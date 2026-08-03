<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Installable, offline-capable PWA.

## Stack

React 18 + TypeScript, Vite, React Router, SCSS theming, Vitest + React Testing Library for unit and
component tests, and Playwright for end-to-end tests. Story data comes from the
[node-hnapi](https://github.com/cheeaun/node-hnapi) Hacker News API.

## Getting started

```bash
npm install
npm run dev          # dev server on http://localhost:5173
```

## Commands

| Command                 | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                               |
| `npm run build`         | Typecheck and build the production bundle into `dist/`   |
| `npm run preview`       | Serve the production bundle                              |
| `npm test`              | Run the Vitest unit and component suite                  |
| `npm run test:coverage` | Run the unit suite with a coverage report                |
| `npm run e2e`           | Run the Playwright end-to-end suite against `dist/`      |
| `npm run lint`          | ESLint over the project                                  |
| `npm run typecheck`     | `tsc -b`                                                 |
| `npm run format`        | Prettier (4-space tabs, single quotes, 120 columns)       |

The Playwright suite builds nothing on its own: run `npm run build` first (its web server runs
`npm run preview`). Browsers are installed with `npx playwright install chromium`.

## Layout

- `src/router` — route table, including the feed routes that carry a feed type
- `src/shared` — models, Hacker News API access, the settings store and shared components
- `src/core` — app shell: header, footer, settings
- `src/features` — feed, item details and user features
- `src/styles` — SCSS theme engine
- `e2e` — Playwright specs; the Hacker News API is served from fixtures

## Offline Support

The production build ships a Workbox service worker (via `vite-plugin-pwa`) that precaches the app
shell — HTML, JS, CSS and the web manifest — and caches static assets on first use.

## Manifest

`manifest.webmanifest` is generated at build time, so the app can be installed to a home screen.

## Themes

Built in theme engine!

Current themes:

- Default
- Night
- Black (AMOLED)

The app follows the operating system's `prefers-color-scheme` until a theme is picked explicitly, and
the choice is then persisted in `localStorage`.

To add a theme, add its variables to `src/styles/_theme_variables.scss`, include the `theme` mixin in
`src/styles/_themes.scss`, and list it in `src/core/Settings.tsx`.

## Deployment

Firebase Hosting serves `dist/` with a rewrite of every route to `index.html`; Travis builds, tests
and deploys `master`.

## License

[MIT](/LICENSE.md)
