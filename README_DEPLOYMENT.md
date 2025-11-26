# 📚 배포 문서

이 프로젝트를 AWS에 배포하기 위한 문서입니다.

## 📖 문서 목록

1. **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** - 빠른 배포 가이드 (추천)
2. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 상세 배포 가이드

## 🚀 빠른 시작

### 백엔드 배포

```bash
# 방법 1: 스크립트 사용 (권장)
chmod +x deploy-backend.sh
./deploy-backend.sh

# 방법 2: 수동 배포
cd backend
./gradlew clean build
eb init -p java-17 -r ap-northeast-2
eb create danseongsa-backend-env
eb setenv DB_URL="..." DB_USERNAME="..." ...
```

### 프론트엔드 배포

```bash
# 방법 1: 스크립트 사용 (권장)
export VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com
chmod +x deploy-frontend.sh
./deploy-frontend.sh

# 방법 2: 수동 배포
cd frontend
echo "VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com" > .env.production
npm install
npm run build
aws s3 sync dist/ s3://danseongsa-frontend --delete
```

## 🔧 환경 변수 설정

### 백엔드 (Elastic Beanstalk)

필수 환경 변수:
- `DB_URL`: Oracle DB 연결 URL
- `DB_USERNAME`: DB 사용자명
- `DB_PASSWORD`: DB 비밀번호
- `CORS_ALLOWED_ORIGINS`: 허용할 프론트엔드 도메인 (쉼표로 구분)

선택 환경 변수:
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`: 메일 설정
- `TOSS_SECRET_KEY`: 토스페이먼츠 시크릿 키
- `JPA_SHOW_SQL`: SQL 로그 출력 여부 (기본값: true)

### 프론트엔드

빌드 시 환경 변수:
- `VITE_API_BASE_URL`: 백엔드 API URL

## 📝 체크리스트

배포 전 확인사항:
- [ ] Oracle Cloud DB Network Access 설정 (AWS IP 허용)
- [ ] 환경 변수 준비 완료
- [ ] AWS CLI 및 EB CLI 설치 완료
- [ ] AWS 자격 증명 설정 완료 (`aws configure`)

배포 후 확인사항:
- [ ] 백엔드 URL 접속 가능
- [ ] 프론트엔드 URL 접속 가능
- [ ] API 호출 정상 작동
- [ ] CORS 설정 확인
- [ ] HTTPS 적용 확인

## 💡 팁

1. **비용 절감**: t3.micro 또는 t3.small 인스턴스 사용
2. **보안**: 환경 변수에 민감한 정보 저장, HTTPS 필수
3. **모니터링**: CloudWatch로 로그 및 메트릭 확인
4. **백업**: 정기적인 데이터베이스 백업

## 🆘 문제 해결

자세한 트러블슈팅은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)의 "트러블슈팅" 섹션을 참고하세요.

## 📞 지원

배포 중 문제가 발생하면:
1. AWS 콘솔의 로그 확인
2. Elastic Beanstalk 환경 상태 확인
3. CloudFront 배포 상태 확인

