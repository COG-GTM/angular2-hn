<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with Angular (modernized to Angular 17)
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

## Tech Stack

This project was modernized from Angular 9 to a current Angular stack:

- **Angular 17** with standalone components, `bootstrapApplication`, and the new control flow syntax (`@if` / `@for`)
- **TypeScript 5.4** and **RxJS 7.8**
- **esbuild-based** application builder (`@angular-devkit/build-angular:application`)
- **ESLint** (`@angular-eslint`) for linting (replacing TSLint)
- **Karma + Jasmine** for unit tests
- **Playwright** for end-to-end tests (replacing Protractor)
- **GitHub Actions** for CI/CD (replacing Travis CI)

## Offline Support

This app uses [`@angular/service-worker`](https://angular.dev/ecosystem/service-workers) to generate a service worker as part of the production build so it loads quickly and works offline. The worker is configured in `ngsw-config.json` and registered via `provideServiceWorker()` in `src/app/app.config.ts`.

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

## Build process

Requires **Node.js 18.13+ or 20.9+** and npm.

 - Clone or download the repo
 - `npm install`
 - `npm start` to run the dev server at `http://localhost:4200`
 - `npm run build` to produce an optimized production build in `dist/angular-hnpwa/`

### Other scripts

 - `npm run lint` &mdash; run ESLint over the TypeScript and HTML templates
 - `npm test` &mdash; run unit tests in watch mode (Karma + Jasmine)
 - `npm run test:ci` &mdash; run unit tests once in headless Chrome
 - `npm run e2e` &mdash; run the Playwright end-to-end tests (boots the dev server automatically)

The service worker is only enabled in production builds. To exercise it locally, build the app and serve `dist/angular-hnpwa/browser` with any static file server.

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
