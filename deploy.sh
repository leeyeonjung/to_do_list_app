#!/bin/bash

set -e  # 에러 발생 시 중단

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
    if [ ! -f web/backend/.env ]; then
        echo -e "${YELLOW}⚠️ web/backend/.env 없음 → 복사${NC}"
        cp web/backend/.env.example web/backend/.env
        echo -e "${GREEN}✔ web/backend/.env 생성 완료${NC}"
        exit 1
    else
        echo -e "${GREEN}✔ web/backend/.env 확인 완료${NC}"
    fi
fi

# Frontend .env
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    if [ ! -f web/frontend/.env ]; then
        echo -e "${YELLOW}⚠️ web/frontend/.env 없음 → 생성${NC}"
        cat > web/frontend/.env << EOF
REACT_APP_API_URL=/api
REACT_APP_KAKAO_REST_API_KEY=
REACT_APP_NAVER_CLIENT_ID=
EOF
        echo -e "${GREEN}✔ web/frontend/.env 생성 완료${NC}"
        exit 1
    else
        echo -e "${GREEN}✔ web/frontend/.env 확인 완료${NC}"
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
echo -e "${GREEN}✔ Docker 확인 완료${NC}"
echo ""

# ========================================
# 3. 기존 컨테이너 종료 여부
# ========================================
read -p "기존 컨테이너 종료? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then

    if [ "$TARGET" = "b" ]; then
        docker compose stop backend || true
        docker compose rm -f backend || true

    elif [ "$TARGET" = "f" ]; then
        docker compose stop frontend || true
        docker compose rm -f frontend || true

    else
        docker compose down || true
    fi

    echo -e "${GREEN}✔ 종료 완료${NC}"
fi

echo ""

# ========================================
# 4. 의존성 설치
# ========================================
echo "📦 의존성 설치..."

# Backend
if [[ "$TARGET" == "b" || "$TARGET" == "fb" ]]; then
    echo "📦 Backend: npm install"
    cd web/backend
    rm -rf node_modules package-lock.json
    npm install
    cd ../..
fi

# Frontend
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    echo "📦 Frontend: npm install & build"
    cd web/frontend
    rm -rf node_modules package-lock.json
    npm install
    npm run build
    cd ../..
fi

echo -e "${GREEN}✔ 의존성 처리 완료${NC}"
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

echo -e "${GREEN}✔ 이미지 빌드 완료${NC}"
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

echo -e "${GREEN}✔ 컨테이너 실행 완료${NC}"
echo ""

# ========================================
# 7. 상태 확인
# ========================================
echo "📊 컨테이너 상태:"
docker compose ps

echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "🌐 접속:"
echo "  Frontend → http://localhost"
echo "  Backend API → http://localhost:5000/api"
echo ""
