import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";
import type { FsrsSnapshot, ProgressRecord, ReviewRating } from "../../types/progress";

const scheduler = fsrs({ enable_fuzz: false, maximum_interval: 36500 });

const ratings: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function snapshotToCard(snapshot: FsrsSnapshot | undefined, now: Date): Card {
  if (!snapshot) return createEmptyCard(now);
  return {
    due: new Date(snapshot.due),
    stability: snapshot.stability,
    difficulty: snapshot.difficulty,
    elapsed_days: snapshot.elapsedDays,
    scheduled_days: snapshot.scheduledDays,
    learning_steps: snapshot.learningSteps ?? 0,
    reps: snapshot.reps,
    lapses: snapshot.lapses,
    state: snapshot.state as State,
    ...(snapshot.lastReview ? { last_review: new Date(snapshot.lastReview) } : {}),
  };
}

function cardToSnapshot(card: Card): FsrsSnapshot {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    ...(card.last_review ? { lastReview: card.last_review.toISOString() } : {}),
  };
}

function masteryState(card: Card, successfulReviews: number, rating: ReviewRating): ProgressRecord["state"] {
  if ((rating === "good" || rating === "easy") && successfulReviews >= 2 && card.scheduled_days >= 21) return "mastered";
  if (card.state === State.Review) return "review";
  return "learning";
}

export function scheduleReview(knowledgePointId: string, existing: ProgressRecord | undefined, rating: ReviewRating, now: Date): ProgressRecord {
  const currentCard = snapshotToCard(existing?.fsrsState, now);
  const next = scheduler.next(currentCard, now, ratings[rating]).card;
  const successfulReviews = rating === "good" || rating === "easy" ? (existing?.successfulReviews ?? 0) + 1 : 0;
  return {
    knowledgePointId,
    state: masteryState(next, successfulReviews, rating),
    fsrsState: cardToSnapshot(next),
    lastRating: rating,
    successfulReviews,
    dueAt: next.due.toISOString(),
    updatedAt: now.toISOString(),
  };
}
