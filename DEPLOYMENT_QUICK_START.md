# 🚀 빠른 배포 가이드

이 문서는 단성사 프로젝트를 AWS에 빠르게 배포하는 방법을 안내합니다.

## 📋 필수 준비사항

1. AWS 계정 및 AWS CLI 설치
2. Oracle Cloud DB 접근 권한
3. 도메인 (선택사항)

---

## 1단계: 백엔드 배포 (Elastic Beanstalk)

### 1.1 프로젝트 빌드

```bash
cd backend
./gradlew clean build
```

### 1.2 Elastic Beanstalk 초기화

```bash
# EB CLI 설치 (없는 경우)
pip install awsebcli

# EB 초기화
eb init -p java-17 -r ap-northeast-2

# 환경 생성 및 배포
eb create danseongsa-backend-env
```

### 1.3 환경 변수 설정

```bash
eb setenv \
  DB_URL="jdbc:oracle:thin:@jc4dxlbowsuduo56_high" \
  DB_USERNAME="ADMIN" \
  DB_PASSWORD="your_password" \
  MAIL_HOST="smtp.gmail.com" \
  MAIL_PORT="587" \
  MAIL_USERNAME="your_email@gmail.com" \
  MAIL_PASSWORD="your_app_password" \
  TOSS_SECRET_KEY="your_toss_secret_key" \
  CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com" \
  JPA_SHOW_SQL="false"
```

또는 AWS 콘솔에서:
1. Elastic Beanstalk 콘솔 접속
2. 환경 선택 → Configuration → Software → Environment properties
3. 위의 환경 변수 추가

### 1.4 배포 URL 확인

```bash
eb status
```

백엔드 URL 예시: `http://danseongsa-backend-env.elasticbeanstalk.com`

---

## 2단계: 프론트엔드 배포 (S3 + CloudFront)

### 2.1 빌드

```bash
cd frontend

# .env.production 파일 생성
echo "VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com" > .env.production

# 빌드
npm install
npm run build
```

### 2.2 S3 업로드

```bash
# S3 버킷 생성
aws s3 mb s3://danseongsa-frontend --region ap-northeast-2

# 빌드 파일 업로드
aws s3 sync dist/ s3://danseongsa-frontend --delete

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://danseongsa-frontend \
  --index-document index.html \
  --error-document index.html
```

### 2.3 CloudFront 배포

1. [CloudFront 콘솔](https://console.aws.amazon.com/cloudfront) 접속
2. **Create Distribution** 클릭
3. **Origin Domain**: `danseongsa-frontend.s3.ap-northeast-2.amazonaws.com` 선택
4. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
5. **Default Root Object**: `index.html`
6. **Error Pages**:
   - 403 → 200 → `/index.html`
   - 404 → 200 → `/index.html`
7. **Create Distribution** 클릭

### 2.4 프론트엔드 URL 확인

CloudFront 배포 완료 후 (약 5-10분 소요):
- CloudFront 도메인: `https://d1234567890.cloudfront.net`

---

## 3단계: CORS 설정 업데이트

프론트엔드 URL을 백엔드 CORS 설정에 추가:

```bash
eb setenv CORS_ALLOWED_ORIGINS="https://your-cloudfront-url.cloudfront.net"
```

---

## 4단계: 테스트

1. 프론트엔드 URL 접속
2. 회원가입/로그인 테스트
3. 상품 조회/등록 테스트
4. 결제 기능 테스트

---

## 🔧 트러블슈팅

### 백엔드 연결 오류

```bash
# 로그 확인
eb logs

# 환경 상태 확인
eb status
eb health
```

### 프론트엔드 API 호출 실패

1. 브라우저 개발자 도구 → Network 탭 확인
2. CORS 오류인지 확인
3. 백엔드 URL이 올바른지 확인

### Oracle DB 연결 실패

1. Oracle Cloud 콘솔에서 Network Access 설정 확인
2. Elastic Beanstalk IP 주소 허용 목록에 추가
3. Wallet 파일이 JAR에 포함되었는지 확인

---

## 📝 체크리스트

- [ ] 백엔드 배포 완료
- [ ] 환경 변수 설정 완료
- [ ] 프론트엔드 빌드 및 배포 완료
- [ ] CloudFront 배포 완료
- [ ] CORS 설정 업데이트 완료
- [ ] 모든 기능 테스트 완료
- [ ] HTTPS 적용 확인
- [ ] 도메인 연결 (선택사항)

---

## 💰 예상 비용

- **Elastic Beanstalk (t3.small)**: 약 $15-20/월
- **S3**: 약 $1-5/월
- **CloudFront**: 약 $1-10/월
- **총계**: 약 $20-40/월

---

## 📚 추가 정보

자세한 내용은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참고하세요.

