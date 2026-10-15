import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { KnowledgeSearchIndex } from "../search/search";
import { scoreShortAnswer } from "../review/scoring";
import { createReviewQueue } from "../review/session";

const points = knowledgePoints.filter((point) => point.meta.id.startsWith("u3-"));
describe("Unit 3 content and cross-unit contracts", () => {
  it("provides 56 points and three bilingual practice modes with valid model answers", () => {
    expect(points).toHaveLength(56);
    expect(points.filter((point) => point.meta.level === "core")).toHaveLength(51);
    expect(points.filter((point) => point.meta.level === "hl")).toHaveLength(5);
    for (const point of points) {
      expect(point.practice.map((item) => item.type).sort()).toEqual(["flashcard", "mcq", "short-answer"]);
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
  it("searches across languages, excludes HL and composes scopes from all three units", () => {
    const index = new KnowledgeSearchIndex(knowledgePoints);
    const all = { level: "all" as const, scopeIds: new Set<string>() };
    expect(index.search("凯恩斯乘数", "en", all)[0]?.point.meta.id).toBe("u3-49-multiplier");
    expect(index.search("automatic stabilisers", "zh-CN", all)[0]?.point.meta.id).toBe("u3-48-automatic-stabilisers");
    expect(index.search("", "en", { ...all, level: "sl" }).some((hit) => hit.point.meta.id === "u3-49-multiplier")).toBe(false);
    const scopeIds = new Set(["u1-04-scarcity", "u2-01-demand", "u3-02-gdp"]);
    expect(index.search("", "en", { ...all, scopeIds }).map((hit) => hit.point.meta.id).sort()).toEqual([...scopeIds].sort());
  });
  it("restricts every review mode to the selected macroeconomic point", () => {
    for (const mode of ["flashcard", "mcq", "short-answer", "mixed"] as const) {
      const queue = createReviewQueue(knowledgePoints, [], { mode, count: 5, level: "all", scopeIds: new Set(["u3-49-multiplier"]), useScope: true, status: "any", now: new Date("2026-10-15T00:00:00Z") });
      expect(queue.length).toBeGreaterThan(0);
      expect(queue.every((entry) => entry.point.meta.id === "u3-49-multiplier")).toBe(true);
    }
  });
});
