<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite
</p>

---

:zap: **Fast:** Service Worker precaching (via `vite-plugin-pwa`) for fast loads with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen for a native feel.

:rocket: **Progressive:** Installable PWA with an offline-capable app shell.

---

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) with [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (service worker + web manifest)
- [React Router v6](https://reactrouter.com/)
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + [jsdom](https://github.com/jsdom/jsdom)
- [MSW](https://mswjs.io/) for API mocking in tests
- [Sass](https://sass-lang.com/) for the theme system

Data comes from the [node-hnapi](https://github.com/cheeaun/node-hnapi) endpoint at `https://node-hnapi.herokuapp.com`.

## Project structure

```
src/
  components/      React components (core, feeds, item-details, user, shared)
  context/         SettingsProvider + useSettings (theme, font, spacing, links)
  services/        hackerNewsApi (fetch-based HN API client)
  types/           Domain models (Story, User, Comment, PollResult, Settings, FeedType)
  hooks/           usePageViews (Google Analytics pageviews on route change)
  utils/           formatCommentCount and other helpers
  styles/          Global SCSS + theme system (default / night / amoledblack)
  test/            Vitest setup and MSW server/handlers
```

## Getting started

Requires Node.js 18+.

```bash
npm install
```

### Develop

```bash
npm run dev      # or: npm start
```

Starts the Vite dev server (default http://localhost:5173).

### Build

```bash
npm run build    # type-checks with tsc, then builds with Vite (emits the PWA service worker + manifest)
npm run preview  # serve the production build locally
```

### Test & lint

```bash
npm test         # run the Vitest suite once
npm run test:watch
npm run lint     # ESLint over .ts/.tsx
```

## Routes

- `/` → redirects to `/news/1`
- `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page`
- `/item/:id` — item details + recursive comments
- `/user/:id` — user profile
