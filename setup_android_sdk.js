import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

// Installing inside the workspace to ensure full persistence!
const sdkDir = path.resolve("./android-sdk");
const cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip";
const zipPath = "/tmp/commandlinetools.zip";

console.log("=== Android SDK Auto-Installer (Persistent Workspace) ===");
console.log("SDK Target Directory:", sdkDir);

// 1. Create directories
console.log("Creating SDK directory...");
fs.mkdirSync(sdkDir, { recursive: true });
fs.mkdirSync("/tmp", { recursive: true });

// 2. Download zip if not already downloaded
if (!fs.existsSync(zipPath)) {
  console.log(`Downloading Android Command Line Tools from ${cmdlineToolsUrl}...`);
  execSync(`curl -L -o ${zipPath} ${cmdlineToolsUrl}`, { stdio: "inherit" });
} else {
  console.log("Zip already downloaded.");
}

// 3. Extract zip
const extractDir = path.join(sdkDir, "cmdline-tools");
fs.mkdirSync(extractDir, { recursive: true });

console.log("Extracting zip...");
execSync(`unzip -o -q ${zipPath} -d ${extractDir}`, { stdio: "inherit" });

// Move to latest
console.log("Reorganizing to latest...");
const tempSubdir = path.join(extractDir, "cmdline-tools");
const latestDir = path.join(extractDir, "latest");

if (fs.existsSync(latestDir)) {
  fs.rmSync(latestDir, { recursive: true, force: true });
}

if (fs.existsSync(tempSubdir)) {
  fs.renameSync(tempSubdir, latestDir);
  console.log("Moved cmdline-tools/cmdline-tools to cmdline-tools/latest");
}

// 4. Accept Licenses
console.log("Accepting Android SDK licenses...");
const sdkmanagerPath = path.join(latestDir, "bin", "sdkmanager");
if (!fs.existsSync(sdkmanagerPath)) {
  console.error("sdkmanager not found at path:", sdkmanagerPath);
  process.exit(1);
}

// Write licenses
const licenseDir = path.join(sdkDir, "licenses");
fs.mkdirSync(licenseDir, { recursive: true });
const yesProcess = spawn("sh", ["-c", `yes | ${sdkmanagerPath} --sdk_root=${sdkDir} --licenses`]);

yesProcess.on("close", (code) => {
  console.log(`License agreement process closed with code ${code}`);
  
  // 5. Install SDK Platforms, Build-Tools, Platform-Tools
  console.log("Installing platforms;android-35, build-tools;35.0.0, and platform-tools...");
  try {
    execSync(`${sdkmanagerPath} --sdk_root=${sdkDir} "platforms;android-35" "build-tools;35.0.0" "platform-tools"`, { stdio: "inherit" });
    console.log("SDK installation complete inside persistent workspace!");
  } catch (err) {
    console.error("Error during SDK packages installation:", err);
  }
});
