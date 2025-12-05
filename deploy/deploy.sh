#!/bin/bash

set -e  # 에러 발생 시 중단

# 스크립트가 deploy 폴더에서 실행되므로 루트 디렉토리로 이동
cd "$(dirname "$0")/.."

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

# config/.env 확인 (공통 설정, 선택 사항)
if [ ! -f config/.env ]; then
    echo -e "${YELLOW}⚠️ config/.env 없음 (선택 사항)${NC}"
else
    echo -e "${GREEN}✔ config/.env 확인 완료${NC}"
fi

# Backend는 config/.env만 사용
if [[ "$TARGET" == "b" || "$TARGET" == "fb" ]]; then
    if [ ! -f config/.env ]; then
        echo -e "${RED}❌ config/.env 파일이 필요합니다.${NC}"
        echo -e "${YELLOW}⚠️ config/.env.shared.template을 참고하여 config/.env를 생성하세요.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✔ Backend 환경 변수는 config/.env에서 사용됩니다${NC}"
fi

# Frontend는 config/.env만 사용 (web/frontend/.env 불필요)
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    if [ ! -f config/.env ]; then
        echo -e "${RED}❌ config/.env 파일이 필요합니다.${NC}"
        echo -e "${YELLOW}⚠️ config/.env.shared.template을 참고하여 config/.env를 생성하세요.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✔ Frontend 환경 변수는 config/.env에서 사용됩니다${NC}"
fi

echo ""

# ========================================
# 2. .env 파일에서 환경 변수 로드 (계층적)
# ========================================
echo "📥 환경 변수 로드 중..."

# 1단계: config/.env 로드 (공통 설정, 우선순위 낮음)
if [ -f config/.env ]; then
    # set -a를 사용하면 모든 변수가 자동으로 export됨
    set -a
    source config/.env
    set +a
    echo -e "${GREEN}✔ config/.env 로드 완료${NC}"
fi

# Backend는 config/.env만 사용 (추가 로드 불필요)

# Frontend는 config/.env만 사용 (추가 로드 불필요)

echo ""

# ========================================
# 3. Docker 설치 확인
# ========================================
echo "🔍 Docker 설치 확인..."
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
    exit 1
fi
echo -e "${GREEN}✔ Docker 확인 완료${NC}"
echo ""

# ========================================
# 4. 기존 컨테이너 종료 여부
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
# 5. 의존성 설치
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
# 6. Docker 이미지 빌드
# ========================================
echo "🔨 Docker 이미지 빌드 중..."

# Frontend 빌드 시 필요한 환경 변수 준비 (config/.env만 사용)
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    # config/.env에서 변수를 다시 로드하여 export
    if [ -f config/.env ]; then
        set -a
        source config/.env
        set +a
    fi
fi

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
# 7. 컨테이너 실행
# ========================================
echo "🚀 컨테이너 실행 중..."

# Frontend 실행 시 필요한 환경 변수 준비 (config/.env만 사용)
if [[ "$TARGET" == "f" || "$TARGET" == "fb" ]]; then
    # config/.env에서 변수를 다시 로드하여 export
    if [ -f config/.env ]; then
        set -a
        source config/.env
        set +a
    fi
fi

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
# 8. 상태 확인
# ========================================
echo "📊 컨테이너 상태:"
docker compose ps

echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "🌐 접속:"
echo "  Frontend → http://localhost"
echo "  Backend API → http://localhost:5000/api"
echo ""
