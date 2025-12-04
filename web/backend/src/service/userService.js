const userRepository = require('../repository/userRepository');
const jwt = require('jsonwebtoken');

class UserService {
  /**
   * OAuth 사용자 찾기 또는 생성
   */
  async findOrCreateUser(oauthData) {
    const { oauthId, provider, email, nickname, profileImage } = oauthData;

    // 입력 검증
    if (!oauthId || typeof oauthId !== 'string') {
      throw new Error('유효하지 않은 OAuth ID입니다.');
    }

    if (!provider || !['kakao', 'naver'].includes(provider)) {
      throw new Error('유효하지 않은 OAuth 제공자입니다.');
    }

    // 이메일 형식 검증 (있는 경우)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    }

    // 문자열 길이 제한 (DB 컬럼 크기 고려)
    if (nickname && nickname.length > 255) {
      throw new Error('닉네임이 너무 깁니다.');
    }

    // 기존 사용자 찾기
    let user = await userRepository.findByOAuthId(oauthId, provider);

    if (user) {
      // 기존 사용자 정보 업데이트
      user = await userRepository.update(user.id, {
        nickname: nickname || user.nickname,
        profileImage: profileImage || user.profileImage
      });
      return user;
    }

    // 새 사용자 생성
    return await userRepository.create({
      oauthId,
      provider,
      email,
      nickname,
      profileImage
    });
  }

  /**
   * JWT 토큰 생성
   */
  generateToken(user) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      provider: user.provider
    };

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Refresh Token 생성 및 저장
   */
  async generateRefreshToken(user) {
    const crypto = require('crypto');
    
    // 랜덤한 Refresh Token 생성
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // 만료 시간 설정 (30일)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Refresh Token 저장 (DB에 저장)
    await userRepository.saveRefreshToken(refreshToken, user.id, expiresAt.toISOString());
    
    return refreshToken;
  }

  /**
   * Refresh Token으로 새 Access Token 발급
   */
  async refreshAccessToken(refreshToken) {
    // Refresh Token 조회 (DB에서)
    const tokenData = await userRepository.getRefreshToken(refreshToken);
    
    if (!tokenData) {
      throw new Error('유효하지 않은 Refresh Token입니다.');
    }

    // 사용자 정보 조회
    const user = await userRepository.findById(tokenData.userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 새 Access Token 발급
    const newAccessToken = this.generateToken(user);
    
    return {
      token: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        provider: user.provider
      }
    };
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다.');
    }

    try {
      const secret = process.env.JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 사용자 정보 조회
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = new UserService();

