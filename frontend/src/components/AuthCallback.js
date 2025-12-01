import React, { useEffect, useState } from 'react';
import './Login.css';

const AuthCallback = ({ onLogin, apiBaseUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const path = window.location.pathname;

        if (!code) {
          throw new Error('인증 코드를 받지 못했습니다.');
        }

        let result;
        const redirectUri = window.location.origin + path;

        if (path.includes('/kakao')) {
          // 카카오 콜백 처리
          const response = await fetch(`${apiBaseUrl}/auth/kakao/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, redirectUri }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '카카오 로그인에 실패했습니다.');
          }

          result = await response.json();
        } else if (path.includes('/naver')) {
          // 네이버 콜백 처리
          const savedState = sessionStorage.getItem('naver_oauth_state');
          if (state !== savedState) {
            throw new Error('상태 값이 일치하지 않습니다.');
          }

          const response = await fetch(`${apiBaseUrl}/auth/naver/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state, redirectUri }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '네이버 로그인에 실패했습니다.');
          }

          result = await response.json();
          sessionStorage.removeItem('naver_oauth_state');
        } else {
          throw new Error('알 수 없는 인증 경로입니다.');
        }

        // 로그인 성공
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user, result.token);

        // URL 정리
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [apiBaseUrl, onLogin]);

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-loading">로그인 처리 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-error">{error}</div>
          <button
            className="login-button"
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '20px', backgroundColor: '#667eea', color: 'white' }}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

