# ==========================================
# Stage 1: Build the Vite frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and configuration files
COPY frontend/ ./

# Build the frontend production bundle (produces /app/frontend/dist)
RUN npm run build

# ==========================================
# Stage 2: Build the Spring Boot backend
# ==========================================
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

# Copy the pom.xml to cache maven dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source
COPY backend/src ./src

# Copy the built frontend static assets into Spring Boot's static resources directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/

# Build the backend package (skipping tests for build speed)
RUN mvn clean package -DskipTests

# ==========================================
# Stage 3: Run the unified application
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the generated JAR from the builder stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Expose default port (Render will configure PORT, which Spring Boot matches)
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
