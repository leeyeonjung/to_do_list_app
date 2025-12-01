const express = require('express');
const oauthService = require('../service/oauthService');
const userService = require('../service/userService');

const router = express.Router();

/**
 * POST /api/auth/kakao
 * 카카오 OAuth 로그인 (accessToken 직접 전달)
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
 * 카카오 OAuth 코드를 받아서 로그인 처리
 */
router.post('/kakao/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      return res.status(400).json({ error: '코드와 redirectUri가 필요합니다.' });
    }

    const accessToken = await oauthService.exchangeKakaoCode(code, redirectUri);
    const result = await oauthService.handleKakaoLogin(accessToken);
    res.json(result);
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    res.status(401).json({ error: error.message || '카카오 로그인에 실패했습니다.' });
  }
});

/**
 * POST /api/auth/naver
 * 네이버 OAuth 로그인 (accessToken 직접 전달)
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
 * 네이버 OAuth 코드를 받아서 로그인 처리
 */
router.post('/naver/callback', async (req, res) => {
  try {
    const { code, state, redirectUri } = req.body;

    if (!code || !state || !redirectUri) {
      return res.status(400).json({ error: '코드, state, redirectUri가 필요합니다.' });
    }

    const accessToken = await oauthService.exchangeNaverCode(code, state, redirectUri);
    const result = await oauthService.handleNaverLogin(accessToken);
    res.json(result);
  } catch (error) {
    console.error('네이버 로그인 오류:', error);
    res.status(401).json({ error: error.message || '네이버 로그인에 실패했습니다.' });
  }
});

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 조회
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

