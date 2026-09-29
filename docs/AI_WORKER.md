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

Copy `worker/wrangler.toml.example` to an untracked `worker/wrangler.toml`, create the KV namespace, and configure variables. Add secrets only through Wrangler's secret command or the Cloudflare dashboard:

```text
OPENAI_API_KEY
OWNER_ACCESS_TOKEN
```

Do not paste either value into source files, `.env.example`, GitHub variables visible to the frontend, command-line URLs, screenshots, issues, or logs.

## Security behavior

- exact CORS allowlist plus local development origins;
- SHA-256 digest comparison across all bytes for the owner token;
- question, candidate-count, content-length, and output-length limits;
- KV daily counter keyed by date and token hash;
- `store: false` on the Responses API request;
- 401, 403, 400, 429, 503, 502, timeout, and offline states represented without losing local results;
- no runtime Service Worker cache route for `/ask`.

The repository tests the contract with a mocked model. That evidence does **not** prove the configured model, Cloudflare deployment, quota, latency, or live grounded-answer quality. Keep the UI marked unconfigured until a separately authorised live acceptance run passes.
