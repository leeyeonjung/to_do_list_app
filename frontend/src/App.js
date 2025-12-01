import React, { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';

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
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 모든 투두 조회
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
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
    fetchTodos();
  }, []);

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>할 일 목록</h1>
          <p className="app-subtitle">오늘 해야 할 일을 관리하세요</p>
        </header>

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
