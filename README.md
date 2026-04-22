# Angular 2 HN (migrated to React)

A Hacker News Progressive Web App originally written in Angular and now migrated to **React + TypeScript + Vite**. It maintains the same look, feel, and URL structure as the original Angular app while running on a modern React stack.

## Features

* Fast first paint via an **App Shell** cached by a Workbox-generated service worker
* Full PWA support — installable, works offline after first load
* Three themes (Default, Night, Black / AMOLED) with automatic dark-mode detection via `prefers-color-scheme`
* All original routes preserved:
  * `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page`
  * `/item/:id` — story details with nested comments and polls
  * `/user/:id` — user profile
* Customizable title font size, list spacing, and "open links in new tab" option (all persisted to `localStorage`)
* Uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) REST endpoints (`https://node-hnapi.herokuapp.com`)

## Tech stack

* **[Vite](https://vitejs.dev/)** — dev server and build tool
* **[React 19](https://react.dev/)** with TypeScript and function components / hooks
* **[React Router v7](https://reactrouter.com/)** for routing
* **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** + **Workbox** for service worker + manifest
* **SCSS** for styling, ported 1:1 from the original theme engine
* **[Vitest](https://vitest.dev/)** + **React Testing Library** for unit and component tests

## Getting started

The React app lives in [`react-app/`](./react-app).

```bash
cd react-app
npm install
npm run dev      # start the Vite dev server on http://localhost:4200
npm run build    # type-check + production build into react-app/dist
npm run preview  # preview the production build
npm test         # run the Vitest suite
npm run lint     # TypeScript type-check
```

## Project layout

```
react-app/
  public/                  # static assets (favicon, icons, logo)
  src/
    components/            # shared UI components (Header, Footer, Settings, Item, Comment, Loader, ErrorMessage)
    context/               # React Context providers (SettingsContext with localStorage + matchMedia)
    pages/                 # page-level components (FeedPage, ItemDetailsPage, UserPage)
    services/              # API client (hackerNewsApi — fetch + async/await + AbortSignal)
    styles/                # SCSS (themes, theme variables, media queries, global styles)
    types/                 # TypeScript interfaces (Story, Comment, User, Settings, FeedType, PollResult)
    utils/                 # pure utility functions ported from Angular pipes
    App.tsx                # router + theme-aware app shell
    main.tsx               # entry point
  index.html               # meta tags, PWA icons, Google Analytics, app loader
  vite.config.ts           # Vite + vite-plugin-pwa config
  vitest.config.ts         # Vitest config
```

## Deployment

The Vite build output (`react-app/dist/`) can be deployed to any static host (Firebase Hosting, Netlify, Vercel, S3+CloudFront, etc.). Travis CI runs lint, tests, and the production build on each push to `master`.

## License

MIT — see [LICENSE.md](./LICENSE.md).
