import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryQuotaNamespace } from "../test/quota";
import { constantTimeTokenEquals, handleRequest, type Env } from "./index";

const baseEnv = (): Env => ({
  OPENAI_API_KEY: "test-only-key",
  OWNER_ACCESS_TOKEN: "owner-secret",
  OPENAI_MODEL: "test-model",
  ALLOWED_ORIGIN: "https://louisjia2008-ux.github.io",
  AI_DAILY_LIMIT: "100",
  AI_RATE_LIMIT: new MemoryQuotaNamespace(),
});

function ask(body: unknown, token?: string, origin = "https://louisjia2008-ux.github.io") {
  const headers: Record<string, string> = { "content-type": "application/json", origin };
  if (token) headers.authorization = `Bearer ${token}`;
  return new Request("https://worker.example/ask", { method: "POST", headers, body: JSON.stringify(body) });
}

const validPayload = { question: "What is scarcity?", locale: "en", knowledgePointIds: ["u1-04-scarcity"] };

describe("AI Worker contract", () => {
  it("uses digest comparison for owner tokens", async () => {
    expect(await constantTimeTokenEquals("same", "same")).toBe(true);
    expect(await constantTimeTokenEquals("same", "different-length-value")).toBe(false);
  });

  it("returns 401 with no token and 403 with a wrong token", async () => {
    expect((await handleRequest(ask(validPayload), baseEnv())).status).toBe(401);
    expect((await handleRequest(ask(validPayload, "wrong"), baseEnv())).status).toBe(403);
  });

  it("rejects an untrusted browser origin and oversized questions", async () => {
    expect((await handleRequest(ask(validPayload, "owner-secret", "https://evil.example"), baseEnv())).status).toBe(403);
    expect((await handleRequest(ask({ ...validPayload, question: "x".repeat(2001) }, "owner-secret"), baseEnv())).status).toBe(400);
  });

  it("returns 503 when the model is not configured", async () => {
    const env = baseEnv();
    delete env.OPENAI_API_KEY;
    expect((await handleRequest(ask(validPayload, "owner-secret"), env)).status).toBe(503);
  });

  it("returns 429 after the daily limit", async () => {
    const env = baseEnv();
    env.AI_DAILY_LIMIT = "1";
    const model = async () => ({ answer: "Scarcity requires choice.", citationIds: ["u1-04-scarcity"], unsupported: false });
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, model)).status).toBe(200);
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, model)).status).toBe(429);
  });

  it("returns unsupported without calling the model when candidate IDs are untrusted", async () => {
    let called = false;
    const response = await handleRequest(ask({ ...validPayload, knowledgePointIds: ["forged"] }, "owner-secret"), baseEnv(), async () => {
      called = true;
      return { answer: "should not run", citationIds: [], unsupported: false };
    });
    expect(response.status).toBe(200);
    expect(called).toBe(false);
    expect(await response.json()).toMatchObject({ unsupported: true, citations: [] });
  });

  it("removes invalid citations and keeps valid internal routes", async () => {
    const response = await handleRequest(ask(validPayload, "owner-secret"), baseEnv(), async () => ({
      answer: "Scarcity forces choice.",
      citationIds: ["u1-04-scarcity", "forged-id"],
      unsupported: false,
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      unsupported: false,
      citations: [{ knowledgePointId: "u1-04-scarcity", route: "/#/study/u1-04-scarcity" }],
    });
  });

  it("changes a citation-free model answer to unsupported", async () => {
    const response = await handleRequest(ask(validPayload, "owner-secret"), baseEnv(), async () => ({
      answer: "Unsupported outside claim.",
      citationIds: ["forged-id"],
      unsupported: false,
    }));
    expect(await response.json()).toMatchObject({ unsupported: true, citations: [] });
  });
});


