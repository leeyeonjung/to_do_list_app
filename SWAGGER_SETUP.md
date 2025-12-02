# Swagger API 문서 설정

## 설치

백엔드 폴더에서 다음 명령어를 실행하세요:

```bash
cd backend
npm install
```

## Swagger UI 접속

서버를 실행한 후 다음 URL로 접속하세요:

- **로컬 개발 환경**: http://localhost:5000/api-docs
- **프로덕션 환경**: http://13.124.138.204:5000/api-docs

## 포함된 API

### Health Check
- `GET /health` - 서버 상태 확인

### 인증 API (Auth)
- `POST /api/auth/kakao` - 카카오 로그인 (AccessToken)
- `POST /api/auth/kakao/callback` - 카카오 로그인 (OAuth 코드)
- `POST /api/auth/naver` - 네이버 로그인 (AccessToken)
- `POST /api/auth/naver/callback` - 네이버 로그인 (OAuth 코드)
- `GET /api/auth/me` - 현재 사용자 정보 조회 (인증 필요)

### 투두 API (Todos)
- `GET /api/todos` - 모든 투두 조회
- `GET /api/todos/{id}` - 특정 투두 조회
- `POST /api/todos` - 새 투두 생성
- `PUT /api/todos/{id}` - 투두 수정
- `DELETE /api/todos/{id}` - 투두 삭제

## Swagger UI 사용 방법

1. **서버 실행**
   ```bash
   cd backend
   npm run dev
   ```

2. **브라우저에서 접속**
   - http://localhost:5000/api-docs

3. **API 테스트**
   - 각 API를 클릭하여 펼치기
   - "Try it out" 버튼 클릭
   - 필요한 파라미터 입력
   - "Execute" 버튼 클릭하여 테스트

4. **인증이 필요한 API 테스트**
   - 먼저 로그인 API를 호출하여 토큰 획득
   - 페이지 상단의 "Authorize" 버튼 클릭
   - `Bearer {토큰}` 형식으로 입력
   - 인증이 필요한 API를 테스트

## Swagger 설정 파일

- **설정 파일**: `backend/src/config/swagger.js`
- **주석 위치**: 각 컨트롤러 파일 (`backend/src/controllers/*.js`)

## 추가 정보

- Swagger UI는 `/api-docs` 경로에서 제공됩니다
- 모든 API는 OpenAPI 3.0 스펙을 따릅니다
- 스키마 정의는 `swagger.js`의 `components.schemas`에 있습니다

