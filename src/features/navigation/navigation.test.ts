import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import { buildCoursebookDirectory, buildSyllabusDirectory } from "./directory";
import { isGroupSelected, loadScope, saveScope, scopeStorageKey, toggleScopeGroup } from "./scope";

describe("directory mapping", () => {
  it("maps all 43 points into the syllabus tree", () => {
    const ids = buildSyllabusDirectory(knowledgePoints).flatMap((group) => group.sections.flatMap((section) => section.pointIds));
    expect(new Set(ids).size).toBe(43);
  });

  it("maps all 43 points into the coursebook tree", () => {
    const ids = buildCoursebookDirectory(knowledgePoints).flatMap((group) => group.sections.flatMap((section) => section.pointIds));
    expect(new Set(ids).size).toBe(43);
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
