import { spawn, execSync } from "child_process";
import fs from "fs";

const logFile = "./build.log";
const pidFile = "./build.pid";

// Clear previous logs
try { fs.unlinkSync(logFile); } catch (e) {}

const out = fs.openSync(logFile, "w");
fs.writeSync(out, "=== APK Debug Build Started at " + new Date().toISOString() + " ===\n");

// Make gradlew executable
try {
  execSync("chmod +x android/gradlew");
  fs.writeSync(out, "Made gradlew executable\n");
} catch (err) {
  fs.writeSync(out, "Chmod gradlew error: " + err.stack + "\n");
}

try {
  // We run assembleDebug in the android folder
  const child = spawn("./gradlew", ["assembleDebug", "--stacktrace"], {
    cwd: "./android",
    env: { 
      ...process.env, 
      JAVA_HOME: "/usr/lib/jvm/java-21-openjdk-amd64",
      ANDROID_HOME: "/app/applet/android-sdk"
    },
    detached: true,
    stdio: ["ignore", out, out]
  });

  const pid = child.pid;
  fs.writeFileSync(pidFile, String(pid));
  child.unref();
  
  console.log("Gradle build successfully spawned in background. PID:", pid);
  fs.writeSync(out, `Spawned gradlew assembleDebug with PID: ${pid}\n`);
} catch (err) {
  fs.writeSync(out, "Spawn failed: " + err.stack + "\n");
  console.error("Spawn failed:", err);
}

process.exit(0);
