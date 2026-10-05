# react-app — React port of Angular 2 HN

Vite + React 19 + TypeScript + React Router 7 + TanStack Query, with `vite-plugin-pwa` (Workbox) for offline support.
The original Angular app in `../src/app` stays in place as the reference until the migration is complete.

## Commands

```bash
npm ci
npm start          # dev server on http://localhost:4200
npm run lint       # eslint
npm run typecheck  # tsc -b
npm test           # vitest + React Testing Library (unit)
npm run build      # type-check + production build into dist/ (includes sw.js + manifest)
npm run preview    # serve dist/ on http://localhost:4173
npx playwright install chromium   # once
npm run e2e        # Playwright (builds, serves dist/, mocks the HN API; desktop + mobile viewports)
```

## Layout

| Path | Ported from | Notes |
| --- | --- | --- |
| `src/api/` | `shared/services/hackernews-api.service.ts` | `client.ts` (framework-agnostic fetch functions), `hooks.ts` (`useFeed`, `useItem`, `useUser`) |
| `src/models/` | `shared/models/` | Interfaces + `FEED_NAMES`, `THEMES`, `STORIES_PER_PAGE` |
| `src/context/settings/` | `shared/services/settings.service.ts` | `SettingsProvider` + `useSettings()`; persisted to `localStorage` |
| `src/styles/` | `shared/scss/`, `styles.scss`, `app.component.scss` | Themes are CSS custom properties on `.default` / `.night` / `.amoledblack` |
| `src/utils/` | `shared/pipes/` | `formatCommentCount`, `hasExternalUrl`, `externalLinkProps` |
| `src/components/Loader`, `ErrorMessage` | `shared/components/` | Shared by every page |
| `src/routes.tsx` | `app.routes.ts` | `/` → `/news/1`, `/:feed/:page`, `/item/:id`, `/user/:id` |
| `src/features/feeds/` | `feeds/feed`, `feeds/item` | |
| `src/features/item-details/` | `item-details/`, `item-details/comment` | |
| `src/features/user/` | `user/` | |
| `src/components/Header`, `Footer`, `Settings` | `core/header`, `core/footer`, `core/settings` | |
| `e2e/` | `../e2e` (Protractor) | Playwright; `e2e/fixtures.ts` mocks the HN API |

## Theming

`App` renders `<div class="theme-root {theme}">`. `src/styles/_themes.scss` defines per-theme custom properties
(`--hn-text-color`, `--hn-secondary-color`, `--hn-subtext-color`, `--hn-border`, `--hn-surface-color`, …) and the
same global themed selectors the Angular `theme()` mixin generated (`.subtext`, `.meta`, `.loader`, `#header`, `.popup`,
`.item-header`, `.back-button`, …). So components that keep the Angular class names get themed automatically, and
component SCSS can use `var(--hn-…)` directly. Breakpoints: `@use '../../styles/media' as *;` →
`$mobile-only`, `$laptop-only`, `$tablet-only`.

## Feature migration contract (Phase 1)

Every feature already has a placeholder wired into the router, so each feature branch only touches its own files:

- **Feeds** — `src/features/feeds/FeedPage.tsx` (default export, prop `feedType: FeedName`, reads `:page`) and new files under `src/features/feeds/`.
- **Item details** — `src/features/item-details/ItemDetailsPage.tsx` (default export, reads `:id`) and new files under `src/features/item-details/`.
- **User** — `src/features/user/UserPage.tsx` (default export, reads `:id`) and new files under `src/features/user/`.
- **Core shell** — `src/components/Header/`, `src/components/Footer/`, `src/components/Settings/` (named exports `Header`, `Footer`, `Settings`).

Conventions:

- Keep the Angular markup / class names and port each `.component.scss` next to its component (`Foo.scss`, imported from `Foo.tsx`), replacing `@import` with `@use` and `/` division with `math.div`.
- Fetch data only through `src/api` hooks; render `<Loader />` while loading and `<ErrorMessage message="…" />` on error with the same message text as Angular.
- Put unit tests next to the code (`*.test.tsx`) using `renderWithProviders` / `renderApp` / `mockFetch` from `src/test/render.tsx` and fixtures from `src/test/fixtures.ts`.
- Add e2e coverage in a new `e2e/<feature>.spec.ts` (import `test`/`expect` from `./fixtures`).
- Avoid editing shared files (`routes.tsx`, `App.tsx`, `src/api`, `src/styles`, `src/test`, `package.json`). If a change there is unavoidable, keep it minimal and call it out in the PR.
