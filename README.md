# React HN

A progressive web app implementation of [Hacker News][hn], built with [React][react],
[Vite][vite], and [TypeScript][ts]. Ported from the original Angular implementation in this
repository.

## Features

- **Five feeds**: news, newest, show, ask, jobs
- **Item detail view** with recursive comment threads and poll support
- **User profiles** with karma and creation date
- **Three themes**: Default (day), Night, and AMOLED Black (system dark mode aware)
- **Configurable** font size, list spacing, and "open links in a new tab"
- **Offline support** via [`vite-plugin-pwa`][vite-pwa] and Workbox runtime caching
- **App Shell + Dynamic Content** architecture with lazy-loaded item/user routes

## Architecture

| Concern         | Implementation                                            |
| --------------- | --------------------------------------------------------- |
| Build tooling   | Vite + TypeScript                                         |
| UI framework    | React 19 (function components + hooks)                    |
| Routing         | `react-router-dom` v7 with `createBrowserRouter`          |
| Data fetching   | `fetch` against `https://node-hnapi.herokuapp.com`        |
| State sharing   | React Context (`SettingsContext`) + `localStorage`        |
| Styling         | SCSS with three theme mixins applied via root `className` |
| Service worker  | `vite-plugin-pwa` with NetworkFirst HN API caching        |
| Testing         | Vitest + React Testing Library + jsdom                    |

## Scripts

```bash
npm install
npm run dev         # Vite dev server on http://localhost:5173
npm run build       # tsc -b && vite build
npm run preview     # Preview the production build
npm run lint        # ESLint
npm run typecheck   # tsc -b --noEmit
npm run test        # Vitest single run
npm run test:watch  # Vitest watch mode
```

## Project layout

```
src/
├── api/              # `hackerNewsApi.ts` — fetch wrappers for the HN API
├── components/       # Header, Footer, Settings, FeedItem, Comment, Loader, ErrorMessage
├── context/          # SettingsContext (theme/font/spacing/localStorage)
├── pages/            # Feed, ItemDetails, User
├── styles/           # Global SCSS: _media, _theme_variables, _themes, global
├── types/            # Story, Comment, User, PollResult, FeedType, Settings
├── utils/            # commentUtils, analytics
├── test/             # Vitest setup
├── App.tsx           # Root with SettingsProvider + theming + GA tracking
├── routes.tsx        # createBrowserRouter route map
└── main.tsx          # ReactDOM client entry
```

## Routes

| Path                   | Component                | Notes                              |
| ---------------------- | ------------------------ | ---------------------------------- |
| `/`                    | redirects to `/news/1`   |                                    |
| `/:feedType/:page`     | `<Feed />`               | feedType ∈ news, newest, show, ask, jobs |
| `/item/:id`            | `<ItemDetails />` (lazy) | recursive comments + poll results  |
| `/user/:id`            | `<User />` (lazy)        | profile with karma and creation    |

## License

MIT — see [LICENSE.md](LICENSE.md).

[hn]: https://news.ycombinator.com/
[react]: https://react.dev/
[vite]: https://vite.dev/
[ts]: https://www.typescriptlang.org/
[vite-pwa]: https://vite-pwa-org.netlify.app/
