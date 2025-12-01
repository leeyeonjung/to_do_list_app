const express = require('express');
const oauthService = require('../service/oauthService');
const userService = require('../service/userService');

const router = express.Router();

/**
 * POST /api/auth/kakao
 * 카카오 accessToken 직접 로그인
 */
router.post('/kakao', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: '카카오 accessToken이 필요합니다.' });
    }

    const result = await oauthService.handleKakaoLogin(accessToken);
    res.json(result);
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    res.status(401).json({ error: error.message || '카카오 로그인에 실패했습니다.' });
  }
});

/**
 * POST /api/auth/kakao/callback
 * FE에서 code만 전달 → BE가 .env redirectUri 사용
 */
router.post('/kakao/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '카카오 인증 코드가 필요합니다.' });
    }

    // redirectUri는 FE에서 받지 않고 BE 내부 env 사용
    const accessToken = await oauthService.exchangeKakaoCode(code);
    const result = await oauthService.handleKakaoLogin(accessToken);

    res.json(result);

  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    res.status(401).json({ error: error.message || '카카오 로그인에 실패했습니다.' });
  }
});

/**
 * POST /api/auth/naver
 * 네이버 accessToken 직접 로그인
 */
router.post('/naver', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: '네이버 accessToken이 필요합니다.' });
    }

    const result = await oauthService.handleNaverLogin(accessToken);
    res.json(result);
  } catch (error) {
    console.error('네이버 로그인 오류:', error);
    res.status(401).json({ error: error.message || '네이버 로그인에 실패했습니다.' });
  }
});

/**
 * POST /api/auth/naver/callback
 * FE → code + state 전달
 * BE는 redirectUri를 .env에서 사용
 */
router.post('/naver/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: '코드와 state가 필요합니다.' });
    }

    // redirectUri는 FE에서 받지 않음
    const accessToken = await oauthService.exchangeNaverCode(code, state);
    const result = await oauthService.handleNaverLogin(accessToken);

    res.json(result);

  } catch (error) {
    console.error('네이버 로그인 오류:', error);
    res.status(401).json({ error: error.message || '네이버 로그인에 실패했습니다.' });
  }
});

/**
 * GET /api/auth/me
 * 현재 로그인 사용자 정보 조회
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    const user = userService.getUserById(decoded.id);

    res.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      provider: user.provider
    });
  } catch (error) {
    res.status(401).json({ error: error.message || '인증에 실패했습니다.' });
  }
});

module.exports = router;
