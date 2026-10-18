# CodeBOT B1 contract

## Scope

B1 creates exactly five new files. It does not implement functional adapters, runtime registration or dispatch, technical approval enforcement, mutative tests, build, deployment, installer, dependencies, or external-service access.

## Provenance schema

`profiles/canonical/provenance.json` uses schema version `1.0.0`, exactly five profile entries, and required fields `role`, `path`, and `sha256`. Paths are relative and must remain under `profiles/canonical/`. SHA-256 values are uppercase hexadecimal digests of the exact profile bytes. Hashes must be revalidated immediately before creation; any mismatch stops implementation and is escalated.

## Preservation

Canonical profiles, `_orchestrator\*`, quarantine controls, and `language.md` are preserved. No existing file may be overwritten. Rollback requires separate applicable approval and may remove only files actually created by this implementation.
