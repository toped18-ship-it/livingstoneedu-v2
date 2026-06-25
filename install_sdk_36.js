import { execSync } from "child_process";

const sdkmanagerPath = "/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager";
const sdkDir = "/opt/android-sdk";

console.log("Checking available packages under platforms and build-tools...");
try {
  // Let's run sdkmanager to install platforms;android-36
  console.log("Installing platforms;android-36 and build-tools;34.0.0 (already installed)...");
  // We can compile against 36 using build-tools 34.0.0 or 35.0.0 or 36.0.0-rc1.
  // Let's install platforms;android-36 first!
  execSync(`${sdkmanagerPath} --sdk_root=${sdkDir} "platforms;android-36"`, { stdio: "inherit" });
  console.log("Successfully installed platforms;android-36!");
} catch (err) {
  console.error("Failed to install platforms;android-36:", err.message);
}
