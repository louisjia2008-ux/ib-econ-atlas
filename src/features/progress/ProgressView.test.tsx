import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProgressRecord } from "../../types/progress";
import { getAllProgress } from "./db";
import { ProgressView } from "./ProgressView";

vi.mock("../../generated/content", async () => {
  const { makeKnowledgePoint } = await import("../../test/knowledgePoint");
  return {
    knowledgePoints: [makeKnowledgePoint("core-new", "core"), makeKnowledgePoint("core-learning", "core"), makeKnowledgePoint("hl-review", "hl"), makeKnowledgePoint("extension-mastered", "extension")],
  };
});
vi.mock("./db", () => ({ getAllProgress: vi.fn() }));
afterEach(cleanup);

describe("filtered progress", () => {
  it.each([
    ["sl", undefined, [1, 1, 0, 0], ["core-learning"]],
    ["hl", undefined, [1, 1, 1, 0], ["core-learning", "hl-review"]],
    ["all", undefined, [1, 1, 1, 1], ["core-learning", "hl-review", "extension-mastered"]],
    ["sl", ["hl-review", "extension-mastered"], [0, 0, 0, 0], []],
    ["hl", ["hl-review", "extension-mastered"], [0, 0, 1, 0], ["hl-review"]],
    ["all", ["hl-review", "extension-mastered"], [0, 0, 1, 1], ["hl-review", "extension-mastered"]],
  ] as const)("intersects %s with scope %s for every count and due item", async (level, scope, counts, dueIds) => {
    const records: ProgressRecord[] = [
      { knowledgePointId: "core-learning", state: "learning" },
      { knowledgePointId: "hl-review", state: "review" },
      { knowledgePointId: "extension-mastered", state: "mastered" },
      { knowledgePointId: "removed-point", state: "mastered" },
    ].map((record) => ({ ...record, state: record.state as ProgressRecord["state"], successfulReviews: 1, updatedAt: "2020-01-01T00:00:00Z", dueAt: "2020-01-01T00:00:00Z" }));
    vi.mocked(getAllProgress).mockResolvedValue(records);
    const { container } = render(<ProgressView locale="en" level={level} scopeIds={new Set(scope)} onOpen={vi.fn()} />);
    // Wait for the asynchronous snapshot even when the expected visible subset is empty.
    await vi.waitFor(() => expect(getAllProgress).toHaveResolvedWith(records));
    const cards = container.querySelectorAll(".stat-grid article");
    await vi.waitFor(() => expect([...cards].map((card) => Number(within(card as HTMLElement).getByRole("strong").textContent))).toEqual(counts));
    const panel = container.querySelector(".dashboard-panel") as HTMLElement;
    expect(within(panel).queryAllByRole("button").map((button) => button.textContent)).toEqual(dueIds);
    expect(within(panel).getByText(String(dueIds.length), { exact: true })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "removed-point" })).toBeNull();
  });

  it("updates both counts and due items when the global level changes", async () => {
    vi.mocked(getAllProgress).mockResolvedValue([{ knowledgePointId: "extension-mastered", state: "mastered", successfulReviews: 2, updatedAt: "2020-01-01", dueAt: "2020-01-01" }]);
    const { rerender, container } = render(<ProgressView locale="en" level="all" scopeIds={new Set()} onOpen={vi.fn()} />);
    await screen.findByRole("button", { name: "extension-mastered" });
    rerender(<ProgressView locale="en" level="sl" scopeIds={new Set()} onOpen={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "extension-mastered" })).toBeNull();
    expect([...container.querySelectorAll(".stat-grid strong")].map((value) => value.textContent)).toEqual(["2", "0", "0", "0"]);
  });
});
