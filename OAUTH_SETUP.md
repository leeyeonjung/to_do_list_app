# OAuth 2.0 로그인 설정 가이드

이 프로젝트는 카카오와 네이버 OAuth 2.0을 이용한 소셜 로그인 기능을 제공합니다.

## 필요한 API 키 정보

### 1. 카카오 OAuth 설정

1. **카카오 개발자 콘솔 접속**
   - https://developers.kakao.com 접속
   - 내 애플리케이션 > 애플리케이션 추가하기

2. **REST API 키 발급**
   - 앱 설정 > 앱 키에서 REST API 키 확인
   - 이 키를 `KAKAO_REST_API_KEY`로 사용

3. **플랫폼 설정**
   - 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인 등록 (예: `http://localhost:3000`, `https://yourdomain.com`)

4. **Redirect URI 설정**
   - 제품 설정 > 카카오 로그인 > Redirect URI 등록
   - 개발: `http://localhost:3000/auth/kakao/callback`
   - 프로덕션: `https://yourdomain.com/auth/kakao/callback`

5. **동의 항목 설정 (선택)**
   - 제품 설정 > 카카오 로그인 > 동의항목
   - 필요한 정보에 대한 동의 항목 활성화 (닉네임, 프로필 사진, 이메일 등)

### 2. 네이버 OAuth 설정

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com 접속
   - 애플리케이션 등록

2. **Client ID 및 Client Secret 발급**
   - 애플리케이션 등록 후 Client ID와 Client Secret 확인
   - `NAVER_CLIENT_ID`와 `NAVER_CLIENT_SECRET`로 사용

3. **서비스 URL 및 Callback URL 설정**
   - 서비스 URL: `http://localhost:3000` (개발) 또는 `https://yourdomain.com` (프로덕션)
   - Callback URL: `http://localhost:3000/auth/naver/callback` (개발) 또는 `https://yourdomain.com/auth/naver/callback` (프로덕션)

4. **API 설정**
   - 로그인 오픈 API 서비스 환경 > 사용 API: 네이버 로그인 선택
   - 사용 정보: 이메일, 닉네임, 프로필 사진 등 선택

## 환경 변수 설정

### 백엔드 환경 변수 (backend/.env)

```env
PORT=5000
HOST=0.0.0.0

# JWT 설정
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# 카카오 OAuth 설정
KAKAO_REST_API_KEY=your-kakao-rest-api-key

# 네이버 OAuth 설정
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

### 프론트엔드 환경 변수 (frontend/.env)

```env
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=your-kakao-rest-api-key
REACT_APP_NAVER_CLIENT_ID=your-naver-client-id
```

## 설치 및 실행

### 1. 백엔드 패키지 설치

```bash
cd backend
npm install
```

### 2. 프론트엔드 패키지 설치

```bash
cd frontend
npm install
```

### 3. 환경 변수 파일 생성

**백엔드:**
```bash
cd backend
cp .env.example .env
# .env 파일을 열어서 실제 API 키 값 입력
```

**프론트엔드:**
```bash
cd frontend
# .env 파일 생성 (없는 경우)
echo "REACT_APP_API_URL=/api" > .env
echo "REACT_APP_KAKAO_REST_API_KEY=your-kakao-rest-api-key" >> .env
echo "REACT_APP_NAVER_CLIENT_ID=your-naver-client-id" >> .env
```

### 4. 서버 실행

**백엔드:**
```bash
cd backend
npm run dev
```

**프론트엔드:**
```bash
cd frontend
npm start
```

## API 엔드포인트

### 인증 관련

- `POST /api/auth/kakao` - 카카오 accessToken으로 로그인
- `POST /api/auth/kakao/callback` - 카카오 OAuth 코드로 로그인
- `POST /api/auth/naver` - 네이버 accessToken으로 로그인
- `POST /api/auth/naver/callback` - 네이버 OAuth 코드로 로그인
- `GET /api/auth/me` - 현재 로그인한 사용자 정보 조회 (Bearer 토큰 필요)

## 보안 주의사항

1. **JWT_SECRET**: 프로덕션 환경에서는 반드시 강력한 랜덤 문자열로 변경하세요 (최소 32자 이상 권장)
2. **환경 변수**: `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함되어 있음)
3. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
4. **API 키**: 백엔드의 Client Secret은 절대 프론트엔드에 노출하지 마세요

## 문제 해결

### 카카오 로그인 오류
- Redirect URI가 정확히 일치하는지 확인
- REST API 키가 올바른지 확인
- 플랫폼 설정에서 Web 플랫폼이 등록되어 있는지 확인

### 네이버 로그인 오류
- Callback URL이 정확히 일치하는지 확인
- Client ID와 Client Secret이 올바른지 확인
- 서비스 URL이 올바르게 설정되어 있는지 확인

### CORS 오류
- 백엔드의 CORS 설정 확인
- 프론트엔드와 백엔드의 도메인/포트 확인

