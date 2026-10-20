# Tariff learning workshop / 关税学习工坊

This local improvement adds a worked teaching example to `u4-07-tariff`. It is original Atlas material; it does not reproduce IB examination papers or promise an official mark.

## Learning flow

1. Read the specific/ad valorem distinction and the small-country model assumptions.
2. Follow the price, quantity, stakeholder and welfare mechanism. Domestic D and S remain unchanged. Transfers a and c cancel, leaving losses b+d.
3. Draw independently with line, label and welfare-area tools, or use paper/text notes. Keyboard arrows move a cursor, Enter places points, and Escape cancels pending points. Touch scrolling does not count as a drawing click. Clear can be undone during the current page session.
4. Compare the reference and self-check axes, prices, quantities and areas.
5. Write an original 10-mark explanation or 15-mark evaluation; HL also exposes the numerical extension. Reveal the reference, inspect a weak answer and record “Met” or “Needs revision” against each criterion. Revision clears the previous review.

These checklists report the learner's own assessment. They do not infer semantic correctness, convert completion counts to IB marks, or update FSRS mastery. Suggested times are practice suggestions, not official examination allocations.

## Short answers and the current-point entry

Keyword matching now leaves the result pending at every coverage level. Before saving, the learner must check concepts/assumptions, causation and context against the visible model answer, then explicitly choose incorrect/partial/correct. The persisted attempt records a manual result. A false answer containing all keywords cannot silently become a successful attempt.

`#/review?point=u4-07-tariff` immediately starts only the selected point's eligible items (three at SL, four at HL/all). Invalid or level-ineligible point IDs are blocked rather than silently producing a global session. Temporary exam scope does not replace a deliberately selected point. General `#/review` remains a separate configurable mode.

## Content, arithmetic and evidence

The original linear example uses Pw=10, t=2, pre-tariff quantities 30/110 and post-tariff 50/90. Imports are 80→40 units, revenue 80, producer gain 80, consumer loss 200, production/consumption losses 20 each and net welfare change −40 currency units.

The historical example comes from the [USITC report release of 15 March 2023](https://www.usitc.gov/press_room/news_release/2023/er0315_63679.htm), concerning 2018–2021. Industry output is not employment, and this report does not determine economy-wide net welfare or long-run security benefits. The United States is not presented as a literal small price-taking economy.

The task design uses the distinction between explanation and supported evaluation described in the [IB's 2025 Economics examiner instructions](https://ibpublishing.ibo.org/exinst/apps/exinst/index.html?chapter=2&doc=EX_instructions_2025_e&part=10). Atlas feedback is educational guidance, not an official markscheme.

## Local data

Drawing, answer and self-review drafts persist in this browser under a versioned localStorage prefix. They work without network access after the application has been cached and survive language changes and reloads. They are currently excluded from the progress JSON backup; the UI states this limitation. The confirmed clear-learning-data action removes workshop drafts as well as existing learning data. No AI request is required.

## Checks

Component regressions cover pending keyword results, explicit result selection, current-point isolation, level exclusion, drawing undo/clear, invalid drafts, bilingual restoration and stale-feedback invalidation. Browser acceptance exercises desktop, tablet and mobile layouts plus a freshly cached offline reload. Evidence is kept locally under `output/playwright/tariff-improvements-2026-10-20/`; physical Safari/iPhone and official marking acceptance are separate from Chromium emulation.
