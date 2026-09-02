# React HN PWA

React port of the original Angular Hacker News PWA. This directory is the whole application; the root `package.json` delegates its scripts here.

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

- `src/models/` – `Story`, `Comment`, `User`, `PollResult`, `Settings`, `FeedType`
- `src/api/` – Hacker News API client (`node-hnapi.herokuapp.com`, poll aggregation)
- `src/settings/` – settings store (React Context + `useSettings`, localStorage, `prefers-color-scheme`)
- `src/routes/` – route table (`/` -> `/news/1`, feeds, lazy `item/:id` and `user/:id`)
- `src/core/` – `AppLayout` (theme wrapper + GA pageviews), `Header`, `Footer`, `Settings`
- `src/feed/` – `Feed` + `StoryItem`
- `src/item-details/` – `ItemDetails` + recursive `Comment`
- `src/user/` – `UserProfile`
- `src/shared/components/` – `Loader`, `ErrorMessage`
- `src/styles/` – global SCSS and the three-theme engine (`default`, `night`, `amoledblack`)
- `public/assets/` – icons and images
- `e2e/` – Playwright specs (API mocked via `page.route`)
