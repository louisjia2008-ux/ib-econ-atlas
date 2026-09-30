import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressRecord } from "../../types/progress";
import { getAllProgress, getProgress, saveReviewResult } from "../progress/db";
import { ReviewView } from "./ReviewView";

vi.mock("../../generated/content", async () => {
  const { makeKnowledgePoint } = await import("../../test/knowledgePoint");
  return { knowledgePoints: [makeKnowledgePoint("core-a", "core"), makeKnowledgePoint("core-b", "core"), makeKnowledgePoint("extension", "extension")] };
});
vi.mock("../progress/db", () => ({ getAllProgress: vi.fn(), getProgress: vi.fn(), saveReviewResult: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise; });
  return { promise, resolve, reject };
}

async function startReview(mode = "Flashcards", scopeIds = new Set<string>()) {
  const view = render(<ReviewView locale="en" level="sl" scopeIds={scopeIds} />);
  fireEvent.click(screen.getByRole("button", { name: mode }));
  fireEvent.click(screen.getByRole("button", { name: "Build review session" }));
  await screen.findByRole("heading", { name: /Question for core/ });
  return view;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getAllProgress).mockResolvedValue([]);
  vi.mocked(getProgress).mockResolvedValue(undefined);
  vi.mocked(saveReviewResult).mockResolvedValue();
});
afterEach(cleanup);

describe("review persistence", () => {
  it("accepts only one rapid rating and advances exactly once after a delayed read and write", async () => {
    const read = deferred<ProgressRecord | undefined>();
    const write = deferred<void>();
    vi.mocked(getProgress).mockReturnValueOnce(read.promise);
    vi.mocked(saveReviewResult).mockReturnValueOnce(write.promise);
    await startReview();
    fireEvent.click(screen.getByRole("button", { name: "Show answer" }));
    const okay = screen.getByRole<HTMLButtonElement>("button", { name: "Okay" });
    const forgot = screen.getByRole<HTMLButtonElement>("button", { name: "Forgot" });

    act(() => { okay.click(); okay.click(); forgot.click(); });
    expect(getProgress).toHaveBeenCalledTimes(1);
    expect(saveReviewResult).not.toHaveBeenCalled();
    expect(screen.getByText("1 / 2")).toBeTruthy();
    for (const name of ["Okay", "Forgot", "Difficult", "Confident", "← Exit"]) {
      expect(screen.getByRole<HTMLButtonElement>("button", { name }).disabled).toBe(true);
    }
    expect(screen.getByRole("status").textContent).toBe("Saving…");

    await act(async () => { read.resolve(undefined); });
    expect(saveReviewResult).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1 / 2")).toBeTruthy();
    fireEvent.click(okay);
    expect(saveReviewResult).toHaveBeenCalledTimes(1);
    await act(async () => { write.resolve(); });

    expect(screen.getByText("2 / 2")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Confident" }));
    await screen.findByRole("heading", { name: "Review complete" });
    expect(saveReviewResult).toHaveBeenCalledTimes(2);
    expect(screen.getByText("2 correct, 0 partial, and 0 incorrect. Results are saved on this device.")).toBeTruthy();
  });

  it("disables manual overrides and exit while saving, then permits a failed save to retry", async () => {
    const write = deferred<void>();
    vi.mocked(saveReviewResult).mockReturnValueOnce(write.promise);
    await startReview("Short answer", new Set(["core-a"]));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "scarcity" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Partial" }));
    fireEvent.click(screen.getByRole("button", { name: "Okay" }));
    await waitFor(() => expect(saveReviewResult).toHaveBeenCalledTimes(1));
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Correct" }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "← Exit" }).disabled).toBe(true);
    expect(saveReviewResult).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ result: "partial", manualOverride: true }));
    await act(async () => { write.reject(new Error("Quota exceeded")); });

    expect(screen.getByRole("alert").textContent).toContain("Could not save");
    expect(screen.getByText("1 / 1")).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Okay" }).disabled).toBe(false);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Correct" }).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Okay" }));
    await screen.findByRole("heading", { name: "Review complete" });
    expect(screen.getByText("0 correct, 1 partial, and 0 incorrect. Results are saved on this device.")).toBeTruthy();
  });

  it("does not advance a newly mounted session when an old save completes after navigation", async () => {
    const write = deferred<void>();
    vi.mocked(saveReviewResult).mockReturnValueOnce(write.promise);
    const previous = await startReview();
    fireEvent.click(screen.getByRole("button", { name: "Show answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Okay" }));
    await waitFor(() => expect(saveReviewResult).toHaveBeenCalledTimes(1));
    previous.unmount();
    await startReview();
    await act(async () => { write.resolve(); });
    expect(screen.getByText("1 / 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show answer" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Review complete" })).toBeNull();
  });
});

it.each(["sl", "hl", "all"] as const)("uses the %s global level when building a scoped review", async (level) => {
  render(<ReviewView locale="en" level={level} scopeIds={new Set(["extension"])} />);
  fireEvent.click(screen.getByRole("button", { name: "Flashcards" }));
  fireEvent.click(screen.getByRole("button", { name: "Build review session" }));
  if (level === "all") {
    await screen.findByRole("heading", { name: "Question for extension" });
  } else {
    expect((await screen.findByRole("alert")).textContent).toContain("No items match");
    expect(screen.queryByRole("heading", { name: "Question for extension" })).toBeNull();
  }
});
