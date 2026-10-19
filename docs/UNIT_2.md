# Unit 2 — Microeconomics / 微观经济学

This extension adds 60 original bilingual points and 185 practice items. It covers sections 2.1–2.12, with 34 SL/HL shared points and 26 HL points. All points support the existing search, review, IndexedDB progress, version-1 backup and offline PWA workflows.

本次新增 60 个原创双语知识点、185 道练习。数值情境均为明确标注的原创教学假设，并非现实观测或官方试题。关键词评分仅作复习辅助，可查看依据并手动修正。

| Syllabus / 考纲 | Points | Scope |
| --- | ---: | --- |
| 2.1 Demand / 需求 | 5 | Demand, law, shifts, market demand, HL utility |
| 2.2 Supply / 供给 | 5 | Supply, shifts, time, HL diminishing returns and costs |
| 2.3 Competitive equilibrium / 竞争均衡 | 5 | Equilibrium, adjustment, shifts, price mechanism, surplus |
| 2.4 Maximizing behaviour / 最大化行为 | 3 | HL rationality, biases/nudges, firm objectives |
| 2.5 Demand elasticity / 需求弹性 | 5 | PED, determinants, revenue, YED, HL slope/application |
| 2.6 Supply elasticity / 供给弹性 | 3 | PES, capacity/time, Shared PES calculations; HL primary-commodity comparison |
| 2.7 Intervention / 干预 | 6 | Ceilings, floors, tax, subsidy, evaluation, HL welfare calculations |
| 2.8 Externalities/resources / 外部性与资源 | 8 | Failure, four externalities, commons, policy, HL welfare calculation |
| 2.9 Public goods / 公共物品 | 3 | Characteristics, free riding, provision |
| 2.10 Information / 信息不对称 | 3 | HL adverse selection, moral hazard, remedies |
| 2.11 Market power / 市场势力 | 11 | HL costs, scale, revenues, profit, competition, monopoly, oligopoly, regulation |
| 2.12 Equity / 公平 | 3 | HL equity, income/wealth, redistribution |

## Sources and mapping

- Curriculum baseline: [IB SL brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/sl-economics-en.pdf) and [IB HL brief](https://www.ibo.org/globalassets/new-structure/programmes/dp/pdfs/hl-economics-en.pdf), first assessment 2022. The cards are an authored revision outline, not a reproduction of the full official guide or an official assessment marking scheme.
- The unit headings and HL-only status of 2.4 and 2.10–2.12 were cross-checked against IB's published [Spain curriculum alignment study, economics visualiser](https://www.ibo.org/globalassets/new-structure/research/pdfs/ib-dp-country-studies---spain-alignment-report.pdf), printed page 125. The full official subject guide remains the authority for an individual exam session.
- Coursebook mapping uses the locally held Cambridge 2020 third edition's printed chapter/section page references: competitive markets (chapter 2), elasticity (3), intervention (4), common resources/negative externalities (5), positive externalities/public goods/information/equity (6), and market power (7). A reference identifies the relevant topic location, not the source of copied prose. The PDF is unchanged, ignored and not distributed.
- Numerical scenarios, worked examples, distractors and diagrams are original. No empirical claim is inferred from the hypothetical numbers.

## Behaviour and maintenance

- `node scripts/author-unit-2.mjs` deterministically materialises the authored data in `scripts/content-data/unit-2.mjs` into paired Markdown, metadata and quiz YAML. It preserves the 43 Unit 1 manifest entries.
- `node scripts/author-micro-diagrams.mjs` generates 12 original SVG schematics. Bilingual text alternatives describe relationships and assumptions. These are static diagrams; the existing PPC remains interactive.
- `npm run build` compiles all 103 points. A separate content chunk is precached alongside the shell; the offline first-visit test starts on Unit 1 and opens Unit 2 only after networking is disabled.
- Stable Unit 1 IDs, IndexedDB name and backup schema remain unchanged. Existing backups continue to import alongside Unit 2 records.
- Unit 3 and Unit 4 content are outside this PR. No deployment or live AI configuration is part of Unit 2 verification.

## 2026-10-18 audit update

PES calculations are shared content. Surplus-area and government-intervention calculations are explicitly separated from shared concepts. Five additional HL questions remain available to HL learners while the SL queue excludes them. The earlier subject-brief check was insufficient for subtopic classification; see the full-guide audit and maintenance instructions in [Content audit](CONTENT_AUDIT.md).
