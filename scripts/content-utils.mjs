import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const projectRoot = path.resolve(import.meta.dirname, "..");
export const contentRoot = path.join(projectRoot, "content");

export function readYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

export function parseLocalizedMarkdown(filePath, id, locale) {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${path.relative(projectRoot, filePath)} must contain YAML frontmatter and a Markdown explanation body.`);
  }

  const frontmatter = YAML.parse(match[1]);
  return {
    id,
    locale,
    ...frontmatter,
    explanation: match[2].trim(),
  };
}

export function listImplementedIds() {
  const root = path.join(contentRoot, "knowledge");
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

export function loadKnowledgePoint(id) {
  const dir = path.join(contentRoot, "knowledge", id);
  const meta = readYaml(path.join(dir, "meta.yaml"));
  const practice = readYaml(path.join(contentRoot, "quizzes", `${id}.yaml`));
  return {
    meta,
    content: {
      "zh-CN": parseLocalizedMarkdown(path.join(dir, "zh.md"), id, "zh-CN"),
      en: parseLocalizedMarkdown(path.join(dir, "en.md"), id, "en"),
    },
    practice,
  };
}

