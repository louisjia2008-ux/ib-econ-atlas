import { describe, expect, it } from "vitest";
import { constantTimeTokenEquals, handleRequest, type Env } from "./index";

class MemoryKV {
  values = new Map<string, string>();
  async get(key: string) { return this.values.get(key) ?? null; }
  async put(key: string, value: string) { this.values.set(key, value); }
}

const baseEnv = (): Env => ({
  OPENAI_API_KEY: "test-only-key",
  OWNER_ACCESS_TOKEN: "owner-secret",
  OPENAI_MODEL: "test-model",
  ALLOWED_ORIGIN: "https://louisjia2008-ux.github.io",
  AI_DAILY_LIMIT: "100",
  AI_RATE_LIMIT: new MemoryKV(),
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
