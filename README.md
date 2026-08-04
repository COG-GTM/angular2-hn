<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client, originally built with Angular and now built with React + TypeScript
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

:rocket: **Progressive:** installable, offline-capable and audited with [Lighthouse](https://github.com/GoogleChrome/lighthouse).

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

## Stack

* [React](https://react.dev) 18 with function components and hooks
* [TypeScript](https://www.typescriptlang.org/) in `strict` mode
* [Vite](https://vite.dev) for dev server and production builds
* [react-router](https://reactrouter.com) with lazy-loaded `item` and `user` routes
* [Sass](https://sass-lang.com) for the theme engine and the co-located component stylesheets
* [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for tests

Stories, comments, polls and profiles come from the [node-hnapi](https://github.com/cheeaun/node-hnapi) REST endpoints.

## Offline Support

This app uses [Workbox](https://developer.chrome.com/docs/workbox) through
[`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) to generate a service worker as part of the build step so it
loads quickly and works offline.

* The app shell and every built asset (JS, CSS, HTML, icons, images, fonts) are precached.
* Requests to `https://node-hnapi.herokuapp.com` use a `NetworkFirst` runtime cache (`hn-api`, 100 entries, 1 day),
  so pages you have already visited still render without a network connection.
* The service worker is only registered in production builds — `npm run dev` never installs one.

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

Each theme is a Sass mixin in `src/shared/scss/_themes.scss` keyed off a class name (`default`, `night`,
`amoledblack`). `App.tsx` puts the selected class on the root wrapper and the settings dialog persists the choice to
`localStorage`; with no saved choice the app follows `prefers-color-scheme`. Component stylesheets live next to their
component and are scoped to that component's root class — plain Sass has no equivalent of Angular's view
encapsulation, so a bare `a`/`p`/`ul` selector in a component stylesheet would leak across the whole app.

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Build process

 - Clone or download the repo
 - `npm install`

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on <http://localhost:5173> |
| `npm run build` | Type-checks and builds the production bundle plus the service worker into `dist/` |
| `npm run preview` | Serves the production build (use this to exercise the service worker) |
| `npm run static-serve` | Same as `preview`, on port 8080 |
| `npm test` | Jest + React Testing Library |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with a coverage report in `coverage/` |
| `npm run lint` | ESLint over the whole repo |

Note: any Service Worker changes will not be reflected when you run the application locally in development. To test
service worker changes run `npm run build` followed by `npm run preview`.

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
