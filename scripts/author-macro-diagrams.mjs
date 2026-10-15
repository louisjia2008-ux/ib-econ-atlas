import fs from "node:fs";
import path from "node:path";
import { contentRoot } from "./content-utils.mjs";

// Original qualitative schematics, not numerical estimates or textbook figures.
const models = {
  "macro-ad-as": { title: "AD and SRAS equilibrium", x: "Real GDP (Y)", y: "Price level (P)", lines: [["AD", "M65 85 L315 285"], ["SRAS", "M65 285 L315 85"]], marks: [[190,185,"Ye","Pe"]] },
  "macro-ad-expansion": { title: "Demand expansion: AD0 to AD1", x: "Real GDP (Y)", y: "Price level (P)", lines: [["AD0", "M65 85 L315 285"], ["SRAS", "M65 285 L315 85"], ["AD1", "M65 5 L315 205"]], marks: [[190,185,"Y0","P0"],[240,145,"Y1","P1"]] },
  "macro-supply-shock": { title: "Adverse supply shock: SRAS0 to SRAS1", x: "Real GDP (Y)", y: "Price level (P)", lines: [["AD", "M65 85 L315 285"], ["SRAS0", "M65 285 L315 85"], ["SRAS1", "M65 205 L315 5"]], marks: [[190,185,"Y0","P0"],[140,145,"Y1","P1"]] },
  "macro-lras": { title: "Potential output growth: LRAS0 to LRAS1", x: "Real GDP (Y)", y: "Price level (P)", lines: [["LRAS0", "M160 65 V315"],["LRAS1", "M250 65 V315"]], marks: [[160,310,"Yf0",""],[250,310,"Yf1",""]] },
  "macro-keynesian": { title: "Keynesian AS: spare capacity to capacity limit", x: "Real GDP (Y)", y: "Price level (P)", lines: [["Keynesian AS", "M65 275 H155 Q260 275 260 165 V65"]], marks: [[260,165,"Yf",""]] },
  "macro-cycle": { title: "Business cycle around a rising trend", x: "Time", y: "Real GDP", lines: [["Actual output", "M65 275 C105 305 125 140 165 185 S220 275 250 170 S290 70 315 115"],["Trend", "M65 280 L315 110"]], marks: [] },
  "macro-phillips": { title: "Phillips curves: given inflation expectations", x: "Unemployment rate", y: "Inflation rate", lines: [["SRPC", "M85 80 Q130 260 315 280"],["LRPC", "M210 65 V315"]], marks: [[210,315,"Un",""]] },
  "macro-lorenz": { title: "Lorenz curve and equality line", x: "Cumulative population (%)", y: "Cumulative income (%)", lines: [["Equality", "M65 315 L315 65"],["Lorenz", "M65 315 Q240 315 315 65"]], marks: [[315,65,"100","100"]] },
};
const colours = ["#2454d8", "#148064", "#bb541c"];
for (const [id, model] of Object.entries(models)) {
  const curves = model.lines.map(([label,d],i)=>`<path d="${d}" stroke="${colours[i]}" stroke-width="3" fill="none" clip-path="url(#plot)"/><text x="340" y="${115+i*38}" fill="${colours[i]}">${label}</text>`).join("");
  const marks = model.marks.map(([x,y,q,p])=>`<path d="M65 ${y} H${x} V315" stroke="#64748b" stroke-dasharray="4 4" fill="none"/><text x="${x-12}" y="338">${q}</text><text x="27" y="${y+4}">${p}</text>`).join("");
  fs.writeFileSync(path.join(contentRoot,"diagrams",`${id}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 395" role="img" aria-labelledby="title"><title id="title">${model.title}</title><defs><clipPath id="plot"><rect x="65" y="60" width="255" height="255"/></clipPath></defs><rect width="600" height="395" fill="white"/><g font-family="system-ui,sans-serif" font-size="14" fill="#17233b"><text x="20" y="26">${model.title}</text><text x="65" y="50">${model.y}</text><path d="M65 60 V315 H320" stroke="#17233b" stroke-width="2" fill="none"/><text x="90" y="370">${model.x}</text>${curves}${marks}<text x="340" y="280" font-size="12">Original schematic</text><text x="340" y="300" font-size="12">Not to scale</text></g></svg>\n`);
}
console.log(`Authored ${Object.keys(models).length} original macroeconomic SVG diagrams.`);
