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
  <a href="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml/badge.svg?branch=master"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) ([Workbox](https://developer.chrome.com/docs/workbox)) to generate a service worker as part of the production build. The app shell, icons and lazy-loaded pages are precached, and Hacker News API responses are cached at runtime (network first), so visited feeds, items and profiles load without a network. The service worker checks for updates every hour.

Returning visitors who still have the old Angular service worker get `public/ngsw-worker.js`, a safety worker that removes the Angular caches, unregisters itself and reloads the tab into the React app.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest (`public/manifest.webmanifest`) that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine! Open the settings cog in the header to pick a theme, the feed title font size, the list spacing and whether links open in a new tab. Settings are saved in `localStorage`; on the first visit the theme follows the system colour scheme.

Current themes:

- Default
- Night
- Black (AMOLED)

## Areas of improvement

- Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
- Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Stack

[React 19](https://react.dev/), TypeScript (strict), [Vite 7](https://vite.dev/), [React Router 7](https://reactrouter.com/), [TanStack Query 5](https://tanstack.com/query), Sass, vite-plugin-pwa + workbox-window, Vitest + React Testing Library, Playwright, ESLint + Prettier. Data comes from [node-hnapi](https://github.com/cheeaun/node-hnapi) (feeds and items) and the [HNPWA API](https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md) (users).

The app was migrated from Angular 9; [MIGRATION.md](MIGRATION.md) has the architecture, conventions and porting notes.

## Development

Requires Node.js 22.12 or newer.

- Clone or download the repo
- `npm ci`
- `npm run dev` to start the Vite dev server on http://localhost:4200

| Script                                    | What                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Dev server on http://localhost:4200                                                                                       |
| `npm run build`                           | Production build (with the service worker) to `dist/`                                                                     |
| `npm run preview`                         | Serve `dist/` on http://localhost:4173                                                                                    |
| `npm test`                                | Unit tests (Vitest, jsdom)                                                                                                |
| `npm run e2e`                             | Playwright end-to-end tests; builds and serves the production build on :4173 (run `npx playwright install chromium` once) |
| `npm run lint` / `npm run typecheck`      | ESLint / TypeScript                                                                                                       |
| `npm run format` / `npm run format:check` | Prettier                                                                                                                  |

Note: the service worker is only generated by the production build. To test service worker or offline changes, run `npm run build && npm run preview`.

## Deployment

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, typecheck, unit tests, the build and the Playwright e2e tests on every push and pull request. On pushes to `master`, `.github/workflows/deploy.yml` builds the app and deploys `dist/` to [Firebase Hosting](https://firebase.google.com/docs/hosting) (project from `.firebaserc`, override with the `FIREBASE_PROJECT_ID` repository variable). The deploy needs a `FIREBASE_SERVICE_ACCOUNT` (or `FIREBASE_TOKEN`) secret in the `production` environment and is skipped when neither is set. `firebase.json` rewrites client routes to `/index.html` and sets the cache headers for the service worker and hashed assets.

## Contributors

A million thanks to some awesome people :)

- [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
- [Mateusz](https://github.com/mateuszwitkowski)
- [Jordi Collell](https://github.com/jordic)
- [Ben Brooks](https://github.com/bbrks)
- [Zach Berger](https://github.com/zachberger)
- [blAck PR](https://github.com/blackpr)
- [Bram Borggreve](https://github.com/beeman)
- [Antonio Indrianjafy](https://github.com/Antogin)
- [Addy Osmani](https://github.com/addyosmani)
- [Majid Hajian](https://github.com/mhadaily)
- [Jeff Cross](https://github.com/jeffbcross)
- [Minko Gechev](https://github.com/mgechev)
