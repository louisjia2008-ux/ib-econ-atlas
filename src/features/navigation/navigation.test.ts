import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { buildCoursebookDirectory, buildSyllabusDirectory } from "./directory";
import { isGroupSelected, loadScope, saveScope, scopeStorageKey, toggleScopeGroup } from "./scope";

describe("directory mapping", () => {
  it("maps all four units into separate syllabus groups", () => {
    const ids = buildSyllabusDirectory(knowledgePoints).flatMap((group) => group.sections.flatMap((section) => section.pointIds));
    expect(new Set(ids).size).toBe(215);
    expect(buildSyllabusDirectory(knowledgePoints).map((group) => group.sections.flatMap((section) => section.pointIds).length)).toEqual([43, 60, 56, 56]);
    expect(buildSyllabusDirectory(knowledgePoints)[1]?.sections).toHaveLength(12);
    expect(buildSyllabusDirectory(knowledgePoints)[2]?.sections).toHaveLength(7);
  });

  it("maps all 215 points into the coursebook tree without cross-unit leakage", () => {
    const ids = buildCoursebookDirectory(knowledgePoints).flatMap((group) => group.sections.flatMap((section) => section.pointIds));
    expect(new Set(ids).size).toBe(215);
    const groups = buildCoursebookDirectory(knowledgePoints);
    expect(groups[1]?.sections).toHaveLength(6);
    expect(groups[0]?.sections.flatMap((section) => section.pointIds).every((id) => id.startsWith("u1-"))).toBe(true);
    expect(groups[1]?.sections.flatMap((section) => section.pointIds).every((id) => id.startsWith("u2-"))).toBe(true);
    expect(groups[2]?.sections).toHaveLength(6);
    expect(groups[3]?.sections).toHaveLength(7);
    expect(groups[3]?.sections.flatMap((section) => section.pointIds).every((id) => id.startsWith("u4-"))).toBe(true);
    expect(groups[2]?.sections.flatMap((section) => section.pointIds).every((id) => id.startsWith("u3-"))).toBe(true);
  });
});

describe("session-only scope", () => {
  it("toggles complete groups without disturbing other selections", () => {
    const initial = new Set(["outside"]);
    const selected = toggleScopeGroup(initial, ["a", "b"]);
    expect([...selected].sort()).toEqual(["a", "b", "outside"]);
    expect(isGroupSelected(selected, ["a", "b"])).toBe(true);
    expect([...toggleScopeGroup(selected, ["a", "b"])]).toEqual(["outside"]);
  });

  it("round-trips through session storage and clears an empty scope", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    };
    saveScope(new Set(["b", "a"]), storage);
    expect(memory.get(scopeStorageKey())).toBe('["a","b"]');
    expect([...loadScope(storage)]).toEqual(["a", "b"]);
    saveScope(new Set(), storage);
    expect(memory.has(scopeStorageKey())).toBe(false);
  });
});
