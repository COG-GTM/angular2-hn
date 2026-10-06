<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite
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

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) and [Workbox](https://developer.chrome.com/docs/workbox) to generate a service worker during `npm run build`. The app shell is precached and Hacker News API responses are cached network-first, so previously visited pages load offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine! The selected theme is applied as a class on `document.body` and saved, along with the other settings, in `localStorage`.

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

- [React 18](https://react.dev/) + TypeScript, bundled with [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) for client-side routing (`/news|newest|show|ask|jobs/:page`, `/item/:id` or `/item?id=`, `/user/:id` or `/user?id=`); item and user pages are lazy-loaded
- [TanStack Query](https://tanstack.com/query) for data fetching from the [HNPWA API](https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md) (`https://api.hnpwa.com/v0`)
- Sass for styles and themes
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker and web app manifest
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit/component tests, [Playwright](https://playwright.dev/) for end-to-end tests
- ESLint + Prettier
- Firebase Hosting

## Development

Requires Node.js 20+.

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server at `http://localhost:5173` |
| `npm run build` | Typecheck and build the production PWA into `dist/` |
| `npm run preview` | Serve the production build locally (use this to test the service worker and offline mode) |
| `npm test` | Run unit and component tests with Vitest |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Typecheck with `tsc` |
| `npm run e2e:install` | Install the Playwright Chromium browser (first run only) |
| `npm run e2e` | Build, serve and run the Playwright end-to-end tests |
| `npm run format` | Format sources with Prettier |

The service worker is only generated for production builds, so use `npm run build && npm run preview` to test offline behavior.

## Deployment

`firebase.json` serves `dist/` with an SPA rewrite (`** -> /index.html`). After `npm run build`, deploy with:

```
npx firebase-tools deploy
```

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
