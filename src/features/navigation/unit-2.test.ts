import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { KnowledgeSearchIndex } from "../search/search";
import { scoreShortAnswer } from "../review/scoring";
import { createReviewQueue } from "../review/session";

const points = knowledgePoints.filter((point) => point.meta.id.startsWith("u2-"));
describe("Unit 2 content and cross-unit contracts", () => {
  it("provides 60 points with three bilingual practice modes and valid model answers", () => {
    expect(points).toHaveLength(60);
    expect(points.filter((point) => point.meta.level === "core")).toHaveLength(33);
    expect(points.filter((point) => point.meta.level === "hl")).toHaveLength(27);
    for (const point of points) {
      expect(point.practice.map((item) => item.type).sort()).toEqual(["flashcard", "mcq", "short-answer"]);
      const short = point.practice.find((item) => item.type === "short-answer");
      if (!short || short.type !== "short-answer") throw new Error("Missing short-answer item");
      for (const locale of ["zh-CN", "en"] as const) {
        expect(scoreShortAnswer(short, short.modelAnswer[locale], locale).coverage, point.meta.id).toBe(1);
        expect(scoreShortAnswer(short, "", locale).coverage).toBe(0);
      }
      const mcq = point.practice.find((item) => item.type === "mcq");
      if (!mcq || mcq.type !== "mcq") throw new Error("Missing MCQ");
      for (const locale of ["zh-CN", "en"] as const) expect(new Set(mcq.options.map((option) => option[locale])).size).toBe(4);
    }
  });
  it("finds Unit 2 across languages and respects HL exclusion and cross-unit scopes", () => {
    const index = new KnowledgeSearchIndex(knowledgePoints);
    const all = { level: "all" as const, scopeIds: new Set<string>() };
    expect(index.search("需求价格弹性 PED", "en", all)[0]?.point.meta.id).toBe("u2-19-ped");
    expect(index.search("adverse selection", "zh-CN", all)[0]?.point.meta.id).toBe("u2-44-adverse-selection");
    expect(index.search("", "en", { ...all, level: "sl" }).some((hit) => hit.point.meta.id === "u2-44-adverse-selection")).toBe(false);
    const scopeIds = new Set(["u1-04-scarcity", "u2-01-demand"]);
    expect(index.search("", "en", { ...all, scopeIds }).map((hit) => hit.point.meta.id).sort()).toEqual([...scopeIds].sort());
  });
  it("restricts all review modes to the selected Unit 2 scope", () => {
    const scopeIds = new Set(["u2-01-demand"]);
    for (const mode of ["flashcard", "mcq", "short-answer", "mixed"] as const) {
      const queue = createReviewQueue(knowledgePoints, [], { mode, count: 5, level: "all", scopeIds, useScope: true, status: "any", now: new Date("2026-10-15T00:00:00Z") });
      expect(queue.length).toBeGreaterThan(0);
      expect(queue.every((entry) => entry.point.meta.id === "u2-01-demand")).toBe(true);
    }
  });
});
