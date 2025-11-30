const express = require('express');
const todoService = require('../service/todoService');

const router = express.Router();

/**
 * GET /api/todos
 * 모든 투두 조회
 */
router.get('/', (req, res) => {
  try {
    const todos = todoService.getAllTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/todos/:id
 * 특정 투두 조회
 */
router.get('/:id', (req, res) => {
  try {
    const todo = todoService.getTodoById(req.params.id);
    res.json(todo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * POST /api/todos
 * 새 투두 생성
 */
router.post('/', (req, res) => {
  try {
    const newTodo = todoService.createTodo(req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/todos/:id
 * 투두 수정
 */
router.put('/:id', (req, res) => {
  try {
    const updatedTodo = todoService.updateTodo(req.params.id, req.body);
    res.json(updatedTodo);
  } catch (error) {
    const statusCode = error.message === 'Todo not found' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /api/todos/:id
 * 투두 삭제
 */
router.delete('/:id', (req, res) => {
  try {
    const result = todoService.deleteTodo(req.params.id);
    res.json(result);
  } catch (error) {
    const statusCode = error.message === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

module.exports = router;

