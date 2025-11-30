# Linux 서버 배포 빠른 가이드

## 🚀 빠른 시작

### 1. 서버에 프로젝트 업로드

```bash
# Git 사용
git clone <your-repo-url>
cd to_do_list

# 또는 SCP 사용
scp -r . user@server:/path/to/to_do_list
```

### 2. 환경 변수 설정

```bash
cp env.example .env
nano .env  # 또는 vi, vim 등
```

`.env` 파일에서 수정할 항목:
```env
# 모바일 앱용 API URL (가장 중요!)
REACT_APP_API_URL=https://your-domain.com/api
# 또는 IP 사용 시
REACT_APP_API_URL=http://your-server-ip:5000/api
```

### 3. 배포 스크립트 실행

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 접속 확인

- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip:5000/api`

## 📱 모바일 앱 API URL 변경

서버 배포 후 모바일 앱의 API URL을 서버 주소로 변경해야 합니다.

### 방법 1: 환경 변수 사용 (권장)

1. `.env` 파일 수정:
   ```env
   FRONTEND_API_URL=https://your-domain.com/api
   ```

2. 프론트엔드 재빌드:
   ```bash
   cd frontend
   REACT_APP_API_URL=https://your-domain.com/api npm run build
   ```

3. Docker 재빌드:
   ```bash
   docker-compose up -d --build frontend
   ```

### 방법 2: 코드 직접 수정

`frontend/src/App.js`에서:
```javascript
if (isCapacitor) {
  return 'https://your-domain.com/api';  // 서버 주소로 변경
}
```

그 후 로컬에서 빌드:
```bash
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

## 🔄 업데이트

```bash
git pull
docker-compose up -d --build
```

## 📚 자세한 가이드

- `DEPLOY_LINUX.md`: 상세한 배포 가이드

