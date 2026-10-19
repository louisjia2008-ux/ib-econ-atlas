import { topics, sections } from "./content-data/unit-4.mjs";
import { writeStudyUnit } from "./author-study-unit.mjs";
const guidance = {
 "4.1": ["说明小国、同质商品和成本假设，比较总福利与分配；HL 计算先写机会成本。", "State small-country, homogeneous-good and cost assumptions; compare welfare and distribution. For HL calculations, start with opportunity costs."],
 "4.2": ["从世界价推导数量、进口、财政与福利变化，区分关税收入、配额租和补贴成本。", "Derive quantities, imports, fiscal and welfare changes from the world price; distinguish tariff revenue, quota rents and subsidy costs."],
 "4.3": ["先陈述保护目标，再评价条件、时限、利益相关者、报复与替代政策。", "State protection objectives, then evaluate conditions, duration, stakeholders, retaliation and alternatives."],
 "4.4": ["准确区分一体化层次；比较贸易创造、转移、政策自主性与调整机制。", "Distinguish levels of integration; compare trade creation, diversion, policy autonomy and adjustment mechanisms."],
 "4.5": ["先写汇率报价与制度，再标明需求供给移动，区分价格、数量和时滞效应。", "State the quotation and regime first, label demand/supply shifts, and distinguish price, quantity and lag effects."],
 "4.6": ["声明金融账户符号和储备处理；区分贸易余额与经常账户、会计恒等式与经济因果。", "Declare the financial-account sign and reserve treatment; distinguish trade from current balances and accounting identities from economic causation."],
 "4.7": ["连接当代、代际公平与自然资本，说明政策协同、机会成本和可观察指标。", "Connect current and intergenerational equity with natural capital, explaining synergies, opportunity costs and observable indicators."],
 "4.8": ["说明指标维度、单位、年份及均值局限，用多种证据比较而非只报排名。", "State dimensions, units, years and average-value limits; compare using multiple indicators rather than rankings alone."],
 "4.9": ["解释障碍如何相互强化，识别主要约束，避免对国家或群体作决定论推断。", "Explain reinforcing barriers, identify binding constraints and avoid deterministic claims about countries or groups."],
 "4.10": ["把政策与具体约束匹配，评价执行、资金、时滞、公平与可持续性，给出有条件判断。", "Match policy to constraints; evaluate implementation, finance, lags, equity and sustainability, then give a conditional judgement."],
};
const prerequisites = Object.fromEntries(Object.keys(sections).map(s=>[s,["u1-14-opportunity-cost"]]));
writeStudyUnit({ unit: 4, topics, sections, guidance, prerequisites,
 special: { "comparative-advantage": "audit-comparative-ppc", "fixed-exchange-rate": "audit-fixed-rate", "free-trade-imports": "global-imports", "free-trade-exports": "global-exports", tariff: "global-tariff", quota: "global-quota", "production-subsidy": "global-subsidy", "floating-exchange-rate": "global-currency", "currency-demand-supply": "global-currency", "j-curve": "global-j-curve", "poverty-cycle": "global-poverty-cycle" },
 releaseCounts: { "4.1": 6, "4.2": 5, "4.3": 3, "4.4": 7, "4.5": 8, "4.6": 9, "4.7": 3, "4.8": 5, "4.9": 7, "4.10": 10 } });
