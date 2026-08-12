# angular2-hn — React port (foundation)

React + TypeScript + Vite skeleton that the React rewrite of the Angular app is built on.

## Scripts

```bash
npm install
npm run dev           # dev server on http://localhost:5173
npm run build         # type-check + production build to dist/
npm run lint          # eslint
npm run format        # prettier --write
```

## Layout

| Path                            | Contents                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| `src/models/`                   | Framework-agnostic data models ported from `src/app/shared/models/`   |
| `src/api/hackernews.ts`         | `fetch`-based HN API client (`node-hnapi.herokuapp.com`)              |
| `src/api/queries.ts`            | TanStack Query hooks: `useFeed`, `useItem`, `useUser`                 |
| `src/context/SettingsContext.tsx` | Settings provider (theme, font size, spacing, new-tab links)        |
| `src/styles/`                   | SCSS theme variables/mixins ported from `src/app/shared/scss/`        |
| `src/pages/`                    | Placeholder route components, to be filled in by follow-up work       |

Routes mirror the Angular app: `/` → `/news/1`, `/:feedType/:page`, `/item/:id`, `/user/:id`.
