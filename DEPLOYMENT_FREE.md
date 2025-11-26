# 💰 무료 배포 가이드

이 문서는 단성사 프로젝트를 **완전 무료**로 배포하는 방법을 안내합니다.

## 🎯 무료 배포 전략

### 추천 구성 (완전 무료)
- **백엔드**: Oracle Cloud Always Free (VM 인스턴스)
- **프론트엔드**: Vercel 또는 Netlify (무료)
- **데이터베이스**: Oracle Cloud Always Free (이미 사용 중)

### 대안 구성
- **백엔드**: Render (무료 티어)
- **프론트엔드**: Vercel/Netlify (무료)
- **데이터베이스**: Oracle Cloud Always Free

---

## 방법 1: Oracle Cloud Always Free (추천) ⭐

Oracle Cloud는 **영구 무료 티어**를 제공합니다!

### 장점
- ✅ **완전 무료** (영구)
- ✅ Oracle DB와 같은 클라우드에서 운영
- ✅ 네트워크 지연 최소화
- ✅ 월 10TB 데이터 전송 무료

### 무료 제공량
- **VM 인스턴스**: 2개 (각 1/8 OCPU, 1GB RAM)
- **스토리지**: 200GB
- **데이터 전송**: 월 10TB

### 1단계: Oracle Cloud VM 인스턴스 생성

