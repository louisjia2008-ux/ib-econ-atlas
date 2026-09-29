import type { KnowledgePoint, Locale } from "../../types/content";

export interface DirectorySection {
  id: string;
  title: Record<Locale, string>;
  pointIds: string[];
}

export interface DirectoryGroup {
  id: string;
  title: Record<Locale, string>;
  sections: DirectorySection[];
}

const syllabusTitles: Record<string, Record<Locale, string>> = {
  "1.1": { "zh-CN": "经济学的本质", en: "The nature of economics" },
  "1.2": { "zh-CN": "基本经济问题与制度", en: "Basic questions and systems" },
  "1.3": { "zh-CN": "模型与 PPC", en: "Models and the PPC" },
  "1.4": { "zh-CN": "经济学方法", en: "Methods in economics" },
  "1.5": { "zh-CN": "经济思想史", en: "History of economic thought" },
};

export function buildSyllabusDirectory(points: KnowledgePoint[]): DirectoryGroup[] {
  const sections = Object.entries(syllabusTitles).map(([id, title]) => ({
    id,
    title,
    pointIds: points.filter((point) => point.meta.section === id).map((point) => point.meta.id),
  }));
  return [
    {
      id: "unit-1",
      title: { "zh-CN": "Unit 1 · 经济学导论", en: "Unit 1 · Introduction to economics" },
      sections,
    },
  ];
}

export function buildCoursebookDirectory(points: KnowledgePoint[]): DirectoryGroup[] {
  const chapters = new Map<string, KnowledgePoint[]>();
  for (const point of points) {
    for (const reference of point.meta.textbookRefs) {
      const existing = chapters.get(reference.chapter) ?? [];
      if (!existing.some((candidate) => candidate.meta.id === point.meta.id)) existing.push(point);
      chapters.set(reference.chapter, existing);
    }
  }

  return [
    {
      id: "coursebook-unit-1",
      title: { "zh-CN": "教材 Unit 1 · 经济学导论", en: "Coursebook Unit 1 · Introduction" },
      sections: [...chapters.entries()].map(([chapter, chapterPoints]) => ({
        id: `chapter-${chapter}`,
        title: { "zh-CN": `Chapter ${chapter} · 经济学基础`, en: `Chapter ${chapter} · Foundations` },
        pointIds: chapterPoints.map((point) => point.meta.id),
      })),
    },
  ];
}
