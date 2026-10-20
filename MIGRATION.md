# Architecture and migration notes

This app is a React port of the original Angular 9 angular2-hn PWA (Jira MBA-3267). The Angular code was removed
from the tree in the integration PR; to compare behaviour or looks with the original, check out the last Angular
commit (see "Running the Angular reference" below). This file records the architecture, the conventions the port
follows, the Angular quirks kept for parity and the traps found while porting.

## Stack and versions (`package.json`, npm, Node ≥ 22.12)

| Area        | Package                                                                                                              | Version                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| UI          | `react`, `react-dom`                                                                                                 | 19.3                          |
| Language    | `typescript` (strict, `noUnusedLocals/Parameters`)                                                                   | 5.9                           |
| Build       | `vite`, `@vitejs/plugin-react`                                                                                       | 7.3 (≥ 7.3.6 for Snyk), 5.2   |
| Routing     | `react-router` (v7, **not** `react-router-dom` / v6)                                                                 | 7.18                          |
| Data        | `@tanstack/react-query`                                                                                              | 5.104                         |
| Styles      | `sass` (SCSS)                                                                                                        | 1.105                         |
| PWA         | `vite-plugin-pwa`, `workbox-window`                                                                                  | 2.0, 7.4                      |
| Unit tests  | `vitest` (≥ 4.1.11 for Snyk), `jsdom`, `@testing-library/react` / `user-event` / `jest-dom`                          | 5.0, 27.4, 16.3 / 14.6 / 6.10 |
| E2E         | `@playwright/test` (≥ 1.56 for Snyk)                                                                                 | 1.64                          |
| Lint/format | `eslint` 9 flat config + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier` | 9.39, 8.72, 7.1, 0.5, 3.9     |

Known Snyk finding: `deepmerge` via `vite-plugin-pwa → workbox-build` has no fix upstream — report it, don't fight it.

Scripts:

| Script                            | What                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server on http://localhost:4200 (strict port)                                  |
| `npm run build`                   | Production build to `dist/` (compiles all imported SCSS — tests do not)                 |
| `npm run preview`                 | Serve `dist/` on http://localhost:4173                                                  |
| `npm test` / `npm run test:watch` | Vitest (jsdom), `src/**/*.test.{ts,tsx}`                                                |
| `npm run lint`                    | ESLint (0 warnings expected)                                                            |
| `npm run typecheck`               | `tsc -p tsconfig.app.json && tsc -p tsconfig.node.json`                                 |
| `npm run format` / `format:check` | Prettier (Angular's config: tabWidth 4, singleQuote, printWidth 120, trailingComma es5) |
| `npm run e2e`                     | `playwright test` against the production build (`vite preview` on :4173)                |

Before opening a PR: `npm run lint && npm run format:check && npm run typecheck && npm test && npm run build && npm run e2e`
(CI runs these in `.github/workflows/ci.yml`; `.github/workflows/deploy.yml` deploys `dist/` to Firebase Hosting on
pushes to `master` when a Firebase secret is configured).

## Folder layout

```
.
├── index.html                  # Angular src/index.html port: meta/OG/icons, manifest link, inline .app-loader, #root
├── public/                     # copied verbatim: assets/** (logos, icons, cog.svg), favicon.ico,
│                               # manifest.webmanifest, ngsw-worker.js (retires the old Angular service worker)
├── vite.config.ts              # react plugin, SCSS options, VitePWA (precache + runtime caching for both API hosts)
├── vitest.config.ts            # standalone test config (jsdom, setup file); never loads vite.config.ts
├── playwright.config.ts, e2e/  # Playwright specs against the production build
├── firebase.json, .firebaserc, database.rules.json   # Firebase Hosting (dist/) + database rules
├── eslint.config.js, .prettierrc.json, tsconfig*.json
└── src/
    ├── main.tsx                # createRoot(#root) + StrictMode + global styles + registerServiceWorker()
    ├── app/App.tsx             # QueryClientProvider → SettingsProvider → RouterProvider(createBrowserRouter)
    ├── app/routes.tsx          # route table (mirrors Angular's app.routes.ts)
    ├── pwa/                    # registerSW.ts, setupServiceWorker.ts (hourly update checks, first-visit cache warm-up), runtimeCache.ts
    ├── features/
    │   ├── feeds/              # FeedList, FeedItem (Angular feeds/feed, feeds/item)
    │   ├── item-details/       # ItemDetails, Comment (Angular item-details/**)
    │   ├── user/               # UserProfile (Angular user/**)
    │   └── shell/              # AppShell, Header, Footer, Settings (Angular core/**, app.component)
    └── shared/                 # models/ api/ settings/ utils/ components/ scss/ test-utils/
