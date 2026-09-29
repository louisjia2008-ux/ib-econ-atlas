# Progress Log

## 2026-09-29 - T001

- What changed: locked the mission, created a copyright-safe ignore policy, established an independent nested Git repository, and recorded the source PDF identity without tracking it.
- Verification: PASS - independent root and ignore rule confirmed.
- Files changed: `.gitignore`, `.ralph/task_brief.md`, `.ralph/artifacts/repo_map.md`.
- Remaining risk: application and content are not yet implemented.
- Next task: T002 - scaffold application, legal files and development toolchain.

## 2026-09-29 - T002

- What changed: created the Vite/React/TypeScript foundation, pinned the application and verification dependencies, added the favicon, environment template, MIT license, CC BY-SA content notice, and non-affiliation notice.
- Verification: PASS - `npm run typecheck`.
- Files changed: package/tooling configuration, initial `src/`, `public/favicon.svg`, legal files, and `package-lock.json`.
- Remaining risk: the placeholder is not yet a meaningful preview and no content schema exists.
- Next task: T003 - define content contracts, manifest and validation pipeline.
