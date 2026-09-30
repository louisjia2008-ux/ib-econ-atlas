import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { contentRoot, projectRoot, readYaml } from "./content-utils.mjs";

const manifest = readYaml(path.join(contentRoot, "manifest.yaml"));
const manifestById = new Map(manifest.entries.map((entry) => [entry.id, entry]));

const syllabusLabels = {
  "1.1": "1.1 What is economics?",
  "1.2": "1.2 How do economists approach the world?",
  "1.3": "1.3 Economic models and the PPC",
  "1.4": "1.4 The methods of economics",
  "1.5": "1.5 The evolution of economic thinking",
};

const distractors = {
  "zh-CN": [
    "它只描述个人偏好，与资源、制度或社会结果无关。",
    "它意味着同一种经济结果在任何条件下都会自动出现。",
    "它是一项只适用于高收入经济体的会计规则。",
  ],
  en: [
    "It concerns personal preference only and has no connection to resources, institutions, or social outcomes.",
    "It means the same economic outcome must arise automatically under every set of conditions.",
    "It is an accounting rule that applies only to high-income economies.",
  ],
};

function localizedFrontmatter(topic, locale) {
  const localized = topic[locale];
  return {
    title: localized.title,
    takeaway: localized.takeaway,
    definition: localized.definition,
    causalChain: localized.causalChain,
    realWorldExample: {
      title: localized.example.title,
      sourceUrl: topic.sourceUrl,
      observedAt: topic.observedAt ?? "2026-09-29",
      explanation: localized.example.explanation,
    },
    misconceptions: localized.misconceptions,
    examApplication: localized.examApplication,
    summary: localized.summary,
  };
}

function markdownDocument(topic, locale) {
  return `---\n${YAML.stringify(localizedFrontmatter(topic, locale))}---\n${topic[locale].explanation.trim()}\n`;
}

function buildPractice(topic) {
  const flashId = `${topic.id}-flash-1`;
  const mcqId = `${topic.id}-mcq-1`;
  const shortId = `${topic.id}-short-1`;
  const number = Number(topic.id.slice(3, 5));
  const correctIndex = Number.isFinite(number) ? number % 4 : 0;
  const optionIds = ["a", "b", "c", "d"];
  const options = optionIds.map((id, index) => {
    const isCorrect = index === correctIndex;
    const distractorIndex = index < correctIndex ? index : index - 1;
    return {
      id,
      "zh-CN": isCorrect ? topic["zh-CN"].takeaway : distractors["zh-CN"][distractorIndex],
      en: isCorrect ? topic.en.takeaway : distractors.en[distractorIndex],
    };
  });

  return [
    {
      id: flashId,
      knowledgePointId: topic.id,
      type: "flashcard",
      prompt: {
        "zh-CN": `不看笔记，用自己的话解释“${topic["zh-CN"].title}”。`,
        en: `Without notes, explain “${topic.en.title}” in your own words.`,
      },
      answer: {
        "zh-CN": topic["zh-CN"].definition,
        en: topic.en.definition,
      },
      explanation: {
        "zh-CN": topic["zh-CN"].takeaway,
        en: topic.en.takeaway,
      },
    },
    {
      id: mcqId,
      knowledgePointId: topic.id,
      type: "mcq",
      prompt: {
        "zh-CN": `下列哪一项最准确地概括“${topic["zh-CN"].title}”？`,
        en: `Which statement best captures “${topic.en.title}”?`,
      },
      options,
      correctOptionId: optionIds[correctIndex],
      explanation: {
        "zh-CN": topic["zh-CN"].definition,
        en: topic.en.definition,
      },
    },
    {
      id: shortId,
      knowledgePointId: topic.id,
      type: "short-answer",
      prompt: {
        "zh-CN": `简要解释“${topic["zh-CN"].title}”，并写出一条因果机制和一个重要含义。`,
        en: `Briefly explain “${topic.en.title}”, including one causal mechanism and one important implication.`,
      },
      modelAnswer: {
        "zh-CN": `${topic["zh-CN"].definition} ${topic["zh-CN"].causalChain.join("；")} ${topic["zh-CN"].summary[0]}`,
        en: `${topic.en.definition} ${topic.en.causalChain.join("; ")} ${topic.en.summary[0]}`,
      },
      keywordGroups: [
        {
          id: "concept",
          label: { "zh-CN": "核心概念", en: "Core concept" },
          alternatives: {
            "zh-CN": [topic["zh-CN"].title, ...topic["zh-CN"].synonyms],
            en: [topic.en.title, ...topic.en.synonyms],
          },
        },
        {
          id: "mechanism",
          label: { "zh-CN": "因果机制", en: "Causal mechanism" },
          alternatives: {
            "zh-CN": topic["zh-CN"].causalChain.slice(0, 2),
            en: topic.en.causalChain.slice(0, 2),
          },
        },
        {
          id: "implication",
          label: { "zh-CN": "重要含义", en: "Important implication" },
          alternatives: {
            "zh-CN": topic["zh-CN"].summary.slice(0, 2),
            en: topic.en.summary.slice(0, 2),
          },
        },
      ],
      explanation: {
        "zh-CN": "系统按核心概念、因果机制和重要含义三个关键词组计算覆盖率；你可以查看依据并手动修正最终判定。",
        en: "Coverage is calculated across the core concept, causal mechanism, and implication groups; you can inspect and override the final judgement.",
      },
    },
  ];
}

