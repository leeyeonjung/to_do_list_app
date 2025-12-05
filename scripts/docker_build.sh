#!/bin/bash
set -e

# 버전 값 (필수)
VERSION=${1:-}
# 환경 값 (선택, 없으면 버전만 사용)
ENV=${2:-}

if [ -z "$VERSION" ]; then
    echo "❌ ERROR: Version is required"
    echo "Usage: $0 <version> [env]"
    echo "Example: $0 v1.0.0"
    echo "Example: $0 v1.0.0 dev"
    exit 1
fi

# 태그 생성 (환경이 있으면 버전-환경, 없으면 버전만)
if [ -n "$ENV" ]; then
    TAG="${VERSION}-${ENV}"
    echo "🔨 Building Docker images for VERSION=$VERSION, ENV=$ENV"
else
    TAG="$VERSION"
    echo "🔨 Building Docker images for VERSION=$VERSION"
fi

# 현재 스크립트 기준 프로젝트 경로 계산
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

BACKEND_DIR="$PROJECT_ROOT/web/backend"
FRONTEND_DIR="$PROJECT_ROOT/web/frontend"
OUTPUT_DIR="$PROJECT_ROOT/deploy/images"

mkdir -p "$OUTPUT_DIR"

echo "📦 Building Backend Image..."
docker build -t todolist_backend:$TAG "$BACKEND_DIR"

echo "📦 Saving Backend Image..."
docker save todolist_backend:$TAG | gzip > "$OUTPUT_DIR/backend-${TAG}.tar.gz"

echo "📦 Building Frontend Image..."
docker build -t todolist_frontend:$TAG "$FRONTEND_DIR"

echo "📦 Saving Frontend Image..."
docker save todolist_frontend:$TAG | gzip > "$OUTPUT_DIR/frontend-${TAG}.tar.gz"

echo "✅ Images saved in $OUTPUT_DIR"
