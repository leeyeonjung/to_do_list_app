@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 배포 타겟 설정 (기본값: fb)
set TARGET=%1
if "%TARGET%"=="" set TARGET=fb

echo.
echo [Todo List 배포 시작]
echo.

REM ========================================
REM 인자 처리
REM ========================================
if /i "%TARGET%"=="f" (
    set TARGET=f
    echo [Frontend만 배포합니다]
    goto :check_env
)
if /i "%TARGET%"=="b" (
    set TARGET=b
    echo [Backend만 배포합니다]
    goto :check_env
)
if /i "%TARGET%"=="fb" (
    set TARGET=fb
    echo [Frontend + Backend 전체 배포합니다]
    goto :check_env
)
echo [오류] 잘못된 인자입니다: %TARGET%
echo 사용법: deploy.bat [fb^|f^|b]
exit /b 1

:check_env
echo.

REM ========================================
REM 1. .env 파일 확인
REM ========================================
echo [환경 변수 파일 확인]

REM Backend .env
if "%TARGET%"=="b" goto :check_backend_env
if "%TARGET%"=="fb" goto :check_backend_env
goto :check_frontend_env

:check_backend_env
if not exist "web\backend\.env" (
    echo [오류] web\backend\.env 파일이 없습니다.
    echo web\backend\.env.example을 복사하여 web\backend\.env를 생성하고 설정한 후 다시 실행하세요.
    exit /b 1
) else (
    echo [완료] web\backend\.env 확인 완료
)

:check_frontend_env
if "%TARGET%"=="f" goto :check_frontend_env_file
if "%TARGET%"=="fb" goto :check_frontend_env_cont
goto :load_env

:check_frontend_env_file
if not exist "web\frontend\.env" (
    echo [오류] web\frontend\.env 파일이 없습니다.
    echo web\frontend\.env.example을 복사하여 web\frontend\.env를 생성하고 설정한 후 다시 실행하세요.
    exit /b 1
) else (
    echo [완료] web\frontend\.env 확인 완료
)
goto :load_env

:check_frontend_env_cont
if not exist "web\frontend\.env" (
    echo [오류] web\frontend\.env 파일이 없습니다.
    echo web\frontend\.env.example을 복사하여 web\frontend\.env를 생성하고 설정한 후 다시 실행하세요.
    exit /b 1
) else (
    echo [완료] web\frontend\.env 확인 완료
)

:load_env
echo.

REM ========================================
REM 2. .env 파일에서 환경 변수 로드
REM ========================================
echo [환경 변수 로드 중]

REM Backend .env 로드
if "%TARGET%"=="b" goto :load_backend_env
if "%TARGET%"=="fb" goto :load_backend_env
goto :load_frontend_env

:load_backend_env
if exist "web\backend\.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%a in ("web\backend\.env") do (
        set "key=%%a"
        set "value=%%b"
        set "key=!key: =!"
        set "value=!value: =!"
        if defined key (
            if not "!key!"=="" (
                REM 환경 변수 설정 (공백 제거)
                set "!key!=!value!"
            )
        )
    )
    echo [완료] Backend .env 로드 완료
)

:load_frontend_env
if "%TARGET%"=="f" goto :check_docker
if "%TARGET%"=="fb" goto :load_frontend_env_cont
goto :check_docker

:load_frontend_env_cont
if exist "web\frontend\.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%a in ("web\frontend\.env") do (
        set "key=%%a"
        set "value=%%b"
        set "key=!key: =!"
        set "value=!value: =!"
        if defined key (
            if not "!key!"=="" (
                REM 환경 변수 설정 (공백 제거)
                set "!key!=!value!"
            )
        )
    )
    echo [완료] Frontend .env 로드 완료
)

:check_docker
echo.

REM ========================================
REM 필수 환경 변수 검증
REM ========================================
echo [필수 환경 변수 검증 중]

set "hasError=0"

REM Backend 필수 변수 검증
if "%TARGET%"=="b" goto :validate_backend
if "%TARGET%"=="fb" goto :validate_backend
goto :validate_frontend

