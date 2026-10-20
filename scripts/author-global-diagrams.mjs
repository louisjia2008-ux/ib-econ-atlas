import { tariffDiagram } from "./content-data/tariff-diagram.mjs";
import fs from "node:fs";
import path from "node:path";
import { contentRoot } from "./content-utils.mjs";
// Original qualitative models. Coordinates on the same line share a single scale.
const models = {
 "global-imports": { title: "Small economy: imports at Pw", x: "Domestic quantity", y: "Price", lines: [["D","M65 65 L315 315"],["S","M65 315 L315 65"],["Pw","M65 235 H315"]], marks: [[145,235,"Qs"],[235,235,"Qd"]], note: "Imports = Qd - Qs" },
 "global-exports": { title: "Small economy: exports at Pw", x: "Domestic quantity", y: "Price", lines: [["D","M65 65 L315 315"],["S","M65 315 L315 65"],["Pw","M65 145 H315"]], marks: [[145,145,"Qd"],[235,145,"Qs"]], note: "Exports = Qs - Qd" },
 "global-tariff": { title: "Specific import tariff", x: "Domestic quantity", y: "Price", lines: [["D","M65 65 L315 315"],["S","M65 315 L315 65"],["Pw","M65 255 H315"],["Pw + t","M65 220 H315"]], marks: [[125,255,"Qs0"],[160,220,"Qs1"],[220,220,"Qd1"],[255,255,"Qd0"]], note: "Revenue = t (Qd1 - Qs1)" },
 "global-quota": { title: "Binding import quota", x: "Domestic quantity", y: "Price", lines: [["D","M65 65 L315 315"],["S","M65 315 L315 65"],["Pw","M65 255 H315"],["Pq","M65 220 H315"]], marks: [[160,220,"Qs"],[220,220,"Qd"]], note: "Quota = Qd - Qs; rents depend on licences" },
 "global-subsidy": { title: "Domestic production subsidy", x: "Domestic quantity", y: "Price / receipts", lines: [["D","M65 65 L315 315"],["S","M65 315 L315 65"],["Pw","M65 255 H315"],["Pw + s","M65 220 H315"]], marks: [[125,255,"Qs0"],[160,220,"Qs1"],[255,255,"Qd"]], note: "Buyers pay Pw; fiscal cost = s Qs1" },
 "global-currency": { title: "Home-currency demand increases", x: "Quantity of home currency", y: "USD per home unit", lines: [["D0","M65 85 L315 285"],["S","M65 285 L315 85"],["D1","M65 5 L315 205"]], marks: [[190,185,"Q0"],[240,145,"Q1"]], note: "Higher USD/home unit = appreciation" },
 "global-j-curve": { title: "Possible J-curve after depreciation", x: "Time after depreciation", y: "Trade balance (home currency)", lines: [["Zero","M65 170 H315"],["Balance","M65 220 Q105 295 145 270 T315 85"]], marks: [], note: "Not guaranteed; long-run elasticities matter" },
};
const colours = ["#2454d8", "#148064", "#bb541c", "#7c3aed"];
for (const [id,m] of Object.entries(models)) {
 const curves=m.lines.map(([label,d],i)=>`<path d="${d}" fill="none" stroke="${colours[i]}" stroke-width="3" clip-path="url(#plot)"/><text x="350" y="${100+i*35}" fill="${colours[i]}">${label}</text>`).join("");
 const marks=m.marks.map(([x,y,q])=>`<path d="M${x} ${y} V315" fill="none" stroke="#64748b" stroke-dasharray="4 4"/><text x="${x-12}" y="338">${q}</text>`).join("");
 fs.writeFileSync(path.join(contentRoot,"diagrams",`${id}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 410" role="img" aria-labelledby="title"><title id="title">${m.title}</title><defs><clipPath id="plot"><rect x="65" y="60" width="255" height="255"/></clipPath></defs><rect width="660" height="410" fill="white"/><g font-family="system-ui,sans-serif" font-size="14" fill="#17233b"><text x="20" y="25">${m.title}</text><text x="65" y="50">${m.y}</text><path d="M65 60 V315 H320" stroke="#17233b" stroke-width="2" fill="none"/>${curves}${marks}<text x="90" y="365">${m.x}</text><text x="20" y="395" font-size="13">${m.note} | Original schematic, not to scale</text></g></svg>\n`);
}
fs.writeFileSync(path.join(contentRoot,"diagrams","global-poverty-cycle.svg"),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 320" role="img" aria-labelledby="title"><title id="title">A possible reinforcing poverty cycle</title><rect width="660" height="320" fill="white"/><g font-family="system-ui,sans-serif" font-size="18" text-anchor="middle" fill="#17233b"><text x="330" y="35">A possible reinforcing poverty cycle</text><text x="180" y="100">Low income</text><text x="480" y="100">Low saving</text><text x="480" y="240">Low investment</text><text x="180" y="240">Low productivity</text></g><g fill="#2454d8" font-size="30"><text x="320" y="105">→</text><text x="470" y="175">↓</text><text x="320" y="245">←</text><text x="170" y="175">↑</text></g><text x="40" y="295" font-family="system-ui,sans-serif" font-size="14">Not inevitable: finance, public services and institutions can interrupt the cycle.</text></svg>\n`);
fs.writeFileSync(path.join(contentRoot,"diagrams","global-tariff.svg"), tariffDiagram);
console.log("Authored 8 original global-economy diagrams.");
