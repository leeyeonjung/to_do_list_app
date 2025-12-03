import React, { useState, useEffect } from 'react';
import './TodoItem.css';

function TodoItem({ todo, isEditing, onEditStart, onEditCancel, onToggleComplete, onUpdate, onDelete }) {
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setEditTitle(todo.title);
      setEditDescription(todo.description || '');
    }
  }, [isEditing, todo]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onUpdate({
      title: editTitle.trim(),
      description: editDescription.trim()
    });
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    onEditCancel();
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsDeleting(true);
      await onDelete(todo.id);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div id={`todo-item-${todo.id}`} className="todo-item editing">
        <div className="todo-item-content">
          <input
            type="text"
            className="todo-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="제목"
            disabled={isSubmitting}
            autoFocus
          />
          <textarea
            className="todo-edit-textarea"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="설명"
            rows="2"
            disabled={isSubmitting}
          />
        </div>
        <div className="todo-item-actions">
          <button
            className="todo-btn todo-btn-save"
            onClick={handleSave}
            disabled={isSubmitting || !editTitle.trim()}
          >
            저장
          </button>
          <button
            className="todo-btn todo-btn-cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`todo-item-${todo.id}`}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}
    >
      <div className="todo-item-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          className="checkbox-input"
          id={`todo-complete-${todo.id}`}
        />
      </div>
      <div className="todo-item-content" onClick={() => !todo.completed && onEditStart()}>
        <h3 className="todo-item-title">{todo.title}</h3>
        {todo.description && (
          <p className="todo-item-description">{todo.description}</p>
        )}
        <div className="todo-item-meta">
          <span className="todo-item-date">
            {new Date(todo.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
      <div className="todo-item-actions">
        <button
          className="todo-btn todo-btn-edit"
          onClick={onEditStart}
          title="수정"
        >
          ✏️
        </button>
        <button
          className="todo-btn todo-btn-delete"
          id={`todo-delete-${todo.id}`}
          onClick={handleDelete}
          disabled={isDeleting}
          title="삭제"
        >
          {isDeleting ? '...' : '🗑️'}
        </button>
      </div>
    </div>
  );
}

export default TodoItem;

