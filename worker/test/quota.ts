import { DailyAiQuota, type QuotaNamespace, type QuotaState, type QuotaTransaction } from "../src/rate-limit";

/** Serializable durable-storage stand-in, shared even when object instances restart. */
type QuotaStorage = QuotaState["storage"];

export class MemoryQuotaStorage implements QuotaStorage {
  values = new Map<string, unknown>();
  private tail: Promise<unknown> = Promise.resolve();

  transaction<T>(closure: (transaction: QuotaTransaction) => Promise<T>): Promise<T> {
    const operation = this.tail.then(async () => {
      const pending = new Map(this.values);
      const result = await closure({
        get: async <V>(key: string) => pending.get(key) as V | undefined,
        put: async <V>(key: string, value: V) => { pending.set(key, value); },
      });
      this.values = pending;
      return result;
    });
    this.tail = operation.catch(() => undefined);
    return operation;
  }
}

export class MemoryQuotaNamespace implements QuotaNamespace {
  stores = new Map<string, MemoryQuotaStorage>();
  idFromName(name: string) { return name; }
  get(id: unknown) {
    const name = String(id);
    let storage = this.stores.get(name);
    if (!storage) {
      storage = new MemoryQuotaStorage();
      this.stores.set(name, storage);
    }
    // A fresh object on every fetch proves correctness does not depend on a JS lock.
    return new DailyAiQuota({ storage });
  }
}
