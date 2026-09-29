# Current Task

- ID: T015
- Title: Add unconfigured AI UI and secure Worker contract
- Acceptance: No credential is created or embedded; local search remains primary; the UI represents unconfigured/offline/401/429/timeout states; Worker auth, CORS, limits, grounding and citation validation are mock-tested.
- Verification: Worker contract tests for 401, 403, 400, 429, 503, unsupported answers and invalid citation removal plus repository secret scan.
- Intended file scope: AI settings/client, Cloudflare Worker source/config template, grounded knowledge bundle and contract tests.
