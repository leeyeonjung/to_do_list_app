const axios = require('axios');
const qs = require('qs');
const userService = require('./userService');

class OAuthService {

  constructor() {
    // 각 서비스별 redirectUri를 분리 (fallback 절대 사용 X)
    // REACT_APP_ 변수 사용 (config/.env에서 정의)
    this.kakaoRedirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    this.kakaoRestApiKey = process.env.REACT_APP_KAKAO_REST_API_KEY;
    this.naverRedirectUri = process.env.REACT_APP_NAVER_REDIRECT_URI;
    this.naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID;
    this.naverClientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;

    if (!this.kakaoRedirectUri) {
      console.error("❌ KAKAO_REDIRECT_URI 누락됨!");
    }
    if (!this.kakaoRestApiKey) {
      console.error("❌ KAKAO_REST_API_KEY 누락됨!");
    }
    if (!this.naverRedirectUri) {
      console.error("❌ NAVER_REDIRECT_URI 누락됨!");
    }
    if (!this.naverClientId) {
      console.error("❌ NAVER_CLIENT_ID 누락됨!");
    }
    if (!this.naverClientSecret) {
      console.error("❌ NAVER_CLIENT_SECRET 누락됨!");
    }
  }

  /**
   * 카카오 OAuth 코드를 accessToken으로 교환
   * @param {string} code - 카카오 OAuth 인증 코드
   * @param {string} redirectUri - 선택적 redirect_uri (카카오톡 로그인 시 사용)
   */
  async exchangeKakaoCode(code, redirectUri = null) {
    try {
      // 환경 변수 검증
      if (!this.kakaoRestApiKey) {
        throw new Error('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
      }

      // 카카오톡 로그인의 경우 redirect_uri를 동적으로 처리
      // 카카오톡은 kakao{APP_KEY}://oauth 형태의 redirect_uri를 사용
      const redirectUriToUse = redirectUri || this.kakaoRedirectUri;
      
      if (!redirectUriToUse) {
        throw new Error('KAKAO_REDIRECT_URI가 설정되지 않았습니다.');
      }
      
      console.log("=== [KAKAO TOKEN REQUEST] ===");
      console.log("code:", code);
      console.log("redirect_uri:", redirectUriToUse);
      console.log("client_id:", this.kakaoRestApiKey ? 'SET' : 'NOT SET');
      console.log("==============================");

      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        qs.stringify({
          grant_type: 'authorization_code',
          client_id: this.kakaoRestApiKey,
          redirect_uri: redirectUriToUse,
          code: code
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        }
      );

      // 응답 검증
      if (!response.data || !response.data.access_token) {
        console.error("❌ 카카오 응답 데이터:", response.data);
        throw new Error('카카오에서 access_token을 받지 못했습니다.');
      }

      return response.data.access_token;

    } catch (error) {
      console.error("❌ 카카오 토큰 교환 실패:");
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.error_description || error.message;
      throw new Error(`카카오 토큰 교환 실패: ${errorMessage}`);
    }
  }

  /**
   * 네이버 OAuth 코드를 accessToken으로 교환
   */
  async exchangeNaverCode(code, state) {
    try {
      // 환경 변수 검증
      if (!this.naverClientId || !this.naverClientSecret) {
        throw new Error('NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.');
      }

      console.log("=== [NAVER TOKEN REQUEST] ===");
      console.log("code:", code);
      console.log("state:", state);
      console.log("redirect_uri:", this.naverRedirectUri);
      console.log("client_id:", this.naverClientId ? 'SET' : 'NOT SET');
      console.log("client_secret:", this.naverClientSecret ? 'SET' : 'NOT SET');
      console.log("==============================");

      const response = await axios.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'authorization_code',
          client_id: this.naverClientId,
          client_secret: this.naverClientSecret,
          code: code,
          state: state,
          redirect_uri: this.naverRedirectUri
        }
      });

      // 응답 검증
      if (!response.data || !response.data.access_token) {
        console.error("❌ 네이버 응답 데이터:", response.data);
        throw new Error('네이버에서 access_token을 받지 못했습니다.');
      }

