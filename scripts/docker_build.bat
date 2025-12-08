@echo off
setlocal enabledelayedexpansion

REM ===============================
REM 1. 필수 입력값 체크 (VERSION)
REM ===============================
set "VERSION=%~1"
set "ENV=%~2"

if "%VERSION%"=="" (
    echo ❌ ERROR: Version is required
    echo Usage: %0 ^<version^> [env]
    echo Example: %0 v1.0.0
    echo Example: %0 v1.0.0 dev
    exit /b 1
)

REM ===============================
REM 2. TAG 생성
REM ===============================
if not "%ENV%"=="" (
    set "TAG=%VERSION%-%ENV%"
    echo 🔨 Building Docker images for VERSION=%VERSION%, ENV=%ENV%
) else (
    set "TAG=%VERSION%"
    echo 🔨 Building Docker images for VERSION=%VERSION%
)

REM ===============================
REM 3. 프로젝트 경로 계산
REM ===============================
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

set "BACKEND_DIR=%PROJECT_ROOT%\web\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\web\frontend"
set "OUTPUT_DIR=%PROJECT_ROOT%\deploy\images"

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM ===============================
REM 4. Backend Image Build
REM ===============================
echo 📦 Building Backend Image...
docker build -t todolist_backend:%TAG% "%BACKEND_DIR%"
if errorlevel 1 (
    echo ❌ Backend image build failed
    exit /b 1
)

REM ===============================
REM 5. Backend Image Save + gzip
REM ===============================
echo 📦 Saving Backend Image...
set "BACKEND_TAR=%OUTPUT_DIR%\backend-%TAG%.tar"

docker save todolist_backend:%TAG% -o "%BACKEND_TAR%"
if errorlevel 1 (
    echo ❌ Backend image save failed
    exit /b 1
)

where gzip >nul 2>&1
if %errorlevel%==0 (
    echo 📦 Compressing Backend Image...
    gzip -f "%BACKEND_TAR%"
) else (
    echo ⚠️ gzip not found — saved as .tar only
)

REM ===============================
REM 6. Frontend Image Build
REM ===============================
echo 📦 Building Frontend Image...
docker build -t todolist_frontend:%TAG% "%FRONTEND_DIR%"
if errorlevel 1 (
    echo ❌ Frontend image build failed
    exit /b 1
)

REM ===============================
REM 7. Frontend Image Save + gzip
REM ===============================
echo 📦 Saving Frontend Image...
set "FRONTEND_TAR=%OUTPUT_DIR%\frontend-%TAG%.tar"

docker save todolist_frontend:%TAG% -o "%FRONTEND_TAR%"
if errorlevel 1 (
    echo ❌ Frontend image save failed
    exit /b 1
)

where gzip >nul 2>&1
if %errorlevel%==0 (
    echo 📦 Compressing Frontend Image...
    gzip -f "%FRONTEND_TAR%"
) else (
    echo ⚠️ gzip not found — saved as .tar only
)

echo.
echo ✅ Images saved in %OUTPUT_DIR%
echo.

endlocal
exit /b 0
