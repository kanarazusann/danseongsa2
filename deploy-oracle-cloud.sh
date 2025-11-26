#!/bin/bash

# Oracle Cloud VM에 배포하는 스크립트

echo "🚀 Oracle Cloud에 배포를 시작합니다..."

# 설정 확인
if [ -z "$ORACLE_VM_IP" ]; then
    echo "❌ ORACLE_VM_IP 환경 변수가 설정되지 않았습니다."
    echo "사용법: export ORACLE_VM_IP=your-ip-address"
    exit 1
fi

if [ -z "$ORACLE_VM_USER" ]; then
    ORACLE_VM_USER="opc"
fi

# 1. 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
cd backend
./gradlew clean build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

echo "✅ 빌드 완료"

# 2. JAR 파일 업로드
echo "📤 서버에 파일 업로드 중..."
scp build/libs/backend-0.0.1-SNAPSHOT.jar ${ORACLE_VM_USER}@${ORACLE_VM_IP}:/home/${ORACLE_VM_USER}/app.jar

if [ $? -ne 0 ]; then
    echo "❌ 파일 업로드 실패"
    echo "SSH 키가 설정되어 있는지 확인하세요."
    exit 1
fi

# 3. 서버에서 재시작
echo "🔄 서비스 재시작 중..."
ssh ${ORACLE_VM_USER}@${ORACLE_VM_IP} << EOF
sudo systemctl restart danseongsa-backend
sleep 2
sudo systemctl status danseongsa-backend --no-pager
EOF

echo "✅ 배포 완료!"
echo "📋 서버 URL: http://${ORACLE_VM_IP}:8080"

