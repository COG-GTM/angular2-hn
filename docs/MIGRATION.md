# Angular 9 → React 18 migration manifest

Tracking ticket: [CHAR-33](https://cog-gtm.atlassian.net/browse/CHAR-33).

The Angular app in `src/` stays the production app until cut-over. The React port lives in `react/`, an
independent npm project (Vite + React 18 + TypeScript + React Router 6 + Vitest/React Testing Library) that the
Angular CLI never sees. Target-stack reference: [COG-GTM/react-hn](https://github.com/COG-GTM/react-hn) (stack
only; its Tailwind/shadcn UI is not reused).

## Inventory (src/app)

| Angular unit | Kind | LOC (ts+html+scss) | Consumed by |
| --- | --- | --- | --- |
| `shared/services/hackernews-api.service.ts` + `shared/models/*` | service + models | 117 | feed, item-details, user |
| `shared/services/settings.service.ts` | service (mutable singleton + localStorage) | 89 | app, header, settings, item, item-details |
| `shared/pipes/comment.pipe.ts` | pipe | 40 | item, item-details |
| `shared/scss/*`, `styles.scss` | theme engine | 285 | everything |
| `shared/components/loader` | component | 129 | feed, item-details, user |
| `shared/components/error-message` | component | 143 | feed, item-details, user |
| `core/footer` | component | 41 | app |
| `core/settings` | component | 197 | header |
| `core/header` | component | 202 | app |
| `feeds/item` | component | 134 | feed |
| `feeds/feed` | component (routed: `/news\|newest\|show\|ask\|jobs/:page`) | 181 | router |
| `item-details/comment` | component (recursive) | 125 | item-details, itself |
| `item-details` | component (lazy route `/item/:id`) | 282 | router |
| `user` | component (lazy route `/user/:id`) | 145 | router |
| `app.component`, `app.routes.ts`, `app.module.ts` | shell + routing | 138 | bootstrap |

## Dependency order

```
wave 0  foundation (data layer, settings, styles, test utils, CI)
wave 1  loader · error-message · footer · settings · item · comment        (depend on wave 0 only)
wave 2  header (settings) · feed (item, loader, error-message)
        item-details (comment, loader, error-message) · user (loader, error-message)
wave 3  app shell + routing (header, footer, feed, item-details, user)
```

Each component is one PR, branch `devin/<timestamp>-react-<component>`, opened against `master` (the repo's
default branch). Wave N branches are cut from the wave 0 branch and merge in the wave N-1 branches they depend on,
so until earlier PRs merge their diffs include those commits; review only the files listed in the section below.

## Decisions

- Parity source: the Angular app ships no component specs (`src/app/**/*.spec.ts` did not exist before this
  migration), so each React test asserts parity with the Angular template/class behaviour and cites the file it
  mirrors. Wave 0 adds the first Angular spec (`comment.pipe.spec.ts`) so the Karma suite is non-empty.
- API: the Angular service talks to node-hnapi REST (`https://node-hnapi.herokuapp.com`), not Firebase. Endpoints
  are unchanged: `/{feed}?page={n}`, `/item/{id}`, `/user/{id}`, poll options at `/item/{poll.id + i}`.
- Poll aggregation uses `Promise.all`; the Angular service mutated the story from N un-awaited subscriptions, so
  `poll_votes_count` could render as 0 before options arrived.
- Non-2xx API responses reject (Angular's `lazyFetch` only errored on network/JSON failures) so error states render.
- `Story.time_ago` is typed `string` (Angular typed it `number`; the API returns e.g. `"3 hours ago"`).
  `User.crated_time` (typo) is `created_time`, matching the API.
- Styling: original SCSS is kept for visual parity. Theme partials are copied to `react/src/styles/`.
- The Google Analytics `ga()` pageview hook in `AppComponent` is dropped.
- Out of scope: PWA/service worker parity and cut-over (deleting `src/app`, Firebase hosting changes).

## Conventions for component PRs

- Location mirrors Angular: `react/src/<area>/<Name>/{Name.tsx,Name.scss,Name.test.tsx}`, named export
  (`export function Loader()`).
- Data: `useFeed` / `useItem` / `useUser` and pagination helpers from `react/src/api`; settings via
  `useSettings()` from `react/src/settings`; `formatCommentCount` and `hasUrl` from `react/src/utils`.
- Styles: port the component's SCSS into `Name.scss`, scoped under a root class named after the Angular selector
  (e.g. `.app-footer`) on the component's outermost element. `:host` rules become `&`. Import the partials with
  `@import "../../styles/media"; @import "../../styles/theme_variables";` (adjust depth).
- Tests: React Testing Library + Vitest. Start each test file with a comment citing CHAR-33 and the Angular
  template/class it mirrors. Use `renderWithProviders` from `react/src/test/renderWithProviders` for anything that
  needs settings or the router; mock the data hooks or `fetch`, never the live API.
- Innerhtml bindings (`[innerHTML]`) become `dangerouslySetInnerHTML`, same as Angular's trust model.
- Every PR updates only its own section below: status → `ported`, PR link, ROI note.
- Checks (also run by `.github/workflows/migration-ci.yml`): root `npm run lint`, `npm test -- --watch=false
  --browsers=ChromeHeadlessCI`, `npm run build`; in `react/`: `npm run lint`, `npm test`, `npm run build`.

Statuses: `pending` → `in progress` → `ported` (PR open with parity tests; lands when a human merges it).

## Components

### foundation (wave 0)

- Angular source: `shared/services/*`, `shared/models/*`, `shared/pipes/comment.pipe.ts`, `shared/scss/*`, `styles.scss`
- React target: `react/` scaffold, `react/src/{api,settings,utils,styles,test}`, `.github/workflows/migration-ci.yml`
- Status: ported
- PR: see CHAR-33
- ROI: Angular 531 LOC → React data layer, settings context, utils, styles. Review points: poll aggregation
  semantics, localStorage key/encoding compatibility, first-visit theme detection, Angular lint baseline fixes.

### shared/loader (wave 1)

- Angular source: `src/app/shared/components/loader/` (129 LOC)
- React target: `react/src/shared/components/Loader/` — `Loader()`
- Depends on: foundation
- Status: pending
- PR: —
- ROI: —

### shared/error-message (wave 1)

- Angular source: `src/app/shared/components/error-message/` (143 LOC)
- React target: `react/src/shared/components/ErrorMessage/` — `ErrorMessage({ message })`
- Depends on: foundation
- Status: pending
- PR: —
- ROI: —

### core/footer (wave 1)

- Angular source: `src/app/core/footer/` (41 LOC)
- React target: `react/src/core/Footer/` — `Footer()`
- Depends on: foundation
- Status: pending
- PR: —
- ROI: —

### core/settings (wave 1)

- Angular source: `src/app/core/settings/` (197 LOC)
- React target: `react/src/core/Settings/` — `Settings()`
- Depends on: foundation (`useSettings`)
- Status: pending
- PR: —
- ROI: —

### feeds/item (wave 1)

- Angular source: `src/app/feeds/item/` (134 LOC)
- React target: `react/src/feeds/Item/` — `Item({ item })`
- Depends on: foundation (`useSettings`, `formatCommentCount`, `hasUrl`)
- Status: pending
- PR: —
- ROI: —

### item-details/comment (wave 1)

- Angular source: `src/app/item-details/comment/` (125 LOC)
- React target: `react/src/item-details/Comment/` — `Comment({ comment })`, recursive
- Depends on: foundation
- Status: ported
- PR: PR_URL
- ROI: files touched: `react/src/item-details/Comment/{Comment.tsx,Comment.scss,Comment.test.tsx}`. LOC ported:
  Angular 125 → React 128 (43 tsx + 85 scss; plus 149 LOC of parity tests). Review points: collapse uses the
  `hidden` attribute like Angular's `[hidden]` (content and replies stay mounted, so nested collapse state
  survives a parent toggle); user link is a `NavLink` to keep `routerLinkActive="active"`; `comment.content` is
  injected unsanitised via `dangerouslySetInnerHTML` (Angular sanitised `[innerHTML]`); deleted comments render
  no replies, as in the Angular template.

### core/header (wave 2)

- Angular source: `src/app/core/header/` (202 LOC)
- React target: `react/src/core/Header/` — `Header()`
- Depends on: core/settings
- Status: pending
- PR: —
- ROI: —

### feeds/feed (wave 2)

- Angular source: `src/app/feeds/feed/` (181 LOC)
- React target: `react/src/feeds/Feed/` — `Feed({ feedType })`, reads `:page`
- Depends on: feeds/item, shared/loader, shared/error-message
- Status: pending
- PR: —
- ROI: —

### item-details (wave 2)

- Angular source: `src/app/item-details/` (282 LOC incl. module)
- React target: `react/src/item-details/ItemDetails/` — `ItemDetails()`, reads `:id`
- Depends on: item-details/comment, shared/loader, shared/error-message
- Status: pending
- PR: —
- ROI: —

### user (wave 2)

- Angular source: `src/app/user/` (145 LOC incl. module)
- React target: `react/src/user/User/` — `User()`, reads `:id`
- Depends on: shared/loader, shared/error-message
- Status: pending
- PR: —
- ROI: —

### app shell + routing (wave 3)

- Angular source: `src/app/app.component.*`, `app.routes.ts`, `app.module.ts` (138 LOC)
- React target: `react/src/App.tsx`, `react/src/routes.tsx`
- Routes: `/` → `/news/1`; `/news|newest|show|ask|jobs/:page`; `/item/:id`; `/user/:id`. Bare `/news` etc.
  render page 1 (Angular matched no route there, although `FeedComponent` already defaults `page` to 1).
- Depends on: core/header, core/footer, feeds/feed, item-details, user
- Status: pending
- PR: —
- ROI: —