describe("atomic AI quota", () => {
  afterEach(() => { vi.useRealTimers(); });

  const model = () => vi.fn(async () => ({ answer: "Scarcity requires choice.", citationIds: ["u1-04-scarcity"], unsupported: false }));

  it("admits exactly the remaining slots across concurrent Worker requests", async () => {
    const env = baseEnv();
    env.AI_DAILY_LIMIT = "5";
    const callModel = model();
    // Separate Env values emulate distinct Worker isolates sharing one durable namespace.
    const responses = await Promise.all(Array.from({ length: 50 }, () =>
      handleRequest(ask(validPayload, "owner-secret"), { ...env }, callModel)));
    expect(responses.filter((response) => response.status === 200)).toHaveLength(5);
    expect(responses.filter((response) => response.status === 429)).toHaveLength(45);
    expect(callModel).toHaveBeenCalledTimes(5);
    const namespace = env.AI_RATE_LIMIT as MemoryQuotaNamespace;
    expect([...namespace.stores.keys()]).toEqual([expect.stringMatching(/^[a-f0-9]{64}$/)]);
    expect(JSON.stringify([...namespace.stores])).not.toContain("owner-secret");
  });

  it("resets the persisted counter at midnight UTC", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T23:59:59.000Z"));
    const env = baseEnv();
    env.AI_DAILY_LIMIT = "1";
    const callModel = model();
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(200);
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(429);
    vi.setSystemTime(new Date("2026-10-01T00:00:00.000Z"));
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(200);
    expect(callModel).toHaveBeenCalledTimes(2);
    // A backwards clock must not reset the newer day's budget.
    vi.setSystemTime(new Date("2026-09-30T23:59:59.000Z"));
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(503);
    expect(callModel).toHaveBeenCalledTimes(2);
  });

  it("does not call the model without an atomic quota binding", async () => {
    const env = baseEnv();
    delete env.AI_RATE_LIMIT;
    const callModel = model();
    const response = await handleRequest(ask(validPayload, "owner-secret"), env, callModel);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "rate_limit_unavailable" });
    expect(callModel).not.toHaveBeenCalled();
  });

  it.each(["0", "-1", "1.5", "NaN", "100extra", "9007199254740992"])("fails closed on invalid configured limit %s", async (limit) => {
    const env = baseEnv();
    env.AI_DAILY_LIMIT = limit;
    const callModel = model();
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(503);
    expect(callModel).not.toHaveBeenCalled();
  });

  it.each(["throw", "unexpected-response"])("does not call the model on quota %s", async (failure) => {
    const env = baseEnv();
    env.AI_RATE_LIMIT = {
      idFromName: (name) => name,
      get: () => ({ fetch: async () => {
        if (failure === "throw") throw new Error("storage unavailable");
        return new Response(null, { status: 200 });
      } }),
    };
    const callModel = model();
    const response = await handleRequest(ask(validPayload, "owner-secret"), env, callModel);
    expect(response.status).toBe(503);
    expect(response.headers.get("access-control-allow-origin")).toBe(env.ALLOWED_ORIGIN);
    expect(callModel).not.toHaveBeenCalled();
  });

  it("keeps reservations after a model failure to avoid retry overspending", async () => {
    const env = baseEnv();
    env.AI_DAILY_LIMIT = "1";
    const callModel = vi.fn(async () => { throw new Error("upstream failed"); });
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(502);
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(429);
    expect(callModel).toHaveBeenCalledTimes(1);
  });

  it("does not consume a slot for unsupported knowledge IDs", async () => {
    const env = baseEnv();
    env.AI_DAILY_LIMIT = "1";
    const callModel = model();
    expect((await handleRequest(ask({ ...validPayload, knowledgePointIds: ["unknown"] }, "owner-secret"), env, callModel)).status).toBe(200);
    expect((await handleRequest(ask(validPayload, "owner-secret"), env, callModel)).status).toBe(200);
    expect(callModel).toHaveBeenCalledTimes(1);
  });
});
