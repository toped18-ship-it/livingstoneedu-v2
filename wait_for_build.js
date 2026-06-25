import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const buildPidFile = "./build.pid";
let pid = null;
try {
  pid = Number(fs.readFileSync(buildPidFile, "utf8").trim());
} catch (e) {}

console.log("Checking build process with PID:", pid);

// Wait loop (max 30 seconds per run of this script to avoid timeout)
const startTime = Date.now();
let completed = false;

while (Date.now() - startTime < 30000) {
  let isRunning = false;
  if (pid) {
    try {
      process.kill(pid, 0);
      isRunning = true;
    } catch (e) {}
  }
  
  // Also check if any other gradle/java processes are running
  if (!isRunning) {
    try {
      const psOutput = execSync("ps -ef").toString();
      if (psOutput.includes("gradle-wrapper.jar") || psOutput.includes("GradleDaemon")) {
        isRunning = true;
      }
    } catch (e) {}
  }
  
  if (!isRunning) {
    completed = true;
    break;
  }
  
  // Sleep 3 seconds
  execSync("sleep 3");
}

if (completed) {
  console.log("Gradle build finished! Searching for generated APKs...");
  
  // Find all .apk files
  const searchDir = "./android/app/build/outputs/apk";
  let apkFiles = [];
  
  function findApks(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findApks(fullPath);
      } else if (file.endsWith(".apk")) {
        apkFiles.push(fullPath);
      }
    }
  }
  
  findApks(searchDir);
  console.log("Found APKs:", apkFiles);
  
  if (apkFiles.length > 0) {
    const srcApk = apkFiles[0];
    
    // Ensure targets exist
    fs.mkdirSync(".build-outputs", { recursive: true });
    fs.mkdirSync("APK_DOWNLOAD", { recursive: true });
    
    // Copy
    fs.copyFileSync(srcApk, ".build-outputs/app-debug.apk");
    fs.copyFileSync(srcApk, "APK_DOWNLOAD/app-debug.apk");
    
    console.log("Successfully copied APK to targets!");
    console.log("Target 1 stats:", fs.statSync(".build-outputs/app-debug.apk"));
    console.log("Target 2 stats:", fs.statSync("APK_DOWNLOAD/app-debug.apk"));
  } else {
    console.log("No APK found in build outputs directory!");
    // Check if the build failed, print logs
    try {
      console.log("Last 50 lines of build log:");
      const logs = fs.readFileSync("./build.log", "utf8").split("\n");
      console.log(logs.slice(-50).join("\n"));
    } catch (err) {}
  }
} else {
  console.log("Build is still in progress. Run again to monitor.");
}
