# Angular 9 → React 18 migration manifest (CHAR-29)

The legacy Angular 9 app lives in `src/` and keeps working until cut-over. The React 18 + TypeScript + Vite
app is being built alongside it in `react/`, using [COG-GTM/react-hn](https://github.com/COG-GTM/react-hn) as the
target-stack reference. One component is ported per PR, each with a React Testing Library parity test.

## Target stack

| Concern | Angular app (`src/`) | React app (`react/`) |
| --- | --- | --- |
| Framework | Angular 9 | React 18 |
| Build | Angular CLI (ejected webpack) | Vite 5 |
| Routing | `@angular/router` (`app.routes.ts`) | React Router 6 |
| Styling | component SCSS + theme mixins | same SCSS partials, imported per component |
| Tests | Karma + Jasmine | Vitest + React Testing Library |
| Lint | TSLint | ESLint 9 (flat config) + typescript-eslint |

Commands (run from `react/`): `npm run lint`, `npm run build`, `npm test`, `npm run dev`.

## Dependency order

```
foundation (models, API data layer, settings context, shared components, app shell + route table)
  ├── core/header ──── core/settings
  ├── core/footer
  ├── feeds/item ───── feeds/feed
  ├── item-details/comment ── item-details
  └── user
```

Everything past the foundation can be ported in parallel except `feeds/feed` (needs `feeds/item`),
`item-details` (needs `item-details/comment`) and `core/header` (renders `core/settings`).

## Manifest

Status: `pending` / `in progress` / `ported`.

| # | Angular source | React target | Depends on | Status | PR |
| --- | --- | --- | --- | --- | --- |
| 0 | `shared/models/*`, `shared/services/hackernews-api.service.ts`, `shared/services/settings.service.ts`, `shared/pipes/comment.pipe.ts`, `app.routes.ts` | `react/src/models`, `react/src/api`, `react/src/settings`, `react/src/utils`, `react/src/App.tsx` | — | ported | foundation |
| 1 | `shared/components/loader` | `react/src/components/shared/Loader.tsx` | 0 | ported | foundation |
| 2 | `shared/components/error-message` | `react/src/components/shared/ErrorMessage.tsx` | 0 | ported | foundation |
| 3 | `core/header` | `react/src/components/core/Header.tsx` | 0, 4 | pending | |
| 4 | `core/settings` | `react/src/components/core/Settings.tsx` | 0 | pending | |
| 5 | `core/footer` | `react/src/components/core/Footer.tsx` | 0 | pending | |
| 6 | `feeds/item` | `react/src/components/feeds/Item.tsx` | 0 | pending | |
| 7 | `feeds/feed` | `react/src/components/feeds/Feed.tsx` | 0, 6 | pending | |
| 8 | `item-details/comment` | `react/src/components/item-details/Comment.tsx` | 0 | pending | |
| 9 | `item-details` | `react/src/components/item-details/ItemDetails.tsx` | 0, 8 | pending | |
| 10 | `user` | `react/src/components/user/User.tsx` | 0 | ported | https://github.com/COG-GTM/angular2-hn/pull/PRNUM |
| 11 | app shell cut-over (drop `NotPorted` slots, wire real components, PWA/service worker) | `react/src/App.tsx`, `react/src/main.tsx` | 3–10 | pending | |

Unported components are rendered by `react/src/components/NotPorted.tsx`, a placeholder keyed by component
name. Each component PR replaces exactly one placeholder usage and flips one manifest row to `ported`.

## Route parity

| Route | Angular | React |
| --- | --- | --- |
| `/` | redirect to `/news/1` | redirect to `/news/1` |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | `FeedComponent` with `feedType` route data | `Feed` with the feed name from the path |
| `/item/:id` | lazy `ItemDetailsModule` | `ItemDetails` |
| `/user/:id` | lazy `UserModule` | `User` |

## Porting conventions

- Keep DOM structure and class names identical so the shared SCSS partials apply unchanged; copy the
  component SCSS into `react/src/components/<area>/<Name>.scss` and repoint the `@import`s to `react/src/styles`.
- Services become hooks or context: `HackerNewsAPIService` → `react/src/api` (`useFeed`, `useItem`, `useUser`),
  `SettingsService` → `SettingsProvider` / `useSettings`, pipes → plain functions in `react/src/utils`.
- The Angular app has no Jasmine specs, so "parity" tests assert the rendered output of the Angular
  template and the behaviour of its component class.
- Every PR must keep `npm run lint`, `npm run build` and `npm test` green in `react/`, and must not change `src/`.

## ROI log

| PR | Files touched | LOC ported | Human review points |
| --- | --- | --- | --- |
| user | 6 | ~130 | Angular's `:host >>> pre` scoped selector became `.profile pre` (React has no view encapsulation); `about` is still injected as raw HTML (`dangerouslySetInnerHTML`), same trust assumption as the Angular `[innerHTML]` binding; the Angular template has no submissions/comments links, so none were added. |
| foundation | 24 | ~600 | Poll fetching now resolves options in parallel and no longer mutates a shared story mid-stream; `Story.time_ago` retyped `number` → `string` to match the API; `User.crated_time` typo fixed to `created_time`; theme is read from `localStorage` on first render instead of a synthetic `MediaQueryListEvent`. |
