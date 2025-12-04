const crypto = require('crypto');
const pool = require('../db');

/**
 * Refresh Token 해싱 (SHA-256)
 * @param {string} token - 원본 Refresh Token
 * @returns {string} 해시된 토큰
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * DB 결과를 사용자 객체로 변환
 */
function mapRowToUser(row) {
  return {
    id: row.id,
    oauthId: row.oauth_id,
    provider: row.provider,
    email: row.email,
    nickname: row.nickname,
    profileImage: row.profile_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

class UserRepository {
  /**
   * 모든 사용자 조회
   */
  async findAll() {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY id');
      return result.rows.map(mapRowToUser);
    } catch (error) {
      console.error('사용자 전체 조회 오류:', error);
      throw error;
    }
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('사용자 ID 조회 오류:', error);
      throw error;
    }
  }

  /**
   * OAuth ID와 provider로 사용자 조회
   */
  async findByOAuthId(oauthId, provider) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE oauth_id = $1 AND provider = $2',
        [oauthId, provider]
      );
      if (result.rows.length === 0) {
        return null;
      }
      return mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('OAuth ID 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return null;
      }
      return mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('이메일 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 새 사용자 생성
   */
  async create(userData) {
    try {
      // oauth_id와 provider는 필수
      if (!userData.oauthId || !userData.provider) {
        throw new Error('oauthId와 provider는 필수입니다.');
      }

      const result = await pool.query(
        `INSERT INTO users (oauth_id, provider, email, nickname, profile_image, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          userData.oauthId,
          userData.provider,
          userData.email || null,
          userData.nickname || null,
          userData.profileImage || null
        ]
      );
      return mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      // 중복 키 에러 처리
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error('이미 등록된 사용자입니다.');
      }
      throw error;
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async update(id, userData) {
    try {
      // ID 검증
      if (!id || isNaN(parseInt(id))) {
        throw new Error('유효하지 않은 사용자 ID입니다.');
      }

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // 허용된 필드만 업데이트 (보안: SQL Injection 방지)
      const allowedFields = ['nickname', 'profile_image'];
      
      if (userData.nickname !== undefined) {
        // 문자열 길이 제한
        if (userData.nickname && userData.nickname.length > 255) {
          throw new Error('닉네임이 너무 깁니다.');
        }
        updateFields.push(`nickname = $${paramIndex++}`);
        values.push(userData.nickname);
      }
      if (userData.profileImage !== undefined) {
        updateFields.push(`profile_image = $${paramIndex++}`);
        values.push(userData.profileImage);
      }

      if (updateFields.length === 0) {
        // 업데이트할 필드가 없으면 기존 사용자 조회 후 반환
        return await this.findById(id);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('사용자 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   */
  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * Refresh Token 저장 (해시하여 DB에 저장)
   */
  async saveRefreshToken(refreshToken, userId, expiresAt) {
    try {
      // 보안: 원본 토큰을 해시하여 저장
      const hashedToken = hashToken(refreshToken);
      
      await pool.query(
        'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token_hash) DO UPDATE SET expires_at = $3',
        [hashedToken, userId, expiresAt]
      );
    } catch (error) {
      console.error('Refresh Token 저장 오류:', error);
      throw error;
    }
  }

  /**
   * Refresh Token 조회 (해시된 토큰으로 DB에서 조회)
   */
  async getRefreshToken(refreshToken) {
    try {
      // 보안: 원본 토큰을 해시하여 저장된 값과 비교
      const hashedToken = hashToken(refreshToken);
      
      const result = await pool.query(
        'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1',
        [hashedToken]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const tokenData = result.rows[0];

      // 만료 확인
      if (new Date() > new Date(tokenData.expires_at)) {
        // 만료된 토큰 삭제
        await this.deleteRefreshToken(refreshToken);
        return null;
      }

      return {
        userId: tokenData.user_id,
        expiresAt: tokenData.expires_at
      };
    } catch (error) {
      console.error('Refresh Token 조회 오류:', error);
      return null;
    }
  }

  /**
   * Refresh Token 삭제 (해시된 토큰으로 DB에서 삭제)
   */
  async deleteRefreshToken(refreshToken) {
    try {
      const hashedToken = hashToken(refreshToken);
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token_hash = $1',
        [hashedToken]
      );
    } catch (error) {
      console.error('Refresh Token 삭제 오류:', error);
    }
  }

  /**
   * 사용자의 모든 Refresh Token 삭제 (DB에서)
   */
  async deleteAllRefreshTokensByUserId(userId) {
    try {
      await pool.query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      );
    } catch (error) {
      console.error('사용자 Refresh Token 전체 삭제 오류:', error);
    }
  }

  /**
   * 만료된 Refresh Token 정리 (DB에서)
   */
  async cleanupExpiredRefreshTokens() {
    try {
      await pool.query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
      );
    } catch (error) {
      console.error('만료된 Refresh Token 정리 오류:', error);
    }
  }
}

module.exports = new UserRepository();

