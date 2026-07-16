<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with Angular
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
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

This app uses [Workbox](https://workboxjs.org/) (via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)) to generate a service worker as part of the build step to load quickly and work offline.

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

More to come!

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Tech stack

This app was migrated from Angular 9 to a modern React stack:

* [React 18](https://react.dev/) + [React Router](https://reactrouter.com/)
* [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vitejs.dev/) for dev server and builds
* [Sass](https://sass-lang.com/) theme engine
* [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + [Workbox](https://workboxjs.org/) for the offline App Shell
* [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit/component tests
* [Playwright](https://playwright.dev/) for end-to-end tests

## Getting started

 - Clone or download the repo
 - `npm install`
 - `npm run dev` &mdash; start the Vite dev server (defaults to http://localhost:4200)
 - `npm run build` &mdash; type-check and produce a production build in `dist/`
 - `npm run preview` &mdash; serve the production build locally

The service worker is generated as part of `npm run build`, so preview the production build (`npm run preview`) to exercise offline/PWA behavior.

## Testing

 - `npm run test` &mdash; run unit/component tests once (Vitest)
 - `npm run test:watch` &mdash; run unit/component tests in watch mode
 - `npm run test:e2e` &mdash; run Playwright end-to-end tests (builds the app and runs against the preview server; the Hacker News API is mocked for deterministic, offline runs)

On first use of Playwright, install the browser binaries with `npx playwright install --with-deps chromium`.

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
