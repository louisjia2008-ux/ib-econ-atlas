export type MasteryState = "new" | "learning" | "review" | "mastered";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type PracticeResult = "incorrect" | "partial" | "correct";

export interface FsrsSnapshot {
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview?: string;
}

export interface ProgressRecord {
  knowledgePointId: string;
  state: MasteryState;
  fsrsState?: FsrsSnapshot;
  lastRating?: ReviewRating;
  successfulReviews: number;
  dueAt?: string;
  updatedAt: string;
}

export interface PracticeAttempt {
  id: string;
  knowledgePointId: string;
  practiceItemId: string;
  mode: "flashcard" | "mcq" | "short-answer";
  result: PracticeResult;
  score: number;
  rating: ReviewRating;
  manualOverride: boolean;
  createdAt: string;
}

export interface UserPreferences {
  locale: "zh-CN" | "en";
  levelFilter: "all" | "sl" | "hl";
  aiEndpoint?: string;
  aiEnabled: boolean;
  lastBackupAt?: string;
}

export interface BackupEnvelope {
  schemaVersion: 1;
  appVersion: string;
  exportedAt: string;
  progress: ProgressRecord[];
  attempts: PracticeAttempt[];
  preferences: Omit<UserPreferences, "aiEndpoint"> & { aiEndpoint?: never };
}

