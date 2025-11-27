   FROM gradle:8.10.2-jdk17-alpine AS build
   WORKDIR /app
   COPY . .
   RUN chmod +x gradlew 

# 2. 실행용 이미지
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

# Render가 지정하는 포트 사용
ENV PORT=8080
ENV SERVER_PORT=8080

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]