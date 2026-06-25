import { execSync } from "child_process";

console.log("Installing openjdk-21-jdk-headless via apt...");
try {
  execSync("DEBIAN_FRONTEND=noninteractive apt-get install -y openjdk-21-jdk-headless -o Dir::Log=/tmp", { stdio: "inherit" });
  console.log("Successfully installed openjdk-21-jdk-headless!");
} catch (err) {
  console.error("Failed to install openjdk-21-jdk-headless:", err.message);
}
