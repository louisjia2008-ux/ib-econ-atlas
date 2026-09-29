import type { AskRequest, AskResponse } from "../../types/ai";

export type AiFailure = "unconfigured" | "offline" | "unauthorized" | "limited" | "timeout" | "model" | "invalid-response";

export class AiRequestError extends Error {
  constructor(public readonly kind: AiFailure, message: string) {
    super(message);
    this.name = "AiRequestError";
  }
}

function isAskResponse(value: unknown): value is AskResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<AskResponse>;
  return typeof response.answer === "string"
    && typeof response.unsupported === "boolean"
    && Array.isArray(response.citations)
    && response.citations.every((citation) => citation
      && typeof citation.knowledgePointId === "string"
      && typeof citation.title === "string"
      && typeof citation.route === "string");
}

export async function askAtlas(endpoint: string, token: string, payload: AskRequest, options: { online?: boolean; timeoutMs?: number } = {}): Promise<AskResponse> {
  if (!endpoint.trim() || !token.trim()) throw new AiRequestError("unconfigured", "AI is not configured on this device.");
  if (options.online === false || (options.online === undefined && !navigator.onLine)) throw new AiRequestError("offline", "AI is unavailable while offline; local search remains available.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  let response: Response;
  try {
    response = await fetch(`${endpoint.replace(/\/+$/, "")}/ask`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new AiRequestError("timeout", "The AI request timed out.");
    throw new AiRequestError("model", "The AI Worker could not be reached.");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 || response.status === 403) throw new AiRequestError("unauthorized", "The owner access token was rejected.");
  if (response.status === 429) throw new AiRequestError("limited", "The daily AI limit has been reached.");
  if (response.status === 503) throw new AiRequestError("unconfigured", "The AI model is not configured on the Worker.");
  if (!response.ok) throw new AiRequestError("model", `The AI Worker returned ${response.status}.`);
  const value: unknown = await response.json();
  if (!isAskResponse(value)) throw new AiRequestError("invalid-response", "The AI Worker returned an invalid response.");
  return value;
}
