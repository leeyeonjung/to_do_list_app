const express = require('express');
const todoService = require('../service/todoService');

const router = express.Router();

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 모든 투두 조회
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 투두 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: 특정 투두 조회
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 투두 ID
 *     responses:
 *       200:
 *         description: 투두 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: 투두를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 새 투두 생성
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 할 일 제목
 *                 example: "새로운 할 일"
 *               description:
 *                 type: string
 *                 description: 할 일 설명 (선택)
 *                 example: "설명"
 *     responses:
 *       201:
 *         description: 투두 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: 투두 수정
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 투두 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 할 일 제목
 *                 example: "수정된 제목"
 *               description:
 *                 type: string
 *                 description: 할 일 설명
 *                 example: "수정된 설명"
 *               completed:
 *                 type: boolean
 *                 description: 완료 여부
 *                 example: true
 *     responses:
 *       200:
 *         description: 투두 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 투두를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 투두 삭제
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 투두 ID
 *     responses:
 *       200:
 *         description: 투두 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todo deleted successfully"
 *       404:
 *         description: 투두를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

