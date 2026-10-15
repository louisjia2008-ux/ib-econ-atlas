# Unit 3 extension contract

## User goal and deliverable

Extend the existing bilingual, offline study and review application to Unit 3 macroeconomics, verify it and submit an unmerged PR. Work from main 95cf4fa74593729536ed6d83c2db6101813166ad on codex/unit-3-macroeconomics.

## Acceptance

- 56 stable original bilingual points across syllabus 3.1–3.7, with flashcard, MCQ and keyword short answer for each.
- Original macroeconomic diagrams with bilingual text alternatives; syllabus and chapter 8–13 mappings.
- Existing 103 points, progress IDs, IndexedDB and backup schema preserved; all three units available in navigation, search, scope and review.
- Offline first visit to Unit 3, diagrams, search and review pass; every production JS asset is precached without raising cache limits.
- Validator, lint, TypeScript, unit tests, production/PWA audit and desktop/tablet/mobile browser acceptance pass; PR is pushed, attached and hosted CI inspected.

## Plan and recovery

Lock coverage and chapter mappings; author sections in bounded batches; generalize the existing authoring helper without changing Unit 2 output; integrate directory/diagrams; verify old content and backups; publish verified branch and unmerged PR. Keep checkpoints and repair forward; preserve previous branches and the source PDF. No destructive git operation, dependency upgrade, merge, deployment or live AI call is included.

## Assumptions and risks

Use the existing first-assessment-2022 curriculum baseline, with separate HL labels where applicable. Original numerical scenarios are illustrative rather than empirical claims. Distinguish price level from inflation, real from nominal output, stocks from flows, and short-run from long-run predictions. A curriculum revision outline is not an official exam bank or marking scheme.

## Drift guard

All edits must serve Unit 3 coverage or safe three-unit integration. Do not replace or translate textbook passages. Textbook references contain printed section/page locations only. Preserve old content semantically and prove it before publication.
