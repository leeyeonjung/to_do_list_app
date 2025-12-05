#!/bin/bash
set -e

ENV=${1:-dev}

echo "🚀 Starting deployment for ENV=$ENV"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/deploy/.env-${ENV}"

# deploy 디렉토리 생성 (없으면)
mkdir -p "$(dirname "$ENV_FILE")"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERROR: Missing $ENV_FILE"
    exit 1
fi

echo "📦 Using env file: $ENV_FILE"

# .env 파일을 환경 변수로 export (docker-compose.yml의 변수 치환용)
export $(grep -v '^#' "$ENV_FILE" | xargs)

# ENV_FILE 환경 변수 설정 (docker-compose.yml의 env_file 경로용)
export ENV_FILE="$ENV_FILE"

# DEV → 개발 서버 테스트 용 컨테이너 실행
# PROD → 운영 서버에서 사용
echo "🛑 Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

# 기존 컨테이너가 남아있을 경우 강제 제거
echo "🧹 Cleaning up any remaining containers..."
docker rm -f todo-backend todo-frontend todo-postgres 2>/dev/null || true

echo "🔄 Starting containers for ENV=$ENV..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "🎉 Deployment completed for ENV=$ENV"
