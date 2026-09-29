import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { KnowledgeSearchIndex, levelMatches, normalizeSearchText } from "./search";

const index = new KnowledgeSearchIndex(knowledgePoints);
const filters = { level: "all" as const, scopeIds: new Set<string>() };

describe("KnowledgeSearchIndex", () => {
  it("finds a point from either interface language", () => {
    expect(index.search("机会成本", "en", filters)[0]?.point.meta.id).toBe("u1-14-opportunity-cost");
    expect(index.search("opportunity cost", "zh-CN", filters)[0]?.point.meta.id).toBe("u1-14-opportunity-cost");
  });

  it("tolerates an English spelling error", () => {
    expect(index.search("scarcty", "en", filters)[0]?.point.meta.id).toBe("u1-04-scarcity");
  });

  it("recalls a syllabus section code", () => {
    const hits = index.search("1.3", "en", filters);
    expect(hits.some((hit) => hit.point.meta.id === "u1-25-ppc-construction")).toBe(true);
  });

  it("applies level and temporary-scope filters together", () => {
    const scopeIds = new Set(["u1-04-scarcity", "u1-36-adam-smith"]);
    const hits = index.search("", "en", { level: "sl", scopeIds });
    expect(hits.map((hit) => hit.point.meta.id)).toEqual(["u1-04-scarcity"]);
  });
});

describe("search normalization and levels", () => {
  it("normalizes punctuation, case and simple English forms", () => {
    expect(normalizeSearchText("MARKETS, Marketed!")).toContain("market");
  });

  it("does not leak extension material into SL or HL", () => {
    expect(levelMatches("extension", "sl")).toBe(false);
    expect(levelMatches("extension", "hl")).toBe(false);
    expect(levelMatches("extension", "all")).toBe(true);
  });
});
