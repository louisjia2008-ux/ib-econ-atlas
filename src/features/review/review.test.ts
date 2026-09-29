import { describe, expect, it } from "vitest";
import { knowledgePoints } from "../../generated/content";
import type { ShortAnswerItem } from "../../types/content";
import type { ProgressRecord } from "../../types/progress";
import { classifyCoverage, overrideShortAnswer, ratingForFlashcard, ratingForResult, scoreShortAnswer } from "./scoring";
import { scheduleReview } from "./scheduler";
import { createReviewQueue } from "./session";

const scarcity = knowledgePoints.find((point) => point.meta.id === "u1-04-scarcity");
const scarcityShort = scarcity?.practice.find((item): item is ShortAnswerItem => item.type === "short-answer");

describe("short-answer scoring", () => {
  it("matches Chinese keyword groups and applies 80/50 thresholds", () => {
    expect(scarcityShort).toBeDefined();
    const complete = scoreShortAnswer(scarcityShort as ShortAnswerItem, "资源有限而欲望无限，所以必须选择，放弃最佳替代方案就是机会成本。", "zh-CN");
    expect(complete.coverage).toBe(1);
    expect(complete.result).toBe("correct");
    expect(classifyCoverage(0.8)).toBe("correct");
    expect(classifyCoverage(0.5)).toBe("partial");
    expect(classifyCoverage(0.49)).toBe("incorrect");
  });

  it("matches English synonyms and exposes missing groups", () => {
    const partial = scoreShortAnswer(scarcityShort as ShortAnswerItem, "Finite resources create a resource constraint, while wants exceed resources.", "en");
    expect(partial.coverage).toBeCloseTo(2 / 3);
    expect(partial.result).toBe("partial");
    expect(partial.groups.filter((group) => !group.matched)).toHaveLength(1);
  });

  it("records a manual correction separately from automatic coverage", () => {
    const automatic = scoreShortAnswer(scarcityShort as ShortAnswerItem, "resources", "en");
    const corrected = overrideShortAnswer(automatic, "correct");
    expect(corrected.manualOverride).toBe(true);
    expect(corrected.coverage).toBe(automatic.coverage);
    expect(corrected.result).toBe("correct");
  });
});

describe("rating mapping", () => {
  it("maps incorrect and partial answers independently of optimistic self-rating", () => {
    expect(ratingForResult("incorrect", "mastered")).toBe("again");
    expect(ratingForResult("partial", "mastered")).toBe("hard");
    expect(ratingForResult("correct", "okay")).toBe("good");
    expect(ratingForResult("correct", "mastered")).toBe("easy");
    expect(ratingForFlashcard("forgot")).toBe("again");
  });
});

describe("FSRS scheduling and mastery", () => {
  it("uses deterministic due dates and requires two recent successes plus a 21-day interval", () => {
    let now = new Date("2026-01-01T09:00:00.000Z");
    let record: ProgressRecord | undefined;
    let iterations = 0;
    while (record?.state !== "mastered" && iterations < 12) {
      record = scheduleReview("u1-04-scarcity", record, "easy", now);
      now = new Date(record.dueAt as string);
      iterations += 1;
    }
    expect(record?.state).toBe("mastered");
    expect(record?.successfulReviews).toBeGreaterThanOrEqual(2);
    expect(record?.fsrsState?.scheduledDays).toBeGreaterThanOrEqual(21);
  });

  it("rolls a mastered point back after an incorrect answer", () => {
    let now = new Date("2026-01-01T09:00:00.000Z");
    let record: ProgressRecord | undefined;
    for (let index = 0; index < 12 && record?.state !== "mastered"; index += 1) {
      record = scheduleReview("u1-04-scarcity", record, "easy", now);
      now = new Date(record.dueAt as string);
    }
    const failed = scheduleReview("u1-04-scarcity", record, "again", now);
    expect(failed.state).not.toBe("mastered");
    expect(failed.successfulReviews).toBe(0);
  });
});

describe("review queue", () => {
  it("supports question mode, temporary scope and knowledge status", () => {
    const queue = createReviewQueue(knowledgePoints, [], {
      mode: "short-answer",
      count: 20,
      scopeIds: new Set(["u1-04-scarcity"]),
      useScope: true,
      status: "new",
      now: new Date("2026-01-01T09:00:00.000Z"),
      random: () => 0.5,
    });
    expect(queue).toHaveLength(1);
    expect(queue[0]?.point.meta.id).toBe("u1-04-scarcity");
    expect(queue[0]?.item.type).toBe("short-answer");
  });
});
