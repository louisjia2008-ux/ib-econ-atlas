# Current Task

- ID: T011
- Title: Implement progress persistence and versioned backup restore
- Acceptance: IndexedDB persists allowed progress, attempts, preferences and backup metadata; export/import are schema-validated and atomic; merge and confirmed replace work; scope and AI token never enter backups.
- Verification: focused Vitest coverage using fake IndexedDB for round-trip, merge, replace, unknown-point retention and invalid-import rollback.
- Intended file scope: local database, backup service, settings/progress UI and tests.
