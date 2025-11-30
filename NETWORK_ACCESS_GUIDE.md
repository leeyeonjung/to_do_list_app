# 다른 네트워크에서 접속하기 가이드

## 🔍 현재 상황

- **API URL**: `http://192.168.0.20:5000/api`
- **사설 IP**: 같은 로컬 네트워크(WiFi)에서만 접근 가능
- **다른 WiFi**: 접근 불가 ❌

## ✅ 다른 네트워크에서 접속하는 방법

### 방법 1: 공인 IP + 포트 포워딩

#### 1단계: 공인 IP 확인
```bash
# 웹 브라우저에서 확인
https://whatismyipaddress.com/
또는
curl ifconfig.me
```

#### 2단계: 라우터 포트 포워딩 설정
1. 라우터 관리 페이지 접속 (보통 `192.168.0.1` 또는 `192.168.1.1`)
2. 포트 포워딩 메뉴 찾기
3. 설정 추가:
   - 외부 포트: 5000
   - 내부 IP: 192.168.0.20
   - 내부 포트: 5000
   - 프로토콜: TCP

#### 3단계: 방화벽 설정 (Linux)

```bash
# UFW 사용 (Ubuntu)
sudo ufw allow 5000/tcp
sudo ufw enable

# 또는 iptables
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

#### 4단계: API URL 변경
`frontend/src/App.js` 파일 수정:
```javascript
if (isCapacitor) {
  return 'http://공인IP:5000/api';  // 예: http://123.45.67.89:5000/api
}
```

그 후 빌드:
```bash
cd frontend
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

### 방법 2: 클라우드 서버 배포 (권장)

#### 옵션 A: 무료 호스팅 서비스
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Vercel**: https://vercel.com (프론트엔드용)

#### 옵션 B: AWS/Google Cloud/Azure
1. 서버 인스턴스 생성
2. 백엔드 배포
3. 도메인 연결 (선택)
4. API URL을 서버 주소로 변경

### 방법 3: 동적 DNS 서비스 (DDNS)

집에서 서버를 운영하고 IP가 자주 바뀌는 경우:
- **No-IP**: https://www.noip.com
- **DuckDNS**: https://www.duckdns.org

## 🔧 빠른 해결: 코드 수정

### 환경 변수로 API URL 설정

1. **프로덕션용 API URL 설정**
   - 환경 변수 파일 사용
   - 빌드 시점에 API URL 주입

2. **동적 API URL 선택**
   - 앱 내에서 API URL 입력 가능하도록
   - 설정 화면 추가

## ⚠️ 보안 주의사항

1. **HTTPS 사용 권장**
   - HTTP는 데이터가 암호화되지 않음
   - 프로덕션 환경에서는 반드시 HTTPS 사용

2. **방화벽 설정**
   - 필요한 포트만 열기
   - 불필요한 접근 차단

3. **인증 추가**
   - API 키 또는 토큰 인증
   - 무단 접근 방지

## 📋 체크리스트

다른 네트워크 접속 전 확인사항:
- [ ] 공인 IP 확인
- [ ] 포트 포워딩 설정
- [ ] 방화벽 설정
- [ ] 백엔드 서버가 외부 접근 허용 설정
- [ ] API URL 변경
- [ ] React 앱 재빌드
- [ ] APK 재생성

