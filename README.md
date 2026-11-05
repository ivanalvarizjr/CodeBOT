<div align="center">
  <img src="CodeBOT_typografi.png" alt="CodeBOT Typographi" width="400" />
  <p>Advanced Multi-Agent Orchestration Harness</p>
</div>

CodeBOT is a semi-autonomous AI development team for human-controlled workflows. One prompt becomes an Orchestrator-led plan for your approval-then four specialist roles execute the full implementation and report every change, with clear scope, handoffs, and verification. Built for GitHub Copilot App and Codex.

## What’s Included in CodeBOT

The canonical profiles define five roles:

| Role                                | Responsibilities                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orchestrator`                      | Clarifies scope, plans and directs tasks, coordinates specialists, checks approvals, verifies evidence, and reports results. Does not edit files or run shell commands. |
| `data-analyst-manager`              | Analyzes requirements, data, risks, evidence, and recommendations.                                                                                                      |
| `application-uiux-designer-manager` | Defines user requirements, UI/UX flows, visual direction, and design acceptance criteria.                                                                               |
| `software-engineer`                 | Investigates issues, implements approved changes, debugs and tests, and reports technical evidence.                                                                     |
| `prompt-engineer`                   | Prepares prompts and validated output contracts for handoff to specialists.                                                                                             |

The profiles are available in [`profiles/canonical/`](profiles/canonical/).

## How to Use CodeBOT

**For now, use this repository as a human-readable reference for workflows and agent profiles.** CodeBOT does not yet have a supported installer or runtime integration.

1. Clone or download the repository, then read the canonical profiles.
2. To experiment with an agent runtime, manually adapt the profiles to a format supported by that runtime. Do not assume that candidate adapter documents represent a working integration.
3. Follow the documented workflow: define the scope and acceptance criteria; assign tasks to the appropriate specialists; obtain explicit approval before actions that require it; return specialist results to the Orchestrator; and verify changes and evidence before reporting completion.

Example CodeBOT usage:

> @orchestrator Redesign my portfolio website using a Soft Brutalist Editorial Tech design with the color codes `DF301C`, `FF9100`, `FFF1D1`, and `00B7CD`. Do not change the website’s content. Execute.

Use **@** to call the Orchestrator agent profile, which leads the specialist agents.

### Recommended Usage in GitHub Copilot App

For **GitHub Copilot App**, it is recommended to invoke CodeBOT through the **dynamic workflows** mechanism. For example:


> @orchestrator use CodeBOT dynamic workflows to redesign my portfolio website using a Soft Brutalist Editorial Tech design with the color codes `DF301C`, `FF9100`, `FFF1D1`, and `00B7CD`. Do not change the website's content. Execute.

Using the phrase **"use dynamic workflows to..."** is strongly recommended to help ensure reliable orchestration and proper workflow execution.

During the `code` implementation phase, **Autopilot mode is highly recommended**. This helps prevent the orchestrator from falling back to a mode in which it may lack the necessary write tools, potentially disrupting implementation or causing the workflow to drift away from the intended task.

## Supported Platforms (Current)

CodeBOT currently supports **only** the following agent platforms:

| Platform               | Status    | Notes                                                                          |
| ---------------------- | --------- | ------------------------------------------------------------------------------ |
| **GitHub Copilot App** | Supported | Agent profiles must be placed/adapted according to the app's profile format.   |
| **Codex**              | Supported | Agent profiles and plugin-based skills are supported (see installation notes). |

Other agent runtimes, CLIs, or chat integrations are **not supported at this time**. Do not assume that candidate adapter documents or third-party instructions establish compatibility with CodeBOT.

Tentu, ini adalah draf `README.md` yang sudah diperbarui. Saya telah memasukkan metode instalasi **NPM (Node Package Manager)** sebagai metode utama karena jauh lebih praktis dan profesional, sambil tetap mempertahankan metode skrip mentah (`curl`/PowerShell) sebagai alternatif jika pengguna tidak memiliki Node.js.

Silakan salin dan tempel teks di bawah ini ke dalam file `README.md` Anda sebelum melakukan *push* ke repositori:

---

## Installation

You can install CodeBOT using **NPM (Recommended)** or via the **Direct Script**.

### Method 1: NPM (Recommended)
If you have Node.js (v18+) installed, you can install and run CodeBOT globally.

```bash
npm install -g codebott
```

To start the interactive installer, run:
```bash
codebott
```

Or, skip the menu by passing the target ecosystem directly:
*   **GitHub Copilot App:** `codebott 1`
*   **OpenAI Codex CLI:** `codebott 2`

*(Alternatively, you can use `npx codebott` without a global installation).*

### Method 2: Direct Script (Curl / PowerShell)
If you prefer not to use NPM, you can execute the installer script directly.

**For macOS / Linux / WSL / Git Bash:**
```bash
curl -sSL https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh | bash
```

**For Windows PowerShell:**
*GitHub Copilot App:*
```powershell
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh" -OutFile "install.sh"; & "C:\Program Files\Git\bin\bash.exe" ./install.sh 1; Remove-Item "install.sh"
```
*OpenAI Codex CLI:*
```powershell
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh" -OutFile "install.sh"; & "C:\Program Files\Git\bin\bash.exe" ./install.sh 2; Remove-Item "install.sh"
```

---

## Uninstalling CodeBOT

### Method 1: NPM Uninstall
If you installed CodeBOT via NPM, you can easily clean up the agent profiles, skills, and instructions by running the uninstaller wrapper:

```bash
codebott uninstall
```
*(You can also pass `1` for Copilot, `2` for Codex, or `3` for both).*

After cleaning up the local configurations, you can remove the NPM package itself:
```bash
npm uninstall -g codebott
```

### Method 2: Direct Script Uninstall
If you installed via the direct script, run the appropriate command to remove the integration.

**GitHub Copilot App:**
```powershell
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/uninstall.sh" -OutFile "uninstall.sh"; & "C:\Program Files\Git\bin\bash.exe" ./uninstall.sh 1; Remove-Item "uninstall.sh"
```

**OpenAI Codex CLI:**
```powershell
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/uninstall.sh" -OutFile "uninstall.sh"; & "C:\Program Files\Git\bin\bash.exe" ./uninstall.sh 2; Remove-Item "uninstall.sh"
```

---

### Important Notes
*   **Safe Updates:** CodeBOT uses an "update-safe" mechanism. Existing configurations (like `config.toml` or `copilot-instructions.md`) will not be overwritten; backups are created automatically.
*   **Requirements:** If using the Direct Script method on Windows, ensure **Git Bash** is installed. 
*   **Review:** Always review the installation scripts before running them to understand which local files and configurations they will modify.

### Required Skills and Optional Supporting Skills

**Graphify is required for work involving project structure. Agent Reach is required for internet research, web/code searches, URLs, and online platforms. Taste Skill is required as a core skill for application design.** Caveman, described below, is an optional supporting skill and is not a general prerequisite.

#### Graphify - Required

Graphify builds a searchable knowledge graph from project code and documentation. Its official PyPI package name is **`graphifyy`** (with two `y` characters); the command name is `graphify`.

Install the prerequisites for your operating system, then install Graphify:

**Windows (PowerShell):**

```powershell
winget install astral-sh.uv
uv tool install graphifyy
graphify install
```

**macOS (Homebrew):**

```bash
brew install python@3.12 uv
uv tool install graphifyy
graphify install
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt install python3.12 python3-pip pipx
uv tool install graphifyy
graphify install
```

For an alternative way to install `uv` on Ubuntu/Debian, Graphify also documents `curl -LsSf https://astral.sh/uv/install.sh | sh`; afterward, run `uv tool install graphifyy`. For a project-specific Codex installation, use:

