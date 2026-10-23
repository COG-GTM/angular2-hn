# angular2-hn — React + TypeScript app

React 19 + TypeScript + Vite port of the original Angular 9 Hacker News PWA (removed from the repo after parity was
verified; see git history before the migration for the Angular source). Data comes from `https://node-hnapi.herokuapp.com`; user profiles come from
`https://api.hnpwa.com/v0/user/{id}.json` because node-hnapi's `/user/:id` returns 404.

## Run

Requires Node `^20.19 || >=22.12`. Run everything from `react-app/` (the root `package.json` only forwards scripts here).

```bash
cd react-app
npm install
npm run dev        # http://localhost:4200
npm run build      # tsc -b && vite build -> dist/ (with sw.js)
npm run preview    # serve dist/ on http://localhost:4173 (service worker active)
npm test           # vitest
npm run e2e        # Playwright: builds, serves with vite preview, runs e2e/ (npx playwright install chromium first)
npm run lint && npm run typecheck && npm run format:check
```

## Routes (`src/App.tsx`, same URLs as Angular's `app.routes.ts`)

| Path                                                                       | Renders                  |
| -------------------------------------------------------------------------- | ------------------------ |
| `/`                                                                        | redirect to `/news/1`    |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | `FeedPage feedType=...`  |
| `/item/:id`                                                                | `ItemDetailsPage` (lazy) |
| `/user/:id`                                                                | `UserPage` (lazy)        |

## Layout

| Path                              | Contents                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/types/`                      | `Story`, `User`, `Comment`, `Settings`, `PollResult`, `FeedType`                              |
| `src/services/`                   | `fetchFeed`, `fetchItemContent`, `fetchPollContent`, `fetchUser` (fetch + AbortSignal)        |
| `src/context/SettingsContext.tsx` | `SettingsProvider`, `useSettings()` (localStorage + `prefers-color-scheme`)                   |
| `src/hooks/useFetch.ts`           | `useFetch(fetcher, key)` -> `loading` (+ `stale`) / `success` / `error`, aborts on key change |
| `src/utils/`                      | `formatCommentCount`, `externalHref`, `sanitizeHtml`, `useScrollToTop`, `usePageViews`        |
| `src/styles/`                     | Angular `shared/scss` partials + global styles + app layout                                   |
| `src/components/`                 | `Header`, `Footer`, `Settings`, `Loader`, `ErrorMessage`                                      |
| `src/pages/feeds/`                | `FeedPage`, `Item`                                                                            |
| `src/pages/item/`                 | `ItemDetailsPage`, recursive `Comment`                                                        |
| `src/pages/user/`                 | `UserPage`                                                                                    |
| `src/pwa/`, `vite.config.ts`      | Workbox via `vite-plugin-pwa`                                                                 |
| `src/test/`                       | `renderWithProviders`, `mockFetch`, `mockMatchMedia`, setup                                   |
| `e2e/`, `playwright.config.ts`    | Playwright specs (routes, settings, PWA/offline) against the production build                 |

Each folder keeps its exports in its `index.ts` (`App.tsx` imports from the barrels). Port each component's SCSS next to it and
`@import '../../styles/theme_variables'` etc. as needed. Theme classes (`default`, `night`, `amoledblack`) are applied on
the root layout `div`, exactly as in Angular's `app.component.html`.

Conventions:

- Render API HTML with `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}` (React does not sanitize).
- Use `externalHref(url)` for story links: non-null means external link, else link to `/item/:id`.
- Pages call `useScrollToTop(key)` and `useFetch(...)`; `isAbortError` is handled inside `useFetch`.
- Tests are colocated `*.test.tsx`, using `renderWithProviders` and `mockFetch` from `src/test`.

## Deployment

`firebase.json` at the repo root serves `react-app/dist` (SPA rewrite for route URLs, long-lived caching for hashed
assets, `no-cache` for `index.html`, `sw.js`, `ngsw-worker.js` and the manifest). `public/ngsw-worker.js` unregisters
the old Angular service worker for returning visitors. `.github/workflows/react-app-deploy.yml` deploys on pushes to
`master` when a Firebase secret is configured.
