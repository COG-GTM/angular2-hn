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
  <a href="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml"><img alt="Build Status" src="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml/badge.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** installable, offline-capable PWA.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Stack

The app was originally written in Angular and has been rewritten in React with no change in behaviour:

| | |
| --- | --- |
| UI | React 18 + TypeScript |
| Build / dev server | Vite 5 |
| Routing | React Router v6 |
| Styling | SCSS (three themes: Default, Night, Black (AMOLED)) |
| Unit / component tests | Vitest + React Testing Library |
| End-to-end tests | Playwright |
| PWA | `vite-plugin-pwa` (Workbox) |
| Data | [node-hnapi](https://github.com/cheeaun/node-hnapi) over native `fetch` |

## Getting started

```bash
npm ci
npm run dev       # dev server on http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the production build (service worker included)
```

## Tests

```bash
npm run lint            # ESLint (with Prettier compatibility)
npm test                # Vitest unit and component tests
npm run test:coverage   # the same suite with a V8 coverage report
npm run test:e2e        # Playwright end-to-end tests against the production build
```

The Playwright suite stubs the Hacker News API with fixtures (`e2e/fixtures.ts`) so it is deterministic and can run
offline. CI (`.github/workflows/ci.yml`) runs lint, unit tests, the build and the e2e suite on every pull request.

## Project layout

```
src/
  api/            fetch-based Hacker News API client
  components/     shared presentational components (Loader, ErrorMessage)
  context/        SettingsContext (theme, font size, list spacing, link behaviour)
  core/           app chrome: Header, Footer, Settings modal
  feeds/          feed item row
  item-details/   recursive comment tree
  models/         TypeScript models (Story, Comment, User, PollResult, Settings)
  pages/          routed pages: FeedPage, ItemDetailsPage, UserPage
  styles/         SCSS themes and shared variables/mixins
  utils/          pure helpers (formatCommentCount)
  routes.tsx      route table mirroring the original Angular routes
e2e/              Playwright specs and API fixtures
```

## Offline support

`vite-plugin-pwa` generates a Workbox service worker at build time: the app shell is precached and every navigation
falls back to `index.html`, while Hacker News API responses are served with a `NetworkFirst` strategy (24h expiry) so
previously visited feeds and items keep working offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

The theme follows `prefers-color-scheme` on first load and is then persisted to `localStorage`.

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so the service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
