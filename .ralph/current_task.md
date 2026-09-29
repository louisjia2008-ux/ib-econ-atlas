# Current Task

- ID: T003
- Title: Define content contracts, manifest and validation pipeline
- Acceptance: Schemas cover localized content and quiz types; validation rejects wrong counts, missing locale pairs, and invalid references.
- Verification: `npm run content:validate`.
- Intended file scope: `src/types`, `content/manifest.yaml`, `scripts/validate-content.mjs`, and one representative content record.
