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

## 2026-09-29 - T003

- What changed: defined the public content/progress/AI types, fixed the exact 43-entry Unit 1 manifest, added structured bilingual Markdown and quiz contracts, and implemented draft/strict validation plus generated frontend/Worker bundles.
- Verification: PASS - draft validation, explicit strict-rejection test, compilation, and typecheck.
- Files changed: `src/types`, `content/manifest.yaml`, representative scarcity content and quizzes, `scripts`, and generated bundles.
- Remaining risk: only one knowledge point is authored; the current UI is still the foundation placeholder.
- Next task: T004 - build and hand off the first meaningful study-workspace preview.
