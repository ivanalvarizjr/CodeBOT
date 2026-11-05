#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function getShellCommandAndArgs(scriptName, args) {
  const scriptPath = join(rootDir, scriptName);

  if (process.platform === "win32") {
    // 1. Coba cari Git Bash di lokasi default
    const bashPaths = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
    ];
    for (const path of bashPaths) {
      if (existsSync(path)) {
        return { cmd: path, args: [scriptPath, ...args] };
      }
    }

    // 2. Coba cari 'bash' di PATH
    const bashCheck = spawnSync("bash", ["-c", "echo ok"], { shell: true });
    if (bashCheck.status === 0) {
      return { cmd: "bash", args: [scriptPath, ...args] };
    }

    // 3. Fallback ke WSL jika Git Bash benar-benar tidak ada
    console.log("⚠️  Git Bash tidak ditemukan. Mencoba menggunakan WSL...");
    const wslCheck = spawnSync("wsl", ["--status"], { shell: true });
    if (wslCheck.status === 0) {
      // Konversi path Windows (D:\...) ke format WSL (/mnt/d/...)
      const wslScriptPath = scriptPath
        .replace(/\\/g, "/")
        .replace(
          /^([A-Za-z]):/,
          (match, drive) => `/mnt/${drive.toLowerCase()}`,
        );
      return { cmd: "wsl", args: ["bash", wslScriptPath, ...args] };
    }

    // 4. Jika semuanya gagal
    console.error("❌ ERROR: Git Bash atau WSL tidak ditemukan.");
    console.error(
      "Silakan instal Git for Windows (https://git-scm.com/download/win) terlebih dahulu.",
    );
    process.exit(1);
  }

  // Linux / macOS
  return { cmd: "bash", args: [scriptPath, ...args] };
}

function main() {
  const userArgs = process.argv.slice(2);
  const isUninstall = userArgs[0] === "uninstall";

  const scriptName = isUninstall ? "uninstall.sh" : "install.sh";
  const scriptArgs = isUninstall ? userArgs.slice(1) : userArgs;

  console.log(`\n🚀 Menjalankan ${scriptName}...\n`);

  // Ambil cmd dan args dari fungsi
  const { cmd, args } = getShellCommandAndArgs(scriptName, scriptArgs);

  // PERBAIKAN: Gunakan 'cmd' dan 'args' di sini, bukan 'bashCmd' dan 'installScript'
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  if (result.error) {
    console.error(`❌ Gagal: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

main();