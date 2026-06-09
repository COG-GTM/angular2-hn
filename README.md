<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite (originally built with Angular)
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

This app uses [Workbox](https://workboxjs.org/) to generate a service worker as part of the build step to load quickly and work offline.

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

- [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for development and bundling
- [React Router](https://reactrouter.com/) for routing
- [Sass](https://sass-lang.com/) for theming
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker and manifest
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for tests

The React application lives in the [`react-app/`](./react-app) directory.

## Build process

 - Clone or download the repo
 - `cd react-app`
 - `npm install`
 - `npm run dev` to start the Vite dev server
 - `npm run build` to produce a production build in `react-app/dist/`
 - `npm test` to run the test suite
 - `npm run lint` to lint the project

The root `package.json` also exposes convenience scripts that delegate to the
React app (e.g. `npm run dev`, `npm run build`, `npm test`, `npm run lint`).

Note: The service worker is only generated in production builds. To test it
locally run `npm run build` followed by `npm run preview` from `react-app/`.

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
