# IB Econ Atlas — Unit 1 MVP acceptance report

Status: implementation and the authorised public-PR gate are complete; merge and production deployment remain owner-gated.

## Delivered scope

- Independent Git repository published at `louisjia2008-ux/ib-econ-atlas`; the safety checkpoint is on `main`, the complete implementation history is on `codex/unit-1-mvp`, and PR #1 remains open and unmerged. The local Cambridge PDF is ignored and absent from the Git index.
- Exactly 43 stable Unit 1 knowledge-point IDs: 35 core and 8 extension points across sections 1.1–1.5. The requested Keynesian revolution and formation of macroeconomic policy are one atomic point so the fixed total remains 43.
- 86 independently authored localised pages and 129 practice items: 43 flashcards, 43 MCQs, and 43 keyword-scored short answers.
- Syllabus/coursebook navigation, bilingual fuzzy search, SL/HL/extension filtering, session-only exam scope, scoped review and scoped progress statistics.
- IndexedDB progress/attempts/preferences, deterministic FSRS scheduling, four-level self-rating, manual short-answer override, atomic backup merge/replace, and sensitive-setting exclusions.
- Responsive three-column study workspace, mobile directory drawer, five-item mobile navigation, current mastery displays, keyboard shortcut, visible focus, and a keyboard/touch PPC with static SVG and data-table alternatives.
- Prompt-update PWA that precaches the shell and complete Unit 1 bundle without deleting IndexedDB or caching optional AI requests.
- Optional Cloudflare Worker boundary with constant-time owner-token verification, allow-listed CORS, request limits, hashed daily KV accounting, trusted server-side knowledge rehydration, OpenAI Responses API `store: false`, and citation validation.
- MIT code licensing, CC BY-SA 4.0 original-content licensing, non-affiliation and trademark notices, contribution/security/privacy/publishing guides, PR template, Dependabot, CI, and main-only Pages deployment.

## Automated evidence

| Gate | Result |
| --- | --- |
| Strict content validation | PASS — 43 planned / 43 implemented |
| Generated coverage and copyright reports | PASS — deterministic and current |
| Documentation and workflow validation | PASS — 2 workflows / 8 documentation files |
| ESLint check-only gate | PASS — source, scripts, tests, configuration, and Worker |
| TypeScript | PASS — frontend, browser tests, and Worker |
| Vitest | PASS — 7 files / 38 tests |
| Production build | PASS — Vite/PWA production output generated |
| PWA artifact audit | PASS — manifest and service worker present; no IndexedDB deletion or AI runtime cache rule |
| Secret scan | PASS — no committed credential pattern detected |
| Playwright | PASS — 10 applicable tests; 14 intentional cross-project skips |
| Responsive viewports | PASS — Chromium at 1440×1000, 768×1024, and 390×844 |
| Offline workflow | PASS — installed service worker reload, study, and bilingual search work offline |
| 200% text scaling | PASS — narrow viewport has no horizontal document overflow |
| Fresh-clone reproduction | PASS — `npm ci`, `npm run verify`, and `npm run test:e2e` from a no-hardlinks clone of `837c9f0` |
| GitHub-hosted CI | PASS — PR #1 `verify` and `browser` jobs completed successfully |

The Playwright suite also covers Hash deep links, bilingual fuzzy search, dual directories, session scope, scoped progress, short-answer scoring and override, persisted progress, backup credential exclusions, PPC keyboard/growth/static alternatives, mobile drawer Escape handling, and language switching without route or scroll loss.

## Visual inspection

Manual headed-Chromium screenshots were inspected at the three release widths. A first PPC capture exposed an over-broad SVG selector that enlarged control icons; the selector was narrowed to the direct chart SVG, a regression assertion was added, and the corrected PPC and review centre were visually rechecked. Screenshots and traces remain under ignored `output/playwright/` and are not publication assets.

## Copyright and data boundary

- The source PDF is not tracked, linked for download, copied, or licensed by this repository.
- The repository contains original Markdown/YAML learning content and an original SVG, not scans or publisher artwork.
- External case links are factual references and remain outside the project licences.
- Backups exclude session scope, Worker endpoint, and owner access token.
- No OpenAI API key or owner token was created, committed, logged, or used.

## Explicitly unobserved or owner-gated

- Public repository creation, exact remote refs, PR #1, and hosted CI are verified. The PR is intentionally unmerged; no release or default-branch deployment has been authorised.
- The optional AI runtime is **not configured and not live-verified**. Only its local mock/contract boundary is verified.
- Public Pages behavior, a fresh clone from GitHub, Safari, Firefox, and physical touch devices remain unobserved. A fresh local Git clone and GitHub-hosted Chromium run are verified.
- The production JavaScript bundle is about 999 kB minified / 271 kB gzip. It passes the functional gate, but Vite emits a non-fatal chunk-size warning; later units should introduce content-level code splitting before the full-course corpus grows.

## Publication gate

The public repository, feature branch, unmerged PR #1, and hosted CI are complete. The next gate requires explicit owner confirmation to merge PR #1. Only after merge may the main-only Pages workflow be observed and the public desktop/narrow/offline checks repeated. Worker deployment remains a separate future authorisation.
