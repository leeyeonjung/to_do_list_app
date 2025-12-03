import React, { useState } from 'react';
import './Login.css';
import { Capacitor } from '@capacitor/core';

// Capacitor 환경 감지 (네이티브 앱에서만 true)
const isCapacitor =
  typeof window !== 'undefined' &&
  typeof window.Capacitor !== 'undefined' &&
  Capacitor.isNativePlatform();

const Login = ({ onLogin, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Frontend base URL (Docker 환경에서는 80포트)
  const FRONT_BASE = "http://13.124.138.204";

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Capacitor 환경에서 네이티브 플러그인 사용 시도
      if (isCapacitor && window.KakaoLogin) {
        try {
          const res = await window.KakaoLogin.login();
          const accessToken = res.accessToken;

          if (!accessToken) {
            throw new Error('카카오 accessToken을 받지 못했습니다.');
          }

          // 서버에 accessToken 전달하여 로그인 처리
          const response = await fetch(`${apiBaseUrl}/auth/kakao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '카카오 로그인에 실패했습니다.');
          }

          const result = await response.json();
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          onLogin(result.user, result.token);
          setLoading(false);
          return;
        } catch (pluginErr) {
          console.warn('KakaoLogin plugin error, falling back to OAuth:', pluginErr);
          // 플러그인 실패 시 OAuth 플로우로 fallback
        }
      }

      // 웹 환경 또는 플러그인 실패 시 OAuth 플로우 사용
      const kakaoClientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
      if (!kakaoClientId) throw new Error('카카오 REST API 키가 설정되지 않았습니다.');

      // 카카오는 웹/앱 모두 동일한 Redirect URI 한 개만 사용
      // - http://13.124.138.204/api/auth/kakao/callback
      // - Kakao Developers 및 backend .env(KAKAO_REDIRECT_URI)와 동일해야 함
      // 중요: origin을 사용하지 않고 고정된 URL 사용 (백엔드와 일치해야 함)
      const redirectUri = `http://13.124.138.204/api/auth/kakao/callback`;

      // 모바일 앱인 경우 state에 플랫폼 정보 포함
      let stateParam = '';
      if (isCapacitor) {
        const state = `mobile_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('kakao_oauth_state', state);
        stateParam = `&state=${encodeURIComponent(state)}`;
      }

      const kakaoAuthUrl =
        `https://kauth.kakao.com/oauth/authorize` +
        `?client_id=${kakaoClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code${stateParam}`;

      // Capacitor 환경에서는 외부 브라우저로 열기 (MainActivity에서 처리)
      // 웹 환경에서는 현재 창에서 이동
      if (isCapacitor) {
        // MainActivity의 WebViewClient가 외부 브라우저로 열도록 처리
        window.location.href = kakaoAuthUrl;
      } else {
        window.location.href = kakaoAuthUrl;
      }
    } catch (err) {
      setError(err.message || '카카오 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  // 네이버 로그인 (Capacitor 플러그인)
  const handleNaverLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Capacitor 환경에서는 네이버 플러그인 사용
      if (isCapacitor && window.naverLogin) {
        window.naverLogin.login(
          async (res) => {
            try {
              const accessToken = res.accessToken;

              if (!accessToken) {
                throw new Error('네이버 accessToken을 받지 못했습니다.');
              }

              // 서버에 accessToken 전달하여 로그인 처리
              const response = await fetch(`${apiBaseUrl}/auth/naver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '네이버 로그인에 실패했습니다.');
              }

              const result = await response.json();
              localStorage.setItem('token', result.token);
              localStorage.setItem('user', JSON.stringify(result.user));
              onLogin(result.user, result.token);
              setLoading(false);
            } catch (err) {
              setError(err.message || '네이버 로그인에 실패했습니다.');
              setLoading(false);
            }
          },
          (err) => {
            console.error('네이버 로그인 오류:', err);
            setError('네이버 로그인에 실패했습니다.');
            setLoading(false);
          }
        );
        return;
      }

      // 웹 환경에서는 기존 OAuth 플로우 사용
      const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID;
      if (!naverClientId) throw new Error('네이버 Client ID가 설정되지 않았습니다.');

      // 모바일 앱인 경우 state에 플랫폼 정보 포함
      const stateBase = Math.random().toString(36).substring(2, 15);
      const state = isCapacitor ? `mobile_${stateBase}` : stateBase;
      sessionStorage.setItem('naver_oauth_state', state);

      // 네이버도 웹/앱 모두 동일한 Redirect URI 한 개만 사용
      // - http://13.124.138.204/api/auth/naver/callback
      // 중요: origin을 사용하지 않고 고정된 URL 사용 (백엔드와 일치해야 함)
      const redirectUri = `http://13.124.138.204/api/auth/naver/callback`;

      const naverAuthUrl =
        `https://nid.naver.com/oauth2.0/authorize` +
        `?response_type=code` +
        `&client_id=${naverClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;

      // Capacitor 환경에서는 외부 브라우저로 열기 (MainActivity에서 처리)
      // 웹 환경에서는 현재 창에서 이동
      if (isCapacitor) {
        // MainActivity의 WebViewClient가 외부 브라우저로 열도록 처리
        window.location.href = naverAuthUrl;
      } else {
        window.location.href = naverAuthUrl;
      }
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