# LANGUAGE POLICY

**Status:** FIXED  
**Policy ID:** `LANGUAGE_V1`  
**Purpose:** Ensure the agent always provides human-readable output in either Bahasa Indonesia or English, based on the language used by the owner/request.

---

## 1. Primary Rule

The agent MUST produce all human-readable responses, reports, explanations, progress updates, status messages, and final summaries in:

- **Bahasa Indonesia**, or
- **English**

No other natural language is permitted unless the owner explicitly requests it.

---

## 2. Language Selection

The agent MUST determine the response language from the latest owner instruction.

### Rule A: Indonesian input

If the owner's latest instruction is primarily Bahasa Indonesia:

> Respond in Bahasa Indonesia.

### Rule B: English input

If the owner's latest instruction is primarily English:

> Respond in English.

### Rule C: Mixed Indonesian/English input

If the owner's instruction contains both languages:

1. Determine the dominant natural language.
2. Use that language for the response.
3. Preserve technical terms that are conventionally written in English.

Example:

```text
Owner:
"Tolong audit the browser harness dan give me the result."
```

Expected response language:

```text
Bahasa Indonesia
```

### Rule D: Ambiguous language

If the language cannot be determined reliably:

> Default to Bahasa Indonesia.

---

## 3. Language Persistence

The agent MUST treat the owner's current language preference as persistent for the active conversation/job unless the owner changes it.

A language change may be explicit:

```text
Gunakan English mulai sekarang.
```

or:

```text
Mulai sekarang gunakan Bahasa Indonesia.
```

The agent MUST immediately follow the new preference.

---

## 4. No Unnecessary Language Switching

The agent MUST NOT switch languages merely because:

- a tool output is in English;
- an error message is in English;
- source code is in English;
- documentation is in English;
- a dependency uses English terminology;
- the operating system is in English;
- a CLI command produces English output.

The explanatory response remains in the selected owner language.

---

## 5. Technical Content Preservation

The following MAY remain in their original technical form:

- code;
- commands;
- file paths;
- URLs;
- API names;
- function names;
- variable names;
- environment variables;
- error codes;
- JSON keys;
- schema names;
- protocol names;
- CLI output;
- log output;
- product names;
- proper nouns.

Example:

```text
Perintah berikut menghasilkan `VERIFY: PASS`:

.\\control\\control-plane.ps1 verify
```

The command and output are preserved exactly, while the explanation remains Indonesian.

---

## 6. Do Not Translate Identifiers

Never translate or rename technical identifiers solely for language consistency.

Examples:

```text
AUTONOMOUS_WORKER_V1
HRDP_V1
RESOURCE_DESCRIPTOR
CONTROL PLANE
RETURN HOME
HARD STOP
MCP
Playwright
GitHub Copilot
```

may remain unchanged where they function as identifiers or established technical terms.

---

## 7. Agent Internal Work

The agent may internally reason, inspect files, invoke tools, or process documentation in any language required by the tool or source.

This does NOT change the required output language.

The final human-readable result MUST follow this policy.

---

## 8. Generated Artifacts

Generated documentation, reports, READMEs, audit reports, and other human-readable artifacts MUST use the selected owner language unless the owner explicitly requests another language.

Examples:

```text
Owner language = Bahasa Indonesia
→ Report language = Bahasa Indonesia
```

```text
Owner language = English
→ Report language = English
```

Technical identifiers remain unchanged.

---

## 9. Logs and Raw Evidence

Raw tool output, logs, stack traces, command output, JSON, and machine-readable data MUST NOT be translated if translation would alter the evidence.

When presenting them:

1. preserve the original output;
2. explain the meaning in the selected response language.

Example:

```text
Raw output:
HRDP_DESCRIPTOR_SOURCE_UNAVAILABLE
```

Explanation:

```text
Artinya sumber descriptor tepercaya belum tersedia.
```

---

## 10. Error Reporting

Error reports MUST use the selected owner language for explanation.

Required structure:

```text
Status:
Root Cause:
Impact:
Action:
Next State:
```

The field labels should follow the selected language.

Bahasa Indonesia:

```text
Status:
Penyebab:
Dampak:
Tindakan:
State Berikutnya:
```

English:

```text
Status:
Root Cause:
Impact:
Action:
Next State:
```

---

## 11. Final Response Rule

Before sending a response, the agent MUST perform a language consistency check:

```text
Is the human-readable response Bahasa Indonesia or English?
YES → send
NO  → rewrite before sending
```

The agent MUST NOT send a response containing unexplained paragraphs in a third language.

---

## 12. Explicit Owner Override

The owner may explicitly request a different output language for a specific task.

Example:

```text
Buat laporan ini dalam English.
```

That instruction applies to the requested artifact/task.

After the task is complete, normal language selection resumes unless the owner explicitly changes the persistent preference.

---

## 13. Priority

Language policy MUST NOT override higher-priority:

- security policy;
- authorization policy;
- control-plane policy;
- scope restrictions;
- platform restrictions;
- fail-closed requirements;
- owner safety rules.

Language controls presentation, not authority.

---

## 14. Default

When no explicit preference exists:

> **Default output language: Bahasa Indonesia.**

---

## 15. Canonical Rule

> **Always communicate with the owner in Bahasa Indonesia or English. Match the owner's current language. Preserve technical identifiers and raw evidence. Never allow language switching to change authority, scope, or execution policy.**
