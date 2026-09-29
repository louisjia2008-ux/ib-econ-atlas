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

## 2026-09-30 - T016

- What changed: completed bilingual project documentation, contributor and security rules, privacy/publishing/AI deployment guides, PR and Dependabot configuration, CI and Pages workflows, and deterministic content-coverage and copyright-boundary reports.
- Verification: PASS - `npm run verify`; workflow YAML and eight documentation files were structurally checked, 43/43 content validation passed, 38 tests passed, the PWA built, and 266 candidate files passed the secret scan.
- Files changed: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/`, `.github/`, `reports/`, repository/report validators and package scripts.
- Remaining risk: responsive, keyboard and post-install offline behavior still require real-browser evidence; remote GitHub/Pages and live AI remain unobserved.
- Next task: T017 - full browser QA and final acceptance reporting.

## 2026-09-30 - T017

- What changed: added repeatable 1440/768/390 Playwright acceptance, offline PWA and 200% text-scale checks, mobile directory and settings navigation, live mastery/scope statistics, search mastery labels, and responsive/PPC visual fixes; completed the final acceptance report.
- Verification: PASS locally and from a fresh no-hardlinks clone of `417c604` — `npm ci`, `npm run verify`, and `npm run test:e2e`; 38 Vitest checks and 10 applicable Playwright checks pass.
- Visual evidence: headed Chromium screenshots inspected desktop, tablet, mobile, drawer, review centre, and PPC. An over-broad PPC SVG selector was found, fixed, and regression-tested.
- Remaining risk: Vite reports a non-fatal ~999 kB minified (~271 kB gzip) entry chunk; public GitHub, Pages, Safari/Firefox/physical-device and live-model operation remain unobserved.
- External blocker: GitHub CLI has an invalid `louisjia2008-ux` credential and the repository has no remote. Stop without push, PR, merge, deployment, or credential creation until the user re-authenticates and resumes.
