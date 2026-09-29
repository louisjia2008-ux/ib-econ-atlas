import { z } from "zod";
import type { BackupEnvelope, PracticeAttempt, ProgressRecord, UserPreferences } from "../../types/progress";
import { getAllAttempts, getAllProgress, getDatabase, getPreferences, savePreferences } from "../progress/db";

export const BACKUP_SCHEMA_VERSION = 1;
export const APP_VERSION = "0.1.0";

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Expected an ISO-compatible date.");

const fsrsSchema = z.object({
  due: isoDate,
  stability: z.number().finite(),
  difficulty: z.number().finite(),
  elapsedDays: z.number().finite(),
  scheduledDays: z.number().finite(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: z.number().int(),
  lastReview: isoDate.optional(),
}).passthrough();

const progressSchema = z.object({
  knowledgePointId: z.string().min(1),
  state: z.enum(["new", "learning", "review", "mastered"]),
  fsrsState: fsrsSchema.optional(),
  lastRating: z.enum(["again", "hard", "good", "easy"]).optional(),
  successfulReviews: z.number().int().nonnegative(),
  dueAt: isoDate.optional(),
  updatedAt: isoDate,
}).passthrough();

const attemptSchema = z.object({
  id: z.string().min(1),
  knowledgePointId: z.string().min(1),
  practiceItemId: z.string().min(1),
  mode: z.enum(["flashcard", "mcq", "short-answer"]),
  result: z.enum(["incorrect", "partial", "correct"]),
  score: z.number().min(0).max(1),
  rating: z.enum(["again", "hard", "good", "easy"]),
  manualOverride: z.boolean(),
  createdAt: isoDate,
}).passthrough();

const preferencesSchema = z.object({
  locale: z.enum(["zh-CN", "en"]),
  levelFilter: z.enum(["all", "sl", "hl"]),
  aiEnabled: z.boolean(),
  lastBackupAt: isoDate.optional(),
}).passthrough();

const envelopeSchema = z.object({
  schemaVersion: z.literal(BACKUP_SCHEMA_VERSION),
  appVersion: z.string().min(1),
  exportedAt: isoDate,
  progress: z.array(progressSchema),
  attempts: z.array(attemptSchema),
  preferences: preferencesSchema,
}).passthrough();

export type ImportMode = "merge" | "replace";

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupValidationError";
  }
}

function sanitizePreferences(preferences: UserPreferences): BackupEnvelope["preferences"] {
  const result: BackupEnvelope["preferences"] = {
    locale: preferences.locale,
    levelFilter: preferences.levelFilter,
    aiEnabled: preferences.aiEnabled,
  };
  if (preferences.lastBackupAt) result.lastBackupAt = preferences.lastBackupAt;
  return result;
}

export async function createBackup(now = new Date()): Promise<BackupEnvelope> {
  const [progress, attempts, preferences] = await Promise.all([getAllProgress(), getAllAttempts(), getPreferences()]);
  const exportedAt = now.toISOString();
  const envelope: BackupEnvelope = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt,
    progress,
    attempts,
    preferences: sanitizePreferences(preferences),
  };
  await savePreferences({ ...preferences, lastBackupAt: exportedAt });
  return envelope;
}

export function backupFilename(now = new Date()): string {
  return `ib-econ-atlas-backup-${now.toISOString().slice(0, 10)}.json`;
}

export function serializeBackup(envelope: BackupEnvelope): string {
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

export function parseBackup(text: string): BackupEnvelope {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new BackupValidationError("The selected file is not valid JSON.");
  }
  const parsed = envelopeSchema.safeParse(value);
  if (!parsed.success) {
    throw new BackupValidationError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
  }
  return parsed.data as BackupEnvelope;
}

function importedPreferences(value: BackupEnvelope["preferences"], current: UserPreferences): UserPreferences {
  const result: UserPreferences = {
    locale: value.locale,
    levelFilter: value.levelFilter,
    aiEnabled: value.aiEnabled,
  };
  if (current.aiEndpoint) result.aiEndpoint = current.aiEndpoint;
  if (value.lastBackupAt) result.lastBackupAt = value.lastBackupAt;
  return result;
}

export async function importBackup(text: string, mode: ImportMode, confirmed = false): Promise<{ progress: number; attempts: number }> {
  const envelope = parseBackup(text);
  if (mode === "replace" && !confirmed) throw new BackupValidationError("Replace import requires explicit confirmation.");

  const database = await getDatabase();
  const currentPreferences = await getPreferences();
  const transaction = database.transaction(["progress", "attempts", "settings"], "readwrite");
  const progressStore = transaction.objectStore("progress");
  const attemptStore = transaction.objectStore("attempts");
  const settingsStore = transaction.objectStore("settings");

  if (mode === "replace") {
    await Promise.all([progressStore.clear(), attemptStore.clear()]);
  }

  for (const imported of envelope.progress) {
    const existing = mode === "merge" ? await progressStore.get(imported.knowledgePointId) : undefined;
    if (!existing || Date.parse(imported.updatedAt) >= Date.parse(existing.updatedAt)) {
      await progressStore.put(imported as ProgressRecord);
    }
  }
  for (const imported of envelope.attempts) {
    const existing = mode === "merge" ? await attemptStore.get(imported.id) : undefined;
    if (!existing || Date.parse(imported.createdAt) >= Date.parse(existing.createdAt)) {
      await attemptStore.put(imported as PracticeAttempt);
    }
  }
  await settingsStore.put({ key: "preferences", value: importedPreferences(envelope.preferences, currentPreferences) });
  await transaction.done;
  return { progress: envelope.progress.length, attempts: envelope.attempts.length };
}
