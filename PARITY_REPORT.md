# React ↔ Angular Parity Report

This repo now contains two implementations of the same Hacker News PWA:

- **Angular 9** — original app under `src/` (unchanged behavior, still deployable).
- **React 18 + Vite** — port under `react/`.

Both are driven by the **same recorded API fixtures** in `fixtures/` so their output
can be compared deterministically. Angular remains in place; nothing was deleted.

## How parity is verified

| Layer | Tooling | Location | Result |
|-------|---------|----------|--------|
| Angular unit | Jasmine + Karma (headless Chrome) | `src/**/*.spec.ts` | 33 passing |
| React unit | Vitest + Testing Library + MSW | `react/tests/unit/` | 41 passing |
| Cross-implementation | Playwright (both apps, one browser context, shared fixture interception) | `react/tests/e2e/parity.spec.ts` | 13 passing |

Both unit suites assert the **same rendered text / DOM / class names** against the
same fixtures. The Playwright suite loads the pre-built Angular and React bundles
side by side, intercepts every `node-hnapi.herokuapp.com` request with the shared
fixtures (`fixtures/resolve.ts`), and compares normalized output.

### Run everything

```bash
# from repo root (Angular needs the legacy OpenSSL provider on Node 17+,
# and a headless Chrome via CHROME_BIN for Karma)
export NODE_OPTIONS=--openssl-legacy-provider
export CHROME_BIN=$(which google-chrome || which chromium)
npm install                 # Angular deps
npm install --prefix react  # React deps
npm run test:all            # angular unit -> react unit -> build both -> playwright parity
```

Individual suites: `npm run test:angular`, `npm run test:react`, `npm run test:parity`.

## What is compared

Playwright probes the following on **both** apps and asserts equivalence:

- Normalized visible text (`innerText`, whitespace collapsed).
- Post count (`li.post`) and ordered-list `start` attribute (pagination offset).
- `More ›` / `‹ Prev` presence (More only when a page returns exactly 30 items).
- Poll bar widths (`.pollBar` inline `width`, incl. the vote-summation total).
- Rendered comment count (`.comment-text`), nested + deleted comments.
- Theme wrapper class on the outer app div.
- Error-state text (`.error-section .strong`).
- Comment collapse hides nested subtree text.
- Theme switch adds the `night` class and persists to `localStorage`.

Routes covered: `/news/1`, `/news/2`, `/newest/1`, `/show/1`, `/ask/1`, `/jobs/1`,
`/item/:id` (external link, poll, nested/deleted comments), `/user/:id`, and a
non-existent feed page for the error state.

Unit tests additionally cover: `fetchFeed`/`fetchItemContent` (incl. poll expansion
and `poll_votes_count` summation)/`fetchPollContent`/`fetchUser`, the comment pipe
(`discuss` / `N comment(s)`), settings persistence (theme, font, spacing,
open-in-new-tab, `prefers-color-scheme`), and per-component rendering.

## DOM normalization

Framework-specific markup is normalized before comparison:

- Angular emits component host tags (`<item>`, `<app-comment>`, `<app-loader>`,
  `<app-error-message>`) and `_ngcontent-*` / `ng-*` attributes; React emits plain
  elements. Comparison is therefore done on **class-scoped selectors and visible
  text**, not raw outerHTML, and whitespace is collapsed via a shared `normalize()`.
- The React port intentionally reuses the Angular class names (`.wrapper`,
  `.item-block`, `.subtext`, `.pollBar`, `.comment-tree`, `.error-section`, …) so
  the same selectors resolve in both apps.

## Intentional / unavoidable differences

- **Host elements:** React renders semantic elements where Angular renders custom
  component selectors. Not observable to users; handled by normalization.
- **Async model:** React uses `fetch` + custom promise hooks instead of RxJS
  `Observable`s. Poll options are fetched with `Promise.all`; Angular subscribes
  per option. End state (summed `poll_votes_count`, rendered bars) is identical.
- **`feedType !== 'new'` guard:** faithfully ported from Angular
  (`feed.component.html`). The literal is `'new'` while the router feed type is
  `'newest'`, so the list always renders in both apps — preserved for parity.
- **All-zero poll:** `points / poll_votes_count` yields `NaN%` when every option
  has 0 votes. This matches Angular's identical expression exactly and is not hit
  by any real/rendered poll; preserved for parity rather than diverging.
- **`Story.time_ago` / `User.crated_time` / `FeedType`:** type shapes mirror the
  Angular models verbatim (including the original `crated_time` typo and the narrow
  `FeedType` union) so the port stays a faithful 1:1 translation.
- **HTML sanitization:** Angular's `[innerHTML]` auto-sanitizes via `DomSanitizer`.
  The React port reproduces this with DOMPurify (`sanitizeHtml`) so `dangerouslySetInnerHTML`
  is not an XSS regression; safe fixture markup renders identically in both.