1. [Oracle Cloud 콘솔](https://cloud.oracle.com) 접속
2. **Compute** → **Instances** → **Create Instance**
3. 설정:
   - **Name**: `danseongsa-backend`
   - **Image**: Oracle Linux 8
   - **Shape**: VM.Standard.A1.Flex (Always Free)
   - **OCPU**: 1/8
   - **Memory**: 1GB
   - **Networking**: Public IP 자동 할당
   - **SSH Keys**: 공개 키 추가

### 2단계: 서버 설정

```bash
# SSH 접속
ssh opc@<your-public-ip>

# Java 17 설치
sudo yum install -y java-17-openjdk java-17-openjdk-devel

# 시스템 업데이트
sudo yum update -y

# 방화벽 설정 (포트 8080 열기)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 3단계: 백엔드 배포

```bash
# 프로젝트 클론 (또는 파일 전송)
git clone <your-repo>
cd danseongsa2/backend

# 빌드
./gradlew clean build

# JAR 파일 실행
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

### 4단계: systemd 서비스 등록 (자동 시작)

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/danseongsa-backend.service
```

다음 내용 추가:
```ini
[Unit]
Description=Danseongsa Backend Service
After=network.target

[Service]
Type=simple
User=opc
WorkingDirectory=/home/opc/danseongsa2/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /home/opc/danseongsa2/backend/build/libs/backend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable danseongsa-backend
sudo systemctl start danseongsa-backend
sudo systemctl status danseongsa-backend
```

### 5단계: 환경 변수 설정

`/home/opc/danseongsa2/backend/application-prod.properties` 파일 생성:

```properties
server.port=8080

# DB 설정
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# CORS 설정
cors.allowed.origins=${CORS_ALLOWED_ORIGINS}

# 기타 설정...
```

또는 환경 변수로 설정:
```bash
export DB_URL="jdbc:oracle:thin:@jc4dxlbowsuduo56_high"
export DB_USERNAME="ADMIN"
export DB_PASSWORD="your_password"
export CORS_ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

---

## 방법 2: Render (간단한 배포)

### 장점
- ✅ GitHub 연동으로 자동 배포
- ✅ 무료 티어 제공
- ✅ SSL 자동 적용

### 제한사항
- ⚠️ 15분 비활성 시 슬리프 모드 (첫 요청 시 느림)
- ⚠️ 월 750시간 제한

### 1단계: Render 계정 생성

1. [Render](https://render.com) 접속 및 가입
2. GitHub 연동

### 2단계: 백엔드 배포

1. **New** → **Web Service**
2. GitHub 저장소 선택
3. 설정:
   - **Name**: `danseongsa-backend`
   - **Environment**: Java
   - **Build Command**: `cd backend && ./gradlew clean build`
   - **Start Command**: `cd backend && java -jar build/libs/backend-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: Free

### 3단계: 환경 변수 설정

Render 대시보드에서 **Environment** 탭에 환경 변수 추가:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- 기타 필요한 변수

---

## 방법 3: Railway (최신 옵션)

### 장점
- ✅ GitHub 연동
- ✅ 무료 티어 ($5 크레딧/월)
- ✅ 자동 SSL

### 1단계: Railway 배포

1. [Railway](https://railway.app) 접속 및 가입
2. **New Project** → **Deploy from GitHub**
3. 저장소 선택
4. **Settings** → **Root Directory**: `backend`
5. **Variables** 탭에서 환경 변수 설정

---

## 프론트엔드 무료 배포

### 옵션 1: Vercel (추천) ⭐

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
cd frontend
vercel

# 환경 변수 설정
vercel env add VITE_API_BASE_URL
# 값 입력: https://your-backend-url.com
```

또는 GitHub 연동:
1. [Vercel](https://vercel.com) 접속
2. GitHub 저장소 연결
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**: `VITE_API_BASE_URL` 설정

### 옵션 2: Netlify

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
cd frontend
netlify deploy --prod
```

또는 드래그 앤 드롭:
1. [Netlify](https://netlify.com) 접속
2. `frontend/dist` 폴더 드래그 앤 드롭
3. **Site settings** → **Environment variables** 설정

### 옵션 3: GitHub Pages

```bash
cd frontend

# vite.config.js 수정 필요
# base: '/danseongsa2/' 추가

npm run build

# gh-pages 브랜치에 배포
npm install -g gh-pages
gh-pages -d dist
```

---

## 완전 무료 구성 예시

### 구성 A: Oracle Cloud + Vercel (추천)

```
프론트엔드: Vercel (무료)
    ↓
백엔드: Oracle Cloud VM (Always Free)
    ↓
DB: Oracle Cloud Autonomous DB (Always Free)
```

**비용: $0/월 (완전 무료)**

### 구성 B: Render + Vercel

```
프론트엔드: Vercel (무료)
    ↓
백엔드: Render (무료 티어)
    ↓
DB: Oracle Cloud Autonomous DB (Always Free)
```

**비용: $0/월 (완전 무료)**

---

## Oracle Cloud VM 배포 스크립트

자동화 스크립트를 만들어드리겠습니다:

```bash
#!/bin/bash
# deploy-oracle-cloud.sh

echo "🚀 Oracle Cloud에 배포합니다..."

# 1. 빌드
cd backend
./gradlew clean build

# 2. 서버에 업로드 (SCP 사용)
scp build/libs/backend-0.0.1-SNAPSHOT.jar opc@<your-ip>:/home/opc/

# 3. 서버에서 실행
ssh opc@<your-ip> << 'EOF'
sudo systemctl restart danseongsa-backend
sudo systemctl status danseongsa-backend
EOF

echo "✅ 배포 완료!"
```

---

## 트러블슈팅

### Oracle Cloud VM 연결 문제

```bash
# 보안 규칙 확인
# Oracle Cloud 콘솔 → Networking → Security Lists
# Ingress Rules에 포트 8080 추가
```

### Render 슬리프 모드

- 첫 요청이 느릴 수 있음 (15분 비활성 시)
- 해결: 무료 플랜에서는 어쩔 수 없음
- 또는 Oracle Cloud VM 사용 (항상 실행)

### CORS 오류

- 프론트엔드 URL을 `CORS_ALLOWED_ORIGINS`에 정확히 추가
- 예: `https://your-app.vercel.app`

---

## 비용 비교

| 서비스 | 비용 | 제한사항 |
|--------|------|----------|
| **Oracle Cloud VM** | $0/월 (영구) | 1/8 OCPU, 1GB RAM |
| **Render** | $0/월 | 슬리프 모드, 750시간/월 |
| **Railway** | $0/월 | $5 크레딧/월 |
| **Vercel** | $0/월 | 대역폭 제한 |
| **Netlify** | $0/월 | 대역폭 제한 |

---

## 추천 구성

### 🥇 1순위: Oracle Cloud VM + Vercel
- 완전 무료
- 항상 실행 (슬리프 없음)
- Oracle DB와 같은 클라우드

### 🥈 2순위: Render + Vercel
- 간단한 배포
- GitHub 연동
- 슬리프 모드 있음

### 🥉 3순위: Railway + Vercel
- 최신 기술
- 자동 배포
- 크레딧 제한

---

## 다음 단계

1. Oracle Cloud VM 인스턴스 생성
2. 서버 설정 및 백엔드 배포
3. Vercel에 프론트엔드 배포
4. 환경 변수 설정
5. 테스트

자세한 단계별 가이드는 각 서비스의 공식 문서를 참고하세요!

