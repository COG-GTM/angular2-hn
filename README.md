<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React and TypeScript (originally Angular)
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

This app uses [Workbox](https://developer.chrome.com/docs/workbox) (via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)) to generate a service worker as part of the build step to load quickly and work offline. The app shell and lazy route chunks are precached, and visited API responses are cached network-first. Returning visitors who still have the old Angular service worker get it unregistered automatically (`react-app/public/ngsw-worker.js`).

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:

- Default
- Night
- Black (AMOLED)

More to come!

## Areas of improvement

- Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
- Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Stack

The app lives in [`react-app/`](react-app): React 19, TypeScript, Vite, React Router 7, Sass and `vite-plugin-pwa`.
Tests use Vitest + React Testing Library (unit) and Playwright (e2e). It is a port of the original Angular 9 app with
the same routes, themes, styles and API (`https://node-hnapi.herokuapp.com`; user profiles come from
`https://api.hnpwa.com` because node-hnapi's user endpoint returns 404). See [`react-app/README.md`](react-app/README.md)
for the source layout.

| Route                                                                      | Page                  |
| -------------------------------------------------------------------------- | --------------------- |
| `/`                                                                        | redirect to `/news/1` |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | feed                  |
| `/item/:id`                                                                | story + comments      |
| `/user/:id`                                                                | user profile          |

## Build process

Requires Node `>=20.19` (CI uses Node 22).

```bash
cd react-app
npm ci
npm run dev        # dev server on http://localhost:4200
npm run build      # type-check + production build to react-app/dist (with sw.js)
npm run preview    # serve react-app/dist on http://localhost:4173 with the service worker active
npm test           # Vitest unit tests
npm run e2e        # Playwright e2e (builds, then runs against vite preview; run `npx playwright install chromium` first)
npm run lint && npm run typecheck && npm run format:check
```

The root `package.json` forwards the same scripts (`npm run dev`, `npm run build`, ...) to `react-app/`.

Service worker changes are only active in the production build, so use `npm run build && npm run preview` to test them.

## CI/CD

- [`.github/workflows/react-app-ci.yml`](.github/workflows/react-app-ci.yml) runs lint, format check, type-check, unit tests,
  the production build and the Playwright e2e suite on every push and pull request.
- [`.github/workflows/react-app-deploy.yml`](.github/workflows/react-app-deploy.yml) deploys `react-app/dist` to Firebase
  Hosting on pushes to `master` (needs a `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_TOKEN` secret; skipped otherwise).
  [`firebase.json`](firebase.json) serves `react-app/dist` with an SPA rewrite and no-cache headers for `index.html`,
  `sw.js`, `ngsw-worker.js` and the manifest.

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
