import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
import Kakao from '@kakao/kakao-js-sdk';

// Capacitor 환경 감지
const isCapacitor = typeof window !== 'undefined' && window.Capacitor;

const Login = ({ onLogin, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const naverLoginRef = useRef(null);

  // Frontend base URL (Docker 환경에서는 80포트)
  const FRONT_BASE = "http://13.124.138.204";

  // 네이버 로그인 SDK 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.naver) {
      const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID;
      if (!naverClientId) return;

      const callbackUrl = `${FRONT_BASE}/auth/naver/callback`;

      const naverLogin = new window.naver.LoginWithNaverId({
        clientId: naverClientId,
        callbackUrl: callbackUrl,
        isPopup: false,
        loginButton: { color: 'green', type: 3, height: 50 }
      });

      naverLogin.init();
      naverLoginRef.current = naverLogin;

      // 네이버 로그인 성공 이벤트 리스너
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'naver_login') {
          handleNaverCallback(event.data.code, event.data.state);
        }
      });
    }
  }, []);

  // 카카오 로그인 (Web SDK 방식)
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${FRONT_BASE}/auth/kakao/callback`;

      // 카카오 SDK로 로그인 요청
      Kakao.Auth.authorize({
        redirectUri: redirectUri,
      });
    } catch (err) {
      setError(err.message || '카카오 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  // 네이버 로그인 버튼 클릭 핸들러
  const handleNaverLogin = () => {
    if (naverLoginRef.current) {
      naverLoginRef.current.leverage();
    }
  };

  // 네이버 콜백 처리 (code를 받아서 서버로 전달)
  const handleNaverCallback = async (code, state) => {
    try {
      const savedState = sessionStorage.getItem('naver_oauth_state');
      if (state !== savedState) {
        throw new Error('상태 값이 일치하지 않습니다.');
      }

      const response = await fetch(`${apiBaseUrl}/auth/naver/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '네이버 로그인에 실패했습니다.');
      }

      const result = await response.json();
      sessionStorage.removeItem('naver_oauth_state');
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      onLogin(result.user, result.token);
    } catch (err) {
      setError(err.message || '네이버 로그인에 실패했습니다.');
    } finally {
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