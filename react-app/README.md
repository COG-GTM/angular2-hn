# angular2-hn — React port

React + TypeScript port of the Angular 9 app in `../src`. Vite, React 19, React Router 7, TanStack Query 5, Sass. The Angular app keeps running from the repo root until the migration is finished.

```bash
cd react-app
npm ci
npm run dev        # http://localhost:4200
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serves dist/ on :4200
npm run lint       # eslint
npm run typecheck  # tsc -b
npm run format:check
npm test           # vitest + Testing Library (jsdom)
npm run e2e        # playwright
```

Requires Node >= 20.19.

## Layout

| Angular (`src/app/...`)                     | React (`react-app/src/...`)                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `shared/models/*`                           | `shared/models/*` (classes became interfaces; same fields)                   |
| `shared/services/hackernews-api.service.ts` | `shared/services/hackernews-api.ts` (Promises) + `shared/hooks/queries.ts`   |
| `shared/services/settings.service.ts`       | `shared/services/settings.ts` + `shared/context/SettingsProvider.tsx`        |
| `shared/pipes/comment.pipe.ts`              | `shared/utils/comment.ts` (`formatCommentCount`)                             |
| `shared/components/{loader,error-message}`  | `shared/components/{Loader,ErrorMessage}.tsx`                                |
| `shared/scss/*`                             | `shared/scss/*` (verbatim; `_themes.scss` imported from `styles.scss`)       |
| `app.routes.ts`                             | `router/routes.tsx` (`handle: { feedType }`, `useFeedType`, `usePageNumber`) |
| `app.component.*`                           | `layout/AppLayout.tsx`                                                       |
| `core/{header,footer,settings}`             | `core/{Header,Footer,Settings}.tsx`                                          |
| `feeds/{feed,item}`                         | `feeds/{Feed,Item}.tsx`                                                      |
| `item-details/` + `comment/`                | `item-details/{ItemDetails,Comment}.tsx`                                     |
| `user/`                                     | `user/User.tsx`                                                              |

## Conventions

- **Data**: components call `useFeed(feedType, page)`, `useItem(id)`, `useUser(id)` from `shared/hooks`. Don't call `fetch` directly. All API functions throw `ApiError` for HTTP errors, `null` bodies and non-JSON bodies (HNPWA returns 200 with `null` or plain text for unknown users).
- **Backends**: feeds/items use `node-hnapi.herokuapp.com` (same as Angular). Users use `api.hnpwa.com/v0`, because node-hnapi's `/user` endpoint returns 404 for everyone.
- **Settings**: `useSettings()` returns `{ settings, toggleSettings, closeSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }`. It uses the same localStorage keys as the Angular app (`theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`), and an OS `prefers-color-scheme` change switches between `default` and `night`.
- **HTML from HN** (`content`, `about`, poll text): always render via `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}`. Angular sanitized `[innerHTML]`; React doesn't.
- **Styles**: global SCSS, one file next to each component (`Feed.tsx` + `Feed.scss`), imported by the component. The theme mixins in `_themes.scss` target global class names (`.wrapper a`, `#header`, `.nav a`, ...), so keep the Angular class names/ids and **don't** use CSS modules. Angular's styles were view-encapsulated: nest generic selectors (`h1`, `a`, `.name`, `.title`) under the component's root class so they don't leak.
- **Links**: use `<Link>` from `react-router` for internal routes (`/item/:id`, `/user/:id`, `/:feed/:page`). For `routerLinkActive="active"`, use `<NavLink>` (it adds `active`).
- **Tests**: Vitest + Testing Library, `*.test.tsx` next to the component. Use the helpers in `src/test`: `renderApp({ route })` (full route tree), `renderWithProviders(ui, { path, route, settings, handle })`, `mockFetch({ 'url-substring': body | { status, body } })`, and the fixtures in `test/fixtures.ts`.
- **Formatting**: Prettier settings are copied from the root `package.json` (4 spaces, single quotes, 120 cols, es5 trailing commas).
