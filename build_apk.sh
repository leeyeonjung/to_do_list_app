#!/bin/bash

# Android APK 빌드 스크립트
# 사용법: ./build-apk.sh

set -e  # 에러 발생 시 스크립트 중단

echo "📱 Android APK 빌드 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Node.js 및 npm 확인
echo "🔍 Node.js 및 npm 설치 확인..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo "설치 가이드: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm이 설치되어 있지 않습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 및 npm 확인 완료${NC}"
echo "  - Node.js 버전: $(node --version)"
echo "  - npm 버전: $(npm --version)"
echo ""

# 2. Frontend .env 파일 확인
echo "🔍 Frontend 환경 변수 파일 확인..."
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

# 3. Frontend 의존성 확인 및 설치
echo "📦 Frontend 의존성 확인 중..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "  - node_modules가 없습니다. npm install 실행 중..."
    npm install
else
    echo -e "${GREEN}  ✅ node_modules 확인 완료${NC}"
fi

# 4. React 앱 빌드
echo ""
echo "🔨 React 앱 빌드 중..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React 앱 빌드 완료${NC}"
else
    echo -e "${RED}❌ React 앱 빌드 실패${NC}"
    exit 1
fi

# 5. Capacitor Android 동기화
echo ""
echo "🔄 Capacitor Android 동기화 중..."
npx cap sync android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Capacitor Android 동기화 완료${NC}"
else
    echo -e "${RED}❌ Capacitor Android 동기화 실패${NC}"
    exit 1
fi

# 6. Android APK 빌드
echo ""
echo "📱 Android APK 빌드 중..."
cd android

# Gradle 실행 권한 확인
if [ ! -x "./gradlew" ]; then
    echo "  - gradlew 실행 권한 부여 중..."
    chmod +x ./gradlew
fi

./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Android APK 빌드 완료${NC}"
    echo ""
    
    # APK 파일 위치 확인 (날짜/시간 포함된 파일명도 찾기)
    APK_DIR="app/build/outputs/apk/debug"
    APK_FILE=$(find "$APK_DIR" -name "app-debug*.apk" -type f | head -n 1)
    
    if [ -n "$APK_FILE" ] && [ -f "$APK_FILE" ]; then
        APK_SIZE=$(du -h "$APK_FILE" | cut -f1)
        APK_NAME=$(basename "$APK_FILE")
        echo -e "${GREEN}📦 APK 파일 위치:${NC}"
        echo "  - 파일명: $APK_NAME"
        echo "  - 경로: $(pwd)/$APK_FILE"
        echo "  - 크기: $APK_SIZE"
        echo ""
        echo -e "${GREEN}🎉 APK 빌드 성공!${NC}"
    else
        echo -e "${YELLOW}⚠️  APK 파일을 찾을 수 없습니다.${NC}"
        echo "  검색 경로: $APK_DIR"
        echo "  찾은 파일:"
        ls -lh "$APK_DIR"/*.apk 2>/dev/null || echo "    (파일 없음)"
    fi
else
    echo -e "${RED}❌ Android APK 빌드 실패${NC}"
    exit 1
fi

cd ../..

echo ""
echo "📌 유용한 명령어:"
echo "  - Release APK 빌드: cd frontend/android && ./gradlew assembleRelease"
if [ -n "$APK_FILE" ] && [ -f "$APK_FILE" ]; then
    echo "  - APK 설치 (디바이스 연결 필요): adb install $APK_FILE"
fi
echo ""

