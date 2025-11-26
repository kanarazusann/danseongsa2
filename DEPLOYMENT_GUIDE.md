# 🚀 AWS 배포 가이드

이 문서는 단성사 프로젝트를 AWS에 배포하는 방법을 안내합니다.

## 📋 목차

1. [배포 아키텍처](#배포-아키텍처)
2. [사전 준비사항](#사전-준비사항)
3. [Oracle DB 설정](#oracle-db-설정)
4. [백엔드 배포 (Elastic Beanstalk)](#백엔드-배포-elastic-beanstalk)
5. [프론트엔드 배포 (S3 + CloudFront)](#프론트엔드-배포-s3--cloudfront)
6. [환경 변수 설정](#환경-변수-설정)
7. [도메인 연결](#도메인-연결)
8. [모니터링 및 로그](#모니터링-및-로그)

---

## 배포 아키텍처

```
┌─────────────────┐
│   CloudFront    │ (CDN)
│   (프론트엔드)    │
└────────┬────────┘
         │
    ┌────▼────┐
    │   S3    │ (정적 파일)
    └─────────┘
         │
         │ API 호출
         ▼
┌─────────────────┐
│ Elastic Beanstalk│ (백엔드)
│  Spring Boot     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Oracle Cloud   │ (데이터베이스)
│  Autonomous DB  │
└─────────────────┘
```

---

## 사전 준비사항

### 1. AWS 계정 생성
- AWS 계정이 필요합니다
- [AWS 콘솔](https://console.aws.amazon.com)에 로그인

### 2. 필요한 AWS 서비스
- **Elastic Beanstalk**: 백엔드 배포
- **S3**: 프론트엔드 정적 파일 저장
- **CloudFront**: CDN 및 HTTPS
- **IAM**: 권한 관리

### 3. 도구 설치
```bash
# AWS CLI 설치
# Windows: https://aws.amazon.com/cli/
# 또는 Chocolatey 사용
choco install awscli

# EB CLI 설치
pip install awsebcli
```

---

## Oracle DB 설정

현재 Oracle Cloud의 Autonomous Database를 사용 중입니다. 배포 시 다음을 확인하세요:

### 1. 네트워크 접근 설정
- Oracle Cloud 콘솔에서 **Network Access** 설정
- AWS Elastic Beanstalk의 IP 주소 범위를 허용 목록에 추가
- 또는 **0.0.0.0/0** (모든 IP 허용) - 보안상 권장하지 않음

### 2. Wallet 파일 확인
- `backend/src/main/resources/wallet/` 폴더의 파일들이 빌드에 포함되는지 확인
- JAR 파일에 wallet 파일이 포함되어야 함

### 3. 연결 문자열
- 환경 변수 `DB_URL`에 Oracle DB 연결 문자열 설정
- 예: `jdbc:oracle:thin:@jc4dxlbowsuduo56_high`

---

## 백엔드 배포 (Elastic Beanstalk)

### 1. 프로젝트 빌드

```bash
cd backend
./gradlew clean build
```

빌드된 JAR 파일: `backend/build/libs/backend-0.0.1-SNAPSHOT.jar`

### 2. Elastic Beanstalk 애플리케이션 생성

#### 방법 1: AWS 콘솔 사용

1. [Elastic Beanstalk 콘솔](https://console.aws.amazon.com/elasticbeanstalk) 접속
2. **Create Application** 클릭
3. 설정:
   - **Application name**: `danseongsa-backend`
   - **Platform**: Java
   - **Platform version**: Java 17 running on 64bit Amazon Linux 2023
   - **Application code**: Upload your code
   - JAR 파일 업로드

#### 방법 2: EB CLI 사용

```bash
# EB CLI 초기화
cd backend
eb init

# 환경 생성
eb create danseongsa-backend-env

# 배포
eb deploy
```

### 3. 환경 변수 설정

Elastic Beanstalk 콘솔에서 **Configuration** → **Software** → **Environment properties**에 다음 변수 추가:

```
DB_URL=jdbc:oracle:thin:@jc4dxlbowsuduo56_high
DB_USERNAME=ADMIN
DB_PASSWORD=your_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=
TOSS_SECRET_KEY=your_toss_secret_key
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
JPA_SHOW_SQL=false
```

### 4. 파일 업로드 경로 설정

Elastic Beanstalk는 임시 스토리지를 사용하므로, S3를 사용하는 것이 좋습니다.

**옵션 1: S3 사용 (권장)**
- 이미지 업로드를 S3로 변경
- `backend/src/main/java/com/example/backend/config/WebConfig.java` 수정 필요

**옵션 2: EBS 볼륨 마운트**
- Elastic Beanstalk에 EBS 볼륨 추가
- `/var/app/current/uploads` 경로 사용

### 5. 포트 설정

Elastic Beanstalk는 자동으로 포트를 할당합니다. `application.properties`에 다음 추가:

```properties
server.port=5000
```

---

## 프론트엔드 배포 (S3 + CloudFront)

### 1. 빌드

```bash
cd frontend
npm install
npm run build
```

빌드된 파일: `frontend/dist/`

### 2. S3 버킷 생성

```bash
# S3 버킷 생성
aws s3 mb s3://danseongsa-frontend --region ap-northeast-2

# 빌드 파일 업로드
aws s3 sync frontend/dist/ s3://danseongsa-frontend --delete

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://danseongsa-frontend \
  --index-document index.html \
  --error-document index.html
```

또는 AWS 콘솔에서:
1. S3 콘솔 접속
2. **Create bucket** 클릭
3. 버킷 이름: `danseongsa-frontend`
4. 리전: `ap-northeast-2` (서울)
5. **Properties** → **Static website hosting** 활성화
6. `dist/` 폴더의 모든 파일 업로드

### 3. CloudFront 배포

1. [CloudFront 콘솔](https://console.aws.amazon.com/cloudfront) 접속
2. **Create Distribution** 클릭
3. 설정:
   - **Origin Domain**: S3 버킷 선택
   - **Origin Path**: 비워둠
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS
   - **Default Root Object**: index.html
   - **Error Pages**:
     - 403 → 200 → /index.html
     - 404 → 200 → /index.html

### 4. 환경 변수 설정

프론트엔드 빌드 시 환경 변수를 설정해야 합니다:

```bash
# .env.production 파일 생성
cd frontend
echo "VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com" > .env.production

# 빌드
npm run build
```

또는 빌드 스크립트 수정:

```json
{
  "scripts": {
    "build": "VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com vite build"
  }
}
```

---

## 환경 변수 설정

### 백엔드 (Elastic Beanstalk)

Elastic Beanstalk 콘솔에서 설정:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DB_URL` | Oracle DB 연결 URL | `jdbc:oracle:thin:@jc4dxlbowsuduo56_high` |
| `DB_USERNAME` | DB 사용자명 | `ADMIN` |
| `DB_PASSWORD` | DB 비밀번호 | `your_password` |
| `MAIL_HOST` | 메일 서버 호스트 | `smtp.gmail.com` |
| `MAIL_PORT` | 메일 서버 포트 | `587` |
| `MAIL_USERNAME` | 메일 계정 | `your_email@gmail.com` |
| `MAIL_PASSWORD` | 메일 앱 비밀번호 | `your_app_password` |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 | `your_secret_key` |
| `CORS_ALLOWED_ORIGINS` | 허용할 프론트엔드 도메인 | `https://your-domain.com` |
| `JPA_SHOW_SQL` | SQL 로그 출력 여부 | `false` |

### 프론트엔드

빌드 시 환경 변수 설정:

```bash
VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com npm run build
```

---

## 도메인 연결

### 백엔드 도메인

1. Elastic Beanstalk 환경에 도메인 연결
2. Route 53 또는 다른 DNS 서비스 사용
3. SSL 인증서 적용 (ACM 사용)

### 프론트엔드 도메인

1. CloudFront에 도메인 연결
2. Route 53에서 A 레코드 설정 (Alias)
3. SSL 인증서 적용 (ACM 사용)

---

## 모니터링 및 로그

### Elastic Beanstalk 로그

```bash
# 로그 다운로드
eb logs

# 실시간 로그 스트리밍
eb logs --stream
```

### CloudWatch

- Elastic Beanstalk는 자동으로 CloudWatch에 로그를 전송합니다
- CloudWatch 콘솔에서 로그 확인 가능

### 알람 설정

1. CloudWatch → Alarms
2. Elastic Beanstalk 환경 메트릭 모니터링
3. CPU, 메모리, 요청 수 등 설정

---

## 비용 최적화

### 예상 월 비용 (서울 리전 기준)

- **Elastic Beanstalk**: t3.small 인스턴스 기준 약 $15-20/월
- **S3**: 저장 용량 및 요청 수에 따라 약 $1-5/월
- **CloudFront**: 데이터 전송량에 따라 약 $1-10/월
- **Oracle Cloud DB**: 기존 사용 중이면 추가 비용 없음

**총 예상 비용: 약 $20-40/월**

### 비용 절감 팁

1. **Elastic Beanstalk**:
   - t3.micro 또는 t3.small 사용
   - Auto Scaling 설정으로 필요 시에만 확장

2. **S3**:
   - S3 Standard 사용
   - 불필요한 파일 정기 삭제

3. **CloudFront**:
   - 캐시 설정 최적화
   - 불필요한 지역 제거

---

## 트러블슈팅

### 백엔드 연결 오류

1. **DB 연결 실패**:
   - Oracle Cloud Network Access 설정 확인
   - Wallet 파일이 JAR에 포함되었는지 확인
   - 환경 변수 확인

2. **CORS 오류**:
   - `CORS_ALLOWED_ORIGINS` 환경 변수 확인
   - 프론트엔드 도메인이 정확히 설정되었는지 확인

### 프론트엔드 오류

1. **API 호출 실패**:
   - `VITE_API_BASE_URL` 환경 변수 확인
   - 백엔드 URL이 올바른지 확인
   - CORS 설정 확인

2. **이미지 로드 실패**:
   - 이미지 경로 확인
   - S3 또는 백엔드 이미지 서버 URL 확인

---

## 보안 체크리스트

- [ ] 환경 변수에 민감한 정보 저장 (비밀번호, API 키 등)
- [ ] HTTPS 사용 (CloudFront, Elastic Beanstalk)
- [ ] CORS 설정 제한 (특정 도메인만 허용)
- [ ] Oracle DB Network Access 제한
- [ ] 정기적인 보안 업데이트
- [ ] 로그에서 민감한 정보 제거

---

## 추가 리소스

- [AWS Elastic Beanstalk 문서](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS S3 문서](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront 문서](https://docs.aws.amazon.com/cloudfront/)
- [Oracle Cloud 문서](https://docs.oracle.com/en-us/iaas/Content/Database/Concepts/adboverview.htm)

---

## 문의

배포 중 문제가 발생하면 다음을 확인하세요:
1. AWS 콘솔의 로그
2. Elastic Beanstalk 환경 상태
3. CloudFront 배포 상태
4. Oracle DB 연결 상태

