# Units 1–4 content audit / 内容审计

Audit date: 2026-10-18. Baseline: published merge `e95cda16c05cfbbddcd19f7af1e5d384eb00688f`. Repair source branch: `codex/content-audit-units-1-4`. The acceptance records below describe the local audit; PR and deployment status are tracked separately in GitHub.

本轮检查范围为原有全部 215 个知识点的定义、层级、公式／数值情境、练习题题干与答案，以及考纲目录。补缺后为 227 个知识点、454 篇双语页面和 695 道练习。检查区分“文件结构通过”“数值复算通过”“学科范围判断”和“实际浏览器流程通过”；关键词匹配不是人工阅卷或语义正确性的证明。

## Findings and corrections

| Finding | Correction |
| --- | --- |
| Unit 1 used coursebook-inspired 1.3–1.5 as syllabus sections | Use the official 1.1/1.2 structure, preserving coursebook references and all stable IDs |
| Eight economic-thought cards were labelled extension | Restore shared SL/HL status; conceptual history differs from the later HL behavioural analysis |
| Circular flow was only available under Unit 3 | Add a Unit 1 card and original real/money-flow diagram |
| 42 generated Unit 1 MCQs reused three unrelated distractors | Replace them with topic-specific misconceptions; preserve the already bespoke scarcity question |
| Some Unit 1 reference answers omitted the title used by their own keyword group | Include the concept name in the reference answer; test every bilingual model answer |
| Actual growth was defined too narrowly as only within existing capacity | Define real-output growth to include newly used capacity as well as fuller utilisation |
| Shared PED/PES concepts and HL derivations were mixed | Keep PES arithmetic shared; move the income/substitution derivation and commodity comparisons into HL material |
| Shared theory included HL area/policy calculations | Separate 14 advanced MCQs and labelled HL explanations from shared cards; SL review and article view exclude them |
| GDP deflation and qualitative Lorenz/Gini interpretation were hidden from SL | Restore shared status; keep quintile construction and advanced arithmetic separately labelled |
| QE, automatic stabilisers and crowding out were labelled shared | Mark their dedicated cards HL, as required by the guide's subtopic boundaries |
| Natural-unemployment example omitted the seasonal category | Include frictional, structural and seasonal categories in this course framework |
| Multiplier simplification could mix disposable- and gross-income bases | State both conventions explicitly, including `1/[1−c(1−t)+m]`, with common-base and fixed-price assumptions |
| Monetary creation, instruments, money-market and inflation-cost coverage was thin | Add four dedicated cards and a money-market diagram |
| Export-subsidy concepts, currency conversion and account identities were hidden from SL | Restore shared status while separating advanced trade computations |
| Monetary-union definition and its HL evaluation were combined | Keep a shared definition and add a dedicated HL evaluation card |
| Poverty–sustainability links and persistent external imbalances were labelled shared | Mark the dedicated analysis cards HL; add surplus and cross-account/currency analysis |
| WTO appeared under protection arguments | Map it to economic integration (4.4) with its existing textbook reference |
| GII/HPI/IHDI, regime comparison and two-country development evidence were incomplete | Add dedicated explanations and a sourced health comparison; retain terms-of-trade arithmetic explicitly as enrichment |
| Many numeric MCQ explanations used a different example's numbers | Supply working from the question's own premises, separate from illustrative examples |

No incorrect keyed numerical answer was identified among the original questions reviewed. The material issues were level boundaries, omissions, conditional formula wording, interpretation and answer explanations. Tests also catch duplicate translated options, missing correct-option targets and reference answers that fail their own keyword groups. They cannot prove that any imaginable alternative answer is semantically equivalent.

## Formula conventions

