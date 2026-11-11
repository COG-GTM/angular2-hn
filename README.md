# Hacker News PWA

A responsive Hacker News client with paginated feeds, nested comments, user profiles,
and persistent display settings. Built with **React 18**, **TypeScript**, **React Router**,
and **Vite**. **Workbox**, through `vite-plugin-pwa`, generates the production service
worker. Profile HTML is sanitized with DOMPurify.

## Getting started

Use **Node.js 24 or newer** and npm. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No Angular CLI or global build tools are required.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Typecheck and build the production app and service worker into `dist/`. |
| `npm run preview` | Serve the existing production build locally. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run Vitest and React Testing Library tests in jsdom. |
| `npm run e2e` | Build and serve production, then run Playwright in desktop and mobile Chromium. |

Install bundled Chromium before running e2e tests:

```sh
npx playwright install chromium
npm run e2e
# Repeat every test three times:
npx playwright test --repeat-each=3
```

Playwright uses port 4173 and manages its own production preview server. API responses
are mocked from `e2e/fixtures/` so tests do not depend on the live HN API. The HTML report
is written to `playwright-report/`; failed runs retain traces and screenshots.

## PWA and offline behavior

The production build generates `sw.js` and registers it automatically. Workbox precaches
the app shell (HTML, JavaScript, CSS), favicon, `manifest.json`, and public icons/images.
After an online visit finishes installing the service worker and it controls the page,
reloads and deep links such as `/news/2`, `/item/123`, and `/user/alice` can load the
app shell offline through the `/index.html` navigation fallback.

**HN API data is not cached**, matching the original Angular app's service-worker
configuration. Offline pages display a load error while the header/navigation remains
available; previously viewed stories and profiles are not an offline data store.
The service worker uses automatic updates. The existing web app manifest and icons
support installation in compatible browsers.

Service workers are not enabled by the development server. To check the actual PWA:

```sh
npm run build
npm run preview -- --port 4173
```

Use localhost (or HTTPS when deployed), wait for service-worker activation/control,
then test offline reload/navigation. The Playwright suite covers this against the real
generated worker, removing API mocks before taking the browser offline.

## Settings

The cog opens controls for Default, Night, and Black (AMOLED) themes, title font size,
list spacing, and opening external links in a new tab. Settings retain the original
localStorage keys, including the legacy `amoledblack` theme value. System color-scheme
changes continue to override and persist the selected theme, as in the original app.

## Project layout

```text
src/
  main.tsx           Router and settings-provider composition
  routes.tsx         Feed, item, and user routes
  App.tsx            Shared header/footer layout
  api/               node-hnapi requests, cancellation, and poll aggregation
  models/            Shared story, comment, user, feed, and settings contracts
  pages/             Feed/paging, item/comments, and user-profile views
  components/        Header, footer, settings, loader, and error display
  settings/          SettingsProvider and useSettings
  styles/            Shared SCSS themes and layout
  utils/             Comment-count formatting
public/              Original manifest, favicon, icons, and images
e2e/                 Production-browser specs and deterministic JSON fixtures
vite.config.ts       React, Vitest, and Workbox/PWA configuration
playwright.config.ts Desktop/mobile Chromium and production web server
firebase.json        Hosting rewrites, cache headers, and database rules reference
```

Unit/component tests live beside source files. Shared API requests accept AbortSignals
and reject HTTP failures. The original API model spelling `User.crated_time` is retained.

## Deployment and CI

Firebase Hosting serves **`dist/`** with an SPA rewrite to `/index.html`. `sw.js` and
`index.html` have `Cache-Control: no-cache` headers so browsers can revalidate updates.
`database.rules.json` and the Firebase project aliases in `.firebaserc` are preserved.

`.travis.yml` installs dependencies and builds with Node 24 on `master`, then uses its
existing Firebase CLI deploy step with `FIREBASE_TOKEN`. Deployment credentials belong
in CI secrets, not source control.

GitHub Actions (`.github/workflows/ci.yml`) runs on pull requests and pushes to `master`:

- Node 24: `npm ci`, lint, unit tests, and production build.
- Separate e2e job: install Chromium with OS dependencies, then `npm run e2e`.
- Upload the Playwright HTML report on failure.

## History, contributing, and license

Originally **Angular 2 HN**, the Angular PWA by
[Houssein Djirdeh](https://github.com/hdjirdeh), this project has been migrated to React
while preserving its routes, themes, public assets, and app-shell offline behavior.
Thanks to the original contributors and maintainers.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and pull-request guidance and
[LICENSE.md](LICENSE.md) for the license.
