# IB Econ Atlas - Ralph Task Brief

## User Goal

Build the agreed IB Econ Atlas as an independent, open-source, bilingual IB Economics study application for the user's own revision. The application must make Unit 1 searchable in Chinese and English, support syllabus and textbook navigation, provide practice and mastery tracking, work offline as a PWA, preserve progress locally, and leave a secure optional AI question-answering boundary without configuring a live API key.

## Final Deliverable

- A runnable React + TypeScript + Vite application rooted at `/Volumes/Taoruide外接/IB Economics`.
- An independent local Git repository whose tracked tree excludes the copyrighted Cambridge PDF.
- A complete Unit 1 data set of exactly 43 stable bilingual knowledge-point records with quizzes and curriculum mappings.
- A responsive learning workspace, bilingual local search, temporary scope filters, free review sessions, local progress and backup/restore, an interactive PPC, PWA/offline support, and an unconfigured AI settings surface.
- A separately testable Cloudflare Worker template for grounded owner-only AI Q&A, with no live credentials or deployment.
- Open-source documentation, licensing, contribution rules, CI/Pages workflows, tests, visual QA evidence, and a final acceptance report.

## Success Criteria

1. Exactly 43 Unit 1 knowledge points exist, each with Chinese and English authored content, syllabus/textbook mappings, level, source page reference, one flashcard, and one MCQ or short-answer item.
2. The working UI exposes bilingual search, dual navigation, SL/HL filtering, session-only scope selection, full-page language switching, study content, related points, and mastery state.
3. Review supports flashcard, MCQ, short-answer, and mixed modes; keyword coverage and manual correction are transparent; answer plus self-rating updates a deterministic FSRS-compatible schedule and mastery state.
4. Progress, attempts, and preferences persist in IndexedDB; versioned JSON export/import supports merge and replace while excluding session scope and AI credentials.
5. The PPC interaction is keyboard/touch usable and includes a readable table alternative.
6. The production build is installable/offline-capable through a service worker and works under the `/ib-econ-atlas/` GitHub Pages base path with hash routes.
7. Worker contract rejects unauthenticated, invalid, over-limit, overlong, unconfigured, and unsupported requests; citations are validated against trusted bundled knowledge-point IDs.
8. Typecheck, content validation, unit tests, production build, and browser checks pass locally; visual review covers desktop and narrow mobile.
9. The source PDF, scans, copied figures, secrets, and environment files are not tracked. Original code uses MIT and original learning content uses CC BY-SA 4.0 with the agreed non-affiliation notice.
10. GitHub publication is prepared but no push, deployment, merge, paid API call, or credential creation occurs automatically.

## Non-Goals

- Do not reproduce, translate page-by-page, upload, edit, or redistribute the Cambridge source PDF.
- Do not implement Units 2-4 in this run beyond navigation placeholders that truthfully say they are not yet published.
- Do not create an account system, cloud sync, named study plans, live news ingestion, analytics, or public shared AI quota.
- Do not create or reuse an OpenAI API key, call a paid model, deploy the Cloudflare Worker, push to GitHub, merge a PR, or publish GitHub Pages without a later explicit user-authorized external step.
- Do not alter files outside this project root or the dirty outer repository.

## Constraints

- Preserve the source PDF unchanged and ignored before Git initialization.
- Use `apply_patch` for project file authoring and edits; generated lockfiles/build output may come from standard tools.
- Work in atomic Ralph tasks, verify each task, checkpoint locally, and continue automatically while state is `RALPH_CONTINUE`.
- No destructive Git operations, history rewrites, cleanup of unrelated data, global Git configuration, push, or deploy.
- Do not expose secrets in files, logs, argv, screenshots, reports, or commits.
- Treat AI as unconfigured until a later secure credential decision; mock/contract tests are not live-model evidence.
- All authored learning explanations must be original paraphrases grounded in broadly established economics and the public syllabus, not copied textbook prose.

## Assumptions

