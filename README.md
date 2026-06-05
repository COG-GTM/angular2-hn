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
  <a href="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml"><img alt="Build Status" src="https://github.com/COG-GTM/angular2-hn/actions/workflows/ci.yml/badge.svg"></a>
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

This app was modernized from Angular 9 to **Angular 17**:

 - **Angular 17** with standalone components (no `NgModule`s) and `@if`/`@for` control-flow syntax
 - **TypeScript 5.4**
 - **RxJS 7**
 - **esbuild** `application` builder (the default for new Angular 17 apps)
 - **ESLint** + [`angular-eslint`](https://github.com/angular-eslint/angular-eslint) (replacing TSLint/Codelyzer)
 - **Karma + Jasmine** for unit tests
 - **GitHub Actions** for CI (replacing Travis)
 - **Workbox** service worker for offline support, deployed to **Firebase Hosting**

## Build process

The project uses the standard [Angular CLI](https://angular.io/cli) workflow:

 - Clone or download the repo
 - `npm install`
 - `npm start` to run the development server at `http://localhost:4200`
 - `npm run build -- --configuration production` to produce an optimized build in `dist/`
 - `npm test` to run unit tests
 - `npm run lint` to lint the project

The production build automatically generates the Workbox service worker, so offline behavior can be verified by serving the contents of `dist/` with any static file server.

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
