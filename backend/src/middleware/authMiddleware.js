const userService = require('../service/userService');

/**
 * JWT 토큰 인증 미들웨어
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    
    // 디코딩된 사용자 정보를 req에 추가
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = { authenticate };

