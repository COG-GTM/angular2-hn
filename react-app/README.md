# angular2-hn — React + TypeScript port

React 19 + TypeScript + Vite port of the Angular 9 Hacker News PWA in `../src` (left in place for reference until the
migration is verified). Data comes from `https://node-hnapi.herokuapp.com`; user profiles come from
`https://api.hnpwa.com/v0/user/{id}.json` because node-hnapi's `/user/:id` returns 404.

## Run

Requires Node `^20.19 || >=22.12`. Run everything from `react-app/` (a root `npm install` rewrites the Angular `yarn.lock`).

```bash
cd react-app
npm install
npm run dev        # http://localhost:4200
npm run build      # tsc -b && vite build -> dist/ (with sw.js)
npm run preview    # serve dist/ on http://localhost:4173 (service worker active)
npm test           # vitest
npm run lint && npm run typecheck && npm run format:check
```

## Routes (`src/App.tsx`, mirrors `src/app/app.routes.ts`)

| Path                                                                       | Renders                  |
| -------------------------------------------------------------------------- | ------------------------ |
| `/`                                                                        | redirect to `/news/1`    |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | `FeedPage feedType=...`  |
| `/item/:id`                                                                | `ItemDetailsPage` (lazy) |
| `/user/:id`                                                                | `UserPage` (lazy)        |

## Layout and ownership

| Path                              | Contents                                                                                      | Owner                    |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| `src/types/`                      | `Story`, `User`, `Comment`, `Settings`, `PollResult`, `FeedType`                              | Phase 1 (shared, frozen) |
| `src/api/`                        | `fetchFeed`, `fetchItemContent`, `fetchPollContent`, `fetchUser` (fetch + AbortSignal)        | Phase 1 (shared, frozen) |
| `src/context/SettingsContext.tsx` | `SettingsProvider`, `useSettings()`                                                           | Phase 1 (shared, frozen) |
| `src/hooks/useFetch.ts`           | `useFetch(fetcher, key)` -> `loading` (+ `stale`) / `success` / `error`, aborts on key change | Phase 1 (shared, frozen) |
| `src/utils/`                      | `formatCommentCount`, `externalHref`, `sanitizeHtml`, `useScrollToTop`, `usePageViews`        | Phase 1 (shared, frozen) |
| `src/styles/`                     | Angular `shared/scss` partials + global styles + app layout                                   | Phase 1 (shared, frozen) |
| `src/pwa/`, `vite.config.ts`      | Workbox via `vite-plugin-pwa`                                                                 | Phase 1 (shared, frozen) |
| `src/test/`                       | `renderWithProviders`, `mockFetch`, `mockMatchMedia`, setup                                   | Phase 1 (shared, frozen) |
| `src/features/feeds/`             | `FeedPage`, `Item`                                                                            | Phase 2                  |
| `src/features/item/`              | `ItemDetailsPage`, recursive `Comment`                                                        | Phase 3                  |
| `src/features/user/`              | `UserPage`                                                                                    | Phase 4                  |
| `src/components/`                 | `Header`, `Footer`, `Settings`, `Loader`, `ErrorMessage`                                      | Phase 5                  |

All phases are integrated. Each folder keeps its exports in its `index.ts` (`App.tsx` imports from the barrels). Port each component's SCSS next to it and
`@import '../../styles/theme_variables'` etc. as needed. Theme classes (`default`, `night`, `amoledblack`) are applied on
the root layout `div`, exactly as in Angular's `app.component.html`.

Conventions:

- Render API HTML with `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}` (React does not sanitize).
- Use `externalHref(url)` for story links: non-null means external link, else link to `/item/:id`.
- Pages call `useScrollToTop(key)` and `useFetch(...)`; `isAbortError` is handled inside `useFetch`.
- Tests are colocated `*.test.tsx`, using `renderWithProviders` and `mockFetch` from `src/test`.

## Deployment

`firebase.json` at the repo root still serves the Angular build (`hosting.public: "dist"`). This app builds to
`react-app/dist/`. To ship the React app, point `hosting.public` at `react-app/dist` (keep the `**` -> `/index.html`
rewrite) once parity is signed off. Also add a `Cache-Control: no-cache` header for `/ngsw-worker.js` and `/sw.js`: `public/ngsw-worker.js` unregisters the old Angular service worker for returning
visitors.
