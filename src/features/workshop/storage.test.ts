import { afterEach, expect, it } from "vitest";
import { clearWorkshopDrafts, workshopStorageKey } from "./storage";
afterEach(() => localStorage.clear());
it("clears only workshop drafts, leaving other browser storage alone", () => {
  localStorage.setItem(workshopStorageKey("u4-07-tariff"), "draft");
  localStorage.setItem(workshopStorageKey("another-point"), "draft");
  localStorage.setItem("unrelated-preference", "keep");
  expect(clearWorkshopDrafts()).toBe(true);
  expect(localStorage.getItem(workshopStorageKey("u4-07-tariff"))).toBeNull();
  expect(localStorage.getItem(workshopStorageKey("another-point"))).toBeNull();
  expect(localStorage.getItem("unrelated-preference")).toBe("keep");
});
