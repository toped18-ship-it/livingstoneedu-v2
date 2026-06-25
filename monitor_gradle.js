import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const logFile = "./build.log";
const pidFile = "./build.pid";

let pid = null;
try {
  pid = Number(fs.readFileSync(pidFile, "utf8").trim());
} catch (e) {}

console.log("Monitoring Gradle build. PID:", pid);

let lastSize = 0;
const startTime = Date.now();

function printNewLogs() {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > lastSize) {
        const fd = fs.openSync(logFile, "r");
        const buffer = Buffer.alloc(stats.size - lastSize);
        fs.readSync(fd, buffer, 0, buffer.length, lastSize);
        fs.closeSync(fd);
        process.stdout.write(buffer.toString());
        lastSize = stats.size;
      }
    }
  } catch (e) {}
}

const interval = setInterval(() => {
  printNewLogs();
  
  // Check if PID is running
  let isRunning = false;
  if (pid) {
    try {
      process.kill(pid, 0);
      isRunning = true;
    } catch (e) {}
  }
  
  // If PID is not running, double check if there's any active Gradle compilation
  if (!isRunning) {
    try {
      const ps = execSync("ps -ef").toString();
      if (ps.includes("gradle-wrapper.jar") || ps.includes("GradleDaemon")) {
        isRunning = true;
      }
    } catch (e) {}
  }
  
  if (!isRunning) {
    clearInterval(interval);
    printNewLogs();
    console.log("\n=== Gradle Build Finished! ===");
    
    // Search for generated APKs
    const apkSrc = "./android/app/build/outputs/apk/debug/app-debug.apk";
    if (fs.existsSync(apkSrc)) {
      const stats = fs.statSync(apkSrc);
      console.log(`\nSuccess! APK generated at: ${apkSrc}`);
      console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
      
      // Ensure target folders exist
      fs.mkdirSync(".build-outputs", { recursive: true });
      fs.mkdirSync("APK_DOWNLOAD", { recursive: true });
      
      // Copy to targets
      fs.copyFileSync(apkSrc, ".build-outputs/app-debug.apk");
      fs.copyFileSync(apkSrc, "APK_DOWNLOAD/app-debug.apk");
      
      console.log("Copied APK to .build-outputs/app-debug.apk");
      console.log("Copied APK to APK_DOWNLOAD/app-debug.apk");
      console.log("Verification of APK_DOWNLOAD/app-debug.apk stats:", fs.statSync("APK_DOWNLOAD/app-debug.apk"));
    } else {
      console.log("\nERROR: No APK was found at expected location:", apkSrc);
      // Let's search if any APK was generated anywhere under android/
      try {
        const findOutput = execSync("find android -name '*.apk'").toString().trim();
        if (findOutput) {
          console.log("APKs found elsewhere:", findOutput);
        } else {
          console.log("No APKs found under android/ folder at all.");
        }
      } catch (err) {}
    }
    process.exit(0);
  }
  
  // Safety timeout for one invocation (45 seconds) to prevent shell_exec timeouts
  if (Date.now() - startTime > 45000) {
    clearInterval(interval);
    printNewLogs();
    console.log("\n=== Monitoring Timeout. Build is still compiling in background... ===");
    process.exit(0);
  }
}, 2000);
