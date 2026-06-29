#!/bin/bash
# Regenerate the Gradle wrapper JAR
cd android
./gradlew wrapper --gradle-version=8.14.3
cd ..
