# Linux 클라우드 서버 배포 가이드

## ✅ Docker 파일 확인

좋은 소식입니다! **모든 Docker 파일들은 이미 Linux 호환**입니다:
- `backend/Dockerfile`: Alpine Linux 기반
- `frontend/Dockerfile`: Alpine Linux 기반
- `docker-compose.yml`: Linux 호환

## 🚀 배포 단계

### 1. 서버 준비

#### 필요한 소프트웨어 설치

```bash
# Docker 설치 (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 확인
docker --version
docker-compose --version
```

### 2. 프로젝트 업로드

```bash
# 방법 1: Git 사용 (권장)
git clone <your-repository-url>
cd to_do_list

# 방법 2: SCP 사용
scp -r /local/path/to_do_list user@your-server:/home/user/
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cp env.example .env

# .env 파일 수정
nano .env
```

`.env` 파일 예시:
```env
# Backend 설정
BACKEND_PORT=5000
BACKEND_HOST=0.0.0.0

# Frontend 설정
FRONTEND_PORT=80
FRONTEND_API_URL=/api

# 모바일 앱용 API URL (실제 서버 주소로 변경)
REACT_APP_API_URL=https://your-domain.com/api
# 또는
REACT_APP_API_URL=http://your-server-ip:5000/api

# 서버 IP (도메인 사용 시 불필요)
SERVER_IP=your-server-ip
```

### 4. Docker 이미지 빌드 및 실행

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

### 5. 포트 확인

```bash
# 포트 열림 확인
sudo netstat -tlnp | grep -E ':(80|5000)'

# 또는
sudo ss -tlnp | grep -E ':(80|5000)'
```

## 🔧 모바일 앱 설정

### API URL 변경

Linux 서버에 배포한 후, 모바일 앱의 API URL을 변경해야 합니다.

#### 방법 1: 환경 변수로 빌드 시 설정 (권장)

1. `.env` 파일에서 `REACT_APP_API_URL` 설정
2. 프론트엔드 재빌드:

```bash
cd frontend
REACT_APP_API_URL=https://your-domain.com/api npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

#### 방법 2: 코드 직접 수정

`frontend/src/App.js` 파일에서:
```javascript
if (isCapacitor) {
  return 'https://your-domain.com/api';  // 서버 주소로 변경
}
```

그 후 빌드:
```bash
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

## 🌐 도메인 설정 (선택사항)

### Nginx 리버스 프록시 설정

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # HTTP를 HTTPS로 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔐 방화벽 설정

```bash
# UFW 사용 (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw enable

# 또는 iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

## 📋 배포 스크립트

`deploy.sh` 파일 사용 (아래 파일 참고)

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔄 업데이트

### 코드 업데이트 후 재배포

```bash
# Git에서 최신 코드 가져오기
git pull

# 이미지 재빌드 및 재시작
docker-compose up -d --build

# 기존 컨테이너 중지 및 삭제 후 재빌드
docker-compose down
docker-compose up -d --build
```

## 🐛 문제 해결

### 로그 확인
```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend

# 실시간 로그
docker-compose logs -f
```

### 컨테이너 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart backend
docker-compose restart frontend
```

### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너
docker-compose ps

# 전체 컨테이너 (중지된 것 포함)
docker-compose ps -a
```

## ✅ 체크리스트

- [ ] Docker 및 Docker Compose 설치 완료
- [ ] 프로젝트 파일 서버에 업로드
- [ ] `.env` 파일 생성 및 설정
- [ ] Docker 이미지 빌드 성공
- [ ] 컨테이너 실행 확인
- [ ] 포트 접근 가능 확인
- [ ] 모바일 앱 API URL 변경
- [ ] 방화벽 설정 완료
- [ ] 도메인 설정 (선택)

