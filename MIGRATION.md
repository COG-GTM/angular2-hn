# Angular 9 → React 18 migration contract

This file is the contract between **Phase 1 (foundation)**, **Phase 2 (features A–D, in parallel)** and
**Phase 3 (integration)**. Phase 2 builds strictly on what is documented here.

The original Angular app in `src/`, `angular.json`, `tsconfig*.json`, `e2e/` (Protractor), `karma.conf.js`,
`tslint.json` etc. stays untouched as the parity reference until Phase 3 deletes it.

## 1. Layout

```
index.html                 Vite entry → /src-react/main.tsx
vite.config.ts             Phase 3 owns (PWA plugin). Dev server :4200, preview :4173, build → dist/
vitest.config.ts           Standalone test config (jsdom, does NOT load vite.config.ts)
tsconfig.react.json        App + tests (src-react/**). Angular keeps tsconfig.json/app/spec.
tsconfig.node.json         Config files (vite/vitest/playwright configs)
eslint.config.mjs          Flat config: typescript-eslint, react-hooks, react-refresh, prettier
.npmrc                     legacy-peer-deps=true (Angular 9 peers pin TypeScript ~3.7)
.prettierignore            Keeps the verbatim Angular SCSS copies untouched
public/assets/             Copy of src/assets → same `/assets/...` URLs as Angular (+ public/favicon.ico)
src-react/
  main.tsx                 createRoot + StrictMode + global styles.scss
  App.tsx                  QueryClientProvider → SettingsProvider → BrowserRouter → AppRoutes
  routes.tsx               AppRoutes (mirrors src/app/app.routes.ts)
  styles.scss              Minimal global styles (imports shared/scss/themes) — Phase 3 replaces
  shared/                  Shared library (read-only for Phase 2)
    models/ api/ utils/ settings/ components/ scss/ test-utils/   (each with index.ts)
    index.ts               Runtime barrel (everything except test-utils)
  features/
    feeds/                 FeedList.tsx, FeedItem.tsx                          (A)
    item-details/          ItemDetails.tsx, Comment.tsx                         (B)
    user/                  UserProfile.tsx                                      (C)
    core/                  AppShell.tsx, Header.tsx, Footer.tsx, Settings.tsx   (D)
```

## 2. npm scripts

| Script                            | What it does                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server on http://localhost:4200                                                        |
| `npm run build`                   | `typecheck` + `vite build` → `dist/`                                                            |
| `npm run preview`                 | Serve `dist/` on :4173                                                                          |
| `npm test` / `npm run test:watch` | Vitest (jsdom), files `src-react/**/*.test.{ts,tsx}`                                            |
| `npm run lint`                    | ESLint (React code + config files; Angular `src/` and `e2e/src` are ignored)                    |
| `npm run format` / `format:check` | Prettier with the existing `prettier` block in package.json (4 spaces, single quotes, 120 cols) |
| `npm run typecheck`               | `tsc -p tsconfig.react.json && tsc -p tsconfig.node.json`                                       |
| `npm run e2e`                     | `playwright test` (Phase 3 adds `playwright.config.ts` and specs)                               |
| `npm run ng:*`                    | Old Angular scripts (`ng:serve`, `ng:build`, `ng:test`, `ng:lint`, `ng:e2e`) — see below        |

All dependencies the later phases need are already installed (`vite-plugin-pwa`, `workbox-window`,
`@playwright/test`, `@testing-library/user-event`, `@testing-library/jest-dom`). npm only: `yarn.lock` was removed,
`package-lock.json` is committed, `.npmrc` sets `legacy-peer-deps=true` so `npm ci` works next to the Angular 9
peers. Phase 2 must not touch `package.json` or the lockfile. Playwright browsers are not downloaded by
`npm ci`; Phase 3 runs `npx playwright install chromium` (or points at a local Chrome).

### Running the Angular reference app

TypeScript 5 breaks the Angular 9 CLI in this tree (`ng build` → `ts.createNodeArray is not a function`), so the
`ng:*` scripts only work on master. Run the reference app from a worktree of master instead:

```bash
git worktree add ../angular2-hn-ng origin/master
cd ../angular2-hn-ng && npm install --legacy-peer-deps
NODE_OPTIONS=--openssl-legacy-provider npx ng serve --port 4300   # Node ≥ 17
```

Angular's user page calls `node-hnapi.herokuapp.com/user/*`, which 404s for every user, so it only shows its
error page; for parity screenshots route that request to `api.hnpwa.com/v0/user/<id>.json` (e.g. Playwright
`context.route`).

## 3. Shared library API (`src-react/shared/`)

Import from the folder barrels, e.g. `import { useItem } from '../../shared/api'`, or from `../../shared` (runtime
barrel). Test helpers come from `../../shared/test-utils`.

### 3.1 `models/`

| Export                                                                       | Notes                                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FeedType` = `'news' \| 'newest' \| 'show' \| 'ask' \| 'jobs'`, `FEED_TYPES` | **Renamed meaning.** In Angular `FeedType` was the _item_ type (`'poll' \| 'story' \| 'job'`) while routes used `data.feedType` for the feed. Here `FeedType` is the feed/route type.           |
| `ItemType`                                                                   | Item `type` from node-hnapi: `poll`, `story`, `job`, `link`, `comment`, `pollopt`, `ask` (Angular's old `FeedType`).                                                                            |
| `Story`                                                                      | Port of `story.ts`. Fixes: `time_ago` is a **string** (Angular said number); `points`/`user` can be `null` (jobs); optional `content` (Ask/job HTML); `poll`/`poll_votes_count` only for polls. |
| `Comment`                                                                    | Port of `comment.ts` (`level`, `user`, `time_ago`, `content` HTML, recursive `comments`, `deleted?`, `dead?`).                                                                                  |
| `PollResult`                                                                 | `{ points: number; content: string }` (`content` is HTML).                                                                                                                                      |
| `User`                                                                       | Port of `user.ts`; Angular's `crated_time` typo is `created_time` (what HNPWA returns). `about` is HTML.                                                                                        |
| `Settings`, `ThemeName`, `THEMES`                                            | `THEMES = ['default', 'night', 'amoledblack']` — **`amoledblack`** is the exact value Angular stores and `_themes.scss` uses.                                                                   |

### 3.2 `api/`

Endpoints (same as Angular except users):

```ts
HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
HNPWA_API_BASE_URL = 'https://api.hnpwa.com/v0';
apiUrls.feed(feedType, page); // `${HN}/${feedType}?page=${page}`
apiUrls.item(id); // `${HN}/item/${id}`
apiUrls.user(id); // `${HNPWA}/user/${id}.json`  (node-hnapi /user/* is 404 for everyone)
```

Plain async functions (no RxJS). All reject with `ApiError` (except an `AbortError` from a cancelled query):

```ts
fetchJson<T>(url, init?): Promise<T>
fetchFeed(feedType: FeedType, page: number | string, signal?): Promise<Story[]>
fetchItemContent(id: number | string, signal?): Promise<Story>
fetchPollContent(id: number, signal?): Promise<PollResult>
fetchUser(id: string | undefined, signal?): Promise<User>
toPositiveInt(value): number   // route param → positive int, or NaN
class ApiError extends Error { kind: 'http' | 'parse' | 'empty' | 'not-found' | 'invalid-param' | 'network'; status?; url?; retryable }
isApiError(e): e is ApiError
```

`fetchJson` rejects when the network fails or the body read is interrupted (`network`); `!res.ok` (`http`, or `not-found` for 404 — Angular's
`lazyFetch` never checked `res.ok`); the body is not JSON (`parse` — HNPWA sends plain text for some unknown users);
the body is `null` (`empty` — HNPWA's other answer for unknown users); or the body is an object with an `error` field
(node-hnapi answers unknown items with HTTP 200 `{"error":"Item … not found"}` → `not-found`).

`fetchItemContent` keeps Angular's poll mapping: for `type === 'poll'` it fetches option _i_ from
`item/<story.id + i>` (i = 1..n), **awaits all of them** before resolving, sets `poll[i-1] = { points, content }` and
`poll_votes_count = Σ points`. A failed option falls back to the `{ item, points }` embedded in the poll.
`poll_votes_count` can be 0 — guard divisions (poll bar width).

Invalid input never hits the network: a non-positive-integer page/id (incl. `NaN`, `'abc'`, `undefined`) or an empty
user id rejects with `kind: 'invalid-param'`.

React Query (v5):

```ts
queryKeys.all | feeds() | feed(feedType, page) | items() | item(id) | users() | user(id)   // ['hn', 'feed', 'news', 1] …
                                 // hooks key invalid params as 'invalid:<raw>' so /item/abc → /item/def re-validates
createQueryClient(): QueryClient // staleTime 60s, gcTime 5min, refetchOnWindowFocus false, retry = shouldRetry
queryClient                      // app singleton used by App.tsx
shouldRetry(failureCount, error) // no retry for non-retryable ApiErrors (invalid-param/not-found/parse/empty/4xx); else up to 2
useFeed(feedType: FeedType, page: number | string | undefined): UseQueryResult<Story[], Error>
useItem(id: number | string | undefined): UseQueryResult<Story, Error>
useUser(id: string | undefined): UseQueryResult<User, Error>
```

Hook semantics: pass the raw route param straight in (`useItem(useParams().id)`). The hooks are **never disabled**:
an invalid param, unknown item or unknown user always ends in `status === 'error'` (`isError`), never an infinite
`pending`. Render `<Loader/>` while `isPending` and `<ErrorMessage message=…/>` on `isError`. Cached data for the same
key shows immediately on back-navigation and is revalidated once older than 60 s (`isFetching`).

### 3.3 `utils/`

```ts
commentLabel(count: number | null | undefined): string // Angular `comment` pipe: 0 → 'discuss', 1 → '1 comment', n → 'n comments'
sanitizeHtml(html: string | null | undefined): string  // use for EVERY dangerouslySetInnerHTML
isSafeHref(href: string): boolean
useScrollToTop(dep: unknown): void                     // window.scrollTo(0, 0) on mount and whenever dep changes
ROUTER_FUTURE_FLAGS                                    // React Router v7 future flags (app + test routers)
```

- There is **no timeago pipe** in the Angular app: the API already returns `time_ago` (items/comments) and `created`
  (users) as text. Render those strings.
- `sanitizeHtml`: Angular's `[innerHTML]` was sanitized by DomSanitizer; React's `dangerouslySetInnerHTML` is not.
  DOMParser allowlist, no dependency. Keeps `p a i em b strong code pre br blockquote ul ol li span u s del sub sup hr
h1–h6`; drops `script/style/iframe/object/embed/svg/math/form…` with their content; unwraps other tags; removes
  comments and every attribute except `a[href]`; removes `javascript:`/`data:`/any non-http(s)/mailto scheme and hrefs
  starting `//`, `/\` or `\`; forces `rel="nofollow noopener noreferrer"` on every link.
- `useScrollToTop`: call it in **every route page**, keyed on the route param (`useScrollToTop(id)`,
  ``useScrollToTop(`${feedType}/${page}`)``), **before** any early return for loading/error.

### 3.4 `settings/` (port of `settings.service.ts`)

```ts
<SettingsProvider>{children}</SettingsProvider> // already mounted in App.tsx and in renderWithProviders
useSettings(): SettingsContextValue             // own file (use-settings.ts); signature frozen; throws outside the provider
interface SettingsContextValue {
    settings: Settings; // { showSettings, openLinkInNewTab, theme, titleFontSize, listSpacing }
    toggleSettings(): void; // showSettings is NOT persisted
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void;
    setFont(fontSize: string): void;
    setSpacing(listSpacing: string): void;
}
// also: STORAGE_KEYS, readStorage, writeStorage, readString, readBoolean, useLocalStorage(key, fallback, codec),
//       stringCodec, booleanCodec, DEFAULT_SETTINGS, applyThemeClass(theme, root?), systemTheme()
```

- localStorage keys and defaults are Angular's: `theme`, `openLinkInNewTab` (`false`), `titleFontSize` (`'16'`),
  `listSpacing` (`'0'`). Values stay strings like Angular; booleans are stored with `JSON.stringify` and read with
  `JSON.parse(raw) === true`.
