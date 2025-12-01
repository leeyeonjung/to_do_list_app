const todoRepository = require('../repository/todoRepository');

class TodoService {
  /**
   * 모든 투두 조회
   */
  getAllTodos() {
    return todoRepository.findAll();
  }

  /**
   * ID로 투두 조회
   */
  getTodoById(id) {
    const todo = todoRepository.findById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    return todo;
  }

  /**
   * 새 투두 생성
   */
  createTodo(todoData) {
    // 유효성 검사
    if (!todoData.title || todoData.title.trim() === '') {
      throw new Error('Title is required');
    }

    return todoRepository.create({
      title: todoData.title.trim(),
      description: todoData.description ? todoData.description.trim() : ''
    });
  }

  /**
   * 투두 수정
   */
  updateTodo(id, todoData) {
    // 투두 존재 여부 확인
    const existingTodo = todoRepository.findById(id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    // 유효성 검사
    if (todoData.title !== undefined && todoData.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    return todoRepository.update(id, todoData);
  }

  /**
   * 투두 삭제
   */
  deleteTodo(id) {
    const todo = todoRepository.findById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    const deleted = todoRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete todo');
    }

    return { message: 'Todo deleted successfully' };
  }
}

module.exports = new TodoService();

