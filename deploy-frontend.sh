#!/bin/bash

# 프론트엔드 배포 스크립트

echo "🚀 프론트엔드 배포를 시작합니다..."

# 환경 변수 확인
if [ -z "$VITE_API_BASE_URL" ]; then
    echo "⚠️ VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다."
    echo "예시: export VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com"
    read -p "백엔드 URL을 입력하세요: " BACKEND_URL
    export VITE_API_BASE_URL=$BACKEND_URL
fi

# 1. 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

echo "✅ 빌드 완료"

# 2. S3 버킷 확인 및 생성
BUCKET_NAME="danseongsa-frontend"
REGION="ap-northeast-2"

echo "☁️ S3 버킷 확인 중..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "📦 S3 버킷 생성 중..."
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
fi

# 3. 파일 업로드
echo "📤 S3에 파일 업로드 중..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

# 4. 정적 웹사이트 호스팅 활성화
echo "🌐 정적 웹사이트 호스팅 설정 중..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document index.html

echo "✅ 배포 완료!"
echo "📋 S3 버킷 URL: http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo "💡 CloudFront를 설정하면 HTTPS와 CDN을 사용할 수 있습니다."