```bash
graphify install --project --platform codex
```

Graphify also provides instructions for GitHub Copilot CLI and VS Code Copilot Chat. Those instructions do not establish compatibility with CodeBOT or GitHub Copilot App. See the [official Graphify installation guide](https://github.com/Graphify-Labs/graphify#install).

#### Agent Reach - Required for Internet Research

[Agent Reach](https://github.com/Panniantong/agent-reach) is a router and readiness checker for web, GitHub, RSS, video, and other platform tools. Use this skill for online research, web/code searches, URLs, and supported platforms. Agent Reach is not a command wrapper: once a channel is available, the agent uses the appropriate upstream tool.

Python 3.10 or later is required. The upstream guide recommends `pipx`; the package is installed directly from the official repository:

**Windows (PowerShell; official venv method):**

```powershell
py -3 -m venv "$env:USERPROFILE\.agent-reach-venv"
& "$env:USERPROFILE\.agent-reach-venv\Scripts\Activate.ps1"
python -m pip install https://github.com/Panniantong/agent-reach/archive/main.zip
agent-reach install --env=auto
```

**macOS and Linux (pipx):**

```bash
pipx install https://github.com/Panniantong/agent-reach/archive/main.zip
agent-reach install --env=auto
```

`agent-reach install --env=auto` only checks readiness and does not modify the system. After installation, review the available channels:

```bash
agent-reach doctor --json
```

Installing system dependencies or optional channels requires explicit approval. After the user approves, an example for the OpenCLI channel is:

```bash
agent-reach install --env=auto --system --channels=opencli
```

Select only the channels you need; `--channels=all` may install many tools and modify system configuration. If Homebrew Python blocks a direct installation (PEP 668), use `pipx` or a virtual environment. On Windows, if `python3` opens the Microsoft Store, use the Python Launcher `py -3` as shown above. See the [official Agent Reach installation guide](https://github.com/Panniantong/agent-reach/blob/main/docs/install.md) and [update guide](https://github.com/Panniantong/agent-reach/blob/main/docs/update.md).

#### Taste Skill - Required

[Taste Skill](https://github.com/Leonxlnx/taste-skill) provides `design-taste-frontend` for interface design work. The official Agent Skills installer is available on Windows, macOS, and Linux; Node.js and npm are required:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

The skill scripts require Node.js 22 or later, as well as Chrome, Edge, or Chromium. For Codex, the repository also documents plugin installation:

```bash
codex plugin marketplace add Leonxlnx/taste-skill
codex plugin add taste-skill@taste-skill
```

Start a new Codex session after installing the plugin. See the [official Taste Skill installation instructions](https://github.com/Leonxlnx/taste-skill#install).

#### Caveman - Optional

[Caveman](https://github.com/JuliusBrussee/caveman) provides agent skills and tools, including a skill for concise responses. Its official interactive installer supports Windows, macOS, and Linux. Using `npx` requires Node.js 22.13 or later:

```bash
npx @caveman-ai/cli@latest
```

The repository also provides an installer for version v4.0.1:

**Windows (PowerShell 5.1+):**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/v4.0.1/install.ps1 | iex
```

**macOS and Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/v4.0.1/install.sh | bash
```

These commands execute a downloaded installer script. Review the [official installation instructions](https://github.com/JuliusBrussee/caveman/blob/main/INSTALL.md) before running the script if you want to inspect it first. Check the Caveman repository for the list of supported agents and the latest configuration options.

Berikut adalah pembaruan untuk bagian **Privacy & Telemetry** di `README.md` Anda. Bagian ini dirancang untuk sangat transparan, menjelaskan *mengapa* telemetri ini penting (untuk pengembangan yang terukur), dan memberikan kendali penuh kepada pengguna.

Silakan ganti bagian **Privacy & Telemetry** yang lama di `README.md` Anda dengan teks di bawah ini:

## Privacy & Telemetry

To help us understand how CodeBOT is being used and to continuously improve its features, CodeBOT includes **anonymous usage telemetry**. We believe that building a better tool requires measurable data, but we also deeply respect your privacy.

**What is collected?**
* The command executed (e.g., `global_install`, `global_uninstall`).
* Basic environment info: Operating System, Node.js version, and whether it's running in a CI/CD environment.
* A completely anonymous machine identifier (hashed hostname + OS) to count unique users.

**What is NOT collected?**
* Your source code, file paths, repository names, or any personal data (PII).
* IP addresses are processed anonymously by our analytics provider and are not stored in a way that identifies you.

**Where is the data sent?**
Telemetry is sent securely to **PostHog Cloud**. 
*(Note: The `phc_...` API key you might see in the source code is a public, write-only ingestion key. It cannot be used to read data or access our PostHog account).*

### 🛑 How to Opt-Out

We fully respect your choice to opt-out. 

**Important:** Running `npm install -g codebott` **only downloads** the package and does **not** send any telemetry. Telemetry is only triggered when you actually **run** the `codebott` or `codebott uninstall` command.

If you wish to disable telemetry, you must set the environment variable **before** typing the `codebott` command.

**For Windows (PowerShell):**
1. Open PowerShell.
2. Run this command and press Enter:
   ```powershell
   $env:DO_NOT_TRACK="1"
   ```
3. Then, run the installer:
   ```powershell
   codebott
   ```

**For macOS / Linux (Terminal):**
1. Open your terminal.
2. Run this command and press Enter:
   ```bash
   export DO_NOT_TRACK=1
   ```
3. Then, run the installer:
   ```bash
   codebott
   ```

**Want to opt-out permanently? (Optional)**
*   **Windows**: Search for "Environment Variables" in the Start menu and add a new User Variable named `DO_NOT_TRACK` with the value `1`.
*   **macOS/Linux**: Add `export DO_NOT_TRACK=1` to your `~/.bashrc` or `~/.zshrc` file.

### 🔧 Advanced Configuration (For Privacy-Focused Users)
If you want to route telemetry to your own self-hosted PostHog instance (or disable it via configuration file), you can create a `.env` file in the directory where you run CodeBOT:
```env
POSTHOG_API_KEY=phc_your_own_api_key_here
```
If you provide your own key, no data will be sent to our PostHog Cloud.

## Repository Guide

- [`profiles/canonical/`](profiles/canonical/) - canonical role profiles.
- [`languange.md`] - the language setting for agents. Indonesian and English are currently supported. **Simply place this file in the workspace directory where the agent operates.**


# NOTES

**For `Codex`** Ensure that multi-agent support is enabled. If you are using an older version of Codex and agents are not detected, add the following configuration to your `~/.codex/config.toml` file, or launch Codex with the `--enable multi_agent` flag:

```toml
[features]
multi_agent = true
```
