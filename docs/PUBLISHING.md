# Publishing

## Branch and review flow

1. Work on `codex/unit-1-mvp` or another `codex/` feature branch.
2. Run `npm ci` and `npm run verify` from a fresh clone.
3. Push the feature branch and open an unmerged PR.
4. Review the complete diff, content coverage report, CI results, narrow-screen evidence, and copyright boundary.
5. Merge only after the repository owner explicitly approves.

## GitHub Pages

The Vite base is `/ib-econ-atlas/` and all application routes use a hash. After `main` changes, `.github/workflows/pages.yml` runs the same verification gate, builds `dist/`, uploads the Pages artifact, and deploys it.

In repository settings, Pages must use **GitHub Actions** as its source. The expected public URL is:

```text
https://louisjia2008-ux.github.io/ib-econ-atlas/
```

Verify the deployed root, a hash study link, search, review, offline reload, 390px layout, and a fresh-clone build before calling the release public.

## Explicitly separate deployment

The Cloudflare Worker is not deployed by the Pages workflow. It requires separate authorisation, its own secrets, SQLite-backed Durable Object namespace, spending controls, and live acceptance. A Pages release must say “AI interface reserved; runtime not configured or verified” until those gates pass.
