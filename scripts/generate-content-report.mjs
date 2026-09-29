import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  contentRoot,
  listImplementedIds,
  loadKnowledgePoint,
  projectRoot,
  readYaml,
} from "./content-utils.mjs";

const checkOnly = process.argv.includes("--check");
const reportsRoot = path.join(projectRoot, "reports");
const manifest = readYaml(path.join(contentRoot, "manifest.yaml"));
const ids = listImplementedIds();
const points = ids.map((id) => loadKnowledgePoint(id));

const sectionCounts = Object.fromEntries(
  ["1.1", "1.2", "1.3", "1.4", "1.5"].map((section) => [
    section,
    points.filter(({ meta }) => meta.section === section).length,
  ]),
);

const levelCounts = Object.fromEntries(
  ["core", "hl", "extension"].map((level) => [
    level,
    points.filter(({ meta }) => meta.level === level).length,
  ]),
);

const practiceCounts = { flashcard: 0, mcq: 0, "short-answer": 0 };
const sourceUrls = new Set();
const diagramIds = new Set();
for (const point of points) {
  for (const item of point.practice) practiceCounts[item.type] += 1;
  for (const diagramId of point.meta.diagramIds ?? []) diagramIds.add(diagramId);
  for (const locale of ["zh-CN", "en"]) {
    const example = point.content[locale].realWorldExample;
    if (example?.sourceUrl) sourceUrls.add(example.sourceUrl);
  }
}

const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: projectRoot,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter(Boolean)
  .sort();

const forbiddenTracked = trackedFiles.filter((file) =>
  /(?:\.pdf$|\.(?:png|jpe?g|tiff?|bmp|webp)$|(?:^|\/)\.env$|(?:^|\/)\.env\.(?!example$)|\.dev\.vars$|wrangler\.toml$)/i.test(file),
);

if (forbiddenTracked.length > 0) {
  throw new Error(`Forbidden tracked files: ${forbiddenTracked.join(", ")}`);
}

const coverage = `# Content coverage report

This report is generated from the checked-in source content by \`npm run content:report\`. Do not edit it by hand.

## Unit 1 release slice

| Measure | Result |
| --- | ---: |
| Manifest knowledge points | ${manifest.entries.length} |
| Implemented knowledge points | ${points.length} |
| Localised learning pages | ${points.length * 2} |
| Chinese pages | ${points.length} |
| English pages | ${points.length} |
| Flashcards | ${practiceCounts.flashcard} |
| Multiple-choice questions | ${practiceCounts.mcq} |
| Short-answer questions | ${practiceCounts["short-answer"]} |
| Total practice items | ${Object.values(practiceCounts).reduce((sum, count) => sum + count, 0)} |
| Unique diagram assets | ${diagramIds.size} |
| Unique external example sources | ${sourceUrls.size} |

## Coverage by syllabus section

| Section | Knowledge points |
| --- | ---: |
${Object.entries(sectionCounts)
  .map(([section, count]) => `| ${section} | ${count} |`)
  .join("\n")}

## Coverage by level

| Level | Knowledge points |
| --- | ---: |
${Object.entries(levelCounts)
  .map(([level, count]) => `| ${level} | ${count} |`)
  .join("\n")}

## Enforced release properties

- Every implemented ID has paired \`zh.md\` and \`en.md\` content.
- Every knowledge point has at least one syllabus mapping and one textbook chapter/page mapping.
- Every knowledge point has a flashcard, multiple-choice question, and short-answer question.
- Every real-world example has an HTTPS source and an observation date.
- Related, prerequisite, quiz, and diagram references are checked during strict content validation.
`;

const copyright = `# Copyright boundary audit

This report is generated from the Git index by \`npm run content:report\`. It is a repository-boundary check, not a legal opinion.

## Result

- Tracked files audited: ${trackedFiles.length}
- Tracked PDFs: 0
- Tracked raster or scanned-page image formats: 0
- Tracked environment or Wrangler secret files: 0
- Source diagrams are original SVG files under \`content/diagrams/\`.
- External URLs in learning content identify factual sources; their text, logos, and trademarks are not redistributed.
- The local Cambridge coursebook is explicitly ignored and is not part of the Git tree or project licences.

## Licensing boundary

- Source code is offered under the MIT License.
- Original learning content under \`content/\` is offered under CC BY-SA 4.0.
- Third-party facts, links, trademarks, syllabus identifiers, and the locally held textbook are excluded from those grants.
`;

const outputs = new Map([
  [path.join(reportsRoot, "content-coverage.md"), coverage],
  [path.join(reportsRoot, "copyright-audit.md"), copyright],
]);

if (!checkOnly) fs.mkdirSync(reportsRoot, { recursive: true });

const stale = [];
for (const [filePath, expected] of outputs) {
  if (checkOnly) {
    const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
    if (actual !== expected) stale.push(path.relative(projectRoot, filePath));
  } else {
    fs.writeFileSync(filePath, expected);
  }
}

if (stale.length > 0) {
  console.error(`Generated reports are missing or stale: ${stale.join(", ")}. Run npm run content:report.`);
  process.exit(1);
}

console.log(
  checkOnly
    ? `Generated report check passed: ${outputs.size} report(s) are current.`
    : `Generated ${outputs.size} repository report(s).`,
);
