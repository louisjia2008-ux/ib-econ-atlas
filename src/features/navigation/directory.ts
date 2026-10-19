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

export const syllabusTitles: Record<string, Record<Locale, string>> = {
  "1.1": { "zh-CN": "什么是经济学？", en: "What is economics?" },
  "1.2": { "zh-CN": "经济学家如何认识世界？", en: "How do economists approach the world?" },
  "2.1": { "zh-CN": "需求", en: "Demand" },
  "2.2": { "zh-CN": "供给", en: "Supply" },
  "2.3": { "zh-CN": "竞争市场均衡", en: "Competitive market equilibrium" },
  "2.4": { "zh-CN": "最大化行为的局限", en: "Critique of maximizing behaviour" },
  "2.5": { "zh-CN": "需求弹性", en: "Elasticity of demand" },
  "2.6": { "zh-CN": "供给弹性", en: "Elasticity of supply" },
  "2.7": { "zh-CN": "政府干预", en: "Government intervention" },
  "2.8": { "zh-CN": "外部性与共同资源", en: "Externalities and common resources" },
  "2.9": { "zh-CN": "公共物品", en: "Public goods" },
  "2.10": { "zh-CN": "信息不对称", en: "Asymmetric information" },
  "2.11": { "zh-CN": "市场势力", en: "Market power" },
  "2.12": { "zh-CN": "市场与公平", en: "Markets and equity" },
  "3.1": { "zh-CN": "经济活动的衡量与波动", en: "Measuring economic activity and its variations" },
  "3.2": { "zh-CN": "总需求与总供给", en: "Aggregate demand and aggregate supply" },
  "3.3": { "zh-CN": "宏观经济目标", en: "Macroeconomic objectives" },
  "3.4": { "zh-CN": "不平等与贫困", en: "Economics of inequality and poverty" },
  "3.5": { "zh-CN": "货币政策", en: "Monetary policy" },
  "3.6": { "zh-CN": "财政政策", en: "Fiscal policy" },
  "3.7": { "zh-CN": "供给侧政策", en: "Supply-side policies" },
  "4.1": { "zh-CN": "国际贸易的益处", en: "Benefits of international trade" },
  "4.2": { "zh-CN": "贸易保护的类型", en: "Types of trade protection" },
  "4.3": { "zh-CN": "贸易保护的论据与评价", en: "Arguments for and against trade protection" },
  "4.4": { "zh-CN": "经济一体化", en: "Economic integration" },
  "4.5": { "zh-CN": "汇率", en: "Exchange rates" },
  "4.6": { "zh-CN": "国际收支", en: "Balance of payments" },
  "4.7": { "zh-CN": "可持续发展", en: "Sustainable development" },
  "4.8": { "zh-CN": "发展水平的衡量", en: "Measuring development" },
  "4.9": { "zh-CN": "增长与发展的障碍", en: "Barriers to economic growth and development" },
  "4.10": { "zh-CN": "增长与发展战略", en: "Economic growth and development strategies" },
};

const unitTitles: Record<string, Record<Locale, string>> = {
  "1": { "zh-CN": "Unit 1 · 经济学导论", en: "Unit 1 · Introduction to economics" },
  "2": { "zh-CN": "Unit 2 · 微观经济学", en: "Unit 2 · Microeconomics" },
  "3": { "zh-CN": "Unit 3 · 宏观经济学", en: "Unit 3 · Macroeconomics" },
  "4": { "zh-CN": "Unit 4 · 全球经济", en: "Unit 4 · The global economy" },
};
const chapterTitles: Record<string, Record<Locale, string>> = {
  "1": { "zh-CN": "经济学基础", en: "Foundations" },
  "2": { "zh-CN": "竞争市场", en: "Competitive markets" },
  "3": { "zh-CN": "弹性", en: "Elasticities" },
  "4": { "zh-CN": "政府干预", en: "Government intervention" },
  "5": { "zh-CN": "共同资源与负外部性", en: "Common resources and negative externalities" },
  "6": { "zh-CN": "正外部性、公共物品与信息", en: "Positive externalities, public goods and information" },
  "7": { "zh-CN": "市场势力", en: "Market power" },
  "8": { "zh-CN": "经济活动的衡量", en: "Measuring economic activity" },
  "9": { "zh-CN": "总需求与总供给", en: "Aggregate demand and aggregate supply" },
  "10": { "zh-CN": "失业与通胀", en: "Unemployment and inflation" },
  "11": { "zh-CN": "增长、债务与目标冲突", en: "Growth, debt and conflicting objectives" },
  "12": { "zh-CN": "不平等与贫困", en: "Inequality and poverty" },
  "13": { "zh-CN": "宏观经济政策", en: "Macroeconomic policies" },
  "14": { "zh-CN": "国际贸易 I", en: "International trade I" },
  "15": { "zh-CN": "国际贸易 II", en: "International trade II" },
  "16": { "zh-CN": "汇率与国际收支", en: "Exchange rates and balance of payments" },
  "17": { "zh-CN": "汇率与国际收支深入", en: "Further exchange rates and balance of payments" },
  "18": { "zh-CN": "理解经济发展", en: "Understanding development" },
  "19": { "zh-CN": "增长与发展障碍", en: "Barriers to growth and development" },
  "20": { "zh-CN": "增长与发展战略", en: "Growth and development strategies" },
};

export function buildSyllabusDirectory(points: KnowledgePoint[]): DirectoryGroup[] {
  const sections = Object.entries(syllabusTitles).map(([id, title]) => ({
    id,
    title,
    pointIds: points.filter((point) => point.meta.section === id).map((point) => point.meta.id),
  }));
  return Object.entries(unitTitles).map(([unit, title]) => ({
    id: `unit-${unit}`, title,
    sections: sections.filter((section) => section.id.startsWith(`${unit}.`) && section.pointIds.length > 0),
  })).filter((group) => group.sections.length > 0);
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

  return Object.entries(unitTitles).map(([unit, title]) => ({
      id: `coursebook-unit-${unit}`, title,
      sections: [...chapters.entries()].filter(([, chapterPoints]) => chapterPoints.some((point) => point.meta.section.startsWith(`${unit}.`))).map(([chapter, chapterPoints]) => ({
        id: `chapter-${chapter}`,
        title: { "zh-CN": `Chapter ${chapter} · ${chapterTitles[chapter]?.["zh-CN"] ?? chapter}`, en: `Chapter ${chapter} · ${chapterTitles[chapter]?.en ?? chapter}` },
        pointIds: chapterPoints.map((point) => point.meta.id),
      })),
    })).filter((group) => group.sections.length > 0);
}
