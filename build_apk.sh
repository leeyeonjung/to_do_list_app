#!/bin/bash
set -e

echo "=== 1. frontend 디렉토리 이동 ==="
cd frontend

echo "=== 2. React build ==="
npm run build

echo "=== 3. Capacitor sync ==="
npx cap sync android

echo "=== 4. android 이동 ==="
cd android

echo "=== 5. APK assembleDebug 빌드 ==="
./gradlew assembleDebug

echo "=== 🎉 APK Build 완료! ==="
