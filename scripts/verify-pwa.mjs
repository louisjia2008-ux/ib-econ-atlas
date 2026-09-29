import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./content-utils.mjs";

const dist = path.join(projectRoot, "dist");
const swPath = path.join(dist, "sw.js");
const manifestPath = path.join(dist, "manifest.webmanifest");
const failures = [];

if (!fs.existsSync(swPath)) failures.push("dist/sw.js was not generated.");
if (!fs.existsSync(manifestPath)) failures.push("dist/manifest.webmanifest was not generated.");

if (fs.existsSync(swPath)) {
  const worker = fs.readFileSync(swPath, "utf8");
  if (!worker.includes("precacheAndRoute")) failures.push("Service worker does not contain a precache route.");
  if (/indexedDB\s*\.\s*deleteDatabase|deleteDatabase\s*\(/.test(worker)) failures.push("Service worker contains IndexedDB deletion code.");
  if (/OPENAI|OWNER_ACCESS_TOKEN|\/ask[\"'`]/.test(worker)) failures.push("Service worker unexpectedly contains AI credentials or an AI runtime cache route.");
}

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.scope !== "/ib-econ-atlas/") failures.push(`Unexpected PWA scope: ${manifest.scope}`);
  if (!String(manifest.start_url).includes("#/study/")) failures.push("PWA start_url is not a Hash Router study route.");
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) failures.push("PWA manifest has no icon.");
}

if (failures.length > 0) {
  console.error(`PWA verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PWA verification passed: manifest and precache worker exist; no IndexedDB deletion or AI runtime cache rule detected.");
