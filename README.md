# 단성사(Danseongsa) 쇼핑몰 프로젝트

패션 쇼핑몰 플랫폼 (Full-Stack Web Application)

## 🛠️ 기술 스택

### Frontend
- **React 19** - 사용자 인터페이스
- **React Router DOM** - 라우팅
- **Vite** - 빌드 도구
- **CSS Modules** - 스타일링

### Backend
- **Java 17** - 프로그래밍 언어
- **Spring Boot 3.5.7** - 백엔드 프레임워크
- **Spring Data JPA** - 데이터베이스 ORM
- **Spring Security** - 보안 및 인증
- **Spring Mail** - 이메일 서비스
- **Hibernate** - JPA 구현체
- **Lombok** - 보일러플레이트 코드 제거

### Database
- **Oracle Database** - 관계형 데이터베이스
- **JDBC** - 데이터베이스 연결
- **Oracle Wallet** - 보안 인증

### Cloud & Infrastructure
- **AWS S3** - 이미지 파일 저장
- **Oracle Cloud** - 데이터베이스 호스팅
- **Vercel** - 프론트엔드 배포

### External APIs
- **Toss Payments SDK** - 결제 시스템
- **Brevo** - 이메일 인증 서비스

### Development Tools
- **Gradle** - 빌드 자동화
- **Git** - 버전 관리

## 📁 프로젝트 구조

```
danseongsa2/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── utils/         # 유틸리티 함수
│   └── public/            # 정적 파일
│
├── backend/           # Spring Boot 백엔드
│   └── src/main/java/com/example/backend/
│       ├── controller/    # REST API 컨트롤러
│       ├── service/       # 비즈니스 로직
│       ├── dao/           # 데이터 접근 객체
│       ├── repository/    # JPA Repository
│       ├── entity/        # JPA 엔티티
│       └── dto/           # 데이터 전송 객체
│
└── oracle_db_schema.sql   # 데이터베이스 스키마
```

## 🚀 시작하기

### 사전 요구사항
- Java 17 이상
- Node.js 18 이상
- Oracle Database (또는 Oracle Cloud)
- AWS 계정 (S3 사용 시)

### 환경 변수 설정

1. **Backend 설정**
   ```bash
   cd backend/src/main/resources
   cp application.properties.example application.properties
   ```
   
   `application.properties` 파일을 열어 다음 환경 변수를 설정하세요:
   - `DB_URL`: Oracle 데이터베이스 연결 URL
   - `DB_USERNAME`: 데이터베이스 사용자명
   - `DB_PASSWORD`: 데이터베이스 비밀번호
   - `BREVO_API_KEY`: Brevo 이메일 서비스 API 키
   - `MAIL_FROM`: 발신 이메일 주소
   - `TOSS_SECRET_KEY`: Toss Payments 시크릿 키
   - `AWS_ACCESS_KEY_ID`: AWS Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key
   - `AWS_S3_BUCKET`: S3 버킷 이름
   - `AWS_S3_BASE_URL`: S3 Base URL

2. **Oracle Wallet 설정**
   - Oracle Cloud Autonomous Database를 사용하는 경우, `wallet` 폴더를 `backend/src/main/resources/` 경로에 배치하세요
   - Wallet 파일들은 `.gitignore`에 포함되어 Git에 올라가지 않습니다

### 실행 방법

**Backend 실행:**
```bash
cd backend
./gradlew bootRun
```

**Frontend 실행:**
```bash
cd frontend
npm install
npm run dev
```

## 📚 주요 기능

- 👤 사용자 인증 (회원가입, 로그인, 이메일 인증)
- 🛍️ 상품 조회 및 검색
- 🛒 장바구니 기능
- 💳 주문 및 결제 (Toss Payments)
- ⭐ 리뷰 및 평점 시스템
- 🎨 판매자 상품 등록 및 관리
- 💰 환불/교환 신청 및 처리
- 📦 주문 관리 (구매자/판매자)

## 🔐 보안 주의사항

⚠️ **중요**: 이 프로젝트는 포트폴리오 목적으로 공개되었습니다.

- `application.properties` 파일은 `.gitignore`에 포함되어 Git에 올라가지 않습니다
- 실제 운영 환경에서는 환경 변수 또는 시크릿 관리 서비스를 사용하세요
- Oracle Wallet 파일과 같은 민감한 정보는 절대 Git에 커밋하지 마세요

## 📄 라이선스

이 프로젝트는 포트폴리오 목적으로 제작되었습니다.

## 👨‍💻 개발자

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

