# Unit 2 acceptance report

Base: main 1e7b938. Branch: codex/unit-2-microeconomics.

## Deliverable

- 60 new original knowledge points across 2.1–2.12: 33 core, 27 HL.
- 120 new Chinese/English learning pages, 180 practice items (60 each of flashcard, MCQ and short answer).
- 12 original microeconomic SVG schematics with bilingual descriptions and text-table alternatives.
- Cross-unit syllabus/coursebook directories, search, scopes, review and dynamic progress totals.
- Unit 1 source and generated content are semantically unchanged; original 43 IDs and version-1 backup schema are preserved.
- Separate learning-content build chunk, fully included in service-worker precache. No cache-size limit was relaxed.

## Verification evidence

- Strict content validation: 103 manifest / 103 implemented; 43 old + 60 new.
- Vitest: 13 files / 82 tests, including all Unit 2 model answers, three practice modes, HL filtering, scopes and old/new backup coexistence.
- Playwright: 16 applicable checks at desktop 1440, tablet 768 and mobile 390 widths; 20 deliberate project skips.
- Offline first visit: install while reading only Unit 1, disable networking, open Unit 2 and its diagram, search adverse selection, open result and reload successfully.
- Visual inspection: headed Chromium desktop and narrow mobile, externality diagram and bilingual text alternative; axis-label clipping and narrow table-header layout were improved after inspection.
- Full verify additionally includes reports, repository docs/workflows, lint, TypeScript, build, PWA inclusion audit and secret scan.

## Content and release boundary

Examples and numbers are labelled illustrative. The cards are an original study outline, not official exam questions or an official marking scheme. Textbook references identify topic locations only; source PDF unchanged and untracked. No dependency upgrade, production deploy or live AI call occurred.

The production shell is approximately 620 kB minified (192 kB gzip), and the content chunk approximately 893 kB (154 kB gzip); Vite retains a non-fatal chunk-size warning. Both are within the existing precache limit and offline acceptance passed. Microeconomic charts are static; the existing PPC is interactive. Physical touch-device, Safari and Firefox acceptance were not performed.

Publication: pending final local verification and authorized feature-branch PR creation.
