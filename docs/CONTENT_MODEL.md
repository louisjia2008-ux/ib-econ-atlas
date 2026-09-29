# Content model

Each knowledge point has one stable ID shared by two independently written language pages, metadata, and practice items.

## Metadata

`meta.yaml` contains:

- `id`, `slug`, `section`, and `level`
- one or more official `syllabusRefs`
- one or more Cambridge `textbookRefs` containing only chapter, section, and page numbers
- `prerequisites` and `related` stable IDs
- bilingual search `terms` and `synonyms`
- `diagramIds` and `quizIds`

## Localised Markdown

`zh.md` and `en.md` use YAML frontmatter for structured study fields and a Markdown body for the longer explanation. Required fields are title, takeaway, definition, causal chain, sourced real-world example, misconceptions, exam application, and summary.

The two pages must agree on economic meaning, assumptions, and exceptions, but natural phrasing and explanatory order may differ by language.

## Practice

Unit 1 currently provides three items per point:

- a recall flashcard;
- an automatically scored multiple-choice question;
- a short-answer prompt with bilingual keyword groups, a model answer, and a visible scoring rationale.

Keyword groups represent ideas rather than one exact sentence. The browser normalises case and punctuation, supports phrase alternatives, reports coverage, and preserves a user's manual correction as the final attempt result.

## Build products

`scripts/compile-content.mjs` creates:

- `src/generated/content.ts` for study, search, navigation, and practice;
- `worker/generated/knowledge.json` for the optional grounded-answer Worker.

These are deterministic build products committed to make content diffs and Worker scope reviewable. Run `npm run content:validate` before compiling.
