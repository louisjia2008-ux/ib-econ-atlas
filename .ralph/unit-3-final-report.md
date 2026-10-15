# Unit 3 verification and delivery

## Implementation

- Base: main 95cf4fa74593729536ed6d83c2db6101813166ad; branch codex/unit-3-macroeconomics.
- 56 original bilingual macroeconomic points across 3.1–3.7, 168 practice items and eight original static diagrams with bilingual alternatives.
- Combined library: 159 points, 318 localised pages, 477 practice items. 119 core, 32 HL, eight extension points.
- Unit 1/2 source content, IDs, database and backup schema preserved. Both Unit 2 and Unit 3 generators retain other units. No dependency changes.
- See docs/UNIT_3.md for scope, primary-source links, assumptions and regeneration commands.

## Verification status

- 86 unit/contract tests pass, including all Unit 3 model answers, cross-language search/filter/scope, all review modes and old-backup compatibility.
- Full `npm run verify` passes: 159-point content validation, generated reports, repository checks, lint, TypeScript, 86 tests, production build, PWA and secret scan (778 tracked files).
- `npm run test:e2e`: 21 applicable checks pass; 24 project-specific cases intentionally skip. Viewports: desktop 1440×1000, tablet 768×1024 and mobile 390×844.
- Offline acceptance starts on Unit 1, installs the precache, disables network and first opens Unit 3 with diagram pixels. Language switch, search, reload, fiscal-scope flashcards, rating and progress reload pass while still offline.
- Desktop Chinese, mobile English and mobile diagram screenshots inspected via headed Chromium. Local evidence is ignored under output/playwright/; not published as repository source.
- Generator round-trip preserves Unit 3 when rebuilding Unit 2, then rebuilding Unit 3 preserves the other 103 points. All 103 previous compiled points compare deeply equal with origin/main; old source content/quizzes have no diff.
- Production content chunk: 1,364.32 kB (221.24 kB gzip); app chunk: 637.74 kB (197.28 kB gzip). Both are precached under the unchanged 2 MiB per-file limit. The existing >500 kB build advisory remains non-blocking; future units may warrant further splitting.
- Two initial browser assertions used a nonexistent Good label and expected 10 cards despite a seven-point scope. Corrected to existing Okay and seven-card queue; the complete rerun passes without retries.
- PR delivery and hosted CI pending at this checkpoint. Unit 3 is not released publicly.

## Boundaries

No Unit 3 merge/deployment or live AI configuration. Initial offline installation requires online cache completion. Static diagrams and keyword coverage do not replace interactive economic estimation or official examiner marking. The local textbook remains ignored, unchanged and undistributed.
