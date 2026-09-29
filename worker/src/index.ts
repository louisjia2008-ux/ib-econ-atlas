import OpenAI from "openai";
import knowledgeBundle from "../generated/knowledge.json";

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  OPENAI_API_KEY?: string;
  OWNER_ACCESS_TOKEN?: string;
  OPENAI_MODEL?: string;
  ALLOWED_ORIGIN?: string;
  AI_DAILY_LIMIT?: string;
  AI_RATE_LIMIT?: KVNamespaceLike;
}

interface KnowledgeRecord {
  id: string;
  content: Record<"zh-CN" | "en", {
    title: string;
    takeaway: string;
    definition: string;
    explanation: string;
    causalChain: string[];
    misconceptions: string[];
    examApplication: string[];
    summary: string[];
  }>;
}

interface AskPayload {
  question: string;
  locale: "zh-CN" | "en";
  knowledgePointIds: string[];
}

interface ModelResult {
  answer: string;
  citationIds: string[];
  unsupported: boolean;
}

interface ModelInput {
  question: string;
  locale: "zh-CN" | "en";
  records: KnowledgeRecord[];
}

type ModelCaller = (input: ModelInput, env: Env) => Promise<ModelResult>;

const knowledge = knowledgeBundle as KnowledgeRecord[];
const knowledgeById = new Map(knowledge.map((record) => [record.id, record]));
const MAX_QUESTION_LENGTH = 2000;
const MAX_CANDIDATES = 12;
const MAX_RESPONSE_LENGTH = 6000;
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);

function json(body: unknown, status: number, origin?: string): Response {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function allowedOrigin(request: Request, env: Env): string | undefined {
  const origin = request.headers.get("origin") ?? undefined;
  if (!origin) return undefined;
  if (origin === env.ALLOWED_ORIGIN || LOCAL_ORIGINS.has(origin)) return origin;
  return undefined;
}

async function sha256(value: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

export async function constantTimeTokenEquals(received: string, expected: string): Promise<boolean> {
  const [left, right] = await Promise.all([sha256(received), sha256(expected)]);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

function parsePayload(value: unknown): AskPayload | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<AskPayload>;
  if (typeof candidate.question !== "string" || candidate.question.trim().length === 0 || candidate.question.length > MAX_QUESTION_LENGTH) return undefined;
  if (candidate.locale !== "zh-CN" && candidate.locale !== "en") return undefined;
  if (!Array.isArray(candidate.knowledgePointIds) || candidate.knowledgePointIds.length > MAX_CANDIDATES || !candidate.knowledgePointIds.every((id) => typeof id === "string")) return undefined;
  return { question: candidate.question.trim(), locale: candidate.locale, knowledgePointIds: [...new Set(candidate.knowledgePointIds)] };
}

async function enforceRateLimit(env: Env, accessToken: string, now = new Date()): Promise<boolean> {
  if (!env.AI_RATE_LIMIT) return true;
  const limit = Math.max(1, Number.parseInt(env.AI_DAILY_LIMIT ?? "100", 10) || 100);
  const tokenHash = [...await sha256(accessToken)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const key = `${now.toISOString().slice(0, 10)}:${tokenHash}`;
  const current = Number.parseInt(await env.AI_RATE_LIMIT.get(key) ?? "0", 10) || 0;
  if (current >= limit) return false;
  await env.AI_RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 172800 });
  return true;
}

async function callOpenAI(input: ModelInput, env: Env): Promise<ModelResult> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_NOT_CONFIGURED");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 15000, maxRetries: 0 });
  const trustedContext = input.records.map((record) => ({
    knowledgePointId: record.id,
    title: record.content[input.locale].title,
    takeaway: record.content[input.locale].takeaway,
    definition: record.content[input.locale].definition,
    explanation: record.content[input.locale].explanation,
    causalChain: record.content[input.locale].causalChain,
    misconceptions: record.content[input.locale].misconceptions,
    examApplication: record.content[input.locale].examApplication,
    summary: record.content[input.locale].summary,
  }));
  const response = await client.responses.create({
    model: env.OPENAI_MODEL ?? "gpt-6-luna",
    store: false,
    max_output_tokens: 1000,
    instructions: [
      "You are the optional IB Econ Atlas study assistant.",
      "Answer only from TRUSTED_KNOWLEDGE supplied by the server.",
      "Do not use web search, outside knowledge, or claims unsupported by that material.",
      "If the material is insufficient, set unsupported=true and explain the limitation briefly.",
      "Every substantive claim must be supported by at least one knowledgePointId in citationIds.",
      `Write in ${input.locale === "zh-CN" ? "Simplified Chinese" : "English"}.`,
    ].join(" "),
    input: `QUESTION:\n${input.question}\n\nTRUSTED_KNOWLEDGE:\n${JSON.stringify(trustedContext)}`,
    text: {
      format: {
        type: "json_schema",
        name: "grounded_atlas_answer",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            answer: { type: "string" },
            citationIds: { type: "array", items: { type: "string" } },
            unsupported: { type: "boolean" },
          },
          required: ["answer", "citationIds", "unsupported"],
        },
      },
    },
  });
  return JSON.parse(response.output_text) as ModelResult;
}

export async function handleRequest(request: Request, env: Env, callModel: ModelCaller = callOpenAI): Promise<Response> {
  const origin = allowedOrigin(request, env);
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && !origin) return json({ error: "origin_not_allowed" }, 403);

  if (request.method === "OPTIONS") {
    if (!origin) return json({ error: "origin_not_allowed" }, 403);
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Authorization, Content-Type",
        "access-control-max-age": "86400",
        vary: "Origin",
      },
    });
  }
  if (request.method !== "POST" || new URL(request.url).pathname !== "/ask") return json({ error: "not_found" }, 404, origin);

  const authorization = request.headers.get("authorization");
  if (!authorization) return json({ error: "authorization_required" }, 401, origin);
  if (!env.OWNER_ACCESS_TOKEN) return json({ error: "worker_not_configured" }, 503, origin);
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !(await constantTimeTokenEquals(token, env.OWNER_ACCESS_TOKEN))) return json({ error: "authorization_invalid" }, 403, origin);

  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > 20000) return json({ error: "request_too_large" }, 400, origin);
  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400, origin);
  }
  const payload = parsePayload(rawPayload);
  if (!payload) return json({ error: "invalid_request" }, 400, origin);
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return json({ error: "model_not_configured" }, 503, origin);
  if (!(await enforceRateLimit(env, token))) return json({ error: "daily_limit_reached" }, 429, origin);

  const records = payload.knowledgePointIds.map((id) => knowledgeById.get(id)).filter((record) => record !== undefined);
  if (records.length === 0) {
    return json({ answer: payload.locale === "zh-CN" ? "当前知识库不足以回答这个问题。" : "The current knowledge base is insufficient to answer this question.", citations: [], unsupported: true }, 200, origin);
  }

  try {
    const result = await callModel({ question: payload.question, locale: payload.locale, records }, env);
    const validIds = [...new Set(result.citationIds)].filter((id) => records.some((record) => record.id === id));
    const unsupported = result.unsupported || validIds.length === 0;
    const answer = unsupported && validIds.length === 0
      ? payload.locale === "zh-CN" ? "当前知识库不足以支持一个有依据的回答。" : "The current knowledge base does not support a grounded answer."
      : result.answer.slice(0, MAX_RESPONSE_LENGTH);
    const citations = validIds.map((id) => {
      const record = knowledgeById.get(id) as KnowledgeRecord;
      return { knowledgePointId: id, title: record.content[payload.locale].title, route: `/#/study/${id}` };
    });
    return json({ answer, citations, unsupported }, 200, origin);
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return json({ error: "model_not_configured" }, 503, origin);
    return json({ error: "model_request_failed" }, 502, origin);
  }
}

export default { fetch: handleRequest };
