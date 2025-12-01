# 상세 설정 가이드

## 1. JWT_SECRET 설정

### ⚠️ 중요: JWT_SECRET은 아무거나 하면 안 됩니다!

**JWT_SECRET**은 로그인 토큰을 암호화하는 비밀키입니다. 이 값이 유출되거나 예측 가능하면 다른 사람이 위조 토큰을 만들어서 로그인할 수 있습니다.

### 개발 환경 (로컬 테스트용)
개발 환경에서는 간단한 값도 사용 가능하지만, 그래도 최소 32자 이상의 랜덤 문자열을 권장합니다.

**안전하게 생성하는 방법:**

#### 방법 1: Node.js로 생성 (권장)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
이 명령어를 실행하면 64자리 랜덤 문자열이 생성됩니다.

#### 방법 2: 온라인 생성기 사용
- https://randomkeygen.com/ 접속
- "CodeIgniter Encryption Keys" 섹션에서 32자 이상의 키 복사

#### 방법 3: 간단한 예시 (개발용만)
```env
JWT_SECRET=my-super-secret-key-for-development-only-12345678901234567890
```

### 프로덕션 환경 (실제 서비스)
반드시 강력한 랜덤 문자열을 사용하세요!

**예시:**
```env
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8f5f167f44f4964e6c998dee827110c
```

**주의사항:**
- 최소 32자 이상 (64자 이상 권장)
- 예측 불가능한 랜덤 문자열
- 절대 Git에 커밋하지 않기
- 팀원들과 공유할 때는 안전한 방법으로 전달

---

## 2. 카카오 개발자 콘솔 설정 (단계별 상세 가이드)

### 2-1. 카카오 개발자 콘솔 접속 및 앱 생성

1. **카카오 개발자 콘솔 접속**
   - 브라우저에서 https://developers.kakao.com 접속
   - 카카오 계정으로 로그인 (없으면 회원가입)

2. **애플리케이션 추가하기**
   - 상단 메뉴에서 "내 애플리케이션" 클릭
   - 우측 상단 "+ 애플리케이션 추가하기" 버튼 클릭
   - 애플리케이션 이름 입력 (예: "할일 목록 앱")
   - 사업자명 입력 (개인 개발자는 본인 이름)
   - "저장" 버튼 클릭

### 2-2. REST API 키 확인

1. **앱 설정 페이지로 이동**
   - 방금 만든 애플리케이션 클릭
   - 좌측 메뉴에서 "앱 설정" > "앱 키" 클릭

2. **REST API 키 복사**
   - "REST API 키" 항목의 값 복사
   - 이 값이 `KAKAO_REST_API_KEY`입니다
   - 예시: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 2-3. 플랫폼 설정 (Web 플랫폼 등록)

1. **플랫폼 메뉴로 이동**
   - 좌측 메뉴에서 "플랫폼" 클릭

2. **Web 플랫폼 추가**
   - "Web 플랫폼" 섹션에서 "플랫폼 추가" 버튼 클릭
   - "사이트 도메인" 입력:
     - 개발 환경: `http://localhost:3000`
     - 프로덕션: `https://yourdomain.com` (실제 도메인)
   - "저장" 버튼 클릭

### 2-4. 카카오 로그인 활성화 및 Redirect URI 설정

1. **제품 설정 메뉴로 이동**
   - 좌측 메뉴에서 "제품 설정" > "카카오 로그인" 클릭

2. **카카오 로그인 활성화**
   - "카카오 로그인" 스위치를 "ON"으로 변경
   - "동의항목" 탭 클릭

3. **Redirect URI 등록**
   - "Redirect URI" 섹션으로 스크롤
   - "Redirect URI 등록" 버튼 클릭
   - URI 입력:
     ```
     http://localhost:3000/auth/kakao/callback
     ```
   - "저장" 버튼 클릭
   - 프로덕션 환경이 있다면 추가로 등록:
     ```
     https://yourdomain.com/auth/kakao/callback
     ```

4. **동의 항목 설정 (선택)**
   - "동의항목" 탭에서 필요한 정보 활성화
   - 필수 항목:
     - ✅ 닉네임 (필수)
     - ✅ 프로필 사진 (선택)
     - ✅ 카카오계정(이메일) (선택, 이메일 받으려면 필요)

### 2-5. 설정 확인

- REST API 키: 복사 완료 ✅
- Web 플랫폼: 등록 완료 ✅
- Redirect URI: 등록 완료 ✅
- 카카오 로그인: 활성화 완료 ✅

---

## 3. 네이버 개발자 센터 설정 (단계별 상세 가이드)

### 3-1. 네이버 개발자 센터 접속 및 애플리케이션 등록

1. **네이버 개발자 센터 접속**
   - 브라우저에서 https://developers.naver.com 접속
   - 네이버 계정으로 로그인 (없으면 회원가입)

2. **애플리케이션 등록**
   - 상단 메뉴에서 "Application" > "애플리케이션 등록" 클릭
   - 또는 직접 https://developers.naver.com/apps/#/register 접속

