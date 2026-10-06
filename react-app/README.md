# React HN (migration of the Angular 9 app in `../src`)

Vite + React 18 + TypeScript port of the Angular HN PWA. The Angular sources in `../src` stay as reference until the migration is complete.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + React Testing Library
npm run typecheck
npm run build
```

## Layout

| Path | Ported from |
| --- | --- |
| `src/AppRoutes.tsx` | `src/app/app.routes.ts` (item/user pages are `lazy()`) |
| `src/api/hn.ts` | `shared/services/hackernews-api.service.ts` |
| `src/settings/SettingsContext.tsx` | `shared/services/settings.service.ts` (`useSettings()`) |
| `src/utils/format.ts` | `shared/pipes/comment.pipe.ts` (`commentLabel`) + template helpers |
| `src/styles/` | `shared/scss/*`, `styles.scss`, `app.component.scss` |
| `src/components/` | `shared/components/{loader,error-message}` |
| `src/layout/` | `app.component.html`, `core/{header,footer,settings}` |
| `src/pages/{feed,item,user}/` | `feeds/`, `item-details/`, `user/` |
| `src/test/` | test setup, `renderWithProviders`, `mockFetch`, fixtures |

Users are fetched from `https://api.hnpwa.com/v0/user/:id.json` because node-hnapi's `/user/:id` returns 404.
