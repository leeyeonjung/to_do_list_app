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
    
    // Debug: 미들웨어에서 JWT 토큰 요청 로그
    console.log("[DEBUG] AUTH MIDDLEWARE - JWT TOKEN REQUEST");
    console.log("[DEBUG] Request Path:", req.path);
    console.log("[DEBUG] Request Method:", req.method);
    
    const decoded = userService.verifyToken(token);
    
    // 디코딩된 사용자 정보를 req에 추가
    req.user = decoded;
    next();
  } catch (error) {
    console.log("[DEBUG] AUTH MIDDLEWARE - TOKEN VERIFICATION FAILED:", error.message);
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = { authenticate };

