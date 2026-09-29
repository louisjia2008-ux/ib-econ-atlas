import { beforeEach, describe, expect, it } from "vitest";
import type { BackupEnvelope, PracticeAttempt, ProgressRecord } from "../../types/progress";
import { saveOwnerAccessToken } from "../ai/credentials";
import {
  clearLearningData,
  getAllAttempts,
  getAllProgress,
  getPreferences,
  resetDatabaseForTests,
  saveAttempt,
  savePreferences,
  saveProgress,
} from "../progress/db";
import { BackupValidationError, createBackup, importBackup, parseBackup, serializeBackup } from "./backup";

const progress = (id: string, updatedAt: string, state: ProgressRecord["state"] = "learning"): ProgressRecord => ({
  knowledgePointId: id,
  state,
  successfulReviews: state === "mastered" ? 2 : 0,
  updatedAt,
});

const attempt: PracticeAttempt = {
  id: "attempt-1",
  knowledgePointId: "u1-04-scarcity",
  practiceItemId: "u1-04-scarcity-mcq-1",
  mode: "mcq",
  result: "correct",
  score: 1,
  rating: "good",
  manualOverride: false,
  createdAt: "2026-09-29T10:00:00.000Z",
};

function envelope(records: ProgressRecord[], attempts: PracticeAttempt[] = []): BackupEnvelope {
  return {
    schemaVersion: 1,
    appVersion: "0.1.0",
    exportedAt: "2026-09-29T12:00:00.000Z",
    progress: records,
    attempts,
    preferences: { locale: "en", levelFilter: "hl", aiEnabled: false },
  };
}

beforeEach(async () => {
  await resetDatabaseForTests();
});

describe("versioned backup", () => {
  it("round-trips progress and attempts while excluding sensitive and session data", async () => {
    await saveProgress(progress("u1-04-scarcity", "2026-09-29T10:00:00.000Z"));
    await saveAttempt(attempt);
    await savePreferences({ locale: "en", levelFilter: "hl", aiEnabled: true, aiEndpoint: "https://private-worker.example" });
    saveOwnerAccessToken("private-owner-token");

    const serialized = serializeBackup(await createBackup(new Date("2026-09-29T12:00:00.000Z")));
    expect(serialized).not.toContain("private-worker");
    expect(serialized.toLocaleLowerCase()).not.toContain("token");
    expect(serialized).not.toContain("exam-scope");

    await clearLearningData();
    await importBackup(serialized, "replace", true);
    expect(await getAllProgress()).toHaveLength(1);
    expect(await getAllAttempts()).toEqual([attempt]);
    expect(await getPreferences()).toMatchObject({ locale: "en", levelFilter: "hl", aiEnabled: true });
    expect((await getPreferences()).aiEndpoint).toBeUndefined();
  });

  it("merges progress by updatedAt and retains removed-point records", async () => {
    await saveProgress(progress("u1-04-scarcity", "2026-09-29T12:00:00.000Z", "review"));
    await importBackup(serializeBackup(envelope([
      progress("u1-04-scarcity", "2026-09-28T12:00:00.000Z", "new"),
      progress("u9-removed-point", "2026-09-29T13:00:00.000Z", "mastered"),
    ])), "merge");

    const records = await getAllProgress();
    expect(records.find((record) => record.knowledgePointId === "u1-04-scarcity")?.state).toBe("review");
    expect(records.find((record) => record.knowledgePointId === "u9-removed-point")?.state).toBe("mastered");
  });

  it("preserves unknown fields for a forward-compatible round trip", async () => {
    const futureRecord = { ...progress("u1-05-choice", "2026-09-29T12:00:00.000Z"), futureScheduler: { strength: 7 } };
    const futureEnvelope = { ...envelope([futureRecord]), futureEnvelopeField: "kept" };
    await importBackup(`${JSON.stringify(futureEnvelope)}\n`, "merge");
    const exported = await createBackup(new Date("2026-09-30T00:00:00.000Z"));
    expect(exported.progress[0]).toHaveProperty("futureScheduler.strength", 7);
    expect(parseBackup(JSON.stringify(futureEnvelope))).toHaveProperty("futureEnvelopeField", "kept");
  });

  it("rejects an invalid file before mutating existing data", async () => {
    await saveProgress(progress("u1-04-scarcity", "2026-09-29T12:00:00.000Z", "review"));
    const invalid = JSON.stringify({ ...envelope([]), progress: [{ knowledgePointId: "broken", state: "unknown" }] });
    await expect(importBackup(invalid, "replace", true)).rejects.toBeInstanceOf(BackupValidationError);
    expect(await getAllProgress()).toEqual([progress("u1-04-scarcity", "2026-09-29T12:00:00.000Z", "review")]);
  });

  it("requires confirmation before replace and clears prior records after confirmation", async () => {
    await saveProgress(progress("old", "2026-09-29T10:00:00.000Z"));
    const incoming = serializeBackup(envelope([progress("new", "2026-09-29T11:00:00.000Z")]));
    await expect(importBackup(incoming, "replace")).rejects.toBeInstanceOf(BackupValidationError);
    expect((await getAllProgress()).map((record) => record.knowledgePointId)).toEqual(["old"]);
    await importBackup(incoming, "replace", true);
    expect((await getAllProgress()).map((record) => record.knowledgePointId)).toEqual(["new"]);
  });
});