```

Every component has a colocated `Component.scss` and `Component.test.tsx`. `src/app/routes.test.tsx` tests
routing only: it `vi.mock`s the feature barrels (`AppShell`, `FeedList`, `ItemDetails`, `UserProfile`), so it does not
depend on what the pages render.

## Routing (`src/app/routes.tsx`)

Mirrors Angular's `src/app/app.routes.ts`:

| URL                                                                        | Element                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                        | `<Navigate to="/news/1" replace />`                                                                                                                                                                                                                                                                                                           |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | `<FeedList key={feedType} feedType={feedType} />` (Angular's `data.feedType` becomes the prop)                                                                                                                                                                                                                                                |
| `/item/:id`                                                                | `ItemDetails`, `React.lazy` + `<Suspense fallback={<Loader />}>` (Angular `loadChildren`)                                                                                                                                                                                                                                                     |
| `/user/:id`                                                                | `UserProfile`, lazy, same fallback                                                                                                                                                                                                                                                                                                            |
| anything else (`/foo`, `/news`, `/item`)                                   | shell with an **empty outlet** — Angular has no wildcard route, so it renders header + footer and nothing in between. Parity; don't add a 404 page. (Angular also resets the address bar to `/` for unmatched URLs like `/nope` because its "Cannot match any routes" navigation error rolls the URL back; React deliberately keeps the URL.) |

All routes are children of a layout route whose element is `<AppShell />`. Components read params with
`useParams()` from `react-router`. Links use `<Link to=…>` / `<NavLink>` from `react-router`.

## Shared library — every export (`src/shared/**`)

Import from the folder barrels (`../../shared/api`, `../../shared/models`, …).

### `shared/models`

```ts
interface Story {
    // node-hnapi item/feed entry (src/app/shared/models/story.ts)
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string; // e.g. "3 hours ago" (Angular typed it number; it's a string)
    type: ItemType;
    url: string;
    domain?: string;
    comments: Comment[]; // tree on /item/:id, [] on feeds
    comments_count: number;
    poll?: PollResult[]; // resolved by fetchItem for type === 'poll'
    poll_votes_count?: number; // sum of poll[].points (may be 0 → guard divide-by-zero in vote bars)
    content?: string; // HTML (Ask HN / text). Sanitize.
    deleted?: boolean;
    dead?: boolean;
}
interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string /* HTML, sanitize */;
    deleted?: boolean;
    dead?: boolean;
    comments: Comment[];
}
interface User {
    id: string;
    created_time: number;
    created: string;
    karma: number;
    avg?: number;
    about?: string /* HTML, sanitize */;
} // HNPWA shape (Angular declared `crated_time` (sic))
interface PollResult {
    points: number;
    content: string /* HTML, sanitize */;
}
type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs'; // feed route / endpoint names
const FEED_TYPES: readonly FeedType[];
function isFeedType(v: unknown): v is FeedType;
type ItemType = 'poll' | 'story' | 'job' | 'link' | 'ask' | 'comment' | (string & {});
//   ↑ Angular called the item kind `FeedType` (feed-type.type.ts). Here FeedType is the feed name; item kind is ItemType.
interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
} // strings like Angular
type Theme = 'default' | 'night' | 'amoledblack';
const THEMES: readonly Theme[];
function isTheme(v: unknown): v is Theme;
```

### `shared/api`

```ts
class ApiError extends Error {
    // every API rejection except AbortError
    kind: 'http' | 'parse' | 'empty' | 'not-found' | 'invalid-param' | 'network';
    status?: number;
    url?: string;
    get retryable(): boolean; // true only for network, 5xx, 429
}
function isApiError(e: unknown): e is ApiError;
function fetchJson<T>(url: string, init?: RequestInit): Promise<T>;
//   rejects: !res.ok (404 → 'not-found'), non-JSON text → 'parse', null body → 'empty',
//   `{ error: "..." }` body (even HTTP 200) → 'not-found' if /not found/i else 'http', fetch TypeError → 'network'.
function toPositiveInt(v: number | string | null | undefined): number; // NaN unless /^\d+$/ and > 0

