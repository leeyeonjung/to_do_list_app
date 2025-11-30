# APK에서 백엔드 접근 불가 문제 해결 완료

## 🔍 문제 원인

1. **모바일 앱에서 window.location.hostname 문제**
   - 모바일 앱에서는 `window.location.hostname`이 모바일 기기 자체를 가리킴
   - 따라서 API URL이 `http://모바일기기:5000/api`가 되어 접근 불가

2. **환경 변수 미설정**
   - `REACT_APP_API_URL` 환경 변수가 설정되지 않음

## ✅ 해결 방법

### App.js 수정 완료

코드를 수정하여:
1. **환경 변수 우선 사용**: `REACT_APP_API_URL`이 있으면 사용
2. **모바일 앱 감지**: Capacitor 환경 감지
3. **고정 IP 사용**: 모바일 앱에서는 `http://192.168.0.20:5000/api` 사용
4. **개발 환경**: 브라우저에서는 `localhost` 사용

## 🚀 다음 단계

### 1. React 앱 다시 빌드

```bash
cd frontend
npm run build
```

### 2. Capacitor 동기화

```bash
npm run cap:sync
```

### 3. APK 다시 빌드

```bash
cd android
./gradlew assembleDebug
```

## 📋 전체 프로세스

```bash
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

APK 위치: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 API URL 변경 방법

### 방법 1: 코드에서 직접 변경

`frontend/src/App.js` 파일에서:
```javascript
if (isCapacitor) {
  return 'http://192.168.0.20:5000/api';  // 여기 IP 변경
}
```

### 방법 2: 환경 변수 사용

프로젝트 루트 또는 `frontend` 폴더에 `.env` 파일 생성:
```env
REACT_APP_API_URL=http://192.168.0.20:5000/api
```

그 후 빌드:
```bash
npm run build
```

## ✅ 확인 사항

- [ ] 백엔드 서버가 `192.168.0.20:5000`에서 실행 중
- [ ] 모바일 기기와 컴퓨터가 같은 WiFi 네트워크
- [ ] React 앱이 다시 빌드됨
- [ ] APK가 다시 빌드됨

