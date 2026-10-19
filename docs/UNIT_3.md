# Unit 3 — Macroeconomics / 宏观经济学

This authored revision outline adds 60 bilingual points, 120 learning pages, 183 practice items and eight original static diagrams. Sections 3.1–3.7 map to the IB subject brief. It is not a reproduction of the official guide, an exhaustive list of assessment statements, or an official marking scheme.

本单元新增 60 个原创双语知识点，每点含定义、因果链、教学情境、误区、考试应用、总结，以及闪卡、选择题和关键词简答题。51 点为共用复习内容，9 点标记为 HL 深入：公共债务、菲利普斯曲线、QE、自动稳定器、乘数、挤出、银行货币创造、货币政策工具与货币市场。HL 标记用于本平台的复习筛选，不表示共用知识点中的所有延伸细节均为 SL 考核要求；应以所参加考期的官方完整指南为准。

| Section / 考纲 | Points | Revision topics |
| --- | ---: | --- |
| 3.1 Economic activity / 衡量与波动 | 10 | Circular flow, GDP/GNI, expenditure, real/nominal, deflator, per-capita/PPP, cycle, limitations and wellbeing |
| 3.2 AD and AS / 总需求与总供给 | 10 | AD components, consumption/investment, SRAS, LRAS, Keynesian AS, equilibrium, gaps, shocks and capacity |
| 3.3 Objectives / 宏观目标 | 13 | Unemployment, CPI, inflation causes, disinflation/deflation, growth, debt, Phillips curve and conflicts |
| 3.4 Inequality and poverty / 不平等与贫困 | 6 | Poverty, causes, Lorenz/Gini, impacts, progressive taxation and policy evaluation |
| 3.5 Monetary policy / 货币政策 | 9 | Central banks/rates, transmission, expansion, contraction, unconventional tools and limitations |
| 3.6 Fiscal policy / 财政政策 | 7 | Budgets, expansion/contraction, automatic stabilisers, multiplier, crowding out and evaluation |
| 3.7 Supply-side policies / 供给侧政策 | 5 | Market-based/interventionist approaches, labour markets, infrastructure/innovation and policy mixes |

## Sources and originality

- Curriculum headings were cross-checked against the primary [IB HL subject brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/hl-economics-en.pdf) and [IB SL subject brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/sl-economics-en.pdf), first assessment 2022. These identify the section structure; the authored cards do not replace the full official guide.
- Coursebook references identify printed locations in the locally held Cambridge 2020 third edition: chapter 8 (measurement), 9 (AD/AS), 10 (unemployment/inflation), 11 (growth/debt/conflicts), 12 (inequality/poverty), and 13 (policy). References are navigation metadata, not copied source prose. The PDF is unchanged, ignored and not distributed.
- Numerical scenarios and diagrams are original teaching examples, explicitly labelled as illustrative rather than empirical observations. No textbook figures, scans, exam questions or translations are distributed.
- Multiplier calculations specify a common income base for marginal leakages, spare capacity, fixed prices and omitted policy/crowding-out responses. Graphs distinguish price levels from inflation rates and actual output from potential output.

## Behaviour and maintenance

- `node scripts/author-unit-3.mjs` materialises `scripts/content-data/unit-3.mjs`; `node scripts/author-macro-diagrams.mjs` rebuilds the eight SVGs. The shared authoring helper preserves all other units' manifest entries. Unit 2 regeneration also preserves Unit 3.
- All 227 points across four units participate in bilingual search, syllabus/coursebook navigation, scope filtering, FSRS review and IndexedDB progress. Existing IDs, database name and version-1 backup schema are unchanged; two-unit backups round-trip alongside new Unit 3 records.
- Diagrams use English axis labels plus Chinese/English captions, alt text and text tables. They are qualitative static models, not interactive numerical simulators. The Unit 1 PPC remains interactive.
- A first-visit offline browser check installs the PWA while reading Unit 1, disables network, then opens Unit 3 diagrams, switches language, searches, reloads and uses review. Initial installation still requires an online visit and successful cache completion.
- Keyword scoring is a transparent coverage aid with manual correction, not an official or semantic IB examiner. Real AI remains unconfigured and is not part of this PR's runtime verification.
- Units 1–4 were published before this audit. The acceptance records below describe the audit; GitHub tracks the subsequent release status.

## 2026-10-18 audit update

GDP deflation and qualitative Lorenz/Gini interpretation are shared. Quintile construction, weighted-CPI and tax computations are separate HL details. Natural unemployment includes the seasonal category in this course. The multiplier now distinguishes gross-income leakage propensities from consumption out of disposable income. Four added points cover commercial-bank money creation, policy instruments, the money market, and inflation costs. See [Content audit](CONTENT_AUDIT.md).
