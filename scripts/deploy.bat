@echo off
setlocal enabledelayedexpansion

REM ===============================
REM 1. ENV 값 (기본 dev)
REM ===============================
set "ENV=%~1"
if "%ENV%"=="" set "ENV=dev"

echo 🚀 Starting deployment for ENV=%ENV%

REM ===============================
REM 2. 경로 계산
REM ===============================
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

set "COMPOSE_FILE=%PROJECT_ROOT%\docker-compose.yml"
set "ENV_FILE=%PROJECT_ROOT%\deploy\.env-%ENV%"

REM ===============================
REM 3. deploy 폴더 생성
REM ===============================
if not exist "%PROJECT_ROOT%\deploy" mkdir "%PROJECT_ROOT%\deploy"

REM ===============================
REM 4. 환경 파일 존재 여부 확인
REM ===============================
if not exist "%ENV_FILE%" (
    echo ❌ ERROR: Missing %ENV_FILE%
    exit /b 1
)

echo 📦 Using env file: %ENV_FILE%

REM ===============================
REM 5. .env 파일 내용 환경변수로 로드
REM (주석(#) 제외하고 KEY=VALUE 형식만 반영)
REM ===============================
for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    echo %%A | findstr /b "#" >nul
    if errorlevel 1 (
        if not "%%A"=="" (
            set "%%A=%%B"
        )
    )
)

REM docker-compose.yml에서 참조할 ENV_FILE 변수 설정
set "ENV_FILE=%ENV_FILE%"

REM ===============================
REM 6. 기존 컨테이너 종료
REM ===============================
echo 🛑 Stopping existing containers...
docker compose -f "%COMPOSE_FILE%" down --remove-orphans

REM ===============================
REM 7. 잔여 컨테이너 강제 제거
REM ===============================
echo 🧹 Cleaning up any remaining containers...
docker rm -f todo-backend todo-frontend todo-postgres 2>nul

REM ===============================
REM 8. 새로운 컨테이너 실행
REM ===============================
echo 🔄 Starting containers for ENV=%ENV%...
docker compose -f "%COMPOSE_FILE%" up -d --build

echo 🎉 Deployment completed for ENV=%ENV%

endlocal
exit /b 0