- The current IB Economics 2022-2029 subject briefs remain the public curriculum baseline.
- The user accepts the previously selected product decisions: SL and HL, dual directories, full-page locale switching, local plus future AI search, local backup/restore, GitHub Pages, PWA, MIT plus CC BY-SA, and owner-only Worker access.
- Chinese is the default locale and the default level filter is all published Unit 1 content.
- The 43-point manifest in the approved plan is authoritative for the Unit 1 count.
- GitHub account `louisjia2008-ux` is the intended remote owner, but remote work remains blocked until its authentication is repaired.

## Risk Areas

- Content breadth: 43 bilingual entries can drift into repetitive or shallow copy; validation and representative manual review are required.
- Copyright: OCR text must not be copied into published content; the PDF may only inform topic/page mapping.
- Chinese fuzzy search: tokenization must work without whitespace and remain usable offline.
- Scheduling: review-state transitions and imports must be deterministic and migration-safe.
- GitHub Pages: asset base paths, hash routing, and service-worker scope can fail only in production-style builds.
- AI security: public frontend code must never contain model or owner tokens; Worker input/citations must be validated.
- Visual responsiveness and accessibility require real-browser QA, not only successful compilation.

## Execution Plan

### Phase 0 - Mission Lock

- Files: `.ralph/task_brief.md` and control-plane state.
- Acceptance: task brief contains all mandatory sections and matches the user-approved plan.
- Rollback: remove only incomplete Ralph state if initialization fails before Git setup.

### Phase 1 - Workspace Safety and Independent Git Baseline

- Files: `.gitignore`, local `.git`, Ralph repository map.
- Acceptance: project root is an independent Git repository; source PDF is ignored and untracked; outer repository is untouched.
- Rollback: stop before project authoring if Git root or ignore protection is ambiguous.

### Phase 2 - Architecture and Atomic Task Queue

- Files: `.ralph/goal.md`, `.ralph/acceptance.md`, `.ralph/plan.md`, `.ralph/tasks.json`, verifier.
- Acceptance: all approved capabilities map to dependency-aware atomic tasks and verification commands.
- Rollback: restore the Phase 1 checkpoint if planning unexpectedly changes product files.

### Phase 3 - Incremental Product Execution

- Files: application, content, Worker, tests, legal/project documentation, workflows.
- Acceptance: each atomic task passes its scoped verifier before checkpointing.
- Rollback: retain the last passing local commit; repair forward without reset/rebase/clean.

### Phase 4 - Full Verification and Visual QA

- Files: verification artifacts and fixes only.
- Acceptance: content validation, tests, typecheck, build, PWA checks, Worker contract tests, and representative desktop/mobile browser review pass or are explicitly marked human review.
- Rollback: fix forward from the failing task; block after three evidence-informed failures.

### Phase 5 - Final Acceptance Report

- Files: `.ralph/final_report.md` and final state.
- Acceptance: results are mapped to the ten success criteria, with external GitHub/auth/deployment limitations stated exactly.
- Rollback: keep `RALPH_CONTINUE` or `RALPH_BLOCKED` rather than claiming completion if evidence is missing.

## Drift Guard

Reread this task brief and the goal before every atomic task and after every phase. Every change must directly serve the User Goal or a listed Success Criterion. Do not expand scope silently, add speculative product features, prioritize decorative work over the learning workflow, or weaken criteria to finish. If a different goal becomes necessary, update this brief before implementing it; if the change requires user authority, set `RALPH_BLOCKED`.

## Git Safety

- Create `.gitignore` before initializing the nested repository, with the exact source PDF and all secret/build/cache paths ignored.
- Verify the effective Git root is this directory, not `/Volumes/Taoruide外接`.
- Create a local baseline/checkpoint before product changes and use only repo-local Git identity if needed.
- Commit checkpoints with `ralph: <phase/task>` messages after successful verification.
- Never push, deploy, rebase, reset, clean, rewrite history, merge remotely, or modify global Git configuration.
- Rollback is by inspecting/reverting a narrow later change with user-safe forward patches or by using a previous local commit as evidence; destructive reset is forbidden.
