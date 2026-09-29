import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { PracticeAttempt, ProgressRecord, UserPreferences } from "../../types/progress";

const DATABASE_NAME = "ib-econ-atlas";
const DATABASE_VERSION = 1;

export const defaultPreferences: UserPreferences = {
  locale: "zh-CN",
  levelFilter: "all",
  aiEnabled: false,
};

interface SettingsRow {
  key: "preferences";
  value: UserPreferences;
}

interface AtlasDatabase extends DBSchema {
  progress: {
    key: string;
    value: ProgressRecord;
  };
  attempts: {
    key: string;
    value: PracticeAttempt;
    indexes: { "by-knowledge-point": string; "by-created-at": string };
  };
  settings: {
    key: SettingsRow["key"];
    value: SettingsRow;
  };
}

let databasePromise: Promise<IDBPDatabase<AtlasDatabase>> | undefined;

export function getDatabase(): Promise<IDBPDatabase<AtlasDatabase>> {
  databasePromise ??= openDB<AtlasDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("progress")) database.createObjectStore("progress", { keyPath: "knowledgePointId" });
      if (!database.objectStoreNames.contains("attempts")) {
        const store = database.createObjectStore("attempts", { keyPath: "id" });
        store.createIndex("by-knowledge-point", "knowledgePointId");
        store.createIndex("by-created-at", "createdAt");
      }
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
    },
  });
  return databasePromise;
}

export async function getAllProgress(): Promise<ProgressRecord[]> {
  return (await getDatabase()).getAll("progress");
}

export async function getProgress(knowledgePointId: string): Promise<ProgressRecord | undefined> {
  return (await getDatabase()).get("progress", knowledgePointId);
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  await (await getDatabase()).put("progress", record);
}

export async function getAllAttempts(): Promise<PracticeAttempt[]> {
  return (await getDatabase()).getAll("attempts");
}

export async function saveAttempt(attempt: PracticeAttempt): Promise<void> {
  await (await getDatabase()).put("attempts", attempt);
}

export async function getPreferences(): Promise<UserPreferences> {
  const row = await (await getDatabase()).get("settings", "preferences");
  return row?.value ?? { ...defaultPreferences };
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await (await getDatabase()).put("settings", { key: "preferences", value: preferences });
}

export async function clearLearningData(): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction(["progress", "attempts", "settings"], "readwrite");
  await Promise.all([
    transaction.objectStore("progress").clear(),
    transaction.objectStore("attempts").clear(),
    transaction.objectStore("settings").clear(),
  ]);
  await transaction.done;
}

export async function getDataCounts(): Promise<{ progress: number; attempts: number }> {
  const database = await getDatabase();
  return {
    progress: await database.count("progress"),
    attempts: await database.count("attempts"),
  };
}

export async function resetDatabaseForTests(): Promise<void> {
  if (databasePromise) {
    const database = await databasePromise;
    database.close();
    databasePromise = undefined;
  }
  await deleteDB(DATABASE_NAME);
}
