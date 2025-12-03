const axios = require('axios');
const qs = require('qs');
const userService = require('./userService');

class OAuthService {

  constructor() {
    // 각 서비스별 redirectUri를 분리 (fallback 절대 사용 X)
    this.kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;
    this.naverRedirectUri = process.env.NAVER_REDIRECT_URI;

    if (!this.kakaoRedirectUri) {
      console.error("❌ KAKAO_REDIRECT_URI 누락됨!");
    }
    if (!this.naverRedirectUri) {
      console.error("❌ NAVER_REDIRECT_URI 누락됨!");
    }
  }

  /**
   * 카카오 OAuth 코드를 accessToken으로 교환
   */
  async exchangeKakaoCode(code) {
    try {
      console.log("=== [KAKAO TOKEN REQUEST] ===");
      console.log("code:", code);
      console.log("redirect_uri:", this.kakaoRedirectUri);
      console.log("==============================");

      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        qs.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: this.kakaoRedirectUri,
          code: code
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        }
      );

      return response.data.access_token;

    } catch (error) {
      console.error("❌ 카카오 토큰 교환 실패:", error.response?.data || error.message);
      throw new Error(`카카오 토큰 교환 실패: ${error.message}`);
    }
  }

  /**
   * 네이버 OAuth 코드를 accessToken으로 교환
   */
  async exchangeNaverCode(code, state) {
    try {
      console.log("=== [NAVER TOKEN REQUEST] ===");
      console.log("code:", code);
      console.log("state:", state);
      console.log("redirect_uri:", this.naverRedirectUri);
      console.log("==============================");

      const response = await axios.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code: code,
          state: state,
          redirect_uri: this.naverRedirectUri
        }
      });

      return response.data.access_token;

    } catch (error) {
      console.error("❌ 네이버 토큰 교환 실패:", error.response?.data || error.message);
      throw new Error(`네이버 토큰 교환 실패: ${error.message}`);
    }
  }

  /**
   * 카카오 OAuth 사용자 정보
   */
  async getKakaoUserInfo(accessToken) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const kakaoUser = response.data;

      return {
        oauthId: kakaoUser.id.toString(),
        provider: 'kakao',
        email: kakaoUser.kakao_account?.email || null,
        nickname:
          kakaoUser.kakao_account?.profile?.nickname ||
          kakaoUser.properties?.nickname ||
          '카카오 사용자',
        profileImage:
          kakaoUser.kakao_account?.profile?.profile_image_url ||
          kakaoUser.properties?.profile_image ||
          null
      };

    } catch (error) {
      throw new Error(`카카오 사용자 정보 조회 실패: ${error.message}`);
    }
  }

  /**
   * 네이버 OAuth 사용자 정보
   */
  async getNaverUserInfo(accessToken) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const naverUser = response.data.response;

      return {
        oauthId: naverUser.id,
        provider: 'naver',
        email: naverUser.email || null,
        nickname: naverUser.nickname || naverUser.name || '네이버 사용자',
        profileImage: naverUser.profile_image || null
      };

    } catch (error) {
      throw new Error(`네이버 사용자 정보 조회 실패: ${error.message}`);
    }
  }

  /**
   * 카카오 로그인 처리
   */
  async handleKakaoLogin(accessToken) {
    const oauthData = await this.getKakaoUserInfo(accessToken);
    const user = userService.findOrCreateUser(oauthData);
    const token = userService.generateToken(user);

    return {
      token,
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
   * 네이버 로그인 처리
   */
  async handleNaverLogin(accessToken) {
    const oauthData = await this.getNaverUserInfo(accessToken);
    const user = userService.findOrCreateUser(oauthData);
    const token = userService.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        provider: user.provider
      }
    };
  }
}

module.exports = new OAuthService();