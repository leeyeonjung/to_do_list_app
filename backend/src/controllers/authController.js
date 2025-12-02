const express = require('express');
const oauthService = require('../service/oauthService');
const userService = require('../service/userService');

const router = express.Router();

/**
 * @swagger
 * /api/auth/kakao:
 *   post:
 *     summary: 카카오 로그인 (AccessToken 직접 전달)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: 카카오 AccessToken
 *                 example: "카카오_access_token_값"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/auth/kakao/callback:
 *   post:
 *     summary: 카카오 로그인 (OAuth 코드)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 카카오 OAuth 인증 코드
 *                 example: "카카오_인증_코드"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/auth/naver:
 *   post:
 *     summary: 네이버 로그인 (AccessToken 직접 전달)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: 네이버 AccessToken
 *                 example: "네이버_access_token_값"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/auth/naver/callback:
 *   post:
 *     summary: 네이버 로그인 (OAuth 코드)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - state
 *             properties:
 *               code:
 *                 type: string
 *                 description: 네이버 OAuth 인증 코드
 *                 example: "네이버_인증_코드"
 *               state:
 *                 type: string
 *                 description: 상태 값 (CSRF 방지)
 *                 example: "상태_값"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 로그인한 사용자 정보 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

/**
 * @swagger
 * /api/auth/test-token:
 *   post:
 *     summary: 테스트용 JWT 토큰 발급
 *     description: |
 *       다른 서비스에서 공통으로 사용할 **테스트용 JWT 토큰**을 발급합니다.
 *       이 엔드포인트는 개발/테스트 환경에서만 사용하세요.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 사용자 ID (임의 값 가능)
 *                 example: 1
 *               email:
 *                 type: string
 *                 description: 이메일 (선택)
 *                 example: test@example.com
 *               provider:
 *                 type: string
 *                 description: 제공자 (예: kakao, naver, test 등)
 *                 example: test
 *     responses:
 *       200:
 *         description: 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 발급된 JWT 토큰
 *                 payload:
 *                   type: object
 *                   description: 토큰에 들어간 페이로드
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 프로덕션 환경에서 비활성화
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/test-token', (req, res) => {
  try {
    // 프로덕션 환경에서는 막아두기
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'test-token 엔드포인트는 프로덕션에서 사용할 수 없습니다.' });
    }

    const { id, email, provider } = req.body;

    if (id === undefined || id === null) {
      return res.status(400).json({ error: 'id 값은 필수입니다.' });
    }

    const payload = {
      id,
      email: email || null,
      provider: provider || 'test'
    };

    const token = userService.generateToken(payload);

    res.json({
      token,
      payload
    });
  } catch (error) {
    console.error('테스트 토큰 발급 오류:', error);
    res.status(500).json({ error: error.message || '테스트 토큰 발급에 실패했습니다.' });
  }
});

module.exports = router;