const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
const HNPWA_API_BASE_URL = 'https://api.hnpwa.com/v0';
const apiUrls: {
    feed(feedType: FeedType, page: number): string; // `${HN}/${feed}?page=${page}`
    item(id: number | string): string; // `${HN}/item/${id}`
    user(id: string): string; // `${HNPWA}/user/${encodeURIComponent(id)}.json`
};
function fetchFeed(feedType: FeedType, page: number | string, signal?: AbortSignal): Promise<Story[]>;
function fetchItem(id: number | string, signal?: AbortSignal): Promise<Story>;
//   polls: awaits fetchPollOption(story.id + i) for i = 1..n BEFORE resolving (Angular parity), falls back to
//   the embedded option if one request fails, sets poll_votes_count = Σ points.
function fetchPollOption(id: number, signal?: AbortSignal): Promise<PollResult>;
function fetchUser(id: string | undefined, signal?: AbortSignal): Promise<User>; // HNPWA, needs string `id`

// TanStack Query
const queryKeys: { all; feeds(); feed(feedType, page); items(); item(id); users(); user(id) }; // ['hn', …]
function shouldRetry(failureCount: number, error: unknown): boolean; // no retry for non-retryable ApiError, else ≤ 2
function createQueryClient(): QueryClient; // staleTime 60s, gcTime 5m, retry: shouldRetry, no refetchOnWindowFocus
// Hooks: key = [...queryKeys.x(param), { locationKey }], gcTime 0 → refetch on every navigation incl. Back.
function useFeed(feedType: FeedType, page: number | string | undefined): UseQueryResult<Story[], Error>;
function useItem(id: number | string | undefined): UseQueryResult<Story, Error>;
function useUser(id: string | undefined): UseQueryResult<User, Error>;
```

Hooks take the **raw route param** (`useParams().page` / `.id`); validation happens inside. They are never
disabled: invalid input (`abc`, `0`, `NaN`, blank user) resolves to `isError` with an `ApiError('invalid-param')`
and makes no request. They must be called inside a router (they read `useLocation().key`).

### `shared/settings`

```ts
function SettingsProvider({ children }): JSX.Element;
function useSettings(): {               // Angular SettingsService names
  settings: Settings;
  toggleSettings(): void;               // showSettings (not persisted)
  toggleOpenLinksInNewTab(): void;      // persists JSON boolean
  setTheme(theme: string): void;        // 'default' | 'night' | 'amoledblack'
  setFont(fontSize: string): void;      // titleFontSize
  setSpacing(listSpacing: string): void;
};
type SettingsContextValue;              // = return type of useSettings
const STORAGE_KEYS = { theme: 'theme', openLinkInNewTab: 'openLinkInNewTab',
                       titleFontSize: 'titleFontSize', listSpacing: 'listSpacing' };
