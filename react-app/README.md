# angular2-hn — React port

React + TypeScript port of the Angular 9 app in `../src`. Vite, React 19, React Router 7, TanStack Query 5, Sass. The Angular app keeps running from the repo root until the migration is finished.

```bash
cd react-app
npm ci
npm run dev        # http://localhost:4200
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serves dist/ on :4200
npm run lint       # eslint
npm run typecheck  # tsc -b
npm run format:check
npm test           # vitest + Testing Library (jsdom)
npm run e2e        # playwright
```

Requires Node >= 20.19.

## Layout

| Angular (`src/app/...`)                     | React (`react-app/src/...`)                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `shared/models/*`                           | `shared/models/*` (classes became interfaces; same fields)                   |
| `shared/services/hackernews-api.service.ts` | `shared/services/hackernews-api.ts` (Promises) + `shared/hooks/queries.ts`   |
| `shared/services/settings.service.ts`       | `shared/services/settings.ts` + `shared/context/SettingsProvider.tsx`        |
| `shared/pipes/comment.pipe.ts`              | `shared/utils/comment.ts` (`formatCommentCount`)                             |
| `shared/components/{loader,error-message}`  | `shared/components/{Loader,ErrorMessage}.tsx`                                |
| `shared/scss/*`                             | `shared/scss/*` (verbatim; `_themes.scss` imported from `styles.scss`)       |
| `app.routes.ts`                             | `router/routes.tsx` (`handle: { feedType }`, `useFeedType`, `usePageNumber`) |
| `app.component.*`                           | `layout/AppLayout.tsx`                                                       |
| `core/{header,footer,settings}`             | `core/{Header,Footer,Settings}.tsx`                                          |
| `feeds/{feed,item}`                         | `feeds/{Feed,Item}.tsx`                                                      |
| `item-details/` + `comment/`                | `item-details/{ItemDetails,Comment}.tsx`                                     |
| `user/`                                     | `user/User.tsx`                                                              |

## Conventions

- **Data**: components call `useFeed(feedType, page)`, `useItem(id)`, `useUser(id)` from `shared/hooks`. Don't call `fetch` directly. All API functions throw `ApiError` for HTTP errors, `null` bodies and non-JSON bodies (HNPWA returns 200 with `null` or plain text for unknown users).
- **Backends**: feeds/items use `node-hnapi.herokuapp.com` (same as Angular). Users use `api.hnpwa.com/v0`, because node-hnapi's `/user` endpoint returns 404 for everyone.
- **Settings**: `useSettings()` returns `{ settings, toggleSettings, closeSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }`. It uses the same localStorage keys as the Angular app (`theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`), and an OS `prefers-color-scheme` change switches between `default` and `night`.
- **HTML from HN** (`content`, `about`, poll text): always render via `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}`. Angular sanitized `[innerHTML]`; React doesn't.
- **Styles**: global SCSS, one file next to each component (`Feed.tsx` + `Feed.scss`), imported by the component. The theme mixins in `_themes.scss` target global class names (`.wrapper a`, `#header`, `.nav a`, ...), so keep the Angular class names/ids and **don't** use CSS modules. Angular's styles were view-encapsulated: nest generic selectors (`h1`, `a`, `.name`, `.title`) under the component's root class so they don't leak.
- **Links**: use `<Link>` from `react-router` for internal routes (`/item/:id`, `/user/:id`, `/:feed/:page`). For `routerLinkActive="active"`, use `<NavLink>` (it adds `active`).
- **Tests**: Vitest + Testing Library, `*.test.tsx` next to the component. Use the helpers in `src/test`: `renderApp({ route })` (full route tree), `renderWithProviders(ui, { path, route, settings, handle })`, `mockFetch({ 'url-substring': body | { status, body } })`, and the fixtures in `test/fixtures.ts`.
- **Formatting**: Prettier settings are copied from the root `package.json` (4 spaces, single quotes, 120 cols, es5 trailing commas).

