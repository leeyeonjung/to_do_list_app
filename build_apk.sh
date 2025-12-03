#!/bin/bash
set -e

echo "=== 📱 APK Build 시작 ==="

# 날짜/시간 (예: 20251203_1528)
BUILD_TIME=$(date +"%Y%m%d_%H%M")

# 1. 모바일 디렉토리로 이동
cd mobile

# 2. Capacitor Android Sync (플러그인 동기화만)
echo "=== 🔄 Capacitor Sync ==="
npx cap sync android

# 3. Android 프로젝트로 이동
cd android

# 4. APK 빌드
echo "=== 🏗  APK assembleDebug 빌드 ==="
./gradlew assembleDebug

# 5. 기본 APK 경로
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

# 6. 날짜 포함 새 이름으로 이동 (기존 app-debug.apk 덮어쓰기 피함)
FINAL_APK="app/build/outputs/apk/debug/app-debug-${BUILD_TIME}.apk"

mv "$APK_PATH" "$FINAL_APK"

echo "=== 🎉 APK Build 완료! ==="
echo "📍 최종 APK:"
echo "$FINAL_APK"
