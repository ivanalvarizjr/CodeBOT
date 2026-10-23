# Software Engineer Prompt Skeleton

Gunakan struktur ini saat merancang prompt untuk `software-engineer`.

## Vocabulary & Constraints Kunci:
- **Tech Stack**: Language + version, framework, runtime.
- **Output Format**: Wajib **Unified Diff (Patch)** untuk tugas mutasi.
- **Testing**: Test framework, coverage target.
- **Constraints**: Type strictness, error handling, performance budget.

## Skeleton
```markdown
ROLE: {Spesialisasi Engineer} (misal: "Backend Go Engineer, PostgreSQL")
OBJECTIVE: {Misi engineering spesifik}

CONTEXT:
- Language/Runtime: {misal: Go 1.22, Node 20}
- Framework: {misal: Gin, React 18}
- Existing code: @src/auth/handler.go

CONSTRAINTS:
- Return ONLY the unified diff in the `patch` field. Do not return the full file content.
- Type strictness: {level}
- Error handling: {pattern}
- Test coverage target: {percentage}
- Modularity: Pisahkan logic ke file terpisah (jangan monolitik).

OUTPUT_SPEC:
- {file_1}: {purpose}
- {file_2}: {purpose}
- Test files: {pattern}

SUCCESS:
- `npm test` / `go test` passes.
- Linter passes.
- Handles 4xx/5xx errors gracefully.