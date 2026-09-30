import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryQuotaNamespace } from "../test/quota";
import worker, { type Env } from "./index";

const { createResponse } = vi.hoisted(() => ({ createResponse: vi.fn() }));
vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = { create: createResponse };
  },
}));

describe("Cloudflare fetch entrypoint", () => {
  beforeEach(() => {
    createResponse.mockReset();
    createResponse.mockResolvedValue({ output_text: JSON.stringify({
      answer: "Scarcity requires choice.", citationIds: ["u1-04-scarcity"], unsupported: false,
    }) });
  });

  it("does not treat the runtime ExecutionContext as the injected model caller", async () => {
    const env: Env = {
      OPENAI_API_KEY: "test-only-key", OWNER_ACCESS_TOKEN: "test-owner", OPENAI_MODEL: "test-model",
      AI_RATE_LIMIT: new MemoryQuotaNamespace(),
    };
    const request = new Request("https://worker.example/ask", {
      method: "POST",
      headers: { authorization: "Bearer test-owner", "content-type": "application/json" },
      body: JSON.stringify({ question: "Scarcity?", locale: "en", knowledgePointIds: ["u1-04-scarcity"] }),
    });
    const context = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };
    const response: Response = await Reflect.apply(worker.fetch, worker, [request, env, context]);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ answer: "Scarcity requires choice.", unsupported: false });
    expect(createResponse).toHaveBeenCalledOnce();
    expect(createResponse).toHaveBeenCalledWith(expect.objectContaining({ model: "test-model", store: false }));
  });
});
