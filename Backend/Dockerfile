FROM openjdk:17-jdk-slim

WORKDIR /app
COPY target/nutrition_analyser-0.0.1-SNAPSHOT.jar nutrition_analyser.jar

EXPOSE 8080

CMD ["java", "-jar", "nutrition_analyser.jar"]