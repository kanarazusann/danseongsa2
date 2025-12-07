# 🔐 Git 보안 가이드

이 프로젝트를 GitHub에 공개하기 전에 **반드시 확인**해야 할 사항들입니다.

## ⚠️ 절대 Git에 올리면 안 되는 파일들

### 1. 환경 변수 파일
- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `application.properties` (실제 값이 있는 파일)

### 2. 인증 정보 파일
- ❌ Oracle Wallet 폴더 (`wallet/`)
  - `cwallet.sso`
  - `keystore.jks`
  - `truststore.jks`
  - `tnsnames.ora`
  - `sqlnet.ora`
  - `ojdbc.properties`

### 3. 업로드된 파일
- ❌ `uploads/` 폴더

## ✅ 이미 .gitignore에 추가된 항목들

다음 항목들은 이미 `.gitignore` 파일에 포함되어 있습니다:

```gitignore
# Environment Variables
.env
.env.local
.env.*.local
application-local.properties
application-dev.properties
application-prod.properties

# Oracle Wallet
wallet/
**/wallet/
*.jks
*.sso
*.ora

# Uploads
uploads/
**/uploads/
```

## 🔍 이미 Git에 올라간 민감한 파일 확인하기

만약 이미 민감한 파일이 Git에 커밋되어 있다면, 다음 명령어로 확인할 수 있습니다:

```bash
# Git 히스토리에서 민감한 파일 확인
git log --all --full-history -- "**/.env*"
git log --all --full-history -- "**/application.properties"
git log --all --full-history -- "**/wallet/**"
```

## 🛠️ 이미 올라간 민감한 파일 제거하기

### 방법 1: Git 히스토리에서 완전히 제거 (추천)

```bash
# 1. Git 히스토리에서 파일 삭제
git rm --cached backend/src/main/resources/application.properties
git rm --cached -r backend/src/main/resources/wallet/

# 2. 변경사항 커밋
git commit -m "Remove sensitive files from repository"

# 3. 원격 저장소에 푸시
git push origin main
```

### 방법 2: BFG Repo-Cleaner 사용 (히스토리 완전 삭제)

```bash
# 1. BFG 다운로드 및 설치
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. 민감한 파일 삭제
bfg --delete-files application.properties
bfg --delete-files wallet/

# 3. Git 가비지 컬렉션 실행
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 📝 공개 전 체크리스트

### Backend
- [ ] `backend/src/main/resources/application.properties` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `application.properties.example` 파일만 Git에 포함되어 있는지 확인
- [ ] `wallet/` 폴더가 Git에 포함되어 있지 않은지 확인
- [ ] 하드코딩된 비밀번호, API 키가 없는지 확인

### Frontend
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.example` 파일만 Git에 포함되어 있는지 확인
- [ ] 하드코딩된 API 키가 없는지 확인

### 일반
- [ ] `uploads/` 폴더가 Git에 포함되어 있지 않은지 확인
- [ ] Git 히스토리에서 민감한 정보가 없는지 확인

## 🔒 환경 변수 설정 방법

### Frontend (Vite)
1. `frontend/.env.example` 파일을 복사하여 `.env` 파일 생성
2. 실제 값으로 변경:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   VITE_TOSS_CLIENT_KEY=your_toss_client_key
   ```

### Backend (Spring Boot)
1. `backend/src/main/resources/application.properties.example` 파일을 복사하여 `application.properties` 파일 생성
2. 실제 값으로 변경하거나 환경 변수 사용

또는 IDE에서 환경 변수로 설정:
- IntelliJ IDEA: Run Configuration > Environment Variables
- VS Code: `.vscode/launch.json`에 환경 변수 추가

## 📚 참고 자료

- [Git 보안 모범 사례](https://git-scm.com/book/en/v2/Git-Tools-Revising-History)
- [GitHub 보안 가이드](https://docs.github.com/en/code-security)
- [Spring Boot 외부화된 설정](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)

