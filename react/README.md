# angular2-hn — React

React 18 + TypeScript + Vite rewrite of the Angular app in `../src`. The Angular
app stays untouched until the cutover tasks (T7–T10).

```bash
cd react
npm ci
npm run dev        # http://localhost:5173
npm test           # vitest run (jsdom)
npm run lint
npm run typecheck
npm run build      # tsc -b && vite build -> dist/
```

Requires Node >= 20.19.

## Layout

| Path | Contents |
| --- | --- |
| `src/api/` | `hn.ts` fetch client (`fetchFeed`, `fetchItem`, `fetchUser`) and `types.ts` (node-hnapi shapes). The only place that talks to the network. |
| `src/components/` | Reusable presentational components and the app shell (header, footer, settings popup, layout). Shared: `Loader`, `ErrorMessage`. |
| `src/pages/` | One component per route (`FeedPage`, `ItemPage`, `UserPage`, …). Lazy pages must be default exports. |
| `src/hooks/` | React hooks/context (`useSettings`, data hooks). |
| `src/utils/` | Pure TS helpers ported from Angular pipes; no React imports. |
| `src/routes/` | `routes.tsx` (route table) and `slots/` (per-feature route entry points). |
| `src/types/` | Cross-cutting app types (e.g. `Settings`). |
| `src/styles/` | `theme.css` (theme tokens) and `global.css`. |
| `src/test/` | Test setup, `mockFetch` helper and fixtures. |

Tests live next to the code they cover as `*.test.ts(x)`.

## Routing and ownership

- `src/routes/routes.tsx` is the **only** file that registers paths (owned by T1).
- Features plug pages in through slot files, which the table renders:
  - `routes/slots/feeds.tsx` → `FeedSlot({ feed })` for `/news`, `/newest`, `/show`, `/ask`, `/jobs` (T3). Page number comes from `?page=n`.
  - `routes/slots/item.tsx` → `ItemSlot` for `/item/:id` (T4, `React.lazy` + `Suspense`).
  - `routes/slots/user.tsx` → `UserSlot` for `/user/:id` (T5, `React.lazy` + `Suspense`).
- Feature tasks edit only their slot file plus their own `pages/`, `components/`, `hooks/` files.
- `hooks/useSettings.tsx` is a placeholder with the final API (`types/settings.ts`); T2 replaces its implementation.
- T6 owns `utils/`. Until it lands, features may inline helpers; a follow-up deduplicates.

## Styling

- Plain CSS files imported by the component that uses them (`Foo.tsx` + `Foo.css`), class names ported from the Angular templates.
- Colours come **only** from the custom properties in `styles/theme.css`
  (`--hn-body-bg`, `--hn-wrapper-bg`, `--hn-wrapper-mobile-bg`, `--hn-text`, `--hn-link`, `--hn-link-visited`,
  `--hn-header-bg`, `--hn-subtext`, `--hn-secondary`, `--hn-logo-inner`, `--hn-border`), which map 1:1 to the
  SCSS theme variables.
- The root layout puts the theme name (`default` | `night` | `amoledblack`) as a class on its outermost element.
- Breakpoints: mobile `max-width: 768px`, laptop `min-width: 769px`, tablet `max-width: 1024px`.

## API notes

- Base URL: `https://node-hnapi.herokuapp.com`.
- node-hnapi's `/user/{id}` currently returns 404; `fetchUser` falls back to
  `https://hacker-news.firebaseio.com/v0/user/{id}.json` and normalizes it to the same `User` shape (adds `submitted`).
- Poll items: `fetchItem` resolves each option from `/item/{pollId + n}` and sets `poll_votes_count`, as the Angular service did.
