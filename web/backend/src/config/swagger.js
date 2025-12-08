const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: '할 일 목록 관리 API 문서 (카카오/네이버 OAuth 2.0 로그인 포함)',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 Bearer 형식으로 전달하세요',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 메시지',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '사용자 ID',
            },
            email: {
              type: 'string',
              description: '이메일',
            },
            nickname: {
              type: 'string',
              description: '닉네임',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              description: '프로필 이미지 URL',
            },
            provider: {
              type: 'string',
              enum: ['kakao', 'naver'],
              description: 'OAuth 제공자',
            },
          },
        },
        Todo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '투두 ID',
            },
            title: {
              type: 'string',
              description: '제목',
            },
            description: {
              type: 'string',
              description: '설명',
            },
            completed: {
              type: 'boolean',
              description: '완료 여부',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '생성일시',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '수정일시',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT 토큰 (Access Token)',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh Token (30일 유효)',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../index.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