function validateTopic(topic) {
  const entry = manifestById.get(topic.id);
  if (!entry) throw new Error(`${topic.id} is not present in content/manifest.yaml.`);
  for (const locale of ["zh-CN", "en"]) {
    const localized = topic[locale];
    if (!localized) throw new Error(`${topic.id} is missing ${locale}.`);
    for (const field of ["title", "takeaway", "definition", "explanation"]) {
      if (!localized[field]?.trim()) throw new Error(`${topic.id}/${locale} is missing ${field}.`);
    }
    for (const field of ["causalChain", "misconceptions", "examApplication", "summary", "synonyms"]) {
      if (!Array.isArray(localized[field]) || localized[field].length === 0) {
        throw new Error(`${topic.id}/${locale} is missing ${field}.`);
      }
    }
    if (!localized.example?.title || !localized.example?.explanation) {
      throw new Error(`${topic.id}/${locale} is missing its sourced example.`);
    }
  }
  if (!topic.sourceUrl?.startsWith("https://")) throw new Error(`${topic.id} needs an HTTPS source URL.`);
  return entry;
}

export function writeTopics(topics) {
  for (const topic of topics) {
    const entry = validateTopic(topic);
    const knowledgeDir = path.join(contentRoot, "knowledge", topic.id);
    fs.mkdirSync(knowledgeDir, { recursive: true });

    const related = topic.related ?? [];
    const prerequisites = topic.prerequisites ?? [];
    const practice = buildPractice(topic);
    const meta = {
      id: topic.id,
      slug: topic.id.replace(/^u1-\d+-/, ""),
      section: entry.section,
      level: entry.level,
      syllabusRefs: topic.syllabusRefs ?? [syllabusLabels[entry.section]],
      textbookRefs: [
        {
          chapter: topic.chapter ?? "1",
          section: entry.section,
          pages: entry.pages,
        },
      ],
      prerequisites,
      related,
      terms: [entry.title.en, entry.title["zh-CN"], ...(topic.terms ?? [])],
      synonyms: {
        "zh-CN": topic["zh-CN"].synonyms,
        en: topic.en.synonyms,
      },
      diagramIds: topic.diagramIds ?? [],
      quizIds: practice.map((item) => item.id),
    };

    fs.writeFileSync(path.join(knowledgeDir, "meta.yaml"), YAML.stringify(meta), "utf8");
    fs.writeFileSync(path.join(knowledgeDir, "zh.md"), markdownDocument(topic, "zh-CN"), "utf8");
    fs.writeFileSync(path.join(knowledgeDir, "en.md"), markdownDocument(topic, "en"), "utf8");
    fs.writeFileSync(path.join(contentRoot, "quizzes", `${topic.id}.yaml`), YAML.stringify(practice), "utf8");
  }

  console.log(`Authored ${topics.length} bilingual knowledge point(s) in ${path.relative(projectRoot, contentRoot)}.`);
}