3. **애플리케이션 정보 입력**
   - **애플리케이션 이름**: "할일 목록 앱" (원하는 이름)
   - **사용 API**: "네이버 로그인" 체크
   - **로그인 오픈 API 서비스 환경** 섹션:
     - **서비스 URL**: 
       - 개발: `http://localhost:3000`
       - 프로덕션: `https://yourdomain.com`
     - **Callback URL**: 
       - 개발: `http://localhost:3000/auth/naver/callback`
       - 프로덕션: `https://yourdomain.com/auth/naver/callback`
   - **사용 정보**: 체크박스 선택
     - ✅ 이메일 주소
     - ✅ 별명
     - ✅ 프로필 사진
   - "등록" 버튼 클릭

### 3-2. Client ID 및 Client Secret 확인

1. **애플리케이션 상세 페이지로 이동**
   - 등록한 애플리케이션 클릭
   - 또는 "Application" > "내 애플리케이션"에서 선택

2. **Client ID와 Client Secret 확인**
   - "Client ID" 값 복사 → `NAVER_CLIENT_ID`에 사용
   - "Client Secret" 값 복사 → `NAVER_CLIENT_SECRET`에 사용
   - 예시:
     - Client ID: `abc123def456ghi789`
     - Client Secret: `SECRET_xyz789uvw456rst123`

### 3-3. 설정 확인

- Client ID: 복사 완료 ✅
- Client Secret: 복사 완료 ✅
- 서비스 URL: 등록 완료 ✅
- Callback URL: 등록 완료 ✅
- 사용 API: 네이버 로그인 선택 완료 ✅

---

## 4. 환경 변수 파일 생성 (실제 값 입력)

### 4-1. 백엔드 `.env` 파일 생성

1. **파일 위치**: `backend/.env` (backend 폴더 안에)

2. **파일 내용** (아래 값들을 실제 값으로 교체):

```env
PORT=5000
HOST=0.0.0.0

# JWT 설정 (위에서 생성한 랜덤 문자열 사용)
JWT_SECRET=여기에-64자리-랜덤-문자열-입력
JWT_EXPIRES_IN=7d

# 카카오 OAuth (카카오 개발자 콘솔에서 복사한 REST API 키)
KAKAO_REST_API_KEY=여기에-카카오-REST-API-키-입력

# 네이버 OAuth (네이버 개발자 센터에서 복사한 값)
NAVER_CLIENT_ID=여기에-네이버-Client-ID-입력
NAVER_CLIENT_SECRET=여기에-네이버-Client-Secret-입력
```

**예시:**
```env
PORT=5000
HOST=0.0.0.0

JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8f5f167f44f4964e6c998dee827110c
JWT_EXPIRES_IN=7d

KAKAO_REST_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
NAVER_CLIENT_ID=abc123def456ghi789
NAVER_CLIENT_SECRET=SECRET_xyz789uvw456rst123
```

### 4-2. 프론트엔드 `.env` 파일 생성

1. **파일 위치**: `frontend/.env` (frontend 폴더 안에)

2. **파일 내용**:

```env
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=여기에-카카오-REST-API-키-입력
REACT_APP_NAVER_CLIENT_ID=여기에-네이버-Client-ID-입력
```

**예시:**
```env
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
REACT_APP_NAVER_CLIENT_ID=abc123def456ghi789
```

---

## 5. 설정 완료 체크리스트

### 카카오 설정
- [ ] 카카오 개발자 콘솔에서 앱 생성 완료
- [ ] REST API 키 복사 완료
- [ ] Web 플랫폼 등록 완료 (사이트 도메인: `http://localhost:3000`)
- [ ] Redirect URI 등록 완료 (`http://localhost:3000/auth/kakao/callback`)
- [ ] 카카오 로그인 활성화 완료
- [ ] `backend/.env`에 `KAKAO_REST_API_KEY` 입력 완료
- [ ] `frontend/.env`에 `REACT_APP_KAKAO_REST_API_KEY` 입력 완료

### 네이버 설정
- [ ] 네이버 개발자 센터에서 애플리케이션 등록 완료
- [ ] Client ID 복사 완료
- [ ] Client Secret 복사 완료
- [ ] 서비스 URL 등록 완료 (`http://localhost:3000`)
- [ ] Callback URL 등록 완료 (`http://localhost:3000/auth/naver/callback`)
- [ ] `backend/.env`에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` 입력 완료
- [ ] `frontend/.env`에 `REACT_APP_NAVER_CLIENT_ID` 입력 완료

### JWT 설정
- [ ] JWT_SECRET 생성 완료 (64자 이상 랜덤 문자열)
- [ ] `backend/.env`에 `JWT_SECRET` 입력 완료

---

## 6. 빠른 JWT_SECRET 생성 명령어

터미널에서 실행:

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Mac/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

출력된 값을 복사해서 `backend/.env`의 `JWT_SECRET`에 붙여넣기 하세요!