const DEFAULT_SETTINGS = { showSettings: false, openLinkInNewTab: false, theme: 'default',
                           titleFontSize: '16', listSpacing: '0' };
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
function systemTheme(): 'night' | 'default';
function applyThemeClass(theme: string, root?: HTMLElement): void;
function readStorage(key): string | null; function writeStorage(key, value): void;
function readString(key, fallback): string; function readBoolean(key, fallback): boolean;  // JSON.parse(raw) === true
```

Behaviour (Angular parity — Devin Review may flag the first two; reply "parity", don't change):

- First visit (no `theme` stored): theme = `night` if `prefers-color-scheme: dark` else `default`, **and it is persisted**.
- A live system color-scheme change switches **and persists** the theme, even over a user-chosen one.
- Missing/empty values fall back to defaults; `openLinkInNewTab` is true only for a stored JSON `true`.
- `titleFontSize` applies to **feed list titles only** (`font-size: {titleFontSize}px`); item-details titles stay 16px.
  `listSpacing` is the feed list item's `margin-bottom` in px (see Angular `feeds/item`).

**Theme class placement (decision):** Angular rendered `<div class="{{ settings.theme }}">` around
`.body-cover` + `.wrapper`. `_themes.scss` only needs the class on an ancestor, so `SettingsProvider` puts the
active class on **`<html>`** (removing the other two) and `AppShell` renders `.body-cover` + `.wrapper` without a
theme div. Do not add another theme wrapper; read the theme from `useSettings().settings.theme` if needed.

### `shared/utils`

```ts
function commentLabel(count: number | null | undefined): string; // 0/undefined → 'discuss', 1 → '1 comment', n → 'n comments'
function sanitizeHtml(html: string | null | undefined): string;
function isSafeHref(href: string): boolean;
function useScrollToTop(dep: unknown): void; // window.scrollTo(0, 0) on mount and when dep changes
```

`sanitizeHtml` (DOMParser-based allowlist): keeps HN formatting tags (`p a i b em strong code pre br` …),
drops `script/style/iframe/object/…` with content, unwraps unknown tags, strips all attributes except `a[href]`,
removes `javascript:`/`data:`/`vbscript:` (incl. entity-encoded/whitespace-obfuscated), rejects `//` and `/\`
protocol-relative hrefs, rewrites HN-relative hrefs to absolute HN URLs (`item?id=1` →
`https://news.ycombinator.com/item?id=1`), forces `rel="nofollow noopener noreferrer"` and removes `target`. **Every**
`dangerouslySetInnerHTML` must be `{{ __html: sanitizeHtml(x) }}`.

### `shared/components`

```ts
function Loader(): JSX.Element; // .loading-section[role=status] > .loader
function ErrorMessage({ message }: { message: string }): JSX.Element; // .error-section[role=alert]: skull + message + offline hint
```

Use `Loader` for `isPending` and `ErrorMessage` for `isError` on every page (Angular messages:
feeds `'Could not load ' + feedType + ' stories.'`, item `'Could not load item comments.'`,
user `'Could not load user ' + id + '.'` — check the Angular component and copy its exact text).

### `shared/scss`

- `_media.scss`, `_theme_variables.scss`, `_themes.scss` — verbatim copies of Angular's. Import with
  `@use '../../shared/scss/media' as *;` (media queries: `$mobile-only`, `$laptop-only`, …) and
  `@use '../../shared/scss/theme_variables' as *;`. Never `@import`/`@use` `_themes.scss` from a component
  (it emits global CSS) — it's already in the global bundle.
- `styles.scss` — global: Angular `src/styles.scss` + `app.component.scss` (`html/body`, `pre`, `.body-cover`,
  `.wrapper`) + `_themes.scss`. Imported once by `main.tsx`.
- The Sass deprecation warnings from the verbatim copies (`@import`, `/` division, `darken()`) are silenced in
  `vite.config.ts`. New SCSS should use `@use` and `math.div`.

### `shared/test-utils`

```ts
function renderWithProviders(ui, { route = '/', path = '*', otherRoutes?, queryClient?, ...renderOptions }?):
  RenderResult & { queryClient: QueryClient; user: UserEvent };
//   QueryClientProvider + SettingsProvider + MemoryRouter([route]) + <Route path={path} element={ui}/>.
//   otherRoutes: { '/user/:id': <p>user page</p> } to assert navigation. rerender(next) keeps providers.
function createTestQueryClient(): QueryClient;      // app defaults, retry: false, gcTime: Infinity
function mockFetch(routes?: Record<string, MockResponder>): MockFetchHandle;
//   Stubs global fetch by EXACT url (build keys with apiUrls). Value → 200 JSON; Response → as-is;
//   function (url, init) → awaited, so returning deferred().promise holds the request open.
//   Unknown URL → 404 'Unmocked URL' (listed in handle.unmatched). Honors AbortSignal.
//   handle: { fetch (vi.fn), calls, unmatched, callsTo(url), set(url, responder), restore() }
function jsonResponse(body: unknown, status = 200): Response;
function textResponse(text: string, status = 200): Response;
function deferred<T>(): { promise: Promise<T>; resolve(v: T): void; reject(e?: unknown): void };
function mockMatchMedia(matches = false): { setMatches(next: boolean): void };   // fires 'change' listeners
```

`src/shared/test-utils/setup.ts` (loaded for every test): jest-dom matchers, `matchMedia` stub (light), a
`window.scrollTo` `vi.fn()`, and after each test: RTL cleanup, `vi.unstubAllGlobals()`, `vi.restoreAllMocks()`,
`localStorage.clear()`, theme classes removed from `<html>`.

## Conventions

### SCSS scoping (Angular view encapsulation is gone)

1. One `Component.scss` per component, imported by its `.tsx` (`import './FeedItem.scss';`). Port the Angular
   component SCSS rule-for-rule.
2. Scope **every** rule under the component's own root class. Use `:where(.root)` for the context part so the
   selector keeps Angular's specificity (Angular's `[_ngcontent]` added one attribute; theme rules such as
   `.night .wrapper a` (0,2,1) must still beat component rules). Example: Angular `a { font-weight: bold }` in
   `feed.component.scss` → `:where(.main-content.feed) a { font-weight: bold }`.
3. Never ship bare element/generic selectors (`h1`, `p`, `a`, `.name`, `.title`, `.subtext`) — they leak across
   components (past bugs: Header `.name{display:none}` hid usernames on mobile; Item `p{margin:2px 0}` collapsed
   profile spacing; Feed `a{font-weight:bold}` bolded comment links).
4. Feed and item-details both use `.main-content` → `.main-content.feed` and `.main-content.item-details`.
5. Keep the Angular class names that `_themes.scss` targets (`.wrapper .loader`, `.header`, `.subtext`,
   `.item-header`, `.meta`, `.collapse`, …) — theming depends on them.
6. `.body-cover` and `.wrapper` are reserved for `AppShell`.
7. JSX drops whitespace that Angular templates keep between inline elements: add `{' '}` (e.g. `Title{' '}(domain)`).
   Compare screenshots side by side with Angular at desktop (1280) and mobile (375) widths.
8. Vitest has `css: false`; only `npm run build` compiles your SCSS. Always build.

### Data fetching

- Use only `useFeed` / `useItem` / `useUser` with raw route params; render `<Loader />` while `isPending`,
  `<ErrorMessage message=… />` when `isError`, content when `data`. No `enabled:` flags, no local fetch.
- Never show a previous resource as current: the hooks key on `useLocation().key` and use `gcTime: 0`, so every
  navigation (including Back/Forward) is a fresh fetch with the loader, like Angular. Don't use `placeholderData: keepPreviousData` on route pages.
- Feed pagination: `page` comes from the URL; "next"/"prev" are `<Link>`s to `/${feedType}/${page ± 1}`
  (Angular shows the "More ›" link only when `items.length === 30`).
- Poll vote bars: `poll_votes_count` may be 0 → guard the division.

### Scroll to top

- Every route page calls `useScrollToTop(dep)` keyed on its params — `useScrollToTop(id)` for item/user,
  `useScrollToTop(`${feedType}/${page}`)` for feeds — as the **first** hooks, before any early return.
- `FeedList` additionally sets `history.scrollRestoration = 'manual'` while mounted and restores the previous
  value on unmount.

### Accessibility

- Clickable non-buttons (`[-]` comment collapse spans, back-arrow img, settings cog, `×` close) keep their Angular
  element/classes (theme CSS targets them) but get `role="button"`, `tabIndex={0}`, Enter **and** Space key
  handlers (`preventDefault` on Space) and an `aria-label` / `aria-expanded` where it applies.
- Images need `alt`. Links opened in a new tab (`openLinkInNewTab`) use `target="_blank" rel="noopener noreferrer"`.
- The settings popup is `role="dialog" aria-modal="true"` with an accessible name, traps focus while open, closes on
  Escape and returns focus to the opener.
- Number inputs (font size, spacing) save in `onChange`, not on `keyup`.

### Tests

- Colocate tests: `src/features/<feature>/<Component>.test.tsx`. Port every Angular `*.spec.ts` case of your
  components, then add behavioural tests (loading, error, quirk responses, settings effects).
- Use `renderWithProviders(<X />, { route: '/item/1', path: '/item/:id' })` + `mockFetch({ [apiUrls.item(1)]: … })`.
  Test the Loader by holding the request open with `deferred()`. Never hit the network in unit tests.
