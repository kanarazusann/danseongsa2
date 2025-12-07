# ⚠️ 배포 환경 변수 확인 가이드

현재 `application.properties`에서 하드코딩된 민감한 정보를 제거했습니다. 
**배포 환경에서 반드시 환경 변수가 설정되어 있어야 합니다.**

## 🔍 배포 환경 확인 방법

### AWS Elastic Beanstalk

1. **AWS 콘솔 접속**
   - [AWS Elastic Beanstalk 콘솔](https://console.aws.amazon.com/elasticbeanstalk) 접속

2. **환경 변수 확인**
   - 배포된 환경 선택
   - 좌측 메뉴: **Configuration** > **Software** > **Environment properties** 클릭
   - 다음 환경 변수들이 설정되어 있는지 확인:

### ✅ 필수 환경 변수 체크리스트

```
✅ DB_URL              - Oracle DB 연결 URL
✅ DB_USERNAME         - DB 사용자명  
✅ DB_PASSWORD         - DB 비밀번호
✅ BREVO_API_KEY       - Brevo 이메일 API 키
✅ MAIL_FROM           - 발신 이메일 주소
✅ TOSS_SECRET_KEY     - Toss Payments 시크릿 키
✅ AWS_ACCESS_KEY_ID   - AWS Access Key ID
✅ AWS_SECRET_ACCESS_KEY - AWS Secret Access Key
✅ AWS_S3_BUCKET       - S3 버킷 이름
✅ AWS_S3_BASE_URL     - S3 Base URL
```

## 🛠️ 환경 변수 설정 방법

### 방법 1: AWS Elastic Beanstalk 콘솔에서 설정

1. Elastic Beanstalk 콘솔에서 환경 선택
2. **Configuration** > **Software** 클릭
3. **Edit** 버튼 클릭
4. **Environment properties** 섹션에서 환경 변수 추가/수정
5. **Apply** 클릭

### 방법 2: EB CLI로 설정

```bash
eb setenv \
  DB_URL="jdbc:oracle:thin:@your-db-url" \
  DB_USERNAME="ADMIN" \
  DB_PASSWORD="your_password" \
  BREVO_API_KEY="your_brevo_key" \
  MAIL_FROM="your_email@example.com" \
  TOSS_SECRET_KEY="your_toss_key" \
  AWS_ACCESS_KEY_ID="your_aws_key" \
  AWS_SECRET_ACCESS_KEY="your_aws_secret" \
  AWS_S3_BUCKET="your_bucket_name" \
  AWS_S3_BASE_URL="https://your-s3-url.com"
```

### 방법 3: 환경 변수 파일 사용

`.ebextensions/environment.config` 파일 생성:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DB_URL: jdbc:oracle:thin:@your-db-url
    DB_USERNAME: ADMIN
    DB_PASSWORD: your_password
    BREVO_API_KEY: your_brevo_key
    MAIL_FROM: your_email@example.com
    TOSS_SECRET_KEY: your_toss_key
    AWS_ACCESS_KEY_ID: your_aws_key
    AWS_SECRET_ACCESS_KEY: your_aws_secret
    AWS_S3_BUCKET: your_bucket_name
    AWS_S3_BASE_URL: https://your-s3-url.com
```

## ⚠️ 현재 상태 확인

### 로그에서 확인

```bash
# Elastic Beanstalk 로그 확인
eb logs

# 또는 AWS 콘솔에서
# Elastic Beanstalk > Your Environment > Logs
```

로그에서 다음 에러가 보이면 환경 변수가 설정되지 않은 것입니다:
- `Could not resolve placeholder 'DB_URL'`
- `Could not resolve placeholder 'BREVO_API_KEY'`
- 등등...

### 애플리케이션 상태 확인

1. AWS 콘솔에서 환경 상태 확인
   - 상태가 **Severe** 또는 **Warning**이면 환경 변수 확인 필요
2. 헬스 체크 엔드포인트 호출 (있다면)
3. 애플리케이션 로그 확인

## 🔧 문제 해결

### 문제: 애플리케이션이 시작되지 않음

**원인**: 필수 환경 변수가 설정되지 않음

**해결**:
1. 위의 방법으로 환경 변수 설정
2. 환경 재배포 (`eb deploy` 또는 콘솔에서 재배포)

### 문제: 데이터베이스 연결 실패

**원인**: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` 설정 오류

**해결**:
1. Oracle Cloud 콘솔에서 연결 정보 확인
2. 환경 변수 값이 정확한지 확인
3. Oracle Cloud의 Network Access에서 AWS IP 허용 확인

### 문제: 이메일 전송 실패

**원인**: `BREVO_API_KEY` 또는 `MAIL_FROM` 설정 오류

**해결**:
1. Brevo 콘솔에서 API 키 확인
2. 환경 변수 값 확인

## 📝 로컬 개발 환경

로컬에서 개발할 때는 `application.properties` 파일을 직접 수정하거나 
IDE의 환경 변수 설정을 사용하세요.

**중요**: `application.properties` 파일은 `.gitignore`에 포함되어 Git에 올라가지 않습니다.
로컬 개발용으로만 사용하세요.

## 🔐 보안 주의사항

- ✅ 환경 변수는 AWS 콘솔에서만 관리
- ✅ 로컬 `application.properties`는 Git에 커밋하지 않음
- ✅ `.env` 파일도 Git에 커밋하지 않음
- ✅ API 키나 비밀번호를 코드에 하드코딩하지 않음

