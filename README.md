<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Installable, offline-capable PWA.

## Stack

- [React](https://react.dev) 19 with function components and hooks
- [React Router](https://reactrouter.com) for routing
- [TypeScript](https://www.typescriptlang.org) in strict mode
- [Vite](https://vite.dev) for the dev server and production build
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox) for the service worker and web app manifest
- Sass for the theme engine

## Getting Started

```sh
npm install
npm run dev        # dev server on http://localhost:4200
npm run build      # type-check and build to dist/
npm run preview    # serve the production build (service worker included)
npm run lint
npm run typecheck
```

## Offline Support

The production build generates a Workbox service worker that precaches the app shell and static assets, and serves Hacker News API responses with a network-first strategy so previously visited feeds and threads stay readable offline for a week.

## Manifest

The web app manifest is generated at build time from `vite.config.ts`, so the app can be installed to a homescreen on Chromium based browsers.

## Themes

Built in theme engine!

Current themes:

- Default
- Night
- AMOLED Black

The theme is stored in `localStorage` and defaults to the operating system colour scheme on first visit.

## Structure

```
src/
  components/   header, footer, settings, item, comment tree, loader, error message
  context/      settings context + provider (theme, font size, spacing, link target)
  hooks/        useApiRequest — abortable data fetching
  pages/        Feed, ItemDetails, User
  services/     Hacker News API client
  styles/       global styles, theme mixins, media query helpers
  routes.tsx    router configuration
```

## API

Data comes from the [Hacker News API](https://github.com/cheeaun/node-hnapi) hosted at `https://node-hnapi.herokuapp.com`.

## Deployment

`firebase deploy` publishes `dist/` with SPA rewrites configured in `firebase.json`.

## License

[MIT](LICENSE.md)