- Theme parity with Angular: with nothing saved, the initial theme comes from `prefers-color-scheme` (`night` if dark,
  else `default`) **and is persisted** (Angular's `initTheme` did the same, so on later visits the saved value wins);
  while the app is open, a system color-scheme change switches **and persists** the theme, even over a saved one. Kept
  on purpose for parity — change only with the product owner's OK.
- **Theme class mechanism:** the provider puts the active theme class (`default` | `night` | `amoledblack`) on
  `document.documentElement` (`<html>`) and removes the other theme classes (other classes are left alone).
  `_themes.scss` selectors (`.night .wrapper a`, …) therefore match everything in the page. **AppShell and features
  must NOT add a theme class** (Angular put it on a wrapper div in `app.component.html`).
- Changing `localStorage.theme` by hand takes effect on the next page load (no cross-tab `storage` listener — same as
  Angular).

### 3.5 `components/`

```tsx
<Loader />                   // .loading-section > .loader  (role="status")
<ErrorMessage message="…" /> // .error-section skull + message (role="alert")
```

Markup and SCSS are Angular's (`Loader.scss`, `ErrorMessage.scss` — verbatim except the import path). Their colours
come from the theme (`.<theme> .wrapper .loader`, `.<theme> .wrapper .error-section …`), so render them inside
`.wrapper` (any route page is).

### 3.6 `scss/` — import paths

`_media.scss`, `_theme_variables.scss`, `_themes.scss` are byte-identical copies of `src/app/shared/scss/`. Import
them with a **relative** path from feature SCSS (verified by `npm run build`):

```scss
// src-react/features/<name>/Something.scss
@import '../../shared/scss/media'; // $mobile-only, $laptop-only, $tablet-only
@import '../../shared/scss/theme_variables'; // colours, $skull-size
```

Do **not** import `_themes.scss` from a feature: it emits the global theme CSS (imported once by
`src-react/styles.scss`). Import component SCSS from the component (`import './FeedItem.scss';`). Sass deprecation
warnings for the Angular-era syntax (`@import`, `/` division, `darken`) are silenced in `vite.config.ts`. Vitest does
not process CSS (`css: false`), and Vite only compiles SCSS that is imported, so a broken SCSS import only shows up
in `npm run build` once the component is rendered by the app — always run it.

### 3.7 `test-utils/`

```tsx
import { renderWithProviders, mockFetch, deferred, jsonResponse, textResponse } from '../../shared/test-utils';
import { apiUrls } from '../../shared/api';

mockFetch({ [apiUrls.item(1)]: { id: 1, title: 'Hi', type: 'link', comments: [] } });
const { user, queryClient } = renderWithProviders(<ItemDetails />, { route: '/item/1', path: '/item/:id' });
```

- `renderWithProviders(ui, { route = '/', path = '*', queryClient?, ...rtlOptions })` → RTL result + `queryClient` +
  `user` (`userEvent.setup()`); `rerender(newUi)` re-renders inside the same providers and location. Wraps a **fresh** QueryClient (`retry: false`), `SettingsProvider`,
  `MemoryRouter initialEntries={[route]}` and `<Routes><Route path={path} element={ui} /></Routes>`.
  `createTestQueryClient()` is exported too.
- `mockFetch(routes)` stubs global `fetch`; keys are **exact URLs** (build them with `apiUrls`). A plain value is sent
  as HTTP 200 JSON; a `Response` (`jsonResponse(body, status)`, `textResponse(text, status)`) is sent as is; a
  function `(url, init) => value | Response | Promise<…>` is **awaited**, so returning `deferred().promise` holds the
  request open (loader tests) until you call `resolve(...)`. Throwing in a responder simulates a network error.
  Unmocked URLs get `404 Unmocked URL` and are listed in `handle.unmatched`. Handle:
  `{ fetch, calls, callsTo(url), unmatched, restore }`.
- Global setup (`test-utils/setup.ts`, auto-loaded): jest-dom matchers, a `window.matchMedia` stub
  (`mockMatchMedia(matches)` to change it) and a `window.scrollTo` mock; after each test: RTL cleanup, unstub
  globals, `localStorage.clear()`, theme classes removed from `<html>`.

## 4. Routing (`src-react/routes.tsx`)

Component router (`BrowserRouter` in App.tsx, `<AppRoutes/>`), everything inside the `AppShell` layout route:

| Path                                   | Element                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                    | `<Navigate to="/news/1" replace />`                                             |
| `/news\|newest\|show\|ask\|jobs/:page` | `<FeedList feedType=… />` (Angular `data.feedType` → prop; keyed per feed type) |
| `/item/:id`                            | `<ItemDetails />` (Phase 3 → `React.lazy`)                                      |
| `/user/:id`                            | `<UserProfile />` (Phase 3 → `React.lazy`)                                      |

No catch-all route (Angular had none either); Phase 3 decides on a 404.

## 5. Feature placeholders — final file names and props

| File                                                     | Export / props                                                                            | Reads                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------- |
| `features/feeds/FeedList.tsx`                            | `FeedList({ feedType }: { feedType: FeedType })`                                          | `:page` (`useParams`) |
| `features/feeds/FeedItem.tsx`                            | `FeedItem({ item }: { item: Story })`                                                     | —                     |
| `features/item-details/ItemDetails.tsx`                  | `ItemDetails()`                                                                           | `:id`                 |
| `features/item-details/Comment.tsx`                      | `Comment({ comment }: { comment: Comment })` (recursive)                                  | —                     |
| `features/user/UserProfile.tsx`                          | `UserProfile()`                                                                           | `:id`                 |
| `features/core/AppShell.tsx`                             | `AppShell()` layout: `.body-cover`, `.wrapper` > `<Header/>`, `<Outlet/>`, `<Footer/>`    | —                     |
| `features/core/Header.tsx`, `Footer.tsx`, `Settings.tsx` | no props (use `useSettings()`); Header renders `<Settings/>` when `settings.showSettings` | —                     |

Keep these file names, named exports, props and the `index.ts` barrels; replace the bodies, `data-testid`s and
placeholder tests freely. (`src-react/routes.test.tsx` relies on the placeholder test ids and is Phase 3's to update.)

## 6. Ownership map

| Owner            | Files                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A · Feeds        | `src-react/features/feeds/**`                                                                                                                                                                                                     |
| B · Item details | `src-react/features/item-details/**`                                                                                                                                                                                              |
| C · User         | `src-react/features/user/**`                                                                                                                                                                                                      |
| D · Core shell   | `src-react/features/core/**`                                                                                                                                                                                                      |
| Phase 3          | `src-react/App.tsx`, `src-react/routes.tsx` (+ test), `src-react/main.tsx`, `src-react/styles.scss`, `vite.config.ts`, `index.html`, `public/`, PWA/manifest, `playwright.config.ts` + e2e, CI, Firebase, Angular removal, README |
| Phase 1 (frozen) | `src-react/shared/**`, `vitest.config.ts`, `tsconfig.react.json`, `tsconfig.node.json`, `eslint.config.mjs`, `.npmrc`, `.prettierignore`, `package.json`, `package-lock.json`, this file                                          |

## 7. Conventions for Phase 2

- Feature code (components, SCSS, tests, feature-local hooks/helpers) lives only under `src-react/features/<name>/`.
  Never edit `src-react/shared/`, `App.tsx`, routing, configs, `package.json` or the lockfile. If a shared change is
  needed, **report it** (PR description / structured output) instead of making it, and work around it inside your
  feature folder if possible.
- Named exports, function components; data via the `shared/api` hooks; settings via `useSettings()`.
- Co-locate tests as `*.test.tsx`; mock the network with `mockFetch` + `apiUrls` (unit tests never hit the live API).
- Before opening a PR: `npm run lint && npm run typecheck && npm test && npm run build`, and `npm run format`.

## 8. Angular → React parity traps

1. **HN APIs.** `node-hnapi /user/*` is 404 for everyone → users come from HNPWA. HNPWA returns HTTP 200 with `null`
   or plain text for unknown users; node-hnapi returns HTTP 200 `{"error": …}` for unknown items. The shared fetch
   turns all of these into errors — don't bypass it with your own `fetch`.
2. **Invalid ids** (`/item/abc`, `/news/0`) must show the error state. The hooks already do this — don't wrap them
   with `enabled: false`.
3. **innerHTML.** Always `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}`.
4. **Scroll.** Every route page calls `useScrollToTop(routeParam)` before early returns (client-side navigation keeps
   the previous scroll offset; Angular only did this in item-details).
5. **SCSS encapsulation.** Angular component SCSS was view-encapsulated; ours is global. Nest every generic selector
   (`h1`, `p`, `a`, `.name`, `.logo`, `.main-content`) under the component's root class/id (e.g. `#header`,
   `#popup1`, `.main-content.feed`) or it leaks into other features. Use `:where()` when nesting would raise
   specificity above Angular's. Themed link colours come from `.<theme> .wrapper a` (0,2,1) — check your scoped rules
   neither lose nor win unintentionally.
6. **Accessibility.** Clickable `<span>`/`<img>` elements (comment collapse `[-]`, back button, settings cog, ×) keep
   their element (theme selectors target them) but need `role="button"`, `tabIndex={0}`, Enter/Space key handlers and
   an `aria-label`.
7. **Duplicate titles.** Like Angular, React renders both the `.mobile` and `.laptop` variants of titles/subtext and
   hides one with a media query. jsdom ignores media queries, so unit tests see both (use `getAllBy*` or scoped
   queries); Playwright must query visible elements (`.filter({ visible: true })`, `getByRole`).
8. **Whitespace.** JSX drops the newlines Angular templates kept between inline elements — add `{' '}` where Angular
   rendered a space (e.g. between the title link and `(domain)`).
9. **Settings inputs.** Angular saved font size/spacing on `keyup`; save in `onChange` so spinner/paste edits work.
10. **Settings popup.** Angular's popup is a full-screen fixed `.overlay` above `#header`; a second real click on the
    cog hits the overlay and only × closes it. That is parity.
11. **Settings scope.** `titleFontSize` applies only to feed list titles and `listSpacing` to feed rows, not to item
    pages.
12. **Divisions.** `poll_votes_count` can be 0 — guard percentage widths.
