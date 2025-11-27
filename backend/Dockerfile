FROM gradle:8.10.2-jdk17-alpine AS build
WORKDIR /app
COPY backend/ .
RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
COPY backend/wallet /app/wallet
ENV TNS_ADMIN=/app/wallet
ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]