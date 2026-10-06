# React HN (migration in progress)

React 18 + TypeScript + Vite port of the Angular HN PWA in the repo root. The Angular app stays intact until the final migration phase.

## Scripts (run from `react/`)

| Command                           | What it does                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm start` / `npm run dev`       | Vite dev server on http://localhost:5173                                                             |
| `npm run build`                   | Type-check + production build to `dist/`                                                             |
| `npm run preview`                 | Serve the production build on http://localhost:4173                                                  |
| `npm run lint`                    | ESLint (flat config, typescript-eslint, react-hooks)                                                 |
| `npm run format` / `format:check` | Prettier (tabWidth 4, singleQuote, printWidth 120 — same as the Angular app)                         |
| `npm test`                        | Vitest + React Testing Library with v8 coverage; fails below 80% lines/branches/functions/statements |
| `npm run e2e`                     | Playwright (chromium) against the production build; run `npm run e2e:install` once first             |

## Conventions

- Unit tests live next to source as `*.test.ts(x)`; jsdom environment, globals enabled, `localStorage` cleared after each test.
- E2E specs live in `e2e/`. Use `mockHnApi` from `e2e/support/mock-api.ts` to stub `https://node-hnapi.herokuapp.com` so runs are deterministic.
- Static assets (icons, logo, cog) are in `public/assets/`, copied from `src/assets/`.
