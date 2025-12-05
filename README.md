# Todo List 애플리케이션

Kakao, Naver OAuth 인증을 지원하는 React, Node.js, Express, PostgreSQL 기반의 풀스택 할 일 목록 애플리케이션입니다.

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
├── config/
│   └── .env.template                 # 공통 환경 변수 템플릿
├── web/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/          # API 컨트롤러
│   │   │   ├── service/               # 비즈니스 로직
│   │   │   ├── repository/           # 데이터 접근 계층
│   │   │   ├── middleware/           # 인증 미들웨어
│   │   │   ├── db/                   # 데이터베이스 초기화
│   │   │   └── index.js              # 진입점
│   │   └── Dockerfile
│   └── frontend/
│       ├── src/
│       │   ├── components/           # React 컴포넌트
│       │   └── App.js
│       └── Dockerfile
├── deploy/
│   ├── deploy.sh                     # Linux 배포 스크립트
│   └── deploy.bat                    # Windows 배포 스크립트
├── ci/
│   └── Jenkinsfile                   # CI/CD 파이프라인
└── docker-compose.yml
```

## 🔧 환경 변수 설정

이 프로젝트는 **단일 .env 구조**를 사용합니다:

### 구조
1. **`config/.env`** - 모든 환경 변수 (Backend와 Frontend 공통 사용)
   - `REACT_APP_*` 접두사 변수: React 앱에서 사용 (Frontend 빌드 시 필요)
   - 일반 변수: Backend에서 사용 (NODE_ENV, PORT, HOST, DB_* 등)
   - 템플릿 파일: `config/.env.template` 참고

### 환경 변수 특징

- **모든 변수는 `config/.env`에 정의**: Backend와 Frontend 모두 동일한 파일 사용
- **REACT_APP_ 접두사**: React 앱에서 접근 가능한 변수는 `REACT_APP_` 접두사 필수
- **Backend 코드**: `REACT_APP_` 접두사 변수도 사용 (예: `REACT_APP_BACKEND_URL`)
- **Docker Compose**: `env_file`로 `config/.env` 자동 로드
- **빌드 시**: Frontend 빌드 시 `REACT_APP_` 변수들이 build args로 전달됨

**참고:** Docker 실행 시 `docker-compose.yml`의 `environment: - DB_HOST=postgres`가 자동으로 설정되어 `.env` 파일 값을 덮어씁니다.

### Docker 배포

#### 빠른 시작

```bash
# 배포 스크립트 사용 (권장)
./deploy/deploy.sh fb    # Linux/Mac
deploy\deploy.bat fb     # Windows

# 또는 수동 실행
docker compose up -d
```

#### 배포 스크립트

프로젝트에는 다음을 처리하는 배포 스크립트가 포함되어 있습니다:
- 환경 변수 검증
- Docker 이미지 빌드
- 컨테이너 관리

**사용법:**
```bash
# Frontend와 Backend 모두 배포
./deploy/deploy.sh fb

# Backend만 배포
./deploy/deploy.sh b

# Frontend만 배포
./deploy/deploy.sh f
```

## 📚 API 문서

Backend가 실행 중일 때 Swagger UI에 접근:
```
http://localhost:5000/api-docs
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

- **위치**: `ci/Jenkinsfile`
- **기능**:
  - 환경별 배포 (dev/prod)
  - 템플릿에서 자동 .env 생성
  - Docker 이미지 빌드 및 배포

## 📝 개발 참고사항

### 데이터베이스 호스트 설정

- **로컬 개발** (`npm run dev`): `DB_HOST=localhost`
- **Docker**: `DB_HOST=postgres` (docker-compose.yml에서 자동 설정)

`docker-compose.yml`의 `environment` 섹션이 Docker 배포 시 `.env` 파일 값을 덮어씁니다.

### 환경 변수 로딩

Backend는 `config/.env`만 사용합니다:
1. `config/.env` 로드 (모든 환경 변수 포함)
2. `web/backend/.env`는 선택사항 (추가 설정만 포함, 현재 비어있음)

Frontend도 `config/.env`만 사용합니다:
1. 빌드 시: `REACT_APP_` 변수들이 Docker build args로 전달
2. 런타임: 이미 빌드된 정적 파일 사용 (런타임 환경 변수 불필요)

모든 환경 변수는 `config/.env`에서 중앙 관리됩니다.