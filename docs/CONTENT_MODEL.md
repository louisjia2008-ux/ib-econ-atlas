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

`zh.md` and `en.md` use YAML frontmatter for structured study fields and a Markdown body for the longer explanation. Required fields are title, takeaway, definition, causal chain, misconceptions, exam application, and summary. Real-world examples are optional and require a factual URL and observation date when present. Original hypothetical examples must be labelled illustrative and must not masquerade as dated observations.

The two pages must agree on economic meaning, assumptions, and exceptions, but natural phrasing and explanatory order may differ by language.

## Practice

Units 1 and 2 provide three items per point:

- a recall flashcard;
- an automatically scored multiple-choice question;
- a short-answer prompt with bilingual keyword groups, a model answer, and a visible scoring rationale.

Keyword groups represent ideas rather than one exact sentence. The browser normalises case and punctuation, supports phrase alternatives, reports coverage without assigning correctness. The learner checks the model answer against concepts/assumptions, causal direction and required application, then explicitly selects a result. Until all three checks and that selection are complete, no FSRS result or attempt can be saved. Vocabulary presence, including 100% coverage, cannot prove semantic correctness.

## Optional learning workshop

`content/workshops/<knowledge-point-id>.yaml` adds bilingual diagram prompts and review criteria, original exam-style tasks, model answers, weak-answer diagnosis and source links. Task level, indicative marks and suggested duration are explicit. `scripts/validate-content.mjs` validates both languages, unique task/criterion IDs and source links. Workshops compile into the frontend knowledge bundle; their tasks are separate from the ordinary flashcard/MCQ/short-answer queue. The optional AI Worker continues to receive only article content.

The tariff article, workshop and diagram are authored in `scripts/content-data/tariff-lesson.mjs` and `tariff-diagram.mjs`, through the existing Unit 4 and global diagram writers. Regeneration preserves these additions.

## Build products

`scripts/compile-content.mjs` creates:

- `src/generated/content.ts` for study, search, navigation, and practice;
- `worker/generated/knowledge.json` for the optional grounded-answer Worker.

These are deterministic build products committed to make content diffs and Worker scope reviewable. Run `npm run content:validate` before compiling.
