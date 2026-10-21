# CodeBOT

CodeBOT is a documentation and agent-profile package for human-controlled, multi-agent software development workflows. It defines the Orchestrator role and four specialist roles, with guidance on task scope, approvals, handoffs, and verification.

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

## Installation

### CodeBOT Repository

Run the following command to install the CodeBOT agent profiles automatically:

**For macOS / Linux:** Open `Terminal`.
**For Windows:** Open `Git Bash`.

Copy the command below and press Enter:

#### for Terminal/Git Bash/WSL

```bash
curl -sSL https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh | bash
```

#### for powershell

##### Github Copilot App

```bash
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh" -OutFile "install.sh"; & "C:\Program Files\Git\bin\bash.exe" ./install.sh 1; Remove-Item "install.sh"
```

##### Codex

```bash
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh" -OutFile "install.sh"; & "C:\Program Files\Git\bin\bash.exe" ./install.sh 2; Remove-Item "install.sh"
```

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

## Repository Guide

- [`profiles/canonical/`](profiles/canonical/) - canonical role profiles.
- [`languange.md`] - the language setting for agents. Indonesian and English are currently supported. **Simply place this file in the workspace directory where the agent operates.**


# NOTES

**For `Codex`** Ensure that multi-agent support is enabled. If you are using an older version of Codex and agents are not detected, add the following configuration to your `~/.codex/config.toml` file, or launch Codex with the `--enable multi_agent` flag:

```toml
[features]
multi_agent = true
```
