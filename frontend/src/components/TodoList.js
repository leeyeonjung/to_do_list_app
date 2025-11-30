import React, { useState } from 'react';
import './TodoList.css';
import TodoItem from './TodoItem';

function TodoList({ todos, onToggleComplete, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>아직 할 일이 없습니다.</p>
        <p className="empty-subtitle">위에서 새로운 할 일을 추가해보세요!</p>
      </div>
    );
  }

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h2>할 일 목록</h2>
        <span className="todo-count">
          {completedCount} / {totalCount} 완료
        </span>
      </div>

      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isEditing={editingId === todo.id}
            onEditStart={() => setEditingId(todo.id)}
            onEditCancel={() => setEditingId(null)}
            onToggleComplete={onToggleComplete}
            onUpdate={async (updatedData) => {
              const success = await onUpdate(todo.id, updatedData);
              if (success) {
                setEditingId(null);
              }
            }}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList;

