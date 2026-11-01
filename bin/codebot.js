#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Fungsi deteksi Git Bash untuk Windows
function getShellCommand() {
  if (process.platform === "win32") {
    const possibleBashPaths = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
      "bash", 
    ];
    for (const path of possibleBashPaths) {
      if (existsSync(path)) return path;
    }
    return "bash";
  }
  return "bash"; // Linux / macOS
}

function executeScript(scriptName, args) {
  const bashCmd = getShellCommand();
  const scriptPath = join(rootDir, scriptName);

  console.log(`\n🚀 Menjalankan ${scriptName}...\n`);

  const result = spawnSync(bashCmd, [scriptPath, ...args], {
    stdio: "inherit",
    cwd: rootDir,
  });

  if (result.error) {
    console.error(`❌ Gagal menjalankan ${scriptName}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`❌ Proses berhenti dengan kode: ${result.status}`);
    process.exit(result.status);
  }

  console.log(`\n✅ Proses ${scriptName} selesai!`);
}

// --- LOGIKA UTAMA ---
const userArgs = process.argv.slice(2);
const isUninstall = userArgs[0] === "uninstall";

if (isUninstall) {
  // Jika user mengetik "codebot uninstall", buang kata "uninstall" dari argumen
  // agar argumen berikutnya (misal: 1, 2, atau 3) diteruskan ke uninstall.sh
  const uninstallArgs = userArgs.slice(1);
  executeScript("uninstall.sh", uninstallArgs);
} else {
  // Jika user hanya mengetik "codebot" atau "codebot 1", jalankan installer
  executeScript("install.sh", userArgs);
}