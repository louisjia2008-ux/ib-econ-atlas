# Security Policy

## Supported version

The latest commit on `main` is the supported open-source version. The optional AI Worker is disabled until a maintainer deploys and configures it separately.

## Reporting a vulnerability

Do not open a public issue containing credentials, access tokens, private Worker URLs, personal learning backups, or a working exploit against a deployed instance. Contact the repository owner privately through the GitHub security-reporting channel when it is available.

Useful reports identify the affected route or module, expected security property, reproduction conditions, and whether the issue concerns the static PWA, local learning data, import validation, service worker, or optional Worker.

## Security properties

- OpenAI API keys exist only as Worker secrets, never in the frontend bundle.
- Owner access tokens are never placed in URLs, analytics, backup files, repository files, or error text.
- The Worker accepts only configured origins, validates a constant-time token digest, limits request size and daily usage, and rehydrates context from its own knowledge bundle.
- Imported backups are validated completely before a transaction mutates IndexedDB.
- Service Worker updates must not delete IndexedDB learning records.
- Source coursebook PDFs and scans are forbidden in the Git index.

See [docs/AI_WORKER.md](docs/AI_WORKER.md) and [docs/PRIVACY.md](docs/PRIVACY.md) for architecture details.
