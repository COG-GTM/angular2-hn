# react-app — React migration of angular2-hn

This directory holds the React + TypeScript (Vite) app that will incrementally replace the
Angular app in the repository root. Both apps coexist during the migration; nothing in the
Angular code is modified by this app.

## Run

```bash
cd react-app
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
npm run lint
```

## What's here

- `src/router.tsx` — React Router routes mirroring `src/app/app.routes.ts`:
  `/` → `/news/1`; `/news|newest|show|ask|jobs/:page` → `Feed`; `/item/:id` → `ItemDetails`;
  `/user/:id` → `User`.
- `src/App.tsx` — layout shell (`Header`, `<Outlet />`, `Footer`) ported from `app.component.html`.
- `src/components/` — `Header`, `Footer` placeholders.
- `src/pages/` — `Feed`, `ItemDetails`, `User` placeholders.
- `src/services/hackerNewsApi.ts` — `fetch`/`async` port of `hackernews-api.service.ts`
  (`fetchFeed`, `fetchItemContent`, `fetchPollContent`, `fetchUser`) against
  `https://node-hnapi.herokuapp.com`.
- `src/models/` — interfaces ported from `src/app/shared/models/`.

## Next steps

Port the Angular components (`feeds`, `item-details`, `user`, shared components/pipes) into the
placeholder pages, then the settings/theme service, then the PWA service worker.
