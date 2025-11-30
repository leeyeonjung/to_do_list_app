# APK에서 백엔드 접근 불가 문제 해결

## 🔍 문제 원인

1. **환경 변수 미설정**
   - `frontend/.env` 파일이 없어서 API URL이 제대로 설정되지 않음

2. **모바일 앱의 window.location.hostname 문제**
   - 모바일 앱에서는 `window.location.hostname`이 모바일 기기 자체를 가리킴
   - 따라서 API URL이 `http://모바일기기:5000/api`가 되어 접근 불가

3. **환경 변수 미반영**
   - React 앱 빌드 시 `.env` 파일이 없으면 환경 변수가 포함되지 않음

## ✅ 해결 방법

### 방법 1: .env 파일 생성 (권장)

1. **frontend/.env 파일 생성**:
   ```
   REACT_APP_API_URL=http://192.168.0.20:5000/api
   ```

2. **React 앱 다시 빌드**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Capacitor 동기화**:
   ```bash
   npm run cap:sync
   ```

4. **APK 다시 빌드**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### 방법 2: 코드에서 명시적으로 설정

`frontend/src/App.js` 파일 수정:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.20:5000/api';
```

## 🚀 빠른 해결

```bash
# 1. .env 파일 생성
echo REACT_APP_API_URL=http://192.168.0.20:5000/api > frontend/.env

# 2. 빌드 및 APK 생성
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

## 📋 확인 사항

### 백엔드 서버
- ✅ 포트 5000에서 실행 중
- ✅ `http://192.168.0.20:5000/health` 접근 가능

### 네트워크
- ✅ 같은 WiFi 네트워크
- ✅ 방화벽 설정 확인

### 설정
- ✅ `.env` 파일에 올바른 IP 주소
- ✅ React 빌드 시 환경 변수 포함

