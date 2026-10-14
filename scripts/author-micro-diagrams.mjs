import fs from "node:fs";
import path from "node:path";
import { contentRoot } from "./content-utils.mjs";

const demand = [60, 80, 300, 260];
const supply = [60, 260, 300, 80];
const upper = [60, 200, 300, 20];
const lower = [60, 320, 300, 140];
const benefitUp = [60, 20, 300, 200];
const benefitDown = [60, 140, 300, 320];
const models = {
  "demand-supply": { title: "Competitive equilibrium", curves: [["D = MB", demand], ["S = MC", supply]], marks: [[180, 170, "Qe", "Pe"]] },
  "tax-wedge": { title: "Specific tax: buyer and seller prices", curves: [["D", demand], ["S", supply], ["S + tax", upper]], marks: [[140, 140, "Qt", "Pb"], [140, 200, "", "Ps"], [180, 170, "Q0", ""]] },
  "subsidy-wedge": { title: "Subsidy: receipts exceed buyer payment", curves: [["D", demand], ["S", supply], ["S - subsidy", lower]], marks: [[220, 200, "Qsub", "Pb"], [220, 140, "", "Ps"], [180, 170, "Q0", ""]] },
  "price-ceiling": { title: "Binding ceiling: Qd exceeds Qs", curves: [["D", demand], ["S", supply], ["Ceiling", [60, 200, 300, 200]]], marks: [[140, 200, "Qs", "Pc"], [220, 200, "Qd", ""]] },
  "price-floor": { title: "Binding floor: Qs exceeds Qd", curves: [["D", demand], ["S", supply], ["Floor", [60, 140, 300, 140]]], marks: [[140, 140, "Qd", "Pf"], [220, 140, "Qs", ""]] },
  "negative-production": { title: "Negative production externality", curves: [["MSB = MPB", demand], ["MPC", supply], ["MSC", upper]], marks: [[140, 140, "Q*", ""], [180, 170, "Qm", ""]] },
  "positive-production": { title: "Positive production externality", curves: [["MSB = MPB", demand], ["MPC", supply], ["MSC", lower]], marks: [[180, 170, "Qm", ""], [220, 200, "Q*", ""]] },
  "negative-consumption": { title: "Negative consumption externality", curves: [["MPB", demand], ["MSC = MPC", supply], ["MSB", benefitDown]], marks: [[140, 200, "Q*", ""], [180, 170, "Qm", ""]] },
  "positive-consumption": { title: "Positive consumption externality", curves: [["MPB", demand], ["MSC = MPC", supply], ["MSB", benefitUp]], marks: [[180, 170, "Qm", ""], [220, 140, "Q*", ""]] },
  "monopoly": { title: "Monopoly: output at MR=MC, price on D", curves: [["D = AR", demand], ["MC", supply], ["MR", [60, 80, 180, 260]]], marks: [[140, 200, "Qm", ""], [140, 140, "", "Pm"]] },
  "perfect-competition": { title: "Competitive firm: P=AR=MR=MC", curves: [["P = AR = MR", [60, 170, 300, 170]], ["MC", supply]], marks: [[180, 170, "Qf", "P"]] },
};
const colours = ["#2454d8", "#148064", "#bb541c"];
for (const [id, model] of Object.entries(models)) {
  const curves = model.curves.map(([label, [x1,y1,x2,y2]], index) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${colours[index]}" stroke-width="3" fill="none" clip-path="url(#plot)"/><text x="350" y="${110+index*38}" fill="${colours[index]}">${label}</text>`).join("");
  const marks = model.marks.map(([x,y,q,p]) => `<path d="M60 ${y} H${x} V330" stroke="#64748b" stroke-dasharray="4 4" fill="none"/><circle cx="${x}" cy="${y}" r="4" fill="#17233b"/>${q?`<text x="${x-8}" y="351">${q}</text>`:""}${p?`<text x="25" y="${y+4}">${p}</text>`:""}`).join("");
  fs.writeFileSync(path.join(contentRoot,"diagrams",`${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 390" role="img" aria-labelledby="title"><title id="title">${model.title}</title><defs><clipPath id="plot"><rect x="60" y="60" width="265" height="270"/></clipPath></defs><rect width="580" height="390" fill="#fff"/><g font-family="system-ui,sans-serif" font-size="14" fill="#17233b"><text x="25" y="25">${model.title}</text><path d="M60 60 V330 H325" fill="none" stroke="#17233b" stroke-width="2"/><text x="75" y="52">P / MB / MC</text><text x="285" y="377">Quantity</text>${curves}${marks}<text x="350" y="280" font-size="12">Illustrative model</text><text x="350" y="300" font-size="12">Not to scale</text></g></svg>\n`);
}
fs.writeFileSync(path.join(contentRoot,"diagrams","goods-matrix.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 260" role="img" aria-labelledby="title"><title id="title">Goods classified by rivalry and excludability</title><rect width="580" height="260" fill="#fff"/><g font-family="system-ui,sans-serif" fill="#17233b" font-size="14"><text x="20" y="30">Goods: rivalry and excludability</text><path d="M150 60 H560 V230 H150 Z M150 105 H560 M150 165 H560 M355 60 V230" fill="none" stroke="#64748b"/><text x="175" y="87">Excludable</text><text x="375" y="87">Non-excludable</text><text x="20" y="139">Rival</text><text x="20" y="199">Non-rival</text><text x="175" y="139">Private goods</text><text x="375" y="139">Common resources</text><text x="175" y="199">Club goods</text><text x="375" y="199">Public goods</text></g></svg>\n`);
console.log("Authored 12 original microeconomic SVG diagrams.");
