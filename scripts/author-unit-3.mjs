import { topics, sections } from "./content-data/unit-3.mjs";
import { writeStudyUnit } from "./author-study-unit.mjs";

const guidance = {
  "3.1": ["写清指标、公式、单位和局限；区分名义、实际、总量与人均。", "State indicators, formulas, units and limits; distinguish nominal, real, aggregate and per-capita measures."],
  "3.2": ["标明物价水平与实际产出轴，区分 AD、SRAS、LRAS 及模型假设。", "Label price level and real output; distinguish AD, SRAS, LRAS and model assumptions."],
  "3.3": ["先定义和衡量目标，再解释成因、利益相关者与目标冲突。", "Define and measure objectives before analysing causes, stakeholders and conflicts."],
  "3.4": ["区分收入、财富、贫困与不平等，评价针对性、激励与公平标准。", "Distinguish income, wealth, poverty and inequality; evaluate targeting, incentives and equity criteria."],
  "3.5": ["用利率到支出再到 AD 的链条解释传导，注明汇率制度、时滞与限制。", "Trace rates through spending to AD, stating exchange-rate arrangements, lags and limitations."],
  "3.6": ["区分购买与转移、流量与存量，评价漏出、时滞、挤出和债务。", "Distinguish purchases/transfers and flows/stocks; evaluate leakages, lags, crowding out and debt."],
  "3.7": ["解释生产率与潜在产出的渠道，区分短期 AD 与长期 AS，并评价机会成本。", "Explain productivity and potential-output channels, distinguish short-run AD from long-run AS and evaluate opportunity costs."],
};
const special = {
  "business-cycle": "macro-cycle", "aggregate-demand": "macro-ad-as",
  consumption: "macro-ad-expansion", investment: "macro-ad-expansion",
  sras: "macro-supply-shock", lras: "macro-lras", "keynesian-as": "macro-keynesian",
  "macro-equilibrium": "macro-ad-as",
  "macro-shocks": "macro-supply-shock", "potential-growth": "macro-lras",
  "demand-pull": "macro-ad-expansion", "cost-push": "macro-supply-shock",
  "phillips-curve": "macro-phillips", "lorenz-gini": "macro-lorenz",
  "expansionary-monetary": "macro-ad-expansion", "expansionary-fiscal": "macro-ad-expansion",
  "market-based-supply": "macro-lras", "interventionist-supply": "macro-lras",
  "infrastructure-innovation": "macro-lras", "policy-mix": "macro-lras",
};
const prerequisites = {
  "3.1": ["u1-13-factors-of-production"], "3.2": ["u3-02-gdp"],
  "3.3": ["u3-17-macro-equilibrium"], "3.4": ["u1-35-equality-equity"],
  "3.5": ["u3-11-aggregate-demand"], "3.6": ["u3-11-aggregate-demand"],
  "3.7": ["u3-15-lras"],
};
writeStudyUnit({ unit: 3, topics, sections, guidance, special, prerequisites,
  releaseCounts: { "3.1": 10, "3.2": 10, "3.3": 12, "3.4": 6, "3.5": 6, "3.6": 7, "3.7": 5 } });
