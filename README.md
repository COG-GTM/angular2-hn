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

> **Note:** This project was originally built with Angular 9. It has been
> migrated to **React 18 + TypeScript + Vite** while preserving 1:1 feature
> parity with the original Angular implementation.

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** PWA with Workbox-generated service worker via `vite-plugin-pwa`.

## Tech Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool)
- [React Router v6](https://reactrouter.com/) (routing, lazy routes)
- [Sass](https://sass-lang.com/) (component-scoped SCSS modules + theme engine)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox-powered service worker)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (unit tests)

## Offline Support

This app uses [Workbox](https://developer.chrome.com/docs/workbox/) (via
`vite-plugin-pwa`) to generate a service worker as part of the build step so the
app loads quickly and works offline.

## Manifest

A web app manifest is shipped from `public/manifest.json` so the app can be
installed to your home screen on mobile and desktop.

## Themes

Built-in theme engine:

* Default
* Night
* Black (AMOLED)

Themes are applied by setting a CSS class (`default`, `night`, `amoledblack`) on
the root wrapper. Settings are persisted to `localStorage` via the
`SettingsContext` provider, and dark mode is automatically applied on first
visit when the system color scheme is dark.

## Project structure

```
src/
  components/      React components (Header, Footer, Settings, Feed, Item,
                   ItemDetails, Comment, User, Loader, ErrorMessage)
  context/         SettingsContext (replaces the Angular SettingsService)
  services/        hackernews-api.ts (replaces HackerNewsAPIService)
  types/           TypeScript interfaces (Story, Comment, User, ...)
  utils/           Small pure helpers (e.g. formatCommentCount)
  styles/          SCSS theme engine (themes, theme variables, media queries)
  App.tsx          Root layout, routes, GA tracking
  main.tsx         React entry point
```

## Build process

- Clone or download the repo
- `npm install`
- `npm run dev` to start the Vite dev server
- `npm run build` to produce a production build in `dist/`
- `npm run preview` to preview the production build locally
- `npm run lint` to run ESLint
- `npm test` to run unit tests with Vitest

## Deployment

The Firebase hosting config (`firebase.json`) is configured to serve the
`dist/` directory produced by `vite build`, with SPA rewrites pointing at
`index.html`.

## Original Angular contributors

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
