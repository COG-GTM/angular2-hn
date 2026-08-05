---
name: testing-react-hn-app
description: Test the React (Vite) Hacker News PWA in react/ end-to-end. Use when verifying feed, item/comments, settings/theming, user pages, or responsive/mobile changes in this repo.
---

# Testing the React HN app (react/)

## Setup
- App lives in `react/` (the legacy Angular 9 source is preserved in `src/` as reference — do not delete it).
- Install and run: `cd react && npm install && npm run dev` → http://localhost:5173.
- Backend is the real public API `https://node-hnapi.herokuapp.com` — no credentials needed.

## Commands
- Unit tests: `npm test` (Vitest, jsdom via `// @vitest-environment jsdom` per file).
- E2E: `npm run e2e` (Playwright, builds + serves preview on :4173 automatically).
- Lint/typecheck/build: `npm run lint`, `npm run typecheck`, `npm run build` (build must emit `dist/sw.js` for PWA).

## Golden-path checks
1. `/` redirects to `/news/1`; ordered list of 30 stories starting at 1.
2. Header nav: new/show/ask/jobs; "More ›" → next page, numbering continues at `((page-1)*30)+1`; "‹ Prev" appears on page 2+.
3. Item page `/item/:id`: nested comments; `[-]` collapses subtree, `[+]` restores.
4. Settings cog: themes Default/Night/Black (AMOLED), font size, list spacing — all persist in localStorage across reload.
5. Mobile (~390px width): compact `subtext-palm` feed rows; item page shows fixed back header.

## Gotchas / likely failure modes
- **Upstream `/user/:id` may be down** (returned 404 as of 2026-07). If user pages show the skull error state, verify with `curl -s -o /dev/null -w "%{http_code}" https://node-hnapi.herokuapp.com/user/hhh` before blaming the app. E2E test accepts either profile or error state for this reason.
- **Global SCSS collisions**: Angular's ViewEncapsulation was lost in the port, so page SCSS must stay scoped (`.item-page`, `.user-page` wrappers). If mobile feed rows show huge gaps, suspect an unscoped `.item`/`.item-header` rule leaking from a page stylesheet.
- **HTML from the API must be sanitized**: all `dangerouslySetInnerHTML` uses must go through `sanitizeHtml` (`react/src/utils/sanitize.ts`, DOMPurify). New HTML-rendering code should reuse it.
- Vitest picks up files by `src/**/*.{test,spec}.{ts,tsx}` (configured in `vite.config.ts` `test.include`) — keep Playwright specs in `e2e/` out of that glob.
- For mobile testing, resize the Chrome window (e.g. `wmctrl -r :ACTIVE: -e 0,100,0,400,780`) rather than devtools emulation.
- Probing live CSS/DOM: connect Playwright over CDP (`http://localhost:29229`) from a script placed inside `react/` so `@playwright/test` resolves.

## Devin Secrets Needed
None — public API and local dev only.
