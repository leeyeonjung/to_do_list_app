const path = require('path');

// 계층적 환경 변수 로딩
// 1단계: config/.env 로드 (공통 설정, 우선순위 낮음)
const configEnvPath = process.env.CONFIG_ENV_PATH || path.join(__dirname, '../../../config/.env');
require('dotenv').config({ path: configEnvPath });

// 2단계: web/backend/.env 로드 (서비스별 설정, 우선순위 높음, 덮어쓰기)
// 컨테이너 내에서는 env_file로 환경 변수가 로드되므로 dotenv는 선택적으로 사용
const backendEnvPath = process.env.BACKEND_ENV_PATH || path.join(__dirname, '../.env');
require('dotenv').config({ path: backendEnvPath });
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const pool = require('./db');
const todoRoutes = require('./controllers/todoController');
const authRoutes = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

if (!PORT || !HOST) {
  console.error('❌ PORT와 HOST가 .env 파일에 설정되어야 합니다.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// 모든 요청 로깅 (디버깅용)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo List API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 서버 상태 확인
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버가 정상 작동 중
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 데이터베이스 초기화 후 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 확인
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');
    
    // 테이블 초기화 (CREATE TABLE IF NOT EXISTS 사용 - 이미 있으면 생성하지 않음)
    // 컨테이너를 내렸다 올려도 데이터는 volume에 유지되고, 테이블도 이미 있으면 생성하지 않음
    const fs = require('fs');
    const path = require('path');
    const initSql = fs.readFileSync(
      path.join(__dirname, 'db', 'init.sql'),
      'utf8'
    );
    await pool.query(initSql);
    console.log('✅ Database tables initialized (or already exist)');
    
    // 서버 시작
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`KAKAO_REDIRECT_URI: ${process.env.KAKAO_REDIRECT_URI || 'NOT SET'}`);
      console.log(`KAKAO_REST_API_KEY: ${process.env.KAKAO_REST_API_KEY ? 'SET' : 'NOT SET'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();

