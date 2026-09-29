# Current Task

- ID: T014
- Title: Add PWA offline and update behavior
- Acceptance: A manifest and service worker precache the shell, generated knowledge, SVG and local assets; offline study/search/review/progress remain available after first load; update prompting never clears IndexedDB.
- Verification: production build generates PWA artifacts, service-worker tests confirm no learning-database deletion, and final Playwright QA exercises offline reload.
- Intended file scope: Vite PWA configuration, local app icons, registration/update UI, and focused tests.
