import type { CourseLevel, KnowledgePoint, LocalizedKnowledgePoint } from "../types/content";

export function makeKnowledgePoint(id: string, level: CourseLevel): KnowledgePoint {
  const content = (locale: LocalizedKnowledgePoint["locale"]): LocalizedKnowledgePoint => ({
    id, locale, title: id, takeaway: "Takeaway", definition: "Definition", explanation: "Explanation",
    causalChain: [], misconceptions: [], examApplication: [], summary: [],
  });
  const base = {
    knowledgePointId: id,
    prompt: { en: `Question for ${id}`, "zh-CN": `${id}的问题` },
    explanation: { en: "Explanation", "zh-CN": "解析" },
  };
  return {
    meta: {
      id, slug: id, section: "1.1", level, syllabusRefs: ["1.1"], textbookRefs: [], prerequisites: [],
      related: [], terms: [], synonyms: { en: [], "zh-CN": [] }, diagramIds: [],
      quizIds: [`${id}-flashcard`, `${id}-mcq`, `${id}-short`],
    },
    content: { en: content("en"), "zh-CN": content("zh-CN") },
    practice: [
      { ...base, id: `${id}-flashcard`, type: "flashcard", answer: { en: "Answer", "zh-CN": "答案" } },
      { ...base, id: `${id}-mcq`, type: "mcq", correctOptionId: "a", options: [{ id: "a", en: "Yes", "zh-CN": "是" }, { id: "b", en: "No", "zh-CN": "否" }] },
      {
        ...base, id: `${id}-short`, type: "short-answer", modelAnswer: { en: "Scarcity", "zh-CN": "稀缺性" },
        keywordGroups: [{ id: "scarcity", label: { en: "Scarcity", "zh-CN": "稀缺性" }, alternatives: { en: ["scarcity"], "zh-CN": ["稀缺性"] } }],
      },
    ],
  };
}
