import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import AuthCallback from './components/AuthCallback';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Capacitor 환경 감지 (네이티브 앱에서만 true)
const isCapacitor =
  typeof window !== 'undefined' &&
  typeof window.Capacitor !== 'undefined' &&
  Capacitor.isNativePlatform();

// API 베이스 URL 계산
const getApiBaseUrl = () => {
  // 1) Docker build-time 환경 변수 (권장)
  if (process.env.REACT_APP_API_URL) {
    // 예: "/api"
    return process.env.REACT_APP_API_URL;
  }

  // 2) APK(WebView) 환경용 (외부 IP + /api)
  if (isCapacitor) {
    return 'http://13.124.138.204/api';
  }

  // 3) 개발 환경 기본값
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // OAuth 콜백 경로 확인 (state로 관리)
  const [isAuthCallback, setIsAuthCallback] = useState(
    window.location.pathname.includes('/auth/')
  );

  // URL 변경 감지
  useEffect(() => {
    const checkPath = () => {
      setIsAuthCallback(window.location.pathname.includes('/auth/'));
    };
    
    // 초기 체크
    checkPath();
    
    // popstate 이벤트 리스너 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', checkPath);
    
    return () => {
      window.removeEventListener('popstate', checkPath);
    };
  }, []);

  // 모든 투두 조회
  const fetchTodos = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('투두를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 처리 (useCallback으로 메모이제이션하여 dependency 문제 해결)
  const handleLogin = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setCheckingAuth(false);
    // 메인 페이지로 리다이렉트 (딥링크 처리 후)
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    // fetchTodos는 token이 설정된 후 useEffect에서 자동 호출됨
  }, []);

  // Deep link 처리: todolist://auth/callback?token=xxx
  useEffect(() => {
    if (!isCapacitor) return;

    // JavaScript에서 호출할 수 있도록 전역 함수 등록
    window.handleAuthCallback = (token) => {
      console.log('Received token from deep link:', token);
      if (token) {
        // 토큰으로 사용자 정보 가져오기
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('토큰 검증 실패');
          })
          .then(userData => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            handleLogin(userData, token);
            // handleLogin 내부에서 리다이렉트 처리
          })
          .catch(err => {
            console.error('Deep link 토큰 처리 오류:', err);
          });
      }
    };

    let listenerHandle = null;

    const handleAppUrlOpen = async (event) => {
      const url = event.url;
      console.log('Received custom scheme URL:', url);

      // Deep link 처리: todolist://auth/callback?token=xxx
      if (url.startsWith('todolist://auth/callback')) {
        try {
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('token');

          if (!token) {
            console.error('토큰을 받지 못했습니다.');
            return;
          }

          // 토큰으로 사용자 정보 가져오기
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('토큰 검증 실패');
          }

          const userData = await response.json();

          // 로그인 성공
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          handleLogin(userData, token);
          // handleLogin 내부에서 리다이렉트 처리

        } catch (err) {
          console.error('Deep link 처리 오류:', err);
        }
      }
    };

    // Capacitor App 리스너 등록 (Promise를 await하여 handle을 받음)
    (async () => {
      try {
        listenerHandle = await CapacitorApp.addListener('appUrlOpen', handleAppUrlOpen);
      } catch (err) {
        console.error('Failed to register appUrlOpen listener:', err);
      }
    })();

    return () => {
      // 리스너 제거 (특정 리스너만 제거)
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [isCapacitor, handleLogin, API_BASE_URL]);

  // 인증 상태 확인
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    // 토큰만 있어도 서버에 /auth/me를 물어봐서 사용자 정보를 가져오도록 변경
    if (savedToken) {
      setToken(savedToken);

      // 로컬에 저장된 사용자 정보가 있으면 먼저 세팅
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // 파싱 에러는 무시하고 서버에서 다시 가져옴
        }
      }

      // 토큰 유효성 검증 및 최신 사용자 정보 로드
      verifyToken(savedToken);
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setTodos([]);
    setCheckingAuth(false);
  };

  // 토큰 유효성 검증
  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCheckingAuth(false);
      } else {
        // 토큰이 유효하지 않으면 로그아웃
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  // 투두 추가
  const addTodo = async (todoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('투두 추가에 실패했습니다.');
      }

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // 투두 수정
  const updateTodo = async (id, todoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('투두 수정에 실패했습니다.');
      }

      const updatedTodo = await response.json();
      setTodos(todos.map(todo =>
        (todo.id === updatedTodo.id ? updatedTodo : todo)
      ));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // 투두 삭제
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('투두 삭제에 실패했습니다.');
      }

      setTodos(todos.filter(todo => todo.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // 완료 상태 토글
  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchTodos();
    }
  }, [user, token]);

  // OAuth 콜백 처리
  if (isAuthCallback) {
    return <AuthCallback onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />;
  }

  // 인증 확인 중
  if (checkingAuth) {
    return (
      <div id="page-auth-check" className="app">
        <div id="auth-check-container" className="app-container">
          <div className="loading">인증 확인 중...</div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!user || !token) {
    return <Login onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />;
  }

  // 로그인된 경우
  return (
    <div id="page-main" className="app">
      <div id="main-container" className="app-container">
        <header id="main-header" className="app-header">
          <h1>할 일 목록</h1>
          <p className="app-subtitle">오늘 해야 할 일을 관리하세요</p>
        </header>

        <UserProfile user={user} onLogout={handleLogout} />

        {error && (
          <div className="error-message">
            {error}
            <button className="error-close" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        <TodoForm onAdd={addTodo} />

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <TodoList
            todos={todos}
            onToggleComplete={toggleComplete}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
