const userRepository = require('../repository/userRepository');
const jwt = require('jsonwebtoken');

class UserService {
  /**
   * OAuth 사용자 찾기 또는 생성
   */
  findOrCreateUser(oauthData) {
    const { oauthId, provider, email, nickname, profileImage } = oauthData;

    // 기존 사용자 찾기
    let user = userRepository.findByOAuthId(oauthId, provider);

    if (user) {
      // 기존 사용자 정보 업데이트
      user = userRepository.update(user.id, {
        nickname,
        profileImage
      });
      return user;
    }

    // 새 사용자 생성
    return userRepository.create({
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
    const payload = {
      id: user.id,
      email: user.email,
      provider: user.provider
    };

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 사용자 정보 조회
   */
  getUserById(id) {
    const user = userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = new UserService();

