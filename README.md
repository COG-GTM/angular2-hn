<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

---

> **Note:** This project was originally built with Angular and has been migrated to
> [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), bundled
> with [Vite](https://vitejs.dev/). All features, routes, theming, PWA support and the
> Firebase deployment config are preserved.

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Installable PWA with offline support.

## Tech Stack

- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for development and production builds
- [React Router v6](https://reactrouter.com/) for routing (with lazy-loaded item/user routes)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker and offline support
- [Sass](https://sass-lang.com/) for the theme engine and component styles
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit tests
- [Playwright](https://playwright.dev/) for end-to-end tests

## Project Structure

```
src/
  components/   Header, Footer, Settings, FeedItem, Comment, Loader, ErrorMessage
  pages/        FeedPage, ItemDetailPage, UserPage
  hooks/        useFeed, useItemContent, useUser
  context/      SettingsContext (theme, font size, list spacing, link behavior)
  services/     hackerNewsApi (native fetch)
  utils/        formatComment
  types/        Story, Comment, User, PollResult, Settings, FeedType
  scss/         _themes.scss, _theme_variables.scss, _media.scss
```

## Routes

| Path | Component |
| --- | --- |
| `/` | redirects to `/news/1` |
| `/news/:page` | Feed (top stories) |
| `/newest/:page` | Feed (newest) |
| `/show/:page` | Feed (Show HN) |
| `/ask/:page` | Feed (Ask HN) |
| `/jobs/:page` | Feed (jobs) |
| `/item/:id` | Item detail + comments (lazy) |
| `/user/:id` | User profile (lazy) |

## Data Source

This app uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) REST API
(`https://node-hnapi.herokuapp.com`).

## Themes

Built-in theme engine. Current themes:

- Default
- Night
- Black (AMOLED)

The theme is auto-selected from your system's `prefers-color-scheme` and can be
overridden (and persisted) from the in-app Settings panel.

## Build process

- Clone or download the repo
- `npm install`
- `npm run dev` to run the application with the Vite dev server
- `npm run build` to produce a production build in `dist/`
- `npm run preview` to serve the production build locally (service worker enabled)

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` / `npm start` | Start the Vite dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler with `--noEmit` |
| `npm test` | Run unit tests with Vitest |
| `npm run e2e` | Run Playwright end-to-end tests |

## Deployment

The app is deployed to [Firebase Hosting](https://firebase.google.com/docs/hosting).
The `firebase.json` `hosting.public` directory points to `dist`, and all routes are
rewritten to `/index.html` for client-side routing.

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
