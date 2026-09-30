# Angular 9 → React + TypeScript migration

The Hacker News PWA in `src/` (Angular 9.0.1) has been ported to React 18 + TypeScript (strict) + Vite 6 +
React Router 6 in `react/`. The goal was parity: same routes, same data, same markup/class names, the same
three themes and the same settings, verified by pixel-diffing the two apps on identical fixture data.

## Structure

| Angular | React |
|---|---|
| `app.routes.ts` (feeds `:page`, lazy `item`/`user`, redirect `news/1`) | `react/src/routes.tsx` (same paths; `item/:id` and `user/:id` are lazy route modules) |
| `shared/services/hackernews-api.service.ts` (RxJS) | `react/src/api/hackernews.ts` implementing `HackerNewsApi` (`api/types.ts`) with fetch + `AbortSignal`; same endpoints, `PAGE_SIZE = 30`, poll-option aggregation |
| `lazyFetch` unsubscribe semantics | `react/src/hooks/useAsync.ts` (aborts the in-flight request on param change/unmount) |
| `feeds/feed`, `feeds/item` | `pages/FeedPage.tsx`, `components/feed/FeedItem.tsx` |
| `item-details`, `item-details/comment` | `pages/ItemPage.tsx`, `components/item/{ItemDetails,Comment}.tsx` (recursive, `[-]`/`[+]` collapse, deleted comments) |
| `user` | `pages/UserPage.tsx` |
| `SettingsService` | `settings/SettingsProvider.tsx` + `useSettings()`; same localStorage keys (`theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`) and `prefers-color-scheme: dark` → `night` fallback |
| `core/{header,footer,settings}` | `components/layout/{Header,Footer,SettingsPanel}.tsx` |
| `shared/scss/_themes.scss`, `styles.scss`, component SCSS | `styles/_themes.scss` (`@use`/`sass:color`), `styles/global.scss`, one `.scss` per component nested under its `.app-<selector>` host class |
| `comment` pipe, loader, error-message | `utils/commentLabel.ts`, `components/shared/{Loader,ErrorMessage}.tsx` |

Markup/theming conventions and the file-ownership map used to parallelise the work are in
`react/CONVENTIONS.md`.

## Verification

**Visual (e2e-visual/):** Playwright serves every `node-hnapi.herokuapp.com` request from recorded fixtures, so
both apps render identical data. The same 48 states were captured from the Angular app (`reference-screenshots/`)
and from the React production build:

- routes `news/1`, `newest/1`, `show/1`, `ask/1`, `jobs/1`, `item/49887343` (28 nested comments), `user/laurenth`,
  and the settings popup open over `news/1`
- × themes Default, Night, Black (AMOLED)
- × viewports desktop 1280×800 and mobile 390×844 (full-page screenshots)

Result: **48/48 within the 1% threshold**. Every screenshot has identical dimensions to its reference and the
largest difference is 0.007% of pixels (sub-pixel text anti-aliasing on the item page); 18 shots are pixel-identical.

**Interactions (`e2e-visual/interactions.mjs`), 10/10 passing on both apps:**
root redirect → `/news/1`; More → `/news/2` (list starts at 31) and Prev back; header nav to new/show/ask/jobs
(jobs notice shown); feed → comments (nested tree); collapse/expand a comment; item → user profile; settings
theme switch to Night, Black and Default with `localStorage.theme` persisted across reload; open-links-in-new-tab
sets `target="_blank"` and persists.

**Unit tests:** `cd react && npm test` (Vitest + Testing Library; routes, data service incl. polls, feed
pagination/jobs, feed item, recursive comments/collapse/deleted, user page, settings persistence, header,
settings panel, footer).

## Intentional differences

- **Not ported:** service worker (Workbox / `ngsw-config.json`) and offline support, Protractor e2e and Karma
  unit tests (replaced by Vitest + the Playwright visual/interaction harness), Google Analytics pageview
  tracking, Firebase hosting config. `manifest.json` and icons are kept.
- When the page number or item id changes on the same route, React shows the loader until the new data arrives;
  Angular kept the previous content on screen until then.
- The data service throws on non-2xx responses, which surfaces the existing error message; Angular did not
  check the status.
- An invalid saved `openLinkInNewTab` value falls back to `false` instead of throwing, and the
  `prefers-color-scheme` listener is actually removed on unmount.
- The theme radios react to `change` instead of `click`, so re-clicking the selected theme does not re-save it.
- Two Angular styles that never applied (`:host >>> a` in comment text and `pre` on the user page; they compile
  to an invalid selector in the Angular build) were not ported, matching what Angular rendered.
- The live node-hnapi `/user/:id` endpoint currently returns 404, so user pages show the error state against the
  live API in both apps; the visual fixture for `user/laurenth` was recorded from api.hnpwa.com (same schema).

## Running both apps

```bash
# Angular 9 (reference) — Node 14
nvm use 14 && npm install && npx ng serve          # http://localhost:4200

# React — Node 20
cd react && nvm use 20 && npm install
npm run dev                                         # http://localhost:5173
npm run lint && npm run typecheck && npm test && npm run build
npm run preview                                     # production build on http://localhost:4173

# Visual + interaction verification (Node 20, with both apps running)
cd e2e-visual && npm install && npx playwright install chromium
node capture.mjs --base-url http://localhost:4173 --out ../react-screenshots
node diff.mjs --ref ../reference-screenshots --actual ../react-screenshots --out ../screenshot-diffs
node interactions.mjs --base-url http://localhost:4173
```