## Build & deploy

### PWA

`vite-plugin-pwa` (`generateSW`, `registerType: 'autoUpdate'`) is configured in `vite.config.ts` and only runs on `npm run build`; the dev server has no service worker.

- **Manifest**: generated as `dist/manifest.webmanifest` from the same fields as the Angular `src/manifest.json`. The plugin adds `<link rel="manifest">` to `index.html`.
- **Precache**: JS/CSS/HTML/ico/png/svg in `dist/` (the app shell, lazy route chunks and `public/assets` icons) plus the manifest. Only `workbox.globPatterns` selects files. Don't add `includeAssets`, and keep `includeManifestIcons: false`: a URL listed twice makes Workbox throw `add-to-cache-list-conflicting-entries`, and the SW installs but caches nothing. Check `dist/sw.js` after changing the config.
- **Deep links**: `navigateFallback: 'index.html'`, so `/item/123` loads offline.
- **API**: `node-hnapi.herokuapp.com` and `api.hnpwa.com` use NetworkFirst (5 s timeout, 7 day / 200 + 100 entry cap). Pages visited online work offline.
- **Registration**: `src/pwa/index.ts` (imported by `main.tsx`) calls `registerServiceWorker` from `src/pwa/registerSW.ts`. The new SW activates immediately (`skipWaiting` + `clientsClaim`), and open tabs check for an update every hour while online. On the first visit the API requests start before the SW controls the page, so once it takes control `registerSW` re-requests them (from `performance` resource entries) through the SW; otherwise the page you landed on would not work offline.
- **Retiring the Angular SW**: returning visitors still have `@angular/service-worker` registered at `/ngsw-worker.js`. `public/ngsw-worker.js` is a safety worker served at that URL (excluded from the precache, `no-cache` on Firebase): on the browser's next update check it replaces the old worker, deletes the `ngsw:*` caches, unregisters itself and reloads open tabs, which then register `sw.js`.

### E2E

`npm run e2e` builds the app and runs Playwright against `vite preview` on port 4173. Service workers are blocked by default, so `page.route` mocks keep working. `e2e/offline.spec.ts` opts back in with `test.use({ serviceWorkers: 'allow' })`. `playwright.config.ts` sets `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1` so `context.route` also sees the SW's fetches. `context.setOffline(true)` doesn't stop the SW's own fetches, so the test also aborts every route. If `npx playwright install` is blocked, the config uses the system Chrome under `/opt/.devin/chrome` or `PLAYWRIGHT_CHROME_PATH`.

### Firebase Hosting

`firebase.json` (repo root) serves `react-app/dist`:

- `predeploy` runs `npm ci` + `npm run build` in `react-app/`.
- SPA rewrite `** → /index.html`.
- `Cache-Control: no-cache` for `sw.js`, `index.html`, `manifest.webmanifest` and extensionless SPA routes.
- `public, max-age=31536000, immutable` for Vite's hashed files (`/assets/<name>-<8 char hash>.<ext>`). The unhashed icons in `/assets/icons` and `/assets/images` keep Firebase's default caching.
- The `database` rules entry is unchanged.

Manual deploy from the repo root: `npx firebase-tools deploy --only hosting` (project aliases are in `.firebaserc`).

### CI

`.github/workflows/react-app.yml` replaces `.travis.yml`:

- **check**: on PRs and pushes to `master`, runs `npm ci`, lint, typecheck, test, build and format:check on Node 20 with the npm cache.
- **e2e**: runs the Playwright offline/PWA tests and uploads the report if they fail.
- **deploy**: on pushes to `master`, after both jobs pass. It uses `FirebaseExtended/action-hosting-deploy` if the `FIREBASE_SERVICE_ACCOUNT` secret is set, or falls back to `firebase-tools` with `FIREBASE_TOKEN`. With neither secret it skips with a notice, so forks don't fail.
