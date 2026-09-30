import { beforeEach, describe, expect, it } from "vitest";
import type { PracticeAttempt, ProgressRecord } from "../../types/progress";
import { getAllAttempts, getAllProgress, resetDatabaseForTests, saveProgress, saveReviewResult } from "./db";

const progress: ProgressRecord = { knowledgePointId: "core", state: "learning", successfulReviews: 1, updatedAt: "2026-09-30T00:00:00Z" };
const attempt: PracticeAttempt = {
  id: "attempt-1", knowledgePointId: "core", practiceItemId: "core-flashcard", mode: "flashcard", result: "correct",
  score: 1, rating: "good", manualOverride: false, createdAt: "2026-09-30T00:00:00Z",
};

beforeEach(resetDatabaseForTests);

describe("atomic review persistence", () => {
  it("commits the progress and practice attempt together", async () => {
    await saveReviewResult(progress, attempt);
    expect(await getAllProgress()).toEqual([progress]);
    expect(await getAllAttempts()).toEqual([attempt]);
  });

  it("rolls back an already queued progress update when the attempt cannot be saved", async () => {
    const original: ProgressRecord = { ...progress, state: "new", successfulReviews: 0 };
    await saveProgress(original);
    const invalidAttempt = { ...attempt, id: undefined } as unknown as PracticeAttempt;
    await expect(saveReviewResult(progress, invalidAttempt)).rejects.toThrow();
    expect(await getAllProgress()).toEqual([original]);
    expect(await getAllAttempts()).toEqual([]);

    await saveReviewResult(progress, attempt);
    expect(await getAllProgress()).toEqual([progress]);
    expect(await getAllAttempts()).toEqual([attempt]);
  });
});
