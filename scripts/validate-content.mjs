import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  contentRoot,
  listImplementedIds,
  loadKnowledgePoint,
  projectRoot,
  readYaml,
} from "./content-utils.mjs";

const allowIncomplete = process.argv.includes("--allow-incomplete");
const failures = [];
const manifest = readYaml(path.join(contentRoot, "manifest.yaml"));
const entries = manifest.entries ?? [];
const manifestIds = new Set(entries.map((entry) => entry.id));
const implementedIds = listImplementedIds();

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

requireCondition(manifest.version === 1, "Manifest version must be 1.");
requireCondition(entries.length === 43, `Manifest must contain exactly 43 entries; found ${entries.length}.`);
requireCondition(manifestIds.size === entries.length, "Manifest knowledge-point IDs must be unique.");

const expectedSectionCounts = { "1.1": 15, "1.2": 8, "1.3": 6, "1.4": 6, "1.5": 8 };
for (const [section, count] of Object.entries(expectedSectionCounts)) {
  const actual = entries.filter((entry) => entry.section === section).length;
  requireCondition(actual === count, `Section ${section} must contain ${count} entries; found ${actual}.`);
}

if (!allowIncomplete) {
  requireCondition(implementedIds.length === 43, `Strict validation requires 43 implemented points; found ${implementedIds.length}.`);
  requireCondition(entries.every((entry) => implementedIds.includes(entry.id)), "Every manifest entry must have a knowledge directory.");
}

for (const id of implementedIds) {
  requireCondition(manifestIds.has(id), `${id} is implemented but missing from the manifest.`);
  try {
    const point = loadKnowledgePoint(id);
    const meta = point.meta;
    requireCondition(meta.id === id, `${id}: meta.id must match its directory name.`);
    requireCondition(["core", "hl", "extension"].includes(meta.level), `${id}: invalid level.`);
    requireCondition(typeof meta.slug === "string" && meta.slug.length > 0, `${id}: slug is required.`);
    requireCondition(typeof meta.section === "string", `${id}: section is required.`);
    requireCondition(Array.isArray(meta.syllabusRefs) && meta.syllabusRefs.length > 0, `${id}: syllabusRefs are required.`);
    requireCondition(Array.isArray(meta.textbookRefs) && meta.textbookRefs.length > 0, `${id}: textbookRefs are required.`);
    requireCondition(meta.textbookRefs.every((ref) => Array.isArray(ref.pages) && ref.pages.length > 0), `${id}: every textbook reference needs pages.`);
    requireCondition(Array.isArray(meta.terms) && meta.terms.length > 0, `${id}: terms are required.`);
    requireCondition(Array.isArray(meta.quizIds) && meta.quizIds.length >= 2, `${id}: at least two quiz IDs are required.`);
    for (const ref of [...(meta.related ?? []), ...(meta.prerequisites ?? [])]) {
      requireCondition(manifestIds.has(ref), `${id}: related/prerequisite ${ref} does not exist in the manifest.`);
    }
    for (const locale of ["zh-CN", "en"]) {
      const localized = point.content[locale];
      for (const field of ["title", "takeaway", "definition", "explanation"]) {
        requireCondition(typeof localized[field] === "string" && localized[field].trim().length > 0, `${id}/${locale}: ${field} is required.`);
      }
      for (const field of ["causalChain", "misconceptions", "examApplication", "summary"]) {
        requireCondition(Array.isArray(localized[field]) && localized[field].length > 0, `${id}/${locale}: ${field} must be a non-empty list.`);
      }
      if (localized.realWorldExample) {
        requireCondition(/^https:\/\//.test(localized.realWorldExample.sourceUrl ?? ""), `${id}/${locale}: example source must be HTTPS.`);
        requireCondition(/^\d{4}-\d{2}-\d{2}$/.test(localized.realWorldExample.observedAt ?? ""), `${id}/${locale}: example observedAt must be YYYY-MM-DD.`);
      }
    }
    requireCondition(Array.isArray(point.practice) && point.practice.length >= 2, `${id}: at least two practice items are required.`);
    requireCondition(point.practice.some((item) => item.type === "flashcard"), `${id}: one flashcard is required.`);
    requireCondition(point.practice.some((item) => item.type === "mcq" || item.type === "short-answer"), `${id}: one MCQ or short answer is required.`);
    for (const item of point.practice) {
      requireCondition(item.knowledgePointId === id, `${id}: quiz ${item.id} points at the wrong knowledge point.`);
      requireCondition(meta.quizIds.includes(item.id), `${id}: quiz ${item.id} is not listed by meta.quizIds.`);
    }
  } catch (error) {
    failures.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

try {
  const trackedPdfs = execFileSync("git", ["ls-files", "*.pdf"], { cwd: projectRoot, encoding: "utf8" }).trim();
  requireCondition(trackedPdfs.length === 0, `Tracked PDF files are forbidden: ${trackedPdfs}`);
} catch (error) {
  failures.push(`Could not audit tracked PDFs: ${error instanceof Error ? error.message : String(error)}`);
}

if (failures.length > 0) {
  console.error(`Content validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Content validation passed: ${entries.length} planned, ${implementedIds.length} implemented${allowIncomplete ? " (draft mode)" : ""}.`);

