import { afterEach, describe, expect, it, vi } from "vitest";
import { askAtlas, AiRequestError } from "./client";

const payload = { question: "What is scarcity?", locale: "en" as const, knowledgePointIds: ["u1-04-scarcity"] };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI browser client", () => {
  it("fails locally when unconfigured or offline", async () => {
    await expect(askAtlas("", "", payload, { online: true })).rejects.toMatchObject({ kind: "unconfigured" });
    await expect(askAtlas("https://worker.example", "token", payload, { online: false })).rejects.toMatchObject({ kind: "offline" });
  });

  it("maps auth and limit status without exposing the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("{}", { status: 403 })).mockResolvedValueOnce(new Response("{}", { status: 429 })));
    await expect(askAtlas("https://worker.example", "private-token", payload, { online: true })).rejects.toMatchObject({ kind: "unauthorized" });
    await expect(askAtlas("https://worker.example", "private-token", payload, { online: true })).rejects.toMatchObject({ kind: "limited" });
  });

  it("validates a grounded response contract", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      answer: "Scarcity requires choice.",
      citations: [{ knowledgePointId: "u1-04-scarcity", title: "Scarcity", route: "/#/study/u1-04-scarcity" }],
      unsupported: false,
    }), { status: 200, headers: { "content-type": "application/json" } })));
    await expect(askAtlas("https://worker.example", "token", payload, { online: true })).resolves.toMatchObject({ unsupported: false });
  });

  it("rejects a malformed 200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ answer: "missing fields" }), { status: 200 })));
    await expect(askAtlas("https://worker.example", "token", payload, { online: true })).rejects.toBeInstanceOf(AiRequestError);
  });
});
