# Repository Map - Phase 1

- Workspace: `/Volumes/Taoruide外接/IB Economics`
- Prior effective Git root: `/Volumes/Taoruide外接` (dirty outer repository; out of scope)
- Intended independent Git root: `/Volumes/Taoruide外接/IB Economics`
- Existing user source: one copyrighted 71,043,156-byte Cambridge Economics PDF
- Source SHA-256: `9480e122347676992b525c4188db5cda0ffb3c2c0d7d01be51305e7ce0bacba2`
- Existing application source: none
- Project profile: React/TypeScript PWA after setup; content-heavy static application plus separate Worker template
- Verifier strategy: content validator, TypeScript, Vitest, production Vite build, Worker contract tests, and Playwright/browser visual checks
- Safety boundary: the source PDF is ignored before nested Git initialization; no outer-repository files may be changed
