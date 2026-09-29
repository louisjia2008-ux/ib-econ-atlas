import type { KnowledgePoint, PracticeItem } from "../../types/content";
import type { ProgressRecord } from "../../types/progress";

export type ReviewMode = "flashcard" | "mcq" | "short-answer" | "mixed";
export type ReviewStatusFilter = "new" | "weak" | "due" | "any";

export interface ReviewQueueOptions {
  mode: ReviewMode;
  count: number;
  scopeIds: ReadonlySet<string>;
  useScope: boolean;
  status: ReviewStatusFilter;
  now: Date;
  random?: () => number;
}

export interface QueuedPractice {
  point: KnowledgePoint;
  item: PracticeItem;
}

function statusMatches(record: ProgressRecord | undefined, status: ReviewStatusFilter, now: Date): boolean {
  if (status === "any") return true;
  if (status === "new") return !record || record.state === "new";
  if (status === "weak") return Boolean(record && (record.state === "learning" || record.lastRating === "again" || record.lastRating === "hard"));
  return Boolean(record?.dueAt && Date.parse(record.dueAt) <= now.getTime());
}

export function createReviewQueue(points: KnowledgePoint[], progress: ProgressRecord[], options: ReviewQueueOptions): QueuedPractice[] {
  const progressById = new Map(progress.map((record) => [record.knowledgePointId, record]));
  const pool = points
    .filter((point) => !options.useScope || options.scopeIds.size === 0 || options.scopeIds.has(point.meta.id))
    .filter((point) => statusMatches(progressById.get(point.meta.id), options.status, options.now))
    .flatMap((point) => point.practice
      .filter((item) => options.mode === "mixed" || item.type === options.mode)
      .map((item) => ({ point, item })));

  const random = options.random ?? Math.random;
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const item = shuffled[index];
    shuffled[index] = shuffled[swapIndex] as QueuedPractice;
    shuffled[swapIndex] = item as QueuedPractice;
  }
  return shuffled.slice(0, Math.max(1, Math.min(options.count, shuffled.length)));
}
