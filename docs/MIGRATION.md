# Angular 9 → React 18 migration manifest

Tracking ticket: [CHAR-30](https://cog-gtm.atlassian.net/browse/CHAR-30)

The Angular app under `src/` keeps working and shipping until cut-over. The React 18 +
TypeScript + Vite app lives beside it under `react/`, using
[COG-GTM/react-hn](https://github.com/COG-GTM/react-hn) as the target-stack reference.
Each component below is ported in its own PR against `main`, branch
`devin/<timestamp>-react-<component>`, and every PR must keep `npm run lint`, `npm run build`
and the tests green for both apps.

## Target stack

| Concern | Angular app (`src/`) | React app (`react/`) |
| --- | --- | --- |
| Framework | Angular 9, RxJS 6 | React 18, hooks |
| Build | Angular CLI (webpack) | Vite 6 |
| Routing | `@angular/router`, lazy modules | `react-router-dom` 6 route objects |
| Data access | `HackerNewsAPIService` (Observables) | `src/api` client + `useFeed` / `useItem` / `useUser` |
| Styling | component SCSS + `shared/scss` themes | component SCSS (same variables, ported per component) |
| Tests | Karma + Jasmine | Vitest + React Testing Library |

## Dependency order

Waves can run in parallel internally; a wave starts only once the wave above it has landed.

1. **Wave 0 — foundation (this PR):** `react/` scaffold, typed API data layer, route table,
   placeholder pages, test harness.
2. **Wave 1 — leaves, no app dependencies:** `shared/loader`, `shared/error-message`,
   `core/footer`, and the `comment` pipe helper (folded into `feeds/item`).
3. **Wave 2 — depend on wave 1 and on settings state:** `core/settings` (settings store +
   panel), `core/header`, `feeds/item`, `item-details/comment`.
4. **Wave 3 — page-level, depend on wave 2:** `feeds/feed`, `item-details`, `user`.
5. **Wave 4 — cut-over prep:** `app shell + routing` (replaces the placeholder shell and
   pages with the ported components and the real theme/settings wiring).

## Component manifest

Status values: `pending` / `in progress` / `ported`.

| # | Component | Angular source | React target | Depends on | Status | PR |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | API data layer | `src/app/shared/services/hackernews-api.service.ts`, `src/app/shared/models/*` | `react/src/api/*` | — | ported | this PR |
| 1 | shared/loader | `src/app/shared/components/loader/*` | `react/src/components/Loader` | 0 | pending | |
| 2 | shared/error-message | `src/app/shared/components/error-message/*` | `react/src/components/ErrorMessage` | 0 | ported | [PR](https://github.com/COG-GTM/angular2-hn/pull/PRNUM) |
| 3 | core/footer | `src/app/core/footer/*` | `react/src/components/Footer` | 0 | pending | |
| 4 | core/settings | `src/app/core/settings/*`, `src/app/shared/services/settings.service.ts` | `react/src/settings/*` | 0 | pending | |
| 5 | core/header | `src/app/core/header/*` | `react/src/components/Header` | 4 | pending | |
| 6 | feeds/item | `src/app/feeds/item/*`, `src/app/shared/pipes/comment.pipe.ts` | `react/src/components/Item` | 4 | pending | |
| 7 | item-details/comment | `src/app/item-details/comment/*` | `react/src/components/Comment` | 4 | pending | |
| 8 | feeds/feed | `src/app/feeds/feed/*` | `react/src/pages/FeedPage` | 1, 2, 6 | pending | |
| 9 | item-details | `src/app/item-details/item-details.component.*` | `react/src/pages/ItemDetailsPage` | 1, 2, 7 | pending | |
| 10 | user | `src/app/user/*` | `react/src/pages/UserPage` | 1, 2 | pending | |
| 11 | app shell + routing | `src/app/app.component.*`, `src/app/app.routes.ts` | `react/src/AppShell.tsx`, `react/src/routes.tsx` | 3, 5, 8, 9, 10 | pending | |

## Parity rules for each component PR

- Port the Angular template markup and SCSS as-is; do not redesign. Keep class names so the
  ported `shared/scss` theme variables apply unchanged.
- Add a React Testing Library test asserting the same rendered output/behaviour as the
  corresponding Angular component (the Angular app ships no `.spec.ts` files, so parity is
  asserted against the component template and class logic, not against an existing spec).
- Replace the matching placeholder in `react/src/pages` or `react/src/AppShell.tsx` rather
  than adding a parallel implementation.
- Link the PR back to CHAR-30, update the row above (status + PR link) and append an ROI note.
- Do not delete Angular code; removal happens at cut-over, after wave 4.

## Route parity

| Route | Angular | React |
| --- | --- | --- |
| `/` | redirect to `/news/1` | redirect to `/news/1` |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | `FeedComponent` with `feedType` route data | `FeedPage` with a `feedType` prop |
| `/item/:id` | lazy `ItemDetailsModule` | `ItemDetailsPage` |
| `/user/:id` | lazy `UserModule` | `UserPage` |

Rank numbering across pages uses the same offset as Angular's `listStart`:
`(page - 1) * 30 + 1`, exposed by `listStartForPage` and by `useFeed`.

## API parity

Same host (`https://node-hnapi.herokuapp.com`) and same endpoints as the Angular service:
`/{feedType}?page={n}`, `/item/{id}`, `/user/{id}`. Polls resolve their options from the
consecutive item ids following the poll id and total their points, matching
`fetchItemContent`. Cancellation uses `AbortController` where Angular used the
`lazyFetch` cancel token. Error copy is identical: `Could not load {feedType} stories.`,
`Could not load item comments.`, `Could not load user {id}.`

## ROI log

| PR | Files touched | LOC ported | Human review points |
| --- | --- | --- | --- |
| Wave 0 — scaffold + data layer | 22 | ~430 | API host/endpoint parity, poll option fan-out, route table shape, test harness config |
| Wave 1 — shared/error-message | 6 | ~140 | SCSS reuse of the Angular `shared/scss` partials via relative `@import`, optional `message` prop parity, `vite`/`vitest` dependency dedupe needed to unbreak `npm run build` |