- Query by role/text; titles rendered twice (`.mobile` + `.laptop` variants) need `getAllBy…` or a scoped query.
- Settings: set `localStorage` before rendering, or drive the UI and assert `localStorage`.
- Playwright: run against `npm run build && npm run preview`; `serviceWorkers: 'block'` except in
  SW/offline specs; mock the APIs with `page.route`. The app-loader in `index.html` has its own `img[alt=Logo]` —
  target the header logo with `a.home-link`. Filter duplicated titles with `.filter({ visible: true })`.

## Documented deviations and kept Angular quirks

Deviations from Angular (intentional):

- Unknown URLs (`/nope`, `/news`, `/item`) keep the URL and render the shell with an empty outlet (Angular resets
  the address bar to `/` because of its "Cannot match any routes" navigation error).
- The `User` model uses HNPWA's `created_time` (Angular declared `crated_time`, and called node-hnapi, which 404s).
- Escape closes the settings popup (React addition, with a focus trap and focus return to the cog).
- Links opened in a new tab use `rel="noopener noreferrer"`; links in sanitized HN HTML use `rel="nofollow noopener noreferrer"`.
- API errors (non-2xx, `{ error }` bodies, `null`/non-JSON user bodies, invalid ids/pages) show the error message
  instead of an endless loader.

Angular quirks kept for parity:

- `.head-margin` never applies.
- Replies under deleted comments are hidden.
- "1 points" is not pluralised.
- The first-visit system colour scheme is persisted as the theme, and live system scheme changes switch it.
- `titleFontSize` only changes feed list titles.
- The settings popup's full-screen overlay sits above the header, so only × (or Escape) closes it.

## Running the Angular reference

The Angular app is no longer in the tree. To compare with it, check out the last Angular commit (the parent of the
integration merge on `master`, or any commit before it) in a separate worktree:

```bash
git worktree add ../ng-ref <last-angular-commit>
cd ../ng-ref && npm install && git checkout yarn.lock   # npm rewrites yarn.lock; never commit it
NODE_OPTIONS=--openssl-legacy-provider npx ng serve --port 4300   # http://localhost:4300 (Angular 9 on Node 22)
```

Run React next to it (`npm run dev` on :4200 or `npm run build && npm run preview` on :4173) and compare the same
URL at 1280px and 375px for each theme (set `localStorage.theme` to `default`, `night`, `amoledblack` and reload).
Angular's user page calls node-hnapi `/user/*`, which 404s for everyone; route it to HNPWA
(`https://api.hnpwa.com/v0/user/<id>.json`) with Playwright `context.route` to compare profiles.

## Known traps

HN APIs

- node-hnapi returns HTTP 200 `{"error":"Item … not found"}` for unknown ids → handled by `fetchJson` (`not-found`).
- node-hnapi `/user/*` 404s for everyone → users come from HNPWA, which returns HTTP 200 `null` or plain text
  (`Cannot read property 'apply' of undefined`) for unknown users → `empty` / `parse` errors.
- Angular never checks `res.ok`; we do. Invalid ids/pages are errors, never endless loaders.
- Polls: options are items `story.id + i`; `poll_votes_count` = Σ points; guard divide-by-zero.
- AMOLED theme value is `amoledblack`. Settings keys `theme`, `titleFontSize` ('16'), `listSpacing` ('0'),
  `openLinkInNewTab` (`JSON.parse(raw) === true`). First-visit system theme is persisted (parity).
- `titleFontSize` only affects feed list titles.

React behaviour (Devin Review flags these reliably)

- `dangerouslySetInnerHTML` only via `sanitizeHtml`.
- No stale resources across navigation (hooks already key on `location.key`; don't cache in component state).
- `useScrollToTop` before early returns; FeedList `history.scrollRestoration = 'manual'`.
- Keyboard-operable clickable spans/imgs; dialog focus trap; number inputs save `onChange`.

Testing

- Vitest skips CSS → always `npm run build`.
- Titles render twice (`.mobile`/`.laptop`) → Playwright `.filter({ visible: true })` or roles.
- With `serviceWorkers: 'block'`, `registerSW` logs "Service worker registration failed … 'waiting'"; console-error
  checks must ignore it.
- Headless Chrome for local Playwright: `/opt/.devin/chrome/chrome/linux-*/chrome-linux64/chrome` (glob).
- Don't `pkill -f "<pattern>"` in a command whose own text contains the pattern.
