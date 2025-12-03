import React, { useEffect, useRef, useState } from 'react';
import './Login.css';

const AuthCallback = ({ onLogin, apiBaseUrl }) => {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  // 🔥 useEffect 2회 실행 방지용 ref
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) {
      return; // 두 번째 실행을 완전히 차단
    }
    executedRef.current = true;

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

        // --- 카카오 처리 ---
        if (path.includes('/kakao')) {
          const response = await fetch(`${apiBaseUrl}/auth/kakao/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '카카오 로그인에 실패했습니다.');
          }

          result = await response.json();
        }

        // --- 네이버 처리 ---
        else if (path.includes('/naver')) {
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

          result = await response.json();
          sessionStorage.removeItem('naver_oauth_state');
        }

        else {
          throw new Error('알 수 없는 인증 경로입니다.');
        }

        // --- 로그인 성공 ---
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user, result.token);

        setStatus("success");
        window.location.replace('/');

      } catch (err) {
        console.error('OAuth 콜백 오류:', err);
        setErrorMessage(err.message);
        setStatus("error");
      }
    };

    handleCallback();

  }, [apiBaseUrl, onLogin]);

  // ----- 렌더링 -----

  if (status === "loading") {
    return (
      <div id="page-auth-callback-loading" className="login-container">
        <div id="auth-callback-loading-box" className="login-box">
          <div className="login-loading">로그인 처리 중...</div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div id="page-auth-callback-error" className="login-container">
        <div id="auth-callback-error-box" className="login-box">
          <div className="login-error">{errorMessage}</div>
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
