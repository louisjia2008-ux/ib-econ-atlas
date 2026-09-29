import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js";
import type { CourseLevel, KnowledgePoint, Locale } from "../../types/content";

export type LevelFilter = "all" | "sl" | "hl";

export interface SearchFilters {
  level: LevelFilter;
  scopeIds: ReadonlySet<string>;
}

export interface SearchHit {
  point: KnowledgePoint;
  score: number;
  snippet: string;
  matchedFields: string[];
}

interface SearchDocument {
  id: string;
  point: KnowledgePoint;
  section: string;
  syllabusRefs: string;
  titleZh: string;
  titleEn: string;
  terms: string;
  synonymsZh: string;
  synonymsEn: string;
  takeawayZh: string;
  takeawayEn: string;
  summaryZh: string;
  summaryEn: string;
  bodyZh: string;
  bodyEn: string;
  normalized: string;
}

const englishSuffixes = /(?:ing|ed|es|s)$/;

export function normalizeSearchText(value: string): string {
  const basic = value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{Letter}\p{Number}\p{Script=Han}]+/gu, " ")
    .trim();
  const stemmed = basic
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (token.length > 4 ? token.replace(englishSuffixes, "") : token));
  return [...new Set([...basic.split(/\s+/), ...stemmed])].join(" ");
}

export function levelMatches(level: CourseLevel, filter: LevelFilter): boolean {
  if (filter === "all") return true;
  if (filter === "sl") return level === "core";
  return level === "core" || level === "hl";
}

function makeDocument(point: KnowledgePoint): SearchDocument {
  const zh = point.content["zh-CN"];
  const en = point.content.en;
  const searchable = [
    zh.title,
    en.title,
    ...point.meta.terms,
    ...point.meta.synonyms["zh-CN"],
    ...point.meta.synonyms.en,
    ...point.meta.syllabusRefs,
    point.meta.section,
    zh.takeaway,
    en.takeaway,
    ...zh.summary,
    ...en.summary,
  ].join(" ");
  return {
    id: point.meta.id,
    point,
    section: point.meta.section,
    syllabusRefs: point.meta.syllabusRefs.join(" "),
    titleZh: zh.title,
    titleEn: en.title,
    terms: point.meta.terms.join(" "),
    synonymsZh: point.meta.synonyms["zh-CN"].join(" "),
    synonymsEn: point.meta.synonyms.en.join(" "),
    takeawayZh: zh.takeaway,
    takeawayEn: en.takeaway,
    summaryZh: zh.summary.join(" "),
    summaryEn: en.summary.join(" "),
    bodyZh: `${zh.definition} ${zh.explanation}`,
    bodyEn: `${en.definition} ${en.explanation}`,
    normalized: normalizeSearchText(searchable),
  };
}

const fuseOptions: IFuseOptions<SearchDocument> = {
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  minMatchCharLength: 1,
  threshold: 0.38,
  keys: [
    { name: "titleZh", weight: 1 },
    { name: "titleEn", weight: 1 },
    { name: "terms", weight: 0.96 },
    { name: "synonymsZh", weight: 0.92 },
    { name: "synonymsEn", weight: 0.92 },
    { name: "section", weight: 0.76 },
    { name: "syllabusRefs", weight: 0.74 },
    { name: "normalized", weight: 0.72 },
    { name: "takeawayZh", weight: 0.58 },
    { name: "takeawayEn", weight: 0.58 },
    { name: "summaryZh", weight: 0.48 },
    { name: "summaryEn", weight: 0.48 },
    { name: "bodyZh", weight: 0.22 },
    { name: "bodyEn", weight: 0.22 },
  ],
};

function snippetFor(point: KnowledgePoint, locale: Locale, query: string): string {
  const content = point.content[locale];
  const candidates = [content.takeaway, content.definition, ...content.summary];
  const normalizedQuery = normalizeSearchText(query);
  const match = candidates.find((candidate) => normalizeSearchText(candidate).includes(normalizedQuery));
  const snippet = match ?? content.takeaway;
  return snippet.length > 170 ? `${snippet.slice(0, 167)}…` : snippet;
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] ?? 0;
      const deletion = previous[rightIndex] ?? 0;
      const insertion = current[rightIndex - 1] ?? 0;
      current[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? substitution
        : 1 + Math.min(substitution, deletion, insertion);
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length] ?? Math.max(left.length, right.length);
}

function directScore(document: SearchDocument, query: string, normalizedQuery: string): number {
  const titleZh = normalizeSearchText(document.titleZh);
  const titleEn = normalizeSearchText(document.titleEn);
  if (titleZh === normalizedQuery || titleEn === normalizedQuery) return 1;
  if (titleZh.includes(normalizedQuery) || titleEn.includes(normalizedQuery)) return 0.97;
  if (document.section === query || document.syllabusRefs.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return 0.94;
  const primaryTermText = normalizeSearchText(`${document.terms} ${document.synonymsZh} ${document.synonymsEn}`);
  if (primaryTermText.includes(normalizedQuery)) return 0.92;
  const oneWordQuery = !normalizedQuery.includes(" ");
  if (oneWordQuery && Math.min(editDistance(normalizedQuery, titleZh), editDistance(normalizedQuery, titleEn)) <= 2) return 0.9;
  return 0;
}

export class KnowledgeSearchIndex {
  private readonly documents: SearchDocument[];
  private readonly fuse: Fuse<SearchDocument>;

  constructor(points: KnowledgePoint[]) {
    this.documents = points.map(makeDocument);
    this.fuse = new Fuse(this.documents, fuseOptions);
  }

  search(query: string, locale: Locale, filters: SearchFilters): SearchHit[] {
    const trimmed = query.trim();
    const normalizedQuery = normalizeSearchText(trimmed);
    const ranked = new Map<string, { item: SearchDocument; score: number; matches?: FuseResult<SearchDocument>["matches"] }>();

    if (!trimmed) {
      for (const item of this.documents) ranked.set(item.id, { item, score: 0.5 });
    } else {
      for (const item of this.documents) {
        const score = directScore(item, trimmed, normalizedQuery);
        if (score > 0) ranked.set(item.id, { item, score });
      }
      for (const result of this.fuse.search(trimmed)) {
        const fuseScore = 1 - (result.score ?? 0.5);
        const existing = ranked.get(result.item.id);
        if (!existing || fuseScore > existing.score) {
          ranked.set(result.item.id, { item: result.item, score: fuseScore, matches: result.matches });
        } else if (result.matches) {
          existing.matches = result.matches;
        }
      }
    }

    const raw = [...ranked.values()].sort((left, right) => right.score - left.score);

    return raw
      .filter(({ item }) => levelMatches(item.point.meta.level, filters.level))
      .filter(({ item }) => filters.scopeIds.size === 0 || filters.scopeIds.has(item.id))
      .map((result) => ({
        point: result.item.point,
        score: result.score,
        snippet: snippetFor(result.item.point, locale, trimmed),
        matchedFields: [...new Set((result.matches ?? []).map((match) => String(match.key ?? "content")))],
      }));
  }
}
