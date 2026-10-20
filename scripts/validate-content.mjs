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

const allowIncomplete = process.argv.includes("--allow-incomplete");
const failures = [];
const manifest = readYaml(path.join(contentRoot, "manifest.yaml"));
const entries = manifest.entries ?? [];
const manifestIds = new Set(entries.map((entry) => entry.id));
const implementedIds = listImplementedIds();

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function diagramExists(diagramId) {
  return fs.existsSync(path.join(contentRoot, "diagrams", `${diagramId}.svg`));
}

requireCondition(manifest.version === 1, "Manifest version must be 1.");
requireCondition(entries.filter((entry) => entry.id.startsWith("u1-")).length === 44, "Unit 1 must contain 44 entries.");
requireCondition(entries.filter((entry) => entry.id.startsWith("u2-")).length === 60, "Unit 2 must contain 60 entries.");
requireCondition(entries.filter((entry) => entry.id.startsWith("u3-")).length === 60, "Unit 3 must contain 60 entries.");
requireCondition(entries.filter((entry) => entry.id.startsWith("u4-")).length === 63, "Unit 4 must contain 63 entries.");
requireCondition(manifestIds.size === entries.length, "Manifest knowledge-point IDs must be unique.");

const expectedSectionCounts = { "1.1": 29, "1.2": 15,
  "2.1": 5, "2.2": 5, "2.3": 5, "2.4": 3, "2.5": 5, "2.6": 3,
  "2.7": 6, "2.8": 8, "2.9": 3, "2.10": 3, "2.11": 11, "2.12": 3,
  "3.1": 10, "3.2": 10, "3.3": 13, "3.4": 6, "3.5": 9, "3.6": 7, "3.7": 5,
  "4.1": 6, "4.2": 5, "4.3": 3, "4.4": 7, "4.5": 8, "4.6": 9, "4.7": 3, "4.8": 5, "4.9": 7, "4.10": 10 };
for (const [section, count] of Object.entries(expectedSectionCounts)) {
  const actual = entries.filter((entry) => entry.section === section).length;
  requireCondition(actual === count, `Section ${section} must contain ${count} entries; found ${actual}.`);
}

if (!allowIncomplete) {
  requireCondition(implementedIds.length === entries.length, `Strict validation requires ${entries.length} implemented points; found ${implementedIds.length}.`);
  requireCondition(entries.every((entry) => implementedIds.includes(entry.id)), "Every manifest entry must have a knowledge directory.");
}

for (const id of implementedIds) {
  requireCondition(manifestIds.has(id), `${id} is implemented but missing from the manifest.`);
  try {
    const point = loadKnowledgePoint(id);
    const meta = point.meta;
    const entry = entries.find((candidate) => candidate.id === id);
    requireCondition(meta.id === id, `${id}: meta.id must match its directory name.`);
    requireCondition(["core", "hl", "extension"].includes(meta.level), `${id}: invalid level.`);
    requireCondition(typeof meta.slug === "string" && meta.slug.length > 0, `${id}: slug is required.`);
    requireCondition(typeof meta.section === "string", `${id}: section is required.`);
    requireCondition(entry?.section === meta.section && entry?.level === meta.level, `${id}: manifest section/level must match metadata.`);
    requireCondition(Array.isArray(meta.syllabusRefs) && meta.syllabusRefs.length > 0, `${id}: syllabusRefs are required.`);
    requireCondition(Array.isArray(meta.textbookRefs) && meta.textbookRefs.length > 0, `${id}: textbookRefs are required.`);
    requireCondition(meta.textbookRefs.every((ref) => Array.isArray(ref.pages) && ref.pages.length > 0), `${id}: every textbook reference needs pages.`);
    requireCondition(Array.isArray(meta.terms) && meta.terms.length > 0, `${id}: terms are required.`);
    requireCondition(Array.isArray(meta.quizIds) && meta.quizIds.length >= 2, `${id}: at least two quiz IDs are required.`);
    for (const diagramId of meta.diagramIds ?? []) {
      requireCondition(
        diagramExists(diagramId),
        `${id}: diagram ${diagramId} is missing from content/diagrams.`,
      );
    }
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
      for (const locale of ["zh-CN", "en"]) {
        requireCondition(typeof item.prompt?.[locale] === "string" && item.prompt[locale].trim().length > 0, `${item.id}: localized prompt missing.`);
        requireCondition(typeof item.explanation?.[locale] === "string" && item.explanation[locale].trim().length > 0, `${item.id}: localized explanation missing.`);
        const answer = item.type === "flashcard" ? item.answer : item.type === "short-answer" ? item.modelAnswer : null;
        if (answer) requireCondition(Boolean(answer[locale]?.trim()), `${item.id}: localized answer missing.`);
      }
      requireCondition(item.level === undefined || ["core", "hl", "extension"].includes(item.level), `${item.id}: invalid practice level.`);
      if (item.type === "mcq") {
        requireCondition(item.options?.length === 4 && new Set(item.options.map((option) => option.id)).size === 4, `${item.id}: four unique options required.`);
        requireCondition(item.options.some((option) => option.id === item.correctOptionId), `${item.id}: correct option missing.`);
        for (const locale of ["zh-CN", "en"]) {
          requireCondition(item.options.every((option) => Boolean(option[locale]?.trim())), `${item.id}: localized options missing.`);
          requireCondition(new Set(item.options.map(option => option[locale]?.trim())).size === 4, `${item.id}: duplicate localized MCQ options.`);
        }
      }
      if (item.type === "short-answer") requireCondition(item.keywordGroups?.length >= 3 && item.keywordGroups.every((group) => ["zh-CN", "en"].every((locale) => group.label?.[locale] && group.alternatives?.[locale]?.length > 0)), `${item.id}: three bilingual keyword groups required.`);
    }
    if (point.workshop) {
      const workshop = point.workshop;
      const bilingual = (value) => ["zh-CN", "en"].every(locale => typeof value?.[locale] === "string" && value[locale].trim().length > 0);
      const criteriaValid = (criteria) => Array.isArray(criteria) && criteria.length > 0 && new Set(criteria.map(c => c.id)).size === criteria.length && criteria.every(c => c.id && [c.title, c.guidance, c.feedback].every(bilingual));
      requireCondition([workshop.title, workshop.introduction, workshop.assumptions, workshop.diagram?.prompt].every(bilingual), `${id}: bilingual workshop introduction and diagram prompt required.`);
      requireCondition(criteriaValid(workshop.diagram?.criteria), `${id}: invalid diagram review criteria.`);
      requireCondition(Array.isArray(workshop.tasks) && workshop.tasks.length > 0 && new Set(workshop.tasks.map(t => t.id)).size === workshop.tasks.length, `${id}: unique workshop tasks required.`);
      for (const task of workshop.tasks ?? []) {
        requireCondition([task.title, task.prompt, task.modelAnswer, task.weakAnswer, task.diagnosis].every(bilingual) && criteriaValid(task.criteria), `${id}/${task.id}: bilingual exam task and feedback required.`);
        requireCondition(["core", "hl", "extension"].includes(task.level) && Number.isInteger(task.marks) && task.marks > 0 && Number.isInteger(task.minutes) && task.minutes > 0, `${id}/${task.id}: valid task level, marks and duration required.`);
      }
      requireCondition(workshop.sources?.length > 0 && workshop.sources.every(s => s.title && /^https:\/\//.test(s.url)), `${id}: workshop source links required.`);
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