:validate_backend
if "%PORT%"=="" (
    echo [오류] PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%HOST%"=="" (
    echo [오류] HOST가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%BACKEND_URL%"=="" (
    echo [오류] BACKEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%BACKEND_PORT%"=="" (
    echo [오류] BACKEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%FRONTEND_URL%"=="" (
    echo [오류] FRONTEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%FRONTEND_PORT%"=="" (
    echo [오류] FRONTEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%DB_HOST%"=="" (
    echo [오류] DB_HOST가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%DB_USER%"=="" (
    echo [오류] DB_USER가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%DB_PASS%"=="" (
    echo [오류] DB_PASS가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%DB_NAME%"=="" (
    echo [오류] DB_NAME이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%JWT_SECRET%"=="" (
    echo [오류] JWT_SECRET이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)

:validate_frontend
if "%TARGET%"=="f" goto :validate_frontend_vars
if "%TARGET%"=="fb" goto :validate_frontend_vars
goto :check_validation_result

:validate_frontend_vars
if "%REACT_APP_BACKEND_URL%"=="" (
    echo [오류] REACT_APP_BACKEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%REACT_APP_BACKEND_PORT%"=="" (
    echo [오류] REACT_APP_BACKEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%REACT_APP_FRONTEND_URL%"=="" (
    echo [오류] REACT_APP_FRONTEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%REACT_APP_FRONTEND_PORT%"=="" (
    echo [오류] REACT_APP_FRONTEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)

:check_validation_result
if "%hasError%"=="1" (
    echo.
    echo [오류] 필수 환경 변수가 설정되지 않았습니다. .env 파일을 확인하고 다시 실행하세요.
    exit /b 1
)

echo [완료] 필수 환경 변수 검증 완료
echo.

REM ========================================
REM 3. Docker 설치 확인
REM ========================================
echo [Docker 설치 확인]
where docker >nul 2>&1
if errorlevel 1 (
    echo [오류] Docker가 설치되어 있지 않습니다.
    echo Docker Desktop을 설치해주세요: https://www.docker.com/products/docker-desktop
    exit /b 1
)
echo [완료] Docker 확인 완료
echo.

REM ========================================
REM 4. 기존 컨테이너 종료 여부
REM ========================================
set /p response="기존 컨테이너 종료? (y/N): "
if /i "%response%"=="y" (
    if "%TARGET%"=="b" (
        docker compose stop backend
        docker compose rm -f backend
    ) else if "%TARGET%"=="f" (
        docker compose stop frontend
        docker compose rm -f frontend
    ) else (
        docker compose down
    )
    echo [완료] 종료 완료
)
echo.

REM ========================================
REM 5. Docker 이미지 빌드
REM ========================================
echo [Docker 이미지 빌드 중]

REM 환경 변수를 docker-compose에 전달하기 위해 명시적으로 설정
if "%TARGET%"=="b" (
    docker compose build --no-cache backend
) else if "%TARGET%"=="f" (
    docker compose build --no-cache frontend
) else (
    REM 프론트엔드 빌드 시 필요한 환경 변수들을 명시적으로 전달
    docker compose build --no-cache
)

if errorlevel 1 (
    echo [오류] 이미지 빌드 실패
    exit /b 1
)

echo [완료] 이미지 빌드 완료
echo.

REM ========================================
REM 6. 컨테이너 실행
REM ========================================
echo [컨테이너 실행 중]

if "%TARGET%"=="b" (
    docker compose up -d backend postgres
) else if "%TARGET%"=="f" (
    docker compose up -d frontend
) else (
    docker compose up -d
)

if errorlevel 1 (
    echo [오류] 컨테이너 실행 실패
    exit /b 1
)

echo [완료] 컨테이너 실행 완료
echo.

REM ========================================
REM 7. 상태 확인
REM ========================================
echo [컨테이너 상태]
docker compose ps
echo.

REM ========================================
REM 8. 접속 정보 표시
REM ========================================
echo [배포 완료]
echo.
echo [접속 정보]

set "hasError=0"

if "%FRONTEND_URL%"=="" (
    echo [경고] FRONTEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%FRONTEND_PORT%"=="" (
    echo [경고] FRONTEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%BACKEND_URL%"=="" (
    echo [경고] BACKEND_URL이 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)
if "%BACKEND_PORT%"=="" (
    echo [경고] BACKEND_PORT가 .env 파일에 설정되지 않았습니다.
    set "hasError=1"
)

if "%hasError%"=="0" (
    echo   Frontend - %FRONTEND_URL%:%FRONTEND_PORT%
    echo   Backend API - %BACKEND_URL%:%BACKEND_PORT%/api
) else (
    echo   .env 파일에서 FRONTEND_URL, FRONTEND_PORT, BACKEND_URL, BACKEND_PORT를 설정해주세요.
)
echo.

endlocal

