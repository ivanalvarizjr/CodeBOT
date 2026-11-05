#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PostHog } from 'posthog-node';
import dotenv from 'dotenv'; // PERBAIKAN 1: Import dotenv
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// ==========================================
// 1. KONFIGURASI ENVIRONMENT & TELEMETRI
// ==========================================
dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(rootDir, '.env') }); 

const posthogApiKey = process.env.POSTHOG_API_KEY || 'phc_kWvYUyqeyEeMwtf2M9FzARoxcTE4t5nGnQBARcHJ8UP5';
const isTelemetryDisabled = process.env.DO_NOT_TRACK === '1' || process.env.DO_NOT_TRACK === 'true';

const analytics = (!isTelemetryDisabled && posthogApiKey) 
  ? new PostHog(posthogApiKey, { 
      host: 'https://us.i.posthog.com', // PERBAIKAN 2: Gunakan .i. (Ingestion Host)
      flushAt: 1,                      // PERBAIKAN 3: Kirim segera setelah 1 event
      flushInterval: 0                 // Jangan tunggu antrean
    }) 
  : null;

function getShellCommandAndArgs(scriptName, args) {
  const scriptPath = join(rootDir, scriptName);

  if (process.platform === "win32") {
    const bashPaths = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
    ];
    for (const path of bashPaths) {
      if (existsSync(path)) {
        return { cmd: path, args: [scriptPath, ...args] };
      }
    }

    const bashCheck = spawnSync("bash", ["-c", "echo ok"], { shell: true });
    if (bashCheck.status === 0) {
      return { cmd: "bash", args: [scriptPath, ...args] };
    }

    console.log("⚠️  Git Bash tidak ditemukan. Mencoba menggunakan WSL...");
    const wslCheck = spawnSync("wsl", ["--status"], { shell: true });
    if (wslCheck.status === 0) {
      const wslScriptPath = scriptPath
        .replace(/\\/g, "/")
        .replace(/^([A-Za-z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
      return { cmd: "wsl", args: ["bash", wslScriptPath, ...args] };
    }

    console.error("❌ ERROR: Git Bash atau WSL tidak ditemukan.");
    console.error("Silakan instal Git for Windows (https://git-scm.com/download/win) terlebih dahulu.");
    process.exit(1);
  }

  return { cmd: "bash", args: [scriptPath, ...args] };
}

async function main() {
  const userArgs = process.argv.slice(2);
  const isUninstall = userArgs[0] === "uninstall";

  const scriptName = isUninstall ? "uninstall.sh" : "install.sh";
  const scriptArgs = isUninstall ? userArgs.slice(1) : userArgs;

  // Kirim Telemetri ke PostHog Cloud
  if (analytics) {
    analytics.capture({
      distinctId: `${os.hostname()}_${process.platform}`, 
      event: isUninstall ? 'global_uninstall' : 'global_install',
      properties: {
        os: process.platform,
        node_version: process.version,
        is_ci: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
      }
    });
  }

  console.log(`\n🚀 Menjalankan ${scriptName}...\n`);

  const { cmd, args } = getShellCommandAndArgs(scriptName, scriptArgs);

  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  // Pastikan event PostHog terkirim sebelum aplikasi ditutup
  if (analytics) {
    await analytics.shutdown().catch(() => {});
  }

  if (result.error) {
    console.error(`❌ Gagal: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

main();