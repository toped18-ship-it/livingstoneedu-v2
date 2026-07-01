#!/bin/bash
# Regenerate Gradle Wrapper with validated version

set -e

cd android

# Use Gradle 8.14.3 as specified in gradle-wrapper.properties
./gradlew wrapper --gradle-version 8.14.3

echo "✓ Gradle Wrapper regenerated successfully"
