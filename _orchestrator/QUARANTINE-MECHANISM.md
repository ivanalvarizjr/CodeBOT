# CodeBOT Folder Quarantine Mechanism

**Status:** design/reference contract. This document and its JSON template do not themselves enforce file-system access.

## Purpose

Quarantine is a path-based deny policy for CodeBOT's orchestration chain. A quarantined directory and its descendants must not be read, searched, used as task input, dispatched to a specialist, executed from, or modified. Quarantine does not move, rename, delete, or change ACLs on files.

## Owner commands

Use an absolute, fully specified path:

- `nonaktifkan D:\apps\CodeBOT\legacy` places that path in `QUARANTINED` state.
- `aktifkan D:\apps\CodeBOT\legacy` removes quarantine for that exact path, unless an ancestor remains quarantined.
- `disable <absolute-path>` / `enable <absolute-path>` are accepted English equivalents.
- `tidak ada perubahan` means do not change folder state for the current task.

At the beginning of each new task involving project files/workspaces, if the owner has not already provided a folder directive and folder state has not been confirmed for that task, Orchestrator asks:

> Apakah ada folder yang ingin diaktifkan atau dinonaktifkan untuk task ini? Kirim path absolut lengkap. Contoh: `nonaktifkan D:\apps\CodeBOT\legacy` atau `aktifkan D:\apps\CodeBOT\legacy`. Jawab `tidak ada perubahan` bila tidak ada.

The question is asked once per task and is skipped when the owner has already stated a clear directive. It is not needed for conversation-only tasks.

## Semantics

- `ACTIVE` means a path is eligible for inclusion in a task scope. It is **not** blanket read/write permission and does not add the folder to the current task scope automatically.
- `QUARANTINED` denies access through the whole orchestration chain, even if a task approval otherwise lists that path.
- Quarantined parent always wins over active child. A child cannot be reactivated until the parent is explicitly reactivated or a separate, technically supported exception model is approved.
- Paths outside the approved project root need separate scope approval.
- Do not follow junctions, symlinks, reparse points, mount points, or other path aliases if their actual target cannot be determined safely.
- Missing/invalid/unreadable configuration is `UNKNOWN / NOT_CONFIGURED`; do not claim all paths are active or that quarantine is enforced.

## Change process

1. Parse explicit owner intent and validate an absolute path. Reject relative paths, wildcards, unresolved environment variables, or ambiguous paths; ask for a complete path.
2. Update the active task's logical quarantine state immediately from a clear `nonaktifkan`/`aktifkan` instruction. This session state is not persistent unless a verified runtime state store exists.
3. For a newly quarantined path, halt dispatches that may touch the path. If an agent is already acting there, request cancellation only using a supported runtime feature. Do not claim cancellation succeeded until evidence confirms it; otherwise mark the task `BLOCKED`.
4. For an activated path, remove the exact quarantine entry if applicable. Do not auto-expand task scope; reassess scope and request a new approval if it materially changes.
5. Persisting the state to `_orchestrator/config/quarantine.json` is a file mutation. Propose the exact file/path change and wait for the required technical approval before delegating it to a specialist. The Orchestrator must not write files or execute shell directly.
6. Report the path, action, session/persistent state, scope implications, and enforcement evidence. Do not enumerate the contents of quarantined directories.

## Configuration template

`_orchestrator/config/quarantine.json` is a proposed format. The JSON file is not automatically read by any runtime unless an adapter actually implements it. `enforcement_status` must not be changed to a stronger value without runtime/OS evidence.

Example entry for a folder the owner has deactivated:

```json
{
  "path": "D:\\apps\\CodeBOT\\legacy",
  "state": "QUARANTINED",
  "scope": "directory_and_descendants",
  "source": "owner",
  "reason": "owner-request"
}
```

Example `ACTIVE` entry, for audit clarity after an explicit reactivation:

```json
{
  "path": "D:\\apps\\CodeBOT\\legacy",
  "state": "ACTIVE",
  "scope": "directory_and_descendants",
  "source": "owner",
  "reason": "owner-request"
}
```

When overlapping entries exist, quarantine wins: an active child cannot override a quarantined parent. Duplicate normalized paths are configuration errors and must be resolved, not guessed.

## Enforcement levels

- `POLICY_ONLY`: instructions/state recorded by Orchestrator; not a security boundary.
- `RUNTIME_ENFORCED`: runtime tool gate actually denies access, supported by test evidence.
- `OS_ENFORCED`: filesystem ACL/sandbox boundary actually denies access, supported by test evidence.
- `NOT_VERIFIED`: evidence is insufficient or unavailable.

A `.agent.md` instruction or JSON file by itself is never proof of runtime or OS enforcement. If available tools cannot enforce quarantine, report the limitation clearly and do not claim a specialist is technically prevented from bypassing it.
