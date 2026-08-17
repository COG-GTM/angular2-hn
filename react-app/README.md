# Angular 2 HN — React client

The React + TypeScript + Vite rewrite of the Angular Hacker News PWA. It lives alongside the Angular
sources until the migration is complete (Phase 3).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on http://localhost:4200 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run the Vitest unit suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run e2e` | Run the Playwright end-to-end suite |

## Layout

- `src/models` — TypeScript interfaces ported from `src/app/shared/models`
- `src/services/hackernewsApi.ts` — fetch-based Hacker News API layer (including poll aggregation)
- `src/context` — settings provider (theme, font size, list spacing, open-in-new-tab) with
  `localStorage` persistence and `prefers-color-scheme` syncing
- `src/components` — shared `Loader` and `ErrorMessage`
- `src/core` — header, footer and settings panel
- `src/pages` — routed feature views
- `src/styles` — SCSS ported from `src/styles.scss` and `src/app/shared/scss`

Component styles are global SCSS partials imported from `src/styles/index.scss`; scope new rules
under the component's root class so the theme selectors in `_themes.scss` keep working.
