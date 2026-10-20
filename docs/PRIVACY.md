# Privacy and local data

IB Econ Atlas does not require an account and does not include a project-operated cloud database.

## Stored in IndexedDB

- progress state and FSRS snapshot by stable knowledge-point ID;
- practice attempts and final manual-override state;
- interface language, course-level filter, AI-enabled flag, optional Worker endpoint, and last backup date.

## Stored in sessionStorage

- the temporary exam-scope knowledge-point IDs.

This scope disappears with the browser session and is deliberately excluded from exported backups.

## Workshop drafts in localStorage

Drawing elements, written answers, comparison state and self-review checklists use `atlas-workshop-v1:<knowledge-point-id>`. They stay in this browser and are not sent to a model or a server. Drafts are deliberately disclosed as separate from the progress JSON backup. They survive reload and language changes. The confirmed “Clear learning data” action also removes this prefix, leaving unrelated browser storage alone.

## Stored separately on the device

- the optional Worker owner access token.

The token is never exported, placed in a URL, sent to GitHub Pages, logged by application code, or embedded in an error message. It is sent only in the `Authorization` header to the configured Worker.

## Backup behavior

Backups use the filename `ib-econ-atlas-backup-YYYY-MM-DD.json`. Import validates the entire document before opening a write transaction. Merge keeps the progress record with the newest `updatedAt`; replace requires a second confirmation. Unknown future fields and records for removed knowledge points survive round trips but do not appear as active progress.

## Service Worker

The service worker caches static files needed for offline study. Cache updates and IndexedDB are independent; generated-worker inspection rejects any database-deletion code.
