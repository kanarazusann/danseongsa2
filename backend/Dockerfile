# 빌드 스테이지
FROM gradle:8.10.2-jdk17-alpine AS build
WORKDIR /app
COPY backend/ .
RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

# wallet 폴더가 있으면 tar로 압축 (Git에 없어도 빌드는 성공)
RUN if [ -d "src/main/resources/wallet" ]; then \
      tar czf /tmp/wallet.tar.gz -C src/main/resources wallet; \
    else \
      touch /tmp/wallet.tar.gz; \
    fi

# 실행 스테이지
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

# wallet tar 파일 복사 및 압축 해제 (빈 파일이면 스킵)
COPY --from=build /tmp/wallet.tar.gz /tmp/
RUN if [ -s /tmp/wallet.tar.gz ]; then \
      tar xzf /tmp/wallet.tar.gz -C /app && \
      rm /tmp/wallet.tar.gz; \
    else \
      mkdir -p /app/wallet; \
      rm /tmp/wallet.tar.gz; \
    fi

ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]