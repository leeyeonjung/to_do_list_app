import React, { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import AuthCallback from './components/AuthCallback';

// Capacitor 환경 감지
const isCapacitor = typeof window !== 'undefined' && window.Capacitor;

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

  // 인증 상태 확인
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // 토큰 유효성 검증
      verifyToken(savedToken);
    } else {
      setCheckingAuth(false);
    }
  }, []);

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

  // 로그인 처리
  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setCheckingAuth(false);
    fetchTodos();
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setTodos([]);
    setCheckingAuth(false);
  };


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
