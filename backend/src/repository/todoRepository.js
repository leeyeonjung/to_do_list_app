// 인메모리 데이터베이스
let todos = [];
let nextId = 1;

class TodoRepository {
  /**
   * 모든 투두 조회
   */
  findAll() {
    return [...todos];
  }

  /**
   * ID로 투두 조회
   */
  findById(id) {
    return todos.find(todo => todo.id === parseInt(id));
  }

  /**
   * 새 투두 생성
   */
  create(todoData) {
    const newTodo = {
      id: nextId++,
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    todos.push(newTodo);
    return newTodo;
  }

  /**
   * 투두 수정
   */
  update(id, todoData) {
    const todo = this.findById(id);
    if (!todo) {
      return null;
    }

    todo.title = todoData.title !== undefined ? todoData.title : todo.title;
    todo.description = todoData.description !== undefined ? todoData.description : todo.description;
    todo.completed = todoData.completed !== undefined ? todoData.completed : todo.completed;
    todo.updatedAt = new Date().toISOString();

    return todo;
  }

  /**
   * 투두 삭제
   */
  delete(id) {
    const index = todos.findIndex(todo => todo.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    todos.splice(index, 1);
    return true;
  }
}

module.exports = new TodoRepository();

