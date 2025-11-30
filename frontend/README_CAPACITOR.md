# Capacitor를 사용한 APK 빌드 가이드

## 사전 준비

### 1. Android Studio 설치
- [Android Studio 다운로드](https://developer.android.com/studio)
- Android SDK 및 빌드 도구 설치

### 2. Java JDK 설치
- JDK 11 이상 필요
- Android Studio에 포함되어 있을 수 있음

### 3. 환경 변수 설정
Android SDK 경로를 환경 변수에 추가:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

`.bashrc` 또는 `.zshrc`에 추가:
```bash
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

## 설치 및 설정

### 1. Capacitor 패키지 설치
```bash
cd frontend
npm install
```

### 2. Capacitor 초기화 (이미 설정됨)
설정 파일: `capacitor.config.json`

### 3. Android 플랫폼 추가
```bash
npm run cap:add android
```

### 4. React 앱 빌드
```bash
npm run build
```

### 5. 웹 빌드를 Capacitor에 복사
```bash
npm run cap:sync
```

또는 한 번에:
```bash
npm run cap:build
```

## API URL 설정

### 개발 환경 (웹)
`.env` 파일 생성:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 모바일 앱 테스트
같은 WiFi 네트워크에서 테스트하는 경우:
1. 컴퓨터의 로컬 IP 주소 확인:
   ```bash
   # Linux/Mac
   ifconfig
   # 또는
   ip addr show
   # 또는
   hostname -I
   ```
2. `.env` 파일 수정:
```
REACT_APP_API_URL=http://192.168.1.100:5000/api
```
(IP 주소는 실제 주소로 변경)

### 프로덕션
실제 서버 URL 사용:
```
REACT_APP_API_URL=https://your-production-server.com/api
```

## Android Studio에서 빌드

### 1. Android Studio 열기
```bash
npm run cap:open android
```

또는
```bash
npx cap open android
```

### 2. APK 빌드

#### 디버그 APK (테스트용)
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. 빌드 완료 후 위치: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 릴리스 APK (배포용)
1. Build > Generate Signed Bundle / APK
2. APK 선택
3. 키스토어 생성 (처음인 경우) 또는 기존 키스토어 선택
4. 빌드 완료

## 주의사항

### 1. 백엔드 서버 접근
- 모바일 앱에서 `localhost`는 작동하지 않음
- 같은 WiFi 네트워크의 로컬 IP 사용
- 또는 실제 서버에 백엔드 배포 필요

### 2. 네트워크 권한
`android/app/src/main/AndroidManifest.xml`에 인터넷 권한이 필요:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```
(일반적으로 Capacitor가 자동으로 추가함)

### 3. 빌드 후 코드 변경
코드를 변경한 후에는:
```bash
npm run build
npm run cap:sync
```

### 4. Android Studio에서 직접 수정
Android 네이티브 코드를 수정한 경우:
```bash
npm run cap:copy
```

## 배포 체크리스트

- [ ] API URL이 실제 서버를 가리키도록 설정
- [ ] 백엔드 서버가 외부에서 접근 가능한지 확인
- [ ] 앱 아이콘 설정 (`android/app/src/main/res`)
- [ ] 앱 이름 및 패키지명 확인
- [ ] 키스토어 생성 및 서명 설정
- [ ] 릴리스 APK 빌드
- [ ] 테스트 디바이스에서 설치 및 테스트

## 빠른 명령어 참조

```bash
# React 앱 빌드
npm run build

# Capacitor 동기화
npm run cap:sync

# 빌드 + 동기화
npm run cap:build

# Android Studio 열기
npm run cap:open android

# Android 프로젝트만 복사
npm run cap:copy
```

