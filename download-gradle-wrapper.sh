#!/bin/bash
# Download official Gradle 8.14.3 wrapper JAR
cd "$(dirname "$0")"
wget -q https://services.gradle.org/distributions/gradle-8.14.3-bin.zip -O /tmp/gradle-8.14.3.zip
unzip -q -o /tmp/gradle-8.14.3.zip gradle-8.14.3/gradle/wrapper/gradle-wrapper.jar -d /tmp
cp /tmp/gradle-8.14.3/gradle/wrapper/gradle-wrapper.jar android/gradle/wrapper/gradle-wrapper.jar
rm -rf /tmp/gradle-8.14.3 /tmp/gradle-8.14.3.zip
echo "Gradle wrapper updated successfully"
sha256sum android/gradle/wrapper/gradle-wrapper.jar