      return response.data.access_token;

    } catch (error) {
      console.error("❌ 네이버 토큰 교환 실패:");
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.error_description 
        || error.response?.data?.error 
        || error.message;
      throw new Error(`네이버 토큰 교환 실패: ${errorMessage}`);
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
    const user = await userService.findOrCreateUser(oauthData);
    const token = userService.generateToken(user);
    const refreshToken = await userService.generateRefreshToken(user);

    return {
      token,
      refreshToken,
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
    const user = await userService.findOrCreateUser(oauthData);
    const token = userService.generateToken(user);
    const refreshToken = await userService.generateRefreshToken(user);

    return {
      token,
      refreshToken,
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
   * 카카오 OAuth 리프레시 토큰으로 새 액세스 토큰 갱신
   * @param {string} refreshToken - 카카오 OAuth 리프레시 토큰
   */
  async refreshKakaoToken(refreshToken) {
    try {
      // 입력 검증
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new Error('유효하지 않은 Refresh Token입니다.');
      }

      // 환경 변수 검증
      if (!this.kakaoRestApiKey) {
        throw new Error('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
      }

      console.log("=== [KAKAO REFRESH TOKEN REQUEST] ===");
      console.log("refresh_token:", refreshToken ? `${refreshToken.substring(0, 10)}...` : 'NOT PROVIDED');
      console.log("client_id:", this.kakaoRestApiKey ? 'SET' : 'NOT SET');
      console.log("=====================================");

      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        qs.stringify({
          grant_type: 'refresh_token',
          client_id: this.kakaoRestApiKey,
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        }
      );

      // 응답 검증
      if (!response.data || !response.data.access_token) {
        console.error("❌ 카카오 응답 데이터:", response.data);
        throw new Error('카카오에서 access_token을 받지 못했습니다.');
      }

      console.log("✅ 카카오 토큰 갱신 성공");
      return response.data.access_token;

    } catch (error) {
      console.error("❌ 카카오 리프레시 토큰 갱신 실패:");
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.error_description || error.message;
      
      // 구체적인 에러 메시지 제공
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('만료')) {
        throw new Error('Refresh Token이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      }
      
      throw new Error(`카카오 리프레시 토큰 갱신 실패: ${errorMessage}`);
    }
  }

  /**
   * 네이버 OAuth 리프레시 토큰으로 새 액세스 토큰 갱신
   * @param {string} refreshToken - 네이버 OAuth 리프레시 토큰
   */
  async refreshNaverToken(refreshToken) {
    try {
      // 입력 검증
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new Error('유효하지 않은 Refresh Token입니다.');
      }

      // 환경 변수 검증
      if (!this.naverClientId || !this.naverClientSecret) {
        throw new Error('NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.');
      }

      console.log("=== [NAVER REFRESH TOKEN REQUEST] ===");
      console.log("refresh_token:", refreshToken ? `${refreshToken.substring(0, 10)}...` : 'NOT PROVIDED');
      console.log("client_id:", this.naverClientId ? 'SET' : 'NOT SET');
      console.log("client_secret:", this.naverClientSecret ? 'SET' : 'NOT SET');
      console.log("====================================");

      const response = await axios.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'refresh_token',
          client_id: this.naverClientId,
          client_secret: this.naverClientSecret,
          refresh_token: refreshToken
        }
      });

      // 응답 검증
      if (!response.data) {
        console.error("❌ 네이버 응답 데이터 없음");
        throw new Error('네이버 API에서 응답을 받지 못했습니다.');
      }

      // 에러 응답 확인 (네이버는 에러도 200으로 반환할 수 있음)
      if (response.data.error) {
        console.error("❌ 네이버 API 에러 응답:", response.data);
        const errorMsg = response.data.error_description || response.data.error;
        throw new Error(`네이버 API 에러: ${errorMsg}`);
      }

      if (!response.data.access_token) {
        console.error("❌ 네이버 응답 데이터:", response.data);
        throw new Error('네이버에서 access_token을 받지 못했습니다.');
      }

      console.log("✅ 네이버 토큰 갱신 성공");
      return response.data.access_token;

    } catch (error) {
      console.error("❌ 네이버 리프레시 토큰 갱신 실패:");
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      // 네이버 API 에러 메시지 추출
      const errorMessage = error.response?.data?.error_description 
        || error.response?.data?.error 
        || error.message;
      
      // 구체적인 에러 메시지 제공
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('만료')) {
        throw new Error('Refresh Token이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      }
      
      throw new Error(`네이버 리프레시 토큰 갱신 실패: ${errorMessage}`);
    }
  }
}

module.exports = new OAuthService();