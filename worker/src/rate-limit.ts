/** Minimal structural contracts for the Cloudflare Durable Object storage API. */
export interface QuotaTransaction {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}

export interface QuotaState {
  storage: {
    transaction<T>(closure: (transaction: QuotaTransaction) => Promise<T>): Promise<T>;
  };
}

export interface QuotaNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
}

interface DailyCounter {
  day: string;
  count: number;
}

/**
 * One object per hashed owner token, shared by every Worker isolate.
 * Storage transactions reserve a slot durably before any billable model call.
 * An in-memory lock or Workers KV cannot provide this cross-isolate guarantee.
 */
export class DailyAiQuota {
  private readonly state: QuotaState;

  constructor(state: QuotaState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/reserve") {
      return new Response(null, { status: 404 });
    }
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return new Response(null, { status: 400 });
    }
    const limit = input && typeof input === "object" && "limit" in input ? input.limit : undefined;
    if (typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1) {
      return new Response(null, { status: 400 });
    }

    const allowed = await this.state.storage.transaction(async (transaction) => {
      const day = new Date().toISOString().slice(0, 10);
      const previous = await transaction.get<DailyCounter>("daily");
      // Fail closed for corrupt state or a clock moving behind the persisted day.
      if (previous && (!/^\d{4}-\d{2}-\d{2}$/.test(previous.day)
        || !Number.isSafeInteger(previous.count) || previous.count < 0 || previous.day > day)) {
        throw new Error("INVALID_QUOTA_STATE");
      }
      const count = previous?.day === day ? previous.count : 0;
      if (count >= limit) return false;
      await transaction.put("daily", { day, count: count + 1 });
      return true;
    });
    return new Response(null, { status: allowed ? 204 : 429 });
  }
}
