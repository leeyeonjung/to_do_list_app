# Todo List 애플리케이션

Kakao·Naver OAuth 인증을 지원하는 Todo List 풀스택 애플리케이션으로, React–Node.js–Express–PostgreSQL 기반이며 Docker를 통해 손쉽게 배포할 수 있습니다. 이 프로젝트는 바이브 코딩 방식으로 완성한 프로젝트입니다.

## 🚀 주요 기능

- ✅ 할 일 CRUD 작업 (생성, 조회, 수정, 삭제)
- 🔐 OAuth 인증 (Kakao, Naver)
- 🔄 JWT 기반 인증 및 리프레시 토큰
- 📱 반응형 UI
- 🐳 Docker 컨테이너화
- 📚 Swagger API 문서
- 🔄 계층적 환경 변수 관리

## 🛠️ 기술 스택

### Frontend
- React 18.2.0
- React Scripts 5.0.1
- Nginx (프로덕션)

### Backend
- Node.js 18
- Express.js
- PostgreSQL 16
- JWT (jsonwebtoken)
- Swagger UI

### DevOps
- Docker & Docker Compose
- Jenkins CI/CD
- Nginx

## 📁 프로젝트 구조

```
todolist_app/
├── README.md
│
├── ci/
│   └── Jenkinsfile.app               # Dev → Test → Prod 전체 배포를 수행하는 Jenkins 파이프라인
│
├── config/                           # 환경/설정 파일 관리
│
├── deploy/
│   └── images/                       # 빌드된 Docker 이미지 아카이브 저장소
│
├── scripts/
│   ├── deploy.sh                     # Linux 배포 스크립트
│   ├── deploy.bat                    # Windows 배포 스크립트
│   ├── docker_build.sh               # Docker 이미지 빌드(Linux)
│   └── docker_build.bat              # Docker 이미지 빌드(Windows)
│
├── docker-compose.yml                # 로컬/서버 공통 Docker Compose 실행 설정
│
└── web/
    ├── backend/
    │   ├── Dockerfile                # 백엔드 Docker 빌드 설정
    │   ├── ecosystem.config.js       # PM2 프로덕션 실행 설정
    │   ├── package.json
    │   └── src/
    │       ├── config/
    │       │   └── swagger.js        # Swagger 문서 설정
    │       ├── controllers/          
    │       │   ├── authController.js # OAuth 로그인 처리
    │       │   └── todoController.js # Todo CRUD API
    │       ├── service/
    │       │   ├── oauthService.js   # Kakao/Naver OAuth 로직
    │       │   └── userService.js    # 사용자 도메인 로직
    │       ├── repository/
    │       │   └── userRepository.js # DB 쿼리 처리
    │       ├── db/
    │       │   └── init.sql          # PostgreSQL 초기 스키마
    │       ├── db.js                 # PostgreSQL 연결 설정
    │       └── index.js              # Express 서버 엔트리포인트
    │
    └── frontend/
        ├── Dockerfile                # 프론트엔드 Docker 빌드 설정
        ├── nginx.conf                # 정적 배포 Nginx 설정
        ├── package.json
        ├── public/
        │   └── index.html            # 기본 HTML 엔트리 파일
        └── src/
            ├── components/
            │   ├── AuthCallback.js   # OAuth Redirect 처리
            │   ├── Login.js          # 로그인 UI
            │   ├── TodoForm.js       # Todo 입력 폼
            │   ├── TodoItem.js       # Todo 단일 항목
            │   ├── TodoList.js       # Todo 리스트
            │   └── UserProfile.js    # 사용자 프로필 화면
            ├── App.js                # 라우팅/전체 App 구조
            └── index.js              # React 엔트리포인트
```

## 🔧 환경 변수 설정

이 프로젝트는 **Frontend / Backend 통합 .env 구조**를 사용합니다:

### 구조
**`config/.env`** 
   - `REACT_APP_*` 접두사 변수: Frontend, Backend 공통 사용
   - 일반 변수: Backend에서 사용 (NODE_ENV, PORT, HOST, DB_* 등)
   - 템플릿 파일: `config/.env.template` 참고
   - **Docker Compose**: `env_file`로 `config/.env` 자동 로드

## 배포

### 배포 스크립트 사용

```bash
# Docker image Build
./scripts/docker_build.bat {version} # Linux/Mac
.\scripts\docker_build.bat {version} # Windows

# Deploy
./scripts/deploy.sh {version} # Linux/Mac
.\scripts\deploy.bat {version} # Windows

# Docker 수동 실행
docker compose up -d

```

## 📚 API 문서

Backend url로 Swagger UI에 접근:
```
http://{BACKEND_URL}:5000/api-docs
```

### 주요 엔드포인트

- `GET /health` - 헬스 체크
- `POST /api/auth/login` - 사용자 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/refresh` - 액세스 토큰 갱신
- `GET /api/todos` - 모든 할 일 조회
- `POST /api/todos` - 할 일 생성
- `PUT /api/todos/:id` - 할 일 수정
- `DELETE /api/todos/:id` - 할 일 삭제

### OAuth 엔드포인트

- `GET /api/auth/kakao` - Kakao OAuth 로그인
- `GET /api/auth/kakao/callback` - Kakao OAuth 콜백
- `GET /api/auth/naver` - Naver OAuth 로그인
- `GET /api/auth/naver/callback` - Naver OAuth 콜백

## 🔐 인증

애플리케이션은 인증을 위해 JWT(JSON Web Tokens)를 사용합니다:

- **액세스 토큰**: API 요청용 단기 토큰
- **리프레시 토큰**: 액세스 토큰 갱신용 장기 토큰
- **OAuth 통합**: Kakao 및 Naver OAuth 지원

## 🐳 Docker 설정

### 서비스

- **backend**: Node.js Express API 서버
- **frontend**: Nginx로 제공되는 React 애플리케이션
- **postgres**: PostgreSQL 16 데이터베이스

### 네트워크

모든 서비스는 `todo-network` 브리지 네트워크를 통해 연결됩니다.

### 볼륨

- `postgres-data`: 영구 PostgreSQL 데이터 저장소

## 🔄 CI/CD

프로젝트에는 Jenkins CI/CD 파이프라인 설정이 포함되어 있습니다:

- **위치**: `ci/Jenkinsfile.app`
- **기능**:
  - Git 소스 체크아웃 및 배포 버전 태깅 자동화
  - Jenkins Credential Secret File(todolist_dev_env)을 로드하여 .env-dev를 안전하게 생성하고 Dev용 Docker 이미지를 빌드
  - Dev 컨테이너 실행 후 토큰 리프레시 Job 및 통합 테스트 Job 자동 수행
  - 테스트 완료 시 Dev 컨테이너 및 런타임 리소스 정리(Cleanup)
  - Jenkins Credential Secret File(todolist_prod_env) 기반으로 .env-prod를 생성하고 Prod용 Docker 이미지를 빌드
  - 아카이브된 Prod 이미지를 운영 환경에 로드 후 컨테이너 배포 수행
  - 전체 배포 파이프라인에 대한 성공/실패 상태 로깅 및 후처리 수행
  - 환경 변수 및 민감 값은 Jenkins Credential Secret File을 통해 일관적으로 보안 관리
