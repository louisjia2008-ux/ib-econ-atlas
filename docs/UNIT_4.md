# Unit 4 — The global economy / 全球经济

63 original bilingual revision points add 126 learning pages, 195 practice items and eight original diagrams. Each point includes a definition, causal chain, hypothetical application, misconception, exam guidance, flashcard, MCQ and keyword short answer. Unit 4 brings the atlas to 227 points and 695 practice items.

本单元覆盖 4.1–4.10 的复习框架，含 49 个共用点、13 个 HL 深入点和 1 个扩展点。HL 筛选标记用于平台复习，不代表所有共用点内的延伸计算均为 SL 考核要求；正式范围以所参加考期的完整官方指南为准。本项目不是官方考纲或评分标准。

| Section | Points | Topics |
| --- | ---: | --- |
| 4.1 Benefits of trade | 6 | Benefits, imports/exports, absolute/comparative advantage, distribution |
| 4.2 Trade protection | 5 | Tariffs, quotas, production/export subsidies, administrative barriers |
| 4.3 Arguments and evaluation | 3 | Infant industries, employment/security, alternatives, WTO |
| 4.4 Economic integration | 7 | Agreements, common markets, creation/diversion, monetary union, evaluation |
| 4.5 Exchange rates | 8 | Quotation, demand/supply, effects, fixed/managed regimes, conversion, policy constraints |
| 4.6 Balance of payments | 9 | Accounts, sign conventions, sustainability, Marshall–Lerner, J-curve, policies |
| 4.7 Sustainable development | 3 | Growth versus development, environment/poverty, goals and trade-offs |
| 4.8 Measuring development | 5 | Per-capita/PPP, HDI, multidimensional poverty, data limits |
| 4.9 Barriers | 7 | Poverty cycles, services, primary dependence/terms of trade, finance/debt, institutions, geography/informality |
| 4.10 Strategies | 10 | Trade strategies, diversification/social enterprise, markets, public services, FDI, aid/NGOs, multilateral finance, institutions/microfinance, policy mixes |

## Originality and sources

The section structure follows the primary [IB SL subject brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/sl-economics-en.pdf) and [IB HL subject brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/hl-economics-en.pdf), first assessment 2022. The notes are independently written, not copied assessment statements or translations of a coursebook.

- HDI dimensions and geometric aggregation were checked against [UNDP's HDI explanation](https://hdr.undp.org/data-center/human-development-index).
- Account categories and net-asset financial signs were checked against the [IMF BOP dataset](https://data.imf.org/en/datasets/IMF.STA%3ABOP) and [BPM6 framework](https://www.elibrary.imf.org/abstract/book/9781589068124/ch02.xml).
- Coursebook references are printed section-start navigation anchors, not exact page claims for every subtopic: chapters 14–15 trade, 16–17 external accounts, 18 development, 19 barriers and 20 strategies. The local Cambridge 2020 PDF was used only to confirm its contents-page anchors. It remains ignored and unmodified.
- Numerical teaching scenarios are hypothetical except the explicitly sourced, dated two-country SDG case added in the audit. No textbook figures, scans, publisher prose or official exam questions are distributed. No claims are made about current WTO dispute-body operations, institution-specific lending conditions or current SDG progress.

## Models and boundaries

Trade diagrams assume a price-taking small economy, homogeneous goods, no transport costs and no externalities unless stated. Tariff revenue uses post-tariff imports; quota rents depend on licences; production subsidies leave consumer prices at Pw while supporting producers at Pw+s. Graphs are qualitative and not to scale, with bilingual text alternatives.

Currency graphs quote USD per home unit: a higher number means home appreciation. Fixed-parity devaluation is distinguished from floating depreciation. The balance-of-payments identity explicitly declares the teaching convention of financial net inflows; official net acquisition of assets minus liabilities has the opposite sign. Reserve transactions are inside the financial account and must not be counted twice. Marshall–Lerner and J-curve conclusions state assumptions and are conditional.

Run `node scripts/author-unit-4.mjs` to materialise the authored source in `scripts/content-data/unit-4.mjs`; `node scripts/author-global-diagrams.mjs` generates the eight SVGs. Existing units, stable IDs, IndexedDB database and version-1 backup schema remain compatible. Regenerate compiled bundles and reports after authoring.

Unit 4 uses the existing search, directories, level/scope filters, review and local progress. Offline first visits require an earlier online installation and completed PWA cache. AI remains unconfigured. Uploading the feature branch and opening a PR do not deploy GitHub Pages; merging requires owner approval under the repository's publishing workflow.

## Pre-audit Unit 4 acceptance — 2026-10-18

- Full `npm run verify`: content and repository checks, ESLint, frontend/Worker type checks, 89 Vitest tests, production build, PWA audit and secret scan passed.
- `npm run test:e2e`: 25 passed, 26 deliberately skipped viewport duplicates. Tests include Unit 4 bilingual tariff diagrams at 1440/768/390 widths and first-visit offline search/review/persistence, plus existing-unit regressions.
- Independent headed Playwright CLI session: Chinese/English tariff page had no horizontal overflow at all three widths. After PWA installation, networking was disabled before the first J-curve visit; its diagram loaded, a cache-busting fetch failed as expected, Chinese search opened comparative advantage in the English UI, a six-card trade scope worked, and one learning record survived an offline reload. Local screenshots and output remain ignored in `output/playwright/unit4-local/`.
- These are local Chromium observations, not physical Safari/iPhone or public deployment verification. No AI provider was configured or called. The feature PR remains separate from a Pages release.

## Audit changes

Trade-protection concepts, currency conversion and account identities are shared; advanced numerical trade exercises are separate. Monetary-union definition remains shared while evaluation has an HL card. Poverty–sustainability links, persistent account imbalances and regime evaluation are HL. The WTO now maps to 4.4. Added composite-index explanations, external-account links, current surpluses and a sourced two-country health comparison. Terms-of-trade computation is retained as optional enrichment. The earlier hypothetical-only scope and earlier acceptance counts describe the pre-audit release; the new country case has a source and observation date. See [Content audit](CONTENT_AUDIT.md).
