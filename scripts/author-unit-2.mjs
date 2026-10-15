import { topics, sections } from "./content-data/unit-2.mjs";
import { writeStudyUnit } from "./author-study-unit.mjs";

const guidance = {
  "2.1": ["画图区分沿曲线移动与移动曲线，并明确其他条件。", "Distinguish movements along demand from shifts and state the ceteris paribus assumptions."],
  "2.2": ["写清商品自身价格、成本与时间的不同作用。", "Separate own price, costs and time when explaining supply."],
  "2.3": ["先指出变化因素，再比较新旧价格、数量与利益相关者。", "Identify the changed determinant before comparing prices, quantities and stakeholders."],
  "2.4": ["用具体决策说明模型假设与行为证据的差异。", "Use a concrete decision to explain the gap between assumptions and observed behaviour."],
  "2.5": ["列公式、代入同一基数的百分比、解释符号与分类。", "State the formula, use consistent percentage bases and interpret sign and classification."],
  "2.6": ["结合闲置产能与调整时间解释供给反应。", "Use spare capacity and adjustment time to explain supply responsiveness."],
  "2.7": ["在图中标出价格、数量和政策楔子；评价弹性、财政与分配。", "Label prices, quantities and the policy wedge; evaluate elasticities, public finance and distribution."],
  "2.8": ["明确生产或消费、正或负，标出私人均衡和社会最优。", "Identify production/consumption and positive/negative effects, and label private equilibrium and the social optimum."],
  "2.9": ["用竞争性和排他性分类，解释融资机制而不只说政府提供。", "Classify rivalry and excludability and explain financing rather than merely stating government provision."],
  "2.10": ["写清信息差发生在交易前还是交易后，评价解决方式的可信度。", "State whether the information problem occurs before or after exchange and evaluate credibility of remedies."],
  "2.11": ["明确企业图与市场图、MR=MC 数量及需求曲线上的价格。", "Separate firm and market diagrams, identify MR=MC output and read price from demand."],
  "2.12": ["明确公平标准，比较效率、机会、激励和政策针对性。", "State the equity criterion and compare efficiency, opportunity, incentives and targeting."],
};
const diagramFor = {
  "2.1": "demand-supply", "2.2": "demand-supply", "2.3": "demand-supply",
  "2.7": "tax-wedge", "2.8": "negative-production", "2.11": "monopoly",
};
const special = {
  "price-ceiling": "price-ceiling", "price-floor": "price-floor",
  "subsidy": "subsidy-wedge", "positive-production": "positive-production",
  "negative-consumption": "negative-consumption", "positive-consumption": "positive-consumption",
  "public-goods": "goods-matrix", "common-resources": "goods-matrix",
  "perfect-competition": "perfect-competition",
};
const prerequisites = {
  "2.1": ["u1-04-scarcity", "u1-14-opportunity-cost"],
  "2.2": ["u1-13-factors-of-production"],
  "2.3": ["u2-01-demand", "u2-06-supply"],
  "2.4": ["u1-24-economic-models"],
  "2.5": ["u2-01-demand"],
  "2.6": ["u2-06-supply"],
  "2.7": ["u2-11-equilibrium", "u2-19-ped", "u2-24-pes"],
  "2.8": ["u2-15-surplus-efficiency"],
  "2.9": ["u2-33-market-failure"],
  "2.10": ["u2-33-market-failure"],
  "2.11": ["u2-15-surplus-efficiency", "u2-10-costs-and-supply"],
  "2.12": ["u1-35-equality-equity"],
};

writeStudyUnit({ unit: 2, topics, sections, guidance, diagramFor, special, prerequisites, releaseCounts: {
 "2.1":5, "2.2":5, "2.3":5, "2.4":3, "2.5":5, "2.6":3, "2.7":6, "2.8":8, "2.9":3, "2.10":3, "2.11":11, "2.12":3
} });
