# Optional AI Worker

Atlas AI is an optional self-hosted boundary. The public static site has no OpenAI key and remains fully useful without the Worker.

## Request boundary

1. The browser performs local bilingual search.
2. It sends only `question`, `locale`, and at most 12 candidate knowledge-point IDs.
3. The Worker ignores any client-authored content and loads those IDs from `worker/generated/knowledge.json`.
4. The model is instructed to use only that trusted context and return structured citation IDs.
5. The Worker removes citations outside the candidate set. A response with no valid support becomes `unsupported: true`.

No coursebook PDF, progress record, answer history, or arbitrary user context is sent.

## Required bindings

Copy `worker/wrangler.toml.example` to an untracked `worker/wrangler.toml`, keep the `DailyAiQuota` Durable Object binding and SQLite migration, and configure variables. Add secrets only through Wrangler's secret command or the Cloudflare dashboard:

```text
OPENAI_API_KEY
OWNER_ACCESS_TOKEN
```

Do not paste either value into source files, `.env.example`, GitHub variables visible to the frontend, command-line URLs, screenshots, issues, or logs.

## Security behavior

- exact CORS allowlist plus local development origins;
- SHA-256 digest comparison across all bytes for the owner token;
- question, candidate-count, content-length, and output-length limits;
- atomic daily reservations in a SQLite-backed Durable Object, named only by the token hash;
- fail-closed 503 behavior if the quota binding, configured positive-integer limit, or durable storage is unavailable;
- `store: false` on the Responses API request;
- 401, 403, 400, 429, 503, 502, timeout, and offline states represented without losing local results;
- no runtime Service Worker cache route for `/ask`.

The repository tests the contract with a mocked model. That evidence does **not** prove the configured model, Cloudflare deployment, quota, latency, or live grounded-answer quality. Keep the UI marked unconfigured until a separately authorised live acceptance run passes.


## Daily quota guarantees

`AI_RATE_LIMIT` is a Durable Object namespace, **not a Workers KV namespace**. The
example configuration binds `DailyAiQuota` and creates its SQLite storage with the
`v1` migration. The Worker and the named class are deployed together; no namespace
ID or client-side secret is needed. This is configuration guidance only, not
authorisation to deploy or create credentials.

Every authenticated request with supported knowledge must reserve a slot in a
storage transaction before the model is called. All Worker isolates share the
same object for one hashed owner token; JavaScript process-local locks and
Workers KV read-modify-write are insufficient for this boundary. The object
retains one daily counter across restarts and replaces it at midnight UTC.
The raw owner token, question, and study content never enter quota storage.

`AI_DAILY_LIMIT` defaults to 100 and must be a positive safe integer. It limits
model-call attempts, not currency or token spend. Reservations are not refunded
when the model fails or times out because the upstream request may already have
incurred a charge. Unsupported candidate IDs return a local fallback without
consuming a slot. Missing, broken, or unexpected quota responses fail closed
before any model call. Token rotation creates a separate counter; changing
credentials or limits remains an owner-controlled deployment operation.

The contract tests cover concurrent requests, recreated object instances, UTC
rollover, quota exhaustion, and configuration/storage failure without real model
calls. Cloudflare's [Durable Object storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
provides transactional, strongly consistent storage; see also the
[namespace API](https://developers.cloudflare.com/durable-objects/api/namespace/).
