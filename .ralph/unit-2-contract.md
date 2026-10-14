# Unit 2 extension contract

User goal: extend the original bilingual learning, practice and offline application to Unit 2 microeconomics and deliver a verified, unmerged PR.

Base: remote main 1e7b9387bbe1f2461559e64d66e11450ff91533c. Branch: codex/unit-2-microeconomics. Existing Unit 1 IDs and progress schema are preserved.

Deliverable: 60 original bilingual points across syllabus sections 2.1–2.12, including separately labelled HL material; three practice modes per point; original microeconomic diagrams; syllabus and coursebook navigation; offline search/study/review; documented coverage and verification.

Success criteria: every point has paired explanations and all three practice types; all 12 sections are represented; Unit 1 stays at 43; cross-unit search/navigation/scope and imported progress remain valid; validator, lint, types, unit tests, build, PWA audit and browser checks pass; feature branch is pushed and an unmerged PR is attached.

Scope: implementation, original content, tests, documentation, local checkpoints and authorized feature-branch publication. No merge, production deployment, live AI call or dependency upgrades. Source PDF remains ignored and unchanged.

Plan: lock coverage and mappings; author content and original diagrams; generalize unit assumptions in navigation and validation; verify cross-unit behaviour, offline caching and old-progress compatibility; publish branch and PR after verification.

Rollback: preserve the completed Unit 1 branch and main history; fix forward on the feature branch. No reset, cleanup or history rewrite.

Drift guard: every change serves Unit 2 coverage or cross-unit integration. Printed coursebook pages are mapping references only. Examples and questions are newly authored, and illustrative numerical scenarios are explicitly labelled.