- PED/YED/PES use percentage changes with consistent bases. PED's magnitude classification differs from YED's sign-based normal/inferior classification. A slope is not elasticity. Finite price changes should be checked with actual price–quantity products when interpreting revenue.
- GDP expenditure excludes transfers as direct G and financial-asset trades as real I. Real GDP uses a base-100 deflator. GNI adds net primary income from abroad; net income deducts depreciation. Growth, inflation and output gaps use the stated initial or potential denominator.
- Tax and welfare arithmetic uses post-policy quantities; triangle results require linear curves and the stated externality assumptions. Gini interpretation is shared; quintile construction is HL. Quintile shares 5/10/15/25/45 imply cumulative shares 0/5/15/30/55/100 and piecewise-linear Gini 0.38.
- Multiplier leakages must share a denominator. If consumption is instead out of disposable income, `k=1/[1−c(1−t)+m]` with taxes/imports out of gross income. Real-interest subtraction is an approximation, not the exact Fisher ratio.
- Currency direction depends on quotation; inverse percentage changes are asymmetric. Balance-of-payments teaching net-inflow signs differ from official net-acquisition signs; reserves are not counted twice. Marshall–Lerner and J-curve conclusions remain conditional.

## Evidence and scope

The main boundary source is the **IB-authored Economics guide, first assessment 2022**, syllabus pages 22–53, read from a [publicly hosted copy](https://www.ibdeconomics.com/uploads/1/1/7/5/11758934/new_economics_guide_first_assessment_2022.pdf). The brief alone was insufficient for mixed subtopics. This is a source-location reference; no guide text, PDF, publisher pages or diagrams are committed. The [IB course page](https://ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/economics/) is the official entry point; schools should check current exam-session notices through the IB resource centre.

Composite-index dimensions were checked against [UNDP](https://hdr.undp.org/data-center/composite-indices) and the [Happy Planet Index methodology overview](https://happyplanetindex.org/learn-about-the-happy-planet-index/). The added SDG case uses World Bank indicator [SH.DYN.MORT](https://data.worldbank.org/indicator/SH.DYN.MORT?locations=CN-IN): under-five deaths per 1,000 live births in China/India for 2000 and 2022, checked 2026-10-18. It does not infer policy causation or achievement of all SDGs from one health measure. Historical estimates may be revised.

Existing 2026-09-29 real-world example links were not all re-fetched in this audit; their dates remain evidence dates, not claims of current conditions. The guide is the first-assessment-2022 version; this audit does not establish the absence of later school-only clarifications. Existing knowledge-point IDs, local database and backup schema remain unchanged. No live AI, physical iPhone or Safari acceptance is claimed.

## Reproduction

`npm run content:author` regenerates all four units, including the audited corrections, without renumbering existing IDs. Run the original diagram authoring scripts plus `node scripts/author-audit-diagrams.mjs` to rebuild diagram assets. Then run `node scripts/compile-content.mjs`, `npm run content:report`, `npm run verify` and `npm run test:e2e`.

The audit source is explicit in `scripts/content-data/audit-corrections.mjs`, new notes in `audit-additions.mjs`, numeric working in `audit-workings.mjs`, and Unit 1 distractors in `unit-1-distractors.mjs`. The all-content and independent arithmetic regressions are in `src/features/navigation/content-audit.test.ts`. Generated coverage reports remain the authoritative current counts. Local browser screenshots stay ignored under `output/playwright/content-audit/`.

## Verification results

- `npm run verify` passed: content/repository checks, lint, frontend and Worker type checks, **136 tests**, production build, PWA audit and secret scan.
- The tests include **42 independent numerical-answer recomputations** and reference-answer/option integrity over all **227 bilingual points** (454 short-answer references). The original numeric keys checked were correct; working and level handling were repaired.
- `npm run test:e2e`: **26 passed, 28 intentionally skipped** viewport duplicates. This includes a new SL trade-policy queue test plus the existing four-unit, old-backup, search, review, progress and offline regressions.
- Fresh headed Chromium inspection confirmed shared Lorenz theory remains in SL, HL detail is hidden, and practice counts change from four to three. All four new diagrams loaded at 390px with document width 375px and no horizontal overflow.
- Running `npm run content:author` followed by compilation a second time changed **zero** content/bundle file hashes. Fixes survive regeneration.
- One directory test initially expected an empty fuzzy-search result after regrouping Unit 1; the new circular-flow card can legitimately match. The assertion now checks exclusion of the out-of-scope circular-economy card and clears scope through the persistent rail control. No search matching was weakened to make the test pass.
- Local evidence: `output/playwright/content-audit/verification.json`. This is local repair acceptance, not a new public release; no push, merge, deployment or AI call occurred during this audit.
