import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const kakaoClientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
      if (!kakaoClientId) throw new Error('카카오 REST API 키가 설정되지 않았습니다.');

      // Redirect URI 구성: 직접 지정된 값이 있으면 사용, 없으면 BACKEND_URL + BACKEND_PORT로 자동 구성
      let redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
      if (!redirectUri) {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const backendPort = process.env.REACT_APP_BACKEND_PORT;
        
        if (!backendUrl || !backendPort) {
          throw new Error('REACT_APP_BACKEND_URL과 REACT_APP_BACKEND_PORT가 .env 파일에 설정되어야 합니다.');
        }
        
        // 포트가 80 또는 443이면 포트 번호 생략
        if (backendPort === '80' || backendPort === '443') {
          redirectUri = `${backendUrl}/api/auth/kakao/callback`;
        } else {
          redirectUri = `${backendUrl}:${backendPort}/api/auth/kakao/callback`;
        }
      }

      const kakaoAuthUrl =
        `https://kauth.kakao.com/oauth/authorize` +
        `?client_id=${kakaoClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code`;

      window.location.href = kakaoAuthUrl;
    } catch (err) {
      setError(err.message || '카카오 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  // 네이버 로그인
  const handleNaverLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID;
      if (!naverClientId) throw new Error('네이버 Client ID가 설정되지 않았습니다.');

      // CSRF 방지를 위한 state 생성
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('naver_oauth_state', state);

      // Redirect URI 구성: 직접 지정된 값이 있으면 사용, 없으면 BACKEND_URL + BACKEND_PORT로 자동 구성
      let redirectUri = process.env.REACT_APP_NAVER_REDIRECT_URI;
      if (!redirectUri) {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const backendPort = process.env.REACT_APP_BACKEND_PORT;
        
        if (!backendUrl || !backendPort) {
          throw new Error('REACT_APP_BACKEND_URL과 REACT_APP_BACKEND_PORT가 .env 파일에 설정되어야 합니다.');
        }
        
        // 포트가 80 또는 443이면 포트 번호 생략
        if (backendPort === '80' || backendPort === '443') {
          redirectUri = `${backendUrl}/api/auth/naver/callback`;
        } else {
          redirectUri = `${backendUrl}:${backendPort}/api/auth/naver/callback`;
        }
      }

      const naverAuthUrl =
        `https://nid.naver.com/oauth2.0/authorize` +
        `?response_type=code` +
        `&client_id=${naverClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;

      window.location.href = naverAuthUrl;
    } catch (err) {
      setError(err.message || '네이버 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div id="page-login" className="login-container">
      <div id="login-box" className="login-box">
        <h2 className="login-title">할 일 목록</h2>
        <p className="login-subtitle">로그인하여 시작하세요</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-buttons">
          <button
            id="btn-login-kakao"
            className="login-button kakao-button"
            data-provider="kakao"
            onClick={handleKakaoLogin}
            disabled={loading}
          >
            <span className="login-button-icon">카카오</span> 로그인
          </button>

          <button
            id="btn-login-naver"
            className="login-button naver-button"
            data-provider="naver"
            onClick={handleNaverLogin}
            disabled={loading}
          >
            <span className="login-button-icon">네이버</span> 로그인
          </button>
        </div>

        {loading && <div className="login-loading">로그인 중...</div>}
      </div>
    </div>
  );
};

export default Login;