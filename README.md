<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="HN PWA" title="HN PWA" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React + TypeScript
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

This app was originally built with Angular and has been rewritten as a modern **React 19 + TypeScript + Vite** application. The React app lives in the [`react/`](react/) directory.

:zap: **Fast:** Vite-built PWA with a Workbox service worker for fast loads with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:calendar: **Time travel:** Browse the Hacker News front page for any calendar day in history.

## Features

- All five Hacker News feeds — `news`, `newest`, `show`, `ask`, `jobs` — with pagination, powered by the [node-hnapi](https://github.com/cheeaun/node-hnapi) REST API (`https://node-hnapi.herokuapp.com`)
- Item detail pages with nested comment threads and poll rendering
- User profile pages
- Settings panel with themes (Default / Night / AMOLED), open-links-in-new-tab, title font size, and list spacing — persisted to `localStorage` and respecting `prefers-color-scheme`
- **Front page on this day:** pick any date (via the `past` nav link or `/front-page/:date`) and see that day's top stories ranked by points, with previous day / next day / today navigation and "on this day in previous years" shortcuts — powered by the [Algolia HN Search API](https://hn.algolia.com/api)
- Installable PWA with offline support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) / Workbox

## Tech Stack

- [React 19](https://react.dev/) with function components and hooks
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and production builds
- [React Router v7](https://reactrouter.com/) for routing
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit tests
- ESLint (flat config) with typescript-eslint
- SCSS for styling and theming

## Development

```bash
cd react
npm install
npm run dev        # start the Vite dev server
npm test           # run the Vitest test suite
npm run lint       # run ESLint
npm run build      # typecheck + production build (react/dist)
npm run preview    # preview the production build (with service worker)
```

Note: the service worker is only generated for production builds — use `npm run build && npm run preview` to test PWA/offline behavior locally.

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

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
