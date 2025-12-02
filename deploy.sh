#!/bin/bash

# Linux 클라우드 서버 배포 스크립트

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 Todo List 배포 시작..."

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ========================================
# 인자 처리
# ========================================
TARGET=$1

if [ -z "$TARGET" ]; then
    TARGET="fb"   # 기본값
fi

case "$TARGET" in
    f|F)
        TARGET="f"
        echo "🔧 Frontend만 배포합니다."
        ;;
    b|B)
        TARGET="b"
        echo "🔧 Backend만 배포합니다."
        ;;
    fb|FB)
        TARGET="fb"
        echo "🔧 Frontend + Backend 전체 배포합니다."
        ;;
    *)
        echo -e "${RED}❌ 잘못된 인자입니다: $TARGET${NC}"
        echo "사용법: ./deploy.sh [fb|f|b]"
        exit 1
        ;;
esac

echo ""

# ========================================
# 1. .env 파일 확인
# ========================================
echo "🔍 환경 변수 파일 확인..."

# Backend .env
if [[ "$TARGET" == "b" || "$TARGET" == "fb" ]]; then
    if [ ! -f backend/.env ]; then
        echo -e "${YELLOW}⚠️ backend/.env 파일이 없습니다.${NC}"
        if [ -f backend/.env.example ]; then
            echo "backend/.env.example → backend/.env 복사"
            cp backend/.env.example backend/.env
            echo -e "${GREEN}✅ backend/.env 파일 생성 완료${NC}"
            exit 1
        else
            echo -e "${RED}❌ backend/.env.example 파일도 없습니다.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ backend/.env 확인 완료${NC}"
    fi
fi

# Frontend .env
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    if [ ! -f frontend/.env ]; then
        echo -e "${YELLOW}⚠️ frontend/.env 파일이 없습니다.${NC}"
        echo "기본 .env 자동 생성 중..."
        cat > frontend/.env << EOF
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=
REACT_APP_NAVER_CLIENT_ID=
EOF
        echo -e "${GREEN}✅ frontend/.env 파일 생성 완료${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ frontend/.env 확인 완료${NC}"
    fi
fi

echo ""

# ========================================
# 2. Docker 설치 확인
# ========================================
echo "🔍 Docker 설치 확인..."
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
    exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker 확인 완료${NC}"
echo ""

# ========================================
# 3. 기존 컨테이너 중지 여부 (대상만 중지)
# ========================================
read -p "기존 컨테이너를 중지하고 제거하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then

    if [ "$TARGET" = "b" ]; then
        echo "🛑 Backend 컨테이너만 종료..."
        docker compose stop backend || true
        docker compose rm -f backend || true

    elif [ "$TARGET" = "f" ]; then
        echo "🛑 Frontend 컨테이너만 종료..."
        docker compose stop frontend || true
        docker compose rm -f frontend || true

    else
        echo "🛑 전체 컨테이너 종료..."
        docker compose down || true
    fi

    echo -e "${GREEN}✅ 종료 완료${NC}"
fi

echo ""

# ========================================
# 4. 의존성 설치
# ========================================
echo "📦 의존성 처리 중..."

# Backend
if [[ "$TARGET" == "b" || "$TARGET" == "fb" ]]; then
    echo "📦 Backend: npm install"
    cd backend
    rm -rf node_modules package-lock.json
    npm install
    cd ..
fi

# Frontend
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    echo "📦 Frontend: npm install"
    cd frontend
    rm -rf node_modules package-lock.json
    npm install
    cd ..
fi

echo -e "${GREEN}✅ 의존성 완료${NC}"
echo ""

# ========================================
# 5. Docker 이미지 빌드
# ========================================
echo "🔨 Docker 이미지 빌드 중..."

if [ "$TARGET" = "b" ]; then
    docker compose build --no-cache backend
elif [ "$TARGET" = "f" ]; then
    docker compose build --no-cache frontend
else
    docker compose build --no-cache
fi

echo -e "${GREEN}✅ 이미지 빌드 완료${NC}"
echo ""

# ========================================
# 6. 컨테이너 실행
# ========================================
echo "🚀 컨테이너 실행 중..."

if [ "$TARGET" = "b" ]; then
    docker compose up -d backend
elif [ "$TARGET" = "f" ]; then
    docker compose up -d frontend
else
    docker compose up -d
fi

echo -e "${GREEN}✅ 컨테이너 실행 완료${NC}"
echo ""

# ========================================
# 7. 상태 확인
# ========================================
echo "📊 컨테이너 상태:"
docker compose ps
echo ""

# ========================================
# 8. Health Check
# ========================================
echo "🏥 Health check..."

sleep 2

# Backend
if [[ "$TARGET" == "b" || "$TARGET" == "fb" ]]; then
    echo "🔎 Backend health..."
    curl -f http://localhost:5000/health >/dev/null 2>&1 \
        && echo -e "${GREEN}Backend OK${NC}" \
        || echo -e "${YELLOW}Backend 응답 없음${NC}"
fi

# Frontend
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    echo "🔎 Frontend health..."
    curl -f http://localhost/health >/dev/null 2>&1 \
        && echo -e "${GREEN}Frontend OK${NC}" \
        || echo -e "${YELLOW}Frontend 응답 없음${NC}"
fi

echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "🌐 접속:"
echo "  Frontend → http://localhost"
echo "  Backend API → http://localhost:5000/api"
echo ""
