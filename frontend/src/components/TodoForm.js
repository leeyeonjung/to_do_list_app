import React, { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onAdd({
      title: title.trim(),
      description: description.trim()
    });

    if (success) {
      setTitle('');
      setDescription('');
    }
    setIsSubmitting(false);
  };

  return (
    <form id="section-todo-form" className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="할 일을 입력하세요..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder="설명 (선택사항)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        className="form-submit"
        id="btn-todo-submit"
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? '추가 중...' : '추가하기'}
      </button>
    </form>
  );
}

export default TodoForm;

