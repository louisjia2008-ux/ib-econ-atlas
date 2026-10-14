import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { topics, sections } from "./content-data/unit-2.mjs";
import { contentRoot, readYaml } from "./content-utils.mjs";

const manifestPath = path.join(contentRoot, "manifest.yaml");
const manifest = readYaml(manifestPath);
if (topics.length !== 60) throw new Error(`Expected 60 Unit 2 topics, found ${topics.length}`);
const unit1 = manifest.entries.filter((entry) => entry.id.startsWith("u1-"));
if (unit1.length !== 43) throw new Error("Preserve the 43-point Unit 1 manifest.");

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
const unit2entries = [];
for (const [index, topic] of topics.entries()) {
  const [zhTitle, enTitle] = topic.title;
  const [, sectionLabel, chapter, bookSection, page] = sections[topic.section];
  const book = topic.book ?? [chapter, bookSection, page];
  const id = topic.id;
  const diagram = special[id.split("-").slice(2).join("-")] ?? diagramFor[topic.section];
  const flashId = `${id}-flash-1`, mcqId = `${id}-mcq-1`, shortId = `${id}-short-1`;
  const paired = (value) => ({ "zh-CN": value[0], en: value[1] });
  const entry = { id, section: topic.section, level: topic.level, title: paired(topic.title), pages: [book[2]] };
  unit2entries.push(entry);
  const sameSection = topics.filter((candidate) => candidate.section === topic.section && candidate.id !== id);
  const meta = {
    id, slug: id.replace(/^u2-\d+-/, ""), section: topic.section, level: topic.level,
    syllabusRefs: [`${topic.section} ${sectionLabel}`],
    textbookRefs: [{ chapter: book[0], section: book[1], pages: [book[2]] }],
    prerequisites: prerequisites[topic.section],
    related: sameSection.slice(0, 3).map((candidate) => candidate.id),
    terms: [zhTitle, enTitle, ...topic.keywords.flatMap((value) => value.split("|"))],
    synonyms: { "zh-CN": topic.keywords.map((value) => value.split("|")[0]), en: topic.keywords.map((value) => value.split("|")[1]) },
    diagramIds: diagram ? [diagram] : [], quizIds: [flashId, mcqId, shortId],
  };
  const steps = topic.mechanism.map((value) => value.split(/[；;]/).map((step) => step.trim()));
  const contentDirectory = path.join(contentRoot, "knowledge", id);
  fs.mkdirSync(contentDirectory, { recursive: true });
  fs.writeFileSync(path.join(contentDirectory, "meta.yaml"), YAML.stringify(meta));
  for (const [lang, file] of [[0, "zh.md"], [1, "en.md"]]) {
    const frontmatter = {
      title: topic.title[lang], takeaway: topic.definition[lang], definition: topic.definition[lang],
      causalChain: steps[lang], misconceptions: [topic.trap[lang]],
      examApplication: [guidance[topic.section][lang]],
      summary: [topic.definition[lang], topic.trap[lang]],
    };
    const heading = lang === 0 ? "原创情境与推导" : "Original scenario and reasoning";
    const body = `${topic.mechanism[lang].replace(/[；;]/g, lang === 0 ? "。" : ". ")}${lang === 0 ? "。" : "."}\n\n### ${heading}\n\n${topic.example[lang]}\n\n${topic.trap[lang]}\n\n${guidance[topic.section][lang]}`;
    fs.writeFileSync(path.join(contentDirectory, file), `---\n${YAML.stringify(frontmatter)}---\n${body}\n`);
  }
  const correctIndex = index % 4;
  const distractors = [...topic.wrong];
  const options = [0, 1, 2, 3].map((optionIndex) => ({
    id: String.fromCharCode(97 + optionIndex),
    ...paired(optionIndex === correctIndex ? topic.correct : distractors.shift()),
  }));
  const modelAnswer = topic.definition.map((value, lang) => `${value} ${topic.mechanism[lang]} ${topic.example[lang]}`);
  const practice = [
    { id: flashId, knowledgePointId: id, type: "flashcard",
      prompt: paired([`解释“${zhTitle}”，并说明一个关键条件。`, `Explain ${enTitle} and state one important condition.`]),
      answer: paired(topic.definition), explanation: paired(topic.trap) },
    { id: mcqId, knowledgePointId: id, type: "mcq", prompt: paired(topic.question),
      options, correctOptionId: String.fromCharCode(97 + correctIndex),
      explanation: paired(topic.example.map((value, lang) => `${topic.correct[lang]}${lang === 0 ? "。" : "."} ${value} ${topic.trap[lang]}`)) },
    { id: shortId, knowledgePointId: id, type: "short-answer",
      prompt: paired([`解释${zhTitle}的机制，并用一个自己设计的情境说明其含义。`, `Explain the mechanism of ${enTitle} and apply it to an example of your own.`]),
      modelAnswer: paired(modelAnswer),
      keywordGroups: topic.keywords.map((value, keyIndex) => {
        const [zh, en] = value.split("|");
        return { id: `mechanism-${keyIndex + 1}`, label: { "zh-CN": zh, en }, alternatives: {
          "zh-CN": [zh, steps[0][Math.min(keyIndex, steps[0].length - 1)]],
          en: [en, steps[1][Math.min(keyIndex, steps[1].length - 1)]],
        } };
      }),
      explanation: paired(["关键词覆盖是辅助提示，不是 IB 官方评分。检查条件、因果关系和情境应用后，可手动修正判定。", "Keyword coverage is a study aid, not official IB marking. Check assumptions, causation and application, then override the judgement if needed."]) },
  ];
  fs.writeFileSync(path.join(contentRoot, "quizzes", `${id}.yaml`), YAML.stringify(practice));
}
manifest.entries = [...unit1, ...unit2entries];
manifest.releaseCounts = { "1.1": 15, "1.2": 8, "1.3": 6, "1.4": 6, "1.5": 8,
  "2.1": 5, "2.2": 5, "2.3": 5, "2.4": 3, "2.5": 5, "2.6": 3,
  "2.7": 6, "2.8": 8, "2.9": 3, "2.10": 3, "2.11": 11, "2.12": 3 };
fs.writeFileSync(manifestPath, YAML.stringify(manifest));
console.log(`Authored ${topics.length} Unit 2 points; Unit 1 remains ${unit1.length}.`);
