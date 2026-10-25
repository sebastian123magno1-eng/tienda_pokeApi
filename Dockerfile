# Multi-stage build for Spring Boot application with Java 21
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy Maven project definition and source files
COPY pom.xml .
COPY src ./src

# Build the executable jar (skip unit tests during image build)
RUN mvn clean package -DskipTests

# Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built artifact from builder stage
COPY --from=build /app/target/*.jar app.jar

# Spring Boot web port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
