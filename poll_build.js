import { spawn } from "child_process";
import fs from "fs";

const logFile = "./build.log";
const pidFile = "./build.pid";

// Check if build is already running
let pid = null;
try {
  pid = fs.readFileSync(pidFile, "utf8").trim();
} catch (e) {}

// Check if that PID is actually running
let isRunning = false;
if (pid) {
  try {
    process.kill(Number(pid), 0);
    isRunning = true;
  } catch (e) {}
}

if (!isRunning) {
  // Clear old logs
  try { fs.unlinkSync(logFile); } catch (e) {}
  
  // Start the background build process
  const out = fs.openSync(logFile, "w");
  fs.writeSync(out, "=== APK Build Started at " + new Date().toISOString() + " ===\n");
  
  const child = spawn("npx", ["cap", "build", "android", "--androidreleasetype", "APK"], {
    env: { ...process.env, JAVA_HOME: "/usr/lib/jvm/java-17-openjdk-amd64" },
    detached: true,
    stdio: ["ignore", out, out]
  });
  
  pid = child.pid;
  fs.writeFileSync(pidFile, String(pid));
  child.unref();
  console.log("Spawned new build with PID:", pid);
} else {
  console.log("Resuming tracking of active build PID:", pid);
}

// Now read logFile and tail it for up to 40 seconds
let lastSize = 0;
const startTime = Date.now();

function printNewLogs() {
  try {
    const stats = fs.statSync(logFile);
    if (stats.size > lastSize) {
      const fd = fs.openSync(logFile, "r");
      const buffer = Buffer.alloc(stats.size - lastSize);
      fs.readSync(fd, buffer, 0, buffer.length, lastSize);
      fs.closeSync(fd);
      process.stdout.write(buffer.toString());
      lastSize = stats.size;
    }
  } catch (e) {}
}

const interval = setInterval(() => {
  printNewLogs();
  
  // Check if build process is still running
  let stillRunning = false;
  try {
    process.kill(Number(pid), 0);
    stillRunning = true;
  } catch (e) {}
  
  if (!stillRunning) {
    clearInterval(interval);
    printNewLogs();
    console.log("\n=== BUILD_PROCESS_EXITED ===");
    process.exit(0);
  }
  
  // Timeout prevention (40 seconds max per run)
  if (Date.now() - startTime > 40000) {
    clearInterval(interval);
    printNewLogs();
    console.log("\n=== BUILD_STILL_RUNNING_TIMEOUT_SAFETY ===");
    process.exit(0);
  }
}, 1500);
