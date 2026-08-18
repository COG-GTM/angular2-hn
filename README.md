<p align="center">
  <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
</p>

<p align="center">
  A progressive Hacker News client built with React 18, TypeScript and Vite
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service worker precaching plus runtime caching of API responses for fast loads with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Installable, offline-capable PWA with a web app manifest.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Stack

- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for the dev server and production build
- [React Router](https://reactrouter.com/) for routing
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [MSW](https://mswjs.io/) for unit and component tests
- [Playwright](https://playwright.dev/) for end-to-end tests
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker and manifest
- Sass for styling

Data comes from the public [node-hnapi](https://github.com/cheeaun/node-hnapi) endpoint at `https://node-hnapi.herokuapp.com`.

## Getting started

```bash
npm install
npm start
```

`npm start` runs the Vite dev server (printed URL, `http://localhost:5173` by default).

## Scripts

| Script | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm start` | Start the Vite dev server (alias: `npm run dev`) |
| `npm run build` | Typecheck and build the production bundle into `dist/` (including the service worker) |
| `npm run preview` | Serve the production build locally, service worker included |
| `npm test` | Run the Vitest unit/component suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run the unit suite with a V8 coverage report |
| `npm run test:e2e` | Run the Playwright end-to-end suite |
| `npm run lint` | Run ESLint over the repository |
| `npm run typecheck` | Run `tsc --noEmit` |

Service worker behaviour is not active in development. To exercise it, run `npm run build` followed by `npm run preview`.

## Project layout

```
public/assets       Static icons and images served as-is
src/api             Hacker News API client (hackerNewsApi.ts)
src/components
  core              Header, Footer and the Settings popup
  feeds             Feed list and individual story items
  item-details      Item page and recursive comment tree
  shared            Reusable Loader and ErrorMessage components
  user              User profile page
src/context         React contexts, including SettingsContext
src/models          Shared TypeScript models (story, comment, user, ...)
src/styles          Global Sass, theme variables and media query helpers
src/test            Test setup, MSW server, fixtures and render helpers
src/App.tsx         Application shell, applies the active theme class
src/routes.tsx      Route definitions
src/main.tsx        Entry point
```

### Routes

- `/` redirects to `/news/1`
- `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` render the feed
- `/item/:id` renders an item with its comment tree (lazy loaded)
- `/user/:id` renders a user profile (lazy loaded)

## Themes and settings

Settings live in `src/context/SettingsContext.tsx` and are persisted to `localStorage`. Open them from the cog in the header.

- **Theme:** `default`, `night` or `amoledblack`. The selected theme is applied as a class on the top-level element in `App.tsx`.
- **Open links in a new tab**
- **Title font size**
- **List spacing**

## Offline support and manifest

`vite-plugin-pwa` generates `dist/sw.js` and `dist/manifest.webmanifest` during `npm run build`. The app shell is precached, and Hacker News API requests use a `NetworkFirst` runtime cache so recently viewed content stays available offline. The manifest allows the app to be installed to a mobile home screen.

## Testing

Unit and component tests run in jsdom with Vitest and Testing Library; network calls are intercepted by MSW (`src/test/server.ts`) so tests never hit the live API. Playwright covers the end-to-end flows and should intercept network responses with `page.route` for the same reason — the public API is frequently slow or unavailable.

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
