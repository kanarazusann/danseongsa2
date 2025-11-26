# 💰 무료 배포 빠른 시작 가이드

가장 간단하고 완전 무료로 배포하는 방법입니다!

## 🎯 추천 구성

**Oracle Cloud VM (백엔드) + Vercel (프론트엔드) = 완전 무료!**

---

## 1단계: Oracle Cloud VM 설정 (백엔드)

### 1.1 VM 인스턴스 생성

1. [Oracle Cloud 콘솔](https://cloud.oracle.com) 접속
2. **Compute** → **Instances** → **Create Instance**
3. 설정:
   - **Name**: `danseongsa-backend`
   - **Image**: Oracle Linux 8
   - **Shape**: VM.Standard.A1.Flex (Always Free)
   - **OCPU**: 1/8
   - **Memory**: 1GB
   - **Networking**: Public IP 자동 할당
   - **SSH Keys**: 공개 키 추가 (또는 키 생성)

### 1.2 서버 초기 설정

```bash
# SSH 접속
ssh opc@<your-public-ip>

# 초기 설정 스크립트 실행
# (로컬에서 스크립트를 서버로 복사 후 실행)
bash oracle-cloud-setup.sh
```

또는 수동 설정:

```bash
# Java 설치
sudo yum install -y java-17-openjdk java-17-openjdk-devel

# 방화벽 설정
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# 디렉토리 생성
mkdir -p ~/uploads/images ~/uploads/reviewImages
```

### 1.3 systemd 서비스 설정

```bash
sudo nano /etc/systemd/system/danseongsa-backend.service
```

다음 내용 입력:

```ini
[Unit]
Description=Danseongsa Backend Service
After=network.target

[Service]
Type=simple
User=opc
WorkingDirectory=/home/opc
Environment="DB_URL=jdbc:oracle:thin:@jc4dxlbowsuduo56_high"
Environment="DB_USERNAME=ADMIN"
Environment="DB_PASSWORD=your_password"
Environment="CORS_ALLOWED_ORIGINS=https://your-app.vercel.app"
Environment="JPA_SHOW_SQL=false"
ExecStart=/usr/bin/java -jar /home/opc/app.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable danseongsa-backend
```

### 1.4 보안 규칙 설정

Oracle Cloud 콘솔에서:
1. **Networking** → **Virtual Cloud Networks**
2. VCN 선택 → **Security Lists**
3. **Ingress Rules** → **Add Ingress Rules**
4. 설정:
   - **Source Type**: CIDR
   - **Source CIDR**: 0.0.0.0/0
   - **IP Protocol**: TCP
   - **Destination Port Range**: 8080

### 1.5 백엔드 배포

```bash
# 로컬에서 실행
export ORACLE_VM_IP=your-ip-address
chmod +x deploy-oracle-cloud.sh
./deploy-oracle-cloud.sh
```

또는 수동 배포:

```bash
# 로컬에서 빌드
cd backend
./gradlew clean build

# 서버에 업로드
scp build/libs/backend-0.0.1-SNAPSHOT.jar opc@<your-ip>:/home/opc/app.jar

# 서버에서 시작
ssh opc@<your-ip>
sudo systemctl start danseongsa-backend
sudo systemctl status danseongsa-backend
```

### 1.6 백엔드 URL 확인

```
http://<your-public-ip>:8080
```

---

## 2단계: Vercel 배포 (프론트엔드)

### 2.1 Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속 및 가입
2. GitHub 계정 연동

### 2.2 프로젝트 배포

1. Vercel 대시보드 → **Add New** → **Project**
2. GitHub 저장소 선택
3. 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 환경 변수 설정

Vercel 프로젝트 → **Settings** → **Environment Variables**:

```
VITE_API_BASE_URL = http://<your-oracle-vm-ip>:8080
```

또는 HTTPS를 사용하려면:
```
VITE_API_BASE_URL = https://your-backend-domain.com
```

### 2.4 재배포

환경 변수 추가 후 자동으로 재배포됩니다.

### 2.5 프론트엔드 URL 확인

Vercel이 자동으로 도메인을 제공합니다:
```
https://your-project.vercel.app
```

---

## 3단계: CORS 설정 업데이트

프론트엔드 URL을 백엔드 CORS에 추가:

```bash
# 서버에 SSH 접속
ssh opc@<your-ip>

# 서비스 파일 수정
sudo nano /etc/systemd/system/danseongsa-backend.service

# CORS_ALLOWED_ORIGINS 업데이트
Environment="CORS_ALLOWED_ORIGINS=https://your-project.vercel.app"

# 서비스 재시작
sudo systemctl daemon-reload
sudo systemctl restart danseongsa-backend
```

---

## 4단계: 테스트

1. 프론트엔드 URL 접속
2. 회원가입/로그인 테스트
3. 상품 조회/등록 테스트
4. API 호출 확인 (브라우저 개발자 도구)

---

## 🔧 트러블슈팅

### 백엔드 연결 안 됨

```bash
# 서버 상태 확인
ssh opc@<your-ip>
sudo systemctl status danseongsa-backend

# 로그 확인
sudo journalctl -u danseongsa-backend -f

# 포트 확인
sudo netstat -tlnp | grep 8080
```

### CORS 오류

- 프론트엔드 URL이 `CORS_ALLOWED_ORIGINS`에 정확히 포함되어 있는지 확인
- HTTP/HTTPS 프로토콜 일치 확인

### Oracle DB 연결 실패

- Oracle Cloud 콘솔에서 Network Access 설정 확인
- VM의 공인 IP를 허용 목록에 추가

---

## 💡 추가 팁

### 도메인 연결 (선택사항)

1. **백엔드**: Oracle Cloud에서 도메인 연결 (추가 비용 없음)
2. **프론트엔드**: Vercel에서 커스텀 도메인 추가 (무료)

### HTTPS 설정

- **프론트엔드**: Vercel이 자동으로 HTTPS 제공
- **백엔드**: Oracle Cloud Load Balancer 사용 (무료 티어 포함) 또는 Cloudflare 사용

### 모니터링

- **Vercel**: 대시보드에서 자동 모니터링
- **Oracle Cloud**: Cloud Monitoring 사용 (무료 티어 포함)

---

## 📊 비용 요약

| 항목 | 비용 |
|------|------|
| Oracle Cloud VM | $0/월 (Always Free) |
| Oracle Cloud DB | $0/월 (이미 사용 중) |
| Vercel | $0/월 (무료 플랜) |
| **총계** | **$0/월** |

---

## ✅ 체크리스트

- [ ] Oracle Cloud VM 인스턴스 생성
- [ ] 서버 초기 설정 완료
- [ ] 백엔드 배포 완료
- [ ] 보안 규칙 설정 완료
- [ ] Vercel에 프론트엔드 배포 완료
- [ ] 환경 변수 설정 완료
- [ ] CORS 설정 업데이트 완료
- [ ] 모든 기능 테스트 완료

---

## 🎉 완료!

이제 완전 무료로 전세계 어디서든 접속 가능한 서비스가 준비되었습니다!

문제가 발생하면 [DEPLOYMENT_FREE.md](./DEPLOYMENT_FREE.md)의 트러블슈팅 섹션을 참고하세요.

