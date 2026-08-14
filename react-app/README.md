# React migration skeleton

React + TypeScript (Vite) skeleton for the ongoing migration of the Angular HNPWA that lives in `../src`.
The Angular app is untouched and keeps building/running as before.

## What is in here

- `src/routes.tsx` — routing shell mirroring `src/app/app.routes.ts`: `/` redirects to `/news/1`, feed
  routes `/{news,newest,show,ask,jobs}/:page`, plus `/item/:id` and `/user/:id`.
- `src/pages/` — placeholder page components for each route.
- `src/models/` — models ported from `src/app/shared/models/`.
- `src/api/hackernews.ts` — Promise-based port of `HackerNewsAPIService` (`fetchFeed`, `fetchItemContent`,
  `fetchPollContent`, `fetchUser`) against `https://node-hnapi.herokuapp.com`.

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Not migrated yet

Feed/item/user feature components, pipes, the settings service, styling/themes, and the service worker /
PWA setup.
