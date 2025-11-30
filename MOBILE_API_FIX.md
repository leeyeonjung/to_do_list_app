# 모바일 APK에서 백엔드 접근 불가 문제 해결

## 🔍 문제 원인

1. **frontend/.env 파일이 없음**
   - 환경 변수가 설정되지 않아 API URL이 잘못됨

2. **모바일 앱에서 window.location.hostname 문제**
   - 모바일 앱에서 `window.location.hostname`은 모바일 기기 자체를 가리킴
   - 따라서 API URL이 `http://모바일기기주소:5000/api`가 되어 접근 불가

3. **환경 변수 미반영**
   - `.env` 파일이 없으면 React 빌드 시 환경 변수가 포함되지 않음

## ✅ 해결 방법

### 1. frontend/.env 파일 생성

```env
REACT_APP_API_URL=http://192.168.0.20:5000/api
```

### 2. React 앱 다시 빌드

환경 변수를 반영하려면 반드시 다시 빌드해야 합니다:

```bash
cd frontend
npm run build
```

### 3. Capacitor 동기화

```bash
npm run cap:sync
```

### 4. APK 다시 빌드

```bash
cd android
./gradlew assembleDebug
```

## 🚀 전체 프로세스 (한 번에)

```bash
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

## 📋 확인 사항

### 백엔드 서버 확인
- ✅ 서버가 `http://192.168.0.20:5000`에서 실행 중인지
- ✅ Health check: `http://192.168.0.20:5000/health`

### 네트워크 확인
- ✅ 모바일 디바이스와 컴퓨터가 같은 WiFi 네트워크
- ✅ 모바일 브라우저에서 `http://192.168.0.20:5000/health` 접근 가능한지

### 설정 확인
- ✅ `frontend/.env` 파일에 올바른 API URL 설정
- ✅ React 빌드가 최신 `.env` 파일을 사용했는지

## 💡 중요 사항

**환경 변수는 빌드 시점에 코드에 포함됩니다!**
- `.env` 파일을 변경한 후에는 반드시 `npm run build` 다시 실행
- 빌드하지 않으면 변경사항이 반영되지 않음

