import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { KnowledgeSearchIndex } from "../search/search";
import { scoreShortAnswer } from "../review/scoring";
import { createReviewQueue } from "../review/session";

const points = knowledgePoints.filter((point) => point.meta.id.startsWith("u4-"));
describe("Unit 4 content and cross-unit contracts", () => {
  it("provides 63 points and three bilingual practice modes with valid model answers", () => {
    expect(points).toHaveLength(63);
    expect(points.filter((point) => point.meta.level === "core")).toHaveLength(49);
    expect(points.filter((point) => point.meta.level === "hl")).toHaveLength(13);
    for (const point of points) {
      expect([...new Set(point.practice.map((item) => item.type))].sort()).toEqual(["flashcard", "mcq", "short-answer"]);
      const short = point.practice.find((item) => item.type === "short-answer");
      if (!short || short.type !== "short-answer") throw new Error("Missing short answer");
      const mcq = point.practice.find((item) => item.type === "mcq");
      if (!mcq || mcq.type !== "mcq") throw new Error("Missing MCQ");
      for (const locale of ["zh-CN", "en"] as const) {
        expect(scoreShortAnswer(short, short.modelAnswer[locale], locale).coverage, point.meta.id).toBe(1);
        expect(scoreShortAnswer(short, "", locale).coverage).toBe(0);
        expect(new Set(mcq.options.map((option) => option[locale])).size).toBe(4);
      }
    }
  });
  it("searches across languages, excludes HL and composes scopes from all four units", () => {
    const index = new KnowledgeSearchIndex(knowledgePoints);
    const all = { level: "all" as const, scopeIds: new Set<string>() };
    expect(index.search("比较优势", "en", all)[0]?.point.meta.id).toBe("u4-05-comparative-advantage");
    expect(index.search("J-curve", "zh-CN", all)[0]?.point.meta.id).toBe("u4-33-j-curve");
    expect(index.search("", "en", { ...all, level: "sl" }).some((hit) => hit.point.meta.id === "u4-05-comparative-advantage")).toBe(false);
    const scopeIds = new Set(["u1-04-scarcity", "u2-01-demand", "u3-02-gdp", "u4-07-tariff"]);
    expect(index.search("", "en", { ...all, scopeIds }).map((hit) => hit.point.meta.id).sort()).toEqual([...scopeIds].sort());
  });
  it("restricts every review mode to the selected global-economy point", () => {
    for (const mode of ["flashcard", "mcq", "short-answer", "mixed"] as const) {
      const queue = createReviewQueue(knowledgePoints, [], { mode, count: 5, level: "all", scopeIds: new Set(["u4-05-comparative-advantage"]), useScope: true, status: "any", now: new Date("2026-10-15T00:00:00Z") });
      expect(queue.length).toBeGreaterThan(0);
      expect(queue.every((entry) => entry.point.meta.id === "u4-05-comparative-advantage")).toBe(true);
    }
  });
});
