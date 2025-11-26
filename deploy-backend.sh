#!/bin/bash

# 백엔드 배포 스크립트

echo "🚀 백엔드 배포를 시작합니다..."

# 1. 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
cd backend
./gradlew clean build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

echo "✅ 빌드 완료"

# 2. Elastic Beanstalk 배포
echo "☁️ Elastic Beanstalk에 배포 중..."

# EB CLI가 설치되어 있는지 확인
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요: pip install awsebcli"
    exit 1
fi

# 환경이 없으면 생성
if ! eb list &> /dev/null; then
    echo "📝 Elastic Beanstalk 환경 초기화 중..."
    eb init -p java-17 -r ap-northeast-2
    eb create danseongsa-backend-env
else
    # 기존 환경에 배포
    eb deploy
fi

echo "✅ 배포 완료!"
echo "📋 환경 상태 확인: eb status"
echo "📋 로그 확인: eb logs"

