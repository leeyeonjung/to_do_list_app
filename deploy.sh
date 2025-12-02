#!/bin/bash

# Linux 클라우드 서버 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 Todo List 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. .env 파일 확인
echo "🔍 환경 변수 파일 확인..."

# Backend .env 확인
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env 파일이 없습니다.${NC}"
    if [ -f backend/.env.example ]; then
        echo "backend/.env.example을 복사합니다..."
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ backend/.env 파일 생성 완료${NC}"
        echo -e "${YELLOW}📝 backend/.env 파일을 수정한 후 다시 실행하세요.${NC}"
        exit 1
    else
        echo -e "${RED}❌ backend/.env.example 파일이 없습니다.${NC}"
        echo -e "${YELLOW}💡 backend/.env 파일을 직접 생성해주세요.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ backend/.env 파일 확인 완료${NC}"
fi

# Frontend .env 확인
if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠️  frontend/.env 파일이 없습니다.${NC}"
    echo -e "${YELLOW}💡 frontend/.env 파일을 생성합니다 (기본값 사용)...${NC}"
    cat > frontend/.env << EOF
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=
REACT_APP_NAVER_CLIENT_ID=
EOF
    echo -e "${GREEN}✅ frontend/.env 파일 생성 완료${NC}"
    echo -e "${YELLOW}📝 frontend/.env 파일을 수정한 후 다시 실행하세요.${NC}"
else
    echo -e "${GREEN}✅ frontend/.env 파일 확인 완료${NC}"
fi

echo ""

# 2. Docker 및 Docker Compose 확인
echo "🔍 Docker 설치 확인..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
    echo "설치 가이드: https://docs.docker.com/get-docker/"
    exit 1
fi

# Docker Compose V2 확인 (docker compose)
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다.${NC}"
    echo "설치 가이드: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker 및 Docker Compose 확인 완료${NC}"

# 3. 기존 컨테이너 중지 및 제거 (선택사항)
read -p "기존 컨테이너를 중지하고 제거하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  기존 컨테이너 중지 및 제거..."
    docker compose down
    echo -e "${GREEN}✅ 기존 컨테이너 제거 완료${NC}"
fi

# 4. 의존성 정리 및 재설치
echo "🧹 의존성 정리 및 재설치 중..."

# Backend 의존성 정리 및 재설치
echo "📦 Backend 의존성 처리 중..."
cd backend
if [ -d "node_modules" ]; then
    echo "  - node_modules 삭제 중..."
    rm -rf node_modules/
fi
if [ -f "package-lock.json" ]; then
    echo "  - package-lock.json 삭제 중..."
    rm -f package-lock.json
fi
echo "  - npm install 실행 중..."
npm install
cd ..

# Frontend 의존성 정리 및 재설치
echo "📦 Frontend 의존성 처리 중..."
cd frontend
if [ -d "node_modules" ]; then
    echo "  - node_modules 삭제 중..."
    rm -rf node_modules/
fi
if [ -f "package-lock.json" ]; then
    echo "  - package-lock.json 삭제 중..."
    rm -f package-lock.json
fi
echo "  - npm install 실행 중..."
npm install
cd ..

echo -e "${GREEN}✅ 의존성 정리 및 재설치 완료${NC}"
echo ""

# 5. Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker 이미지 빌드 완료${NC}"
else
    echo -e "${RED}❌ Docker 이미지 빌드 실패${NC}"
    exit 1
fi

# 6. 컨테이너 실행
echo "🚀 컨테이너 실행 중..."
docker compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 컨테이너 실행 완료${NC}"
else
    echo -e "${RED}❌ 컨테이너 실행 실패${NC}"
    exit 1
fi

# 7. 상태 확인
echo "📊 컨테이너 상태 확인..."
sleep 5
docker compose ps

# 8. 로그 확인
echo ""
echo -e "${YELLOW}📋 최근 로그 (Ctrl+C로 종료):${NC}"
echo "전체 로그를 보려면: docker compose logs -f"
echo "특정 서비스 로그: docker compose logs -f backend 또는 frontend"
echo ""

# 9. Health check
echo "🏥 Health check..."
sleep 3

# Backend health check
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend 서버 정상 동작${NC}"
else
    echo -e "${YELLOW}⚠️  Backend 서버 응답 없음 (아직 시작 중일 수 있음)${NC}"
fi

# Swagger UI check
if curl -f http://localhost:5000/api-docs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Swagger UI 정상 동작${NC}"
else
    echo -e "${YELLOW}⚠️  Swagger UI 응답 없음 (아직 시작 중일 수 있음)${NC}"
fi

# Frontend health check
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend 서버 정상 동작${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend 서버 응답 없음 (아직 시작 중일 수 있음)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "📌 유용한 명령어:"
echo "  - 로그 확인: docker compose logs -f"
echo "  - 컨테이너 재시작: docker compose restart"
echo "  - 컨테이너 중지: docker compose down"
echo "  - 상태 확인: docker compose ps"
echo ""
echo "🌐 접속 주소:"
echo "  - Frontend: http://localhost (또는 서버 IP)"
echo "  - Backend API: http://localhost:5000/api"
echo "  - Swagger UI: http://localhost:5000/api-docs"
echo ""

