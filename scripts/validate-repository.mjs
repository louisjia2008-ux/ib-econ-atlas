import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { projectRoot } from "./content-utils.mjs";

const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function readWorkflow(name) {
  const filePath = path.join(projectRoot, ".github", "workflows", name);
  requireCondition(fs.existsSync(filePath), `${name}: workflow file is missing.`);
  if (!fs.existsSync(filePath)) return {};
  try {
    return YAML.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${name}: invalid YAML (${error instanceof Error ? error.message : String(error)}).`);
    return {};
  }
}

function allStepUses(workflow) {
  return Object.values(workflow.jobs ?? {}).flatMap((job) =>
    (job.steps ?? []).map((step) => step.uses).filter(Boolean),
  );
}

function allStepRuns(workflow) {
  return Object.values(workflow.jobs ?? {}).flatMap((job) =>
    (job.steps ?? []).map((step) => step.run).filter(Boolean),
  );
}

const ci = readWorkflow("ci.yml");
requireCondition(ci.permissions?.contents === "read", "ci.yml: contents permission must be read-only.");
requireCondition(Object.hasOwn(ci.on ?? {}, "pull_request"), "ci.yml: pull_request trigger is required.");
requireCondition((ci.on?.push?.branches ?? []).includes("main"), "ci.yml: main push trigger is required.");
requireCondition(allStepRuns(ci).includes("npm ci"), "ci.yml: npm ci is required.");
requireCondition(allStepRuns(ci).includes("npm run verify"), "ci.yml: npm run verify is required.");

const pages = readWorkflow("pages.yml");
requireCondition((pages.on?.push?.branches ?? []).includes("main"), "pages.yml: only the main branch may trigger push deployment.");
requireCondition(Object.hasOwn(pages.on ?? {}, "workflow_dispatch"), "pages.yml: workflow_dispatch is required.");
requireCondition(pages.permissions?.contents === "read", "pages.yml: contents permission must be read-only.");
requireCondition(pages.permissions?.pages === "write", "pages.yml: pages write permission is required.");
requireCondition(pages.permissions?.["id-token"] === "write", "pages.yml: id-token write permission is required.");
requireCondition(allStepRuns(pages).includes("npm run verify"), "pages.yml: deployment must run the full verification gate.");
requireCondition(allStepUses(pages).includes("actions/upload-pages-artifact@v3"), "pages.yml: Pages artifact upload step is required.");
requireCondition(allStepUses(pages).includes("actions/deploy-pages@v4"), "pages.yml: official Pages deployment action is required.");

const markdownFiles = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  ".github/pull_request_template.md",
  ...fs.readdirSync(path.join(projectRoot, "docs"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join("docs", file)),
];

for (const relativeFile of markdownFiles) {
  const filePath = path.join(projectRoot, relativeFile);
  requireCondition(fs.existsSync(filePath), `${relativeFile}: documentation file is missing.`);
  if (!fs.existsSync(filePath)) continue;
  const markdown = fs.readFileSync(filePath, "utf8");
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const localTarget = decodeURIComponent(target.split("#", 1)[0]);
    const resolved = path.resolve(path.dirname(filePath), localTarget);
    requireCondition(
      resolved.startsWith(`${projectRoot}${path.sep}`) && fs.existsSync(resolved),
      `${relativeFile}: local link does not resolve (${target}).`,
    );
  }
}

if (failures.length > 0) {
  console.error(`Repository validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Repository validation passed: 2 workflows and ${markdownFiles.length} documentation files checked.`);
