# React HN PWA

React port of the Angular Hacker News PWA living in the parent directory. Both apps coexist until parity is verified.

## Scripts

| Command                 | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Vite dev server on http://localhost:5173                  |
| `npm run build`         | Type-check and build (service worker included) to `dist/` |
| `npm run preview`       | Serve the production build                                |
| `npm run lint`          | ESLint + Prettier check                                   |
| `npm run typecheck`     | `tsc -b`                                                  |
| `npm test`              | Vitest unit/component tests (jsdom + Testing Library)     |
| `npm run test:coverage` | Vitest with v8 coverage                                   |
| `npm run e2e`           | Playwright end-to-end tests (builds and previews the app) |

## Layout

- `src/styles/` – global SCSS and theme engine ported from `../src/styles.scss` and `../src/app/shared/scss/`
- `public/assets/` – icons and images copied from `../src/assets/`
- `e2e/` – Playwright specs (replaces `../e2e/` Protractor)
