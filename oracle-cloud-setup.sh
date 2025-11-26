#!/bin/bash

# Oracle Cloud VM 초기 설정 스크립트
# 이 스크립트는 서버에서 실행하세요: bash oracle-cloud-setup.sh

echo "🔧 Oracle Cloud VM 초기 설정을 시작합니다..."

# 1. Java 17 설치
echo "☕ Java 17 설치 중..."
sudo yum install -y java-17-openjdk java-17-openjdk-devel

# 2. 방화벽 설정
echo "🔥 방화벽 설정 중..."
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# 3. 업로드 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p ~/uploads/images
mkdir -p ~/uploads/reviewImages
chmod -R 755 ~/uploads

# 4. systemd 서비스 파일 생성
echo "⚙️ systemd 서비스 설정 중..."
sudo tee /etc/systemd/system/danseongsa-backend.service > /dev/null <<EOF
[Unit]
Description=Danseongsa Backend Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
Environment="DB_URL=jdbc:oracle:thin:@jc4dxlbowsuduo56_high"
Environment="DB_USERNAME=ADMIN"
Environment="DB_PASSWORD=your_password_here"
Environment="CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app"
Environment="JPA_SHOW_SQL=false"
ExecStart=/usr/bin/java -jar $HOME/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 5. 서비스 활성화
echo "🚀 서비스 활성화 중..."
sudo systemctl daemon-reload
sudo systemctl enable danseongsa-backend

echo "✅ 설정 완료!"
echo ""
echo "📝 다음 단계:"
echo "1. /etc/systemd/system/danseongsa-backend.service 파일을 편집하여 환경 변수를 설정하세요"
echo "2. app.jar 파일을 ~/ 디렉토리에 업로드하세요"
echo "3. sudo systemctl start danseongsa-backend 명령으로 서비스를 시작하세요"
echo "4. sudo systemctl status danseongsa-backend 명령으로 상태를 확인하세요"

