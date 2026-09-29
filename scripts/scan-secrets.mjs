import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./content-utils.mjs";

const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: projectRoot, encoding: "utf8" }).split("\0").filter(Boolean);
const failures = [];
const forbiddenFiles = tracked.filter((file) => ((/(^|\/)(\.env(?:\..+)?|\.dev\.vars|wrangler\.toml)$/.test(file) && file !== ".env.example") || /\.pdf$/i.test(file)));
for (const file of forbiddenFiles) failures.push(`forbidden tracked file: ${file}`);

const patterns = [
  { label: "OpenAI-style secret", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { label: "private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { label: "hard-coded bearer token", regex: /Authorization\s*[:=]\s*["'`]Bearer\s+[A-Za-z0-9._-]{16,}/gi },
  { label: "assigned OpenAI key", regex: /OPENAI_API_KEY\s*=\s*["']?[A-Za-z0-9_-]{16,}/g },
];

for (const relative of tracked) {
  const absolute = path.join(projectRoot, relative);
  if (!fs.statSync(absolute).isFile()) continue;
  const buffer = fs.readFileSync(absolute);
  if (buffer.includes(0)) continue;
  const text = buffer.toString("utf8");
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(text)) failures.push(`${pattern.label} pattern in ${relative}`);
  }
}

if (failures.length > 0) {
  console.error(`Secret scan failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Secret scan passed across ${tracked.length} tracked files.`);
