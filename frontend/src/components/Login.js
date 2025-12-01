import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 프론트에서는 반드시 명시적으로 8000 포트 사용해야 함
  const redirectUri = "http://13.124.138.204:8000/oauth";

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const kakaoClientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
      if (!kakaoClientId) throw new Error('카카오 REST API 키가 설정되지 않았습니다.');

      const kakaoAuthUrl =
        `https://kauth.kakao.com/oauth/authorize` +
        `?client_id=${kakaoClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code`;

      console.log(">>> FRONT redirectUri:", redirectUri);
      console.log(">>> KakaoAuthUrl:", kakaoAuthUrl);

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

      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('naver_oauth_state', state);

      const naverAuthUrl =
        `https://nid.naver.com/oauth2.0/authorize` +
        `?response_type=code` +
        `&client_id=${naverClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;

      console.log(">>> FRONT redirectUri:", redirectUri);
      console.log(">>> NaverAuthUrl:", naverAuthUrl);

      window.location.href = naverAuthUrl;

    } catch (err) {
      setError(err.message || '네이버 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">할 일 목록</h2>
        <p className="login-subtitle">로그인하여 시작하세요</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-buttons">
          <button
            className="login-button kakao-button"
            onClick={handleKakaoLogin}
            disabled={loading}
          >
            <span className="login-button-icon">카카오</span>
            로그인
          </button>

          <button
            className="login-button naver-button"
            onClick={handleNaverLogin}
            disabled={loading}
          >
            <span className="login-button-icon">네이버</span>
            로그인
          </button>
        </div>

        {loading && <div className="login-loading">로그인 중...</div>}
      </div>
    </div>
  );
};

export default Login;