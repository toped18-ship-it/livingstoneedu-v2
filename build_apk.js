import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const logFile = "./build.log";
const out = fs.openSync(logFile, "w");

fs.writeSync(out, "=== APK Build Started at " + new Date().toISOString() + " ===\n");

try {
  const child = spawn("npx", ["cap", "build", "android", "--androidreleasetype", "APK"], {
    env: { ...process.env, JAVA_HOME: path.resolve("./jdk21") },
    detached: true,
    stdio: ["ignore", out, out]
  });

  child.unref();
  console.log("Build process successfully spawned in background. PID:", child.pid);
} catch (err) {
  fs.writeSync(out, "Spawn failed: " + err.stack + "\n");
  console.error("Spawn failed:", err);
}

process.exit(0);
