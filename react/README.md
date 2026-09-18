# angular2-hn — React + TypeScript migration

A React (Vite + TypeScript + `react-router-dom`) port of the Angular Hacker News PWA that lives in `../src`.
The Angular app stays intact and untouched until this port reaches parity.

## Getting started

```bash
cd react
npm install
npm run dev        # dev server
npm run build      # type-check + production build (dist/)
npm run preview    # serve the production build
```

## Structure

```
react/
├── e2e/                      Playwright specs
│   ├── fixtures/             JSON fixtures (feed, story, poll, user)
│   ├── support/mockApi.ts    page.route() helper mapping the HN API to fixtures
│   └── *.spec.ts
├── src/
│   ├── api/hackernews.ts     data layer (fetch + AbortController), replaces HackerNewsAPIService
│   ├── components/           Item, Loader, ErrorMessage, Comment, layout/ (Header, Footer, Settings)
│   ├── context/SettingsContext.tsx   replaces SettingsService (localStorage + prefers-color-scheme)
│   ├── models/               ported interfaces from src/app/shared/models
│   ├── pages/                Feed, ItemDetails, User
│   ├── styles/               ported SCSS themes + globals
│   ├── test/setup.ts         Vitest setup (jest-dom, localStorage, matchMedia, fetch mocks)
│   ├── utils/                formatCommentCount (replaces CommentPipe)
│   ├── App.tsx               themed wrapper + routes
│   └── main.tsx              providers + router bootstrap
├── playwright.config.ts
└── vitest.config.ts
```

Routing mirrors `src/app/app.routes.ts`: `/` redirects to `/news/1`, feeds are `/:feedType/:page` for
`news | newest | show | ask | jobs`, and `/item/:id` and `/user/:id` are `React.lazy` routes.

## Testing

```bash
npm run test            # unit tests (Vitest)
npm run test:coverage   # unit tests + v8 coverage, 80% gate
npx playwright install  # once, to download browsers
npm run e2e             # Playwright specs against the production build
npm run e2e:report      # open the last HTML report
```

Vitest coverage thresholds are 80% for lines/functions/branches/statements. The coverage `include`
list is scoped to the directories that have been migrated so far and is widened by each phase;
Phase 5 flips it to all of `src/`. E2E specs assert user-visible behaviour and are not counted
toward the unit coverage number.

## Migration phases and directory ownership

The migration ships as five PRs. Phase 1 (this foundation) lands first; Phases 2–5 then run in
parallel as separate child sessions, each owning a disjoint set of files so the PRs do not conflict.

| Phase | Session | Owns |
| --- | --- | --- |
| 1 — Foundation | this session | scaffold, `src/models`, `src/api`, `src/context`, `src/styles`, `src/utils`, routing skeleton, Vitest + Playwright setup |
| 2 — Core layout | child A | `src/components/layout/` (Header, Footer, Settings, GA tracking), `e2e/navigation.spec.ts`, `e2e/settings.spec.ts` |
| 3 — Feeds | child B | `src/pages/Feed`, `src/components/Item`, `src/components/Loader`, `src/components/ErrorMessage`, `e2e/feed.spec.ts` |
| 4 — Item details | child C | `src/pages/ItemDetails`, `src/components/Comment`, `e2e/item-details.spec.ts` |
| 5 — User + PWA + gates | child D | `src/pages/User`, `vite-plugin-pwa` config, global coverage gate, `e2e/user.spec.ts`, CI wiring |

Every phase ships feature code, colocated unit tests, its own E2E specs, and extends the Vitest
coverage `include` list with the directories it adds, so each PR is independently green.

## CI

Each PR should run, from `react/`:

```bash
npm ci
npm run test:coverage
npx playwright install --with-deps chromium
npm run e2e
```

and upload `playwright-report/` (plus `test-results/` traces) as build artifacts. Phase 5 wires this
into the repository CI configuration.
