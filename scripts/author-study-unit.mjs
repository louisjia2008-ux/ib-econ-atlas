import { workings } from "./content-data/audit-workings.mjs";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { contentRoot, readYaml } from "./content-utils.mjs";

export function writeStudyUnit({ unit, topics, sections, guidance, diagramFor = {}, special = {}, prerequisites, releaseCounts }) {
const manifestPath = path.join(contentRoot, "manifest.yaml");
const manifest = readYaml(manifestPath);
const prefix = `u${unit}-`;
if (topics.length !== Object.values(releaseCounts).reduce((sum,count)=>sum+count,0)) throw new Error("Topic count disagrees with locked section counts.");
const retained = manifest.entries.filter((entry)=>!entry.id.startsWith(prefix));
const authoredEntries = [];
for (const [index, topic] of topics.entries()) {
  const [zhTitle, enTitle] = topic.title;
  const [, sectionLabel, chapter, bookSection, page] = sections[topic.section];
  const book = topic.book ?? [chapter, bookSection, page];
  const id = topic.id;
  const diagram = special[id.split("-").slice(2).join("-")] ?? diagramFor[topic.section];
  const flashId = `${id}-flash-1`, mcqId = `${id}-mcq-1`, shortId = `${id}-short-1`;
  const paired = (value) => ({ "zh-CN": value[0], en: value[1] });
  const entry = { id, section: topic.section, level: topic.level, title: paired(topic.title), pages: [book[2]] };
  authoredEntries.push(entry);
  const sameSection = topics.filter((candidate) => candidate.section === topic.section && candidate.id !== id);
  const meta = {
    id, slug: id.replace(/^u\d+-\d+-/, ""), section: topic.section, level: topic.level,
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
      ...(topic.sourceUrl ? { realWorldExample: { title: topic.title[lang], sourceUrl: topic.sourceUrl, observedAt: topic.observedAt, explanation: topic.example[lang] } } : {}),
      ...(topic.hlExample ? { hlExtension: topic.hlExample[lang] } : {}),
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
  const worked = topic.hlQuestion ? undefined : workings[id];
  const modelAnswer = topic.definition.map((value, lang) => `${value} ${topic.mechanism[lang]} ${topic.example[lang]}`);
  const practice = [
    { id: flashId, knowledgePointId: id, type: "flashcard",
      prompt: paired([`解释“${zhTitle}”，并说明一个关键条件。`, `Explain ${enTitle} and state one important condition.`]),
      answer: paired(topic.definition), explanation: paired(topic.trap) },
    { id: mcqId, knowledgePointId: id, type: "mcq", prompt: paired(topic.question),
      options, correctOptionId: String.fromCharCode(97 + correctIndex),
      explanation: paired(topic.mechanism.map((value, lang) => `${topic.correct[lang]}${lang === 0 ? "。" : "."} ${worked ?? value} ${topic.trap[lang]}`)) },
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
  if (topic.hlQuestion) {
    const advancedCorrect = (index + 1) % 4;
    const advancedWrong = [...topic.hlQuestion.wrong];
    const advancedOptions = [0, 1, 2, 3].map(i => ({ id: String.fromCharCode(97 + i), ...paired(i === advancedCorrect ? topic.hlQuestion.correct : advancedWrong.shift()) }));
    const advancedId = `${id}-mcq-hl-1`;
    practice.push({ id: advancedId, knowledgePointId: id, type: "mcq", level: "hl",
      prompt: paired(topic.hlQuestion.question), options: advancedOptions, correctOptionId: String.fromCharCode(97 + advancedCorrect),
      explanation: paired(topic.hlExample.map((value, lang) => `${topic.hlQuestion.correct[lang]}${lang === 0 ? "。" : "."} ${workings[id] ?? (id === "u3-24-cpi" ? "46 / 40 × 100 = 115" : value)}`)) });
    meta.quizIds.push(advancedId);
    fs.writeFileSync(path.join(contentDirectory, "meta.yaml"), YAML.stringify(meta));
  }
  fs.writeFileSync(path.join(contentRoot, "quizzes", `${id}.yaml`), YAML.stringify(practice));
}

manifest.entries = [...retained, ...authoredEntries].sort((a,b)=>a.id.localeCompare(b.id));
manifest.releaseCounts = { ...manifest.releaseCounts, ...releaseCounts };
fs.writeFileSync(manifestPath, YAML.stringify(manifest));
console.log(`Authored ${topics.length} Unit ${unit} points; preserved ${retained.length} other points.`);
}
