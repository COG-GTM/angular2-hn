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
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/834
- ROI: 3 files touched (`Loader.tsx`, `Loader.scss`, `Loader.test.tsx`); Angular 129 → React 122 LOC (+22 LOC parity
  test). Review points: SCSS copied verbatim under `.app-loader` (global `load1` keyframes, mobile override quirk kept);
  `.app-loader` also names the Angular pre-bootstrap splash, which `global.scss` drops, so rename one if the shell ports it.

### shared/error-message (wave 1)

- Angular source: `src/app/shared/components/error-message/` (143 LOC)
- React target: `react/src/shared/components/ErrorMessage/` — `ErrorMessage({ message })`
- Depends on: foundation
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/830
- ROI: 3 files touched (`ErrorMessage.tsx`, `ErrorMessage.scss`, `ErrorMessage.test.tsx`); Angular 143 → React 144
  (+56 LOC parity test). Review points: root `<div class="app-error-message">` replaces the inline
  `<app-error-message>` host (only child is the block `.error-section`, so the layout is the same); `message`
  is rendered as text like Angular's `{{ }}` interpolation; skull colours still come from `styles/_themes.scss`.

### core/footer (wave 1)

- Angular source: `src/app/core/footer/` (41 LOC)
- React target: `react/src/core/Footer/` — `Footer()`
- Depends on: foundation
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/831
- ROI: files touched: `react/src/core/Footer/{Footer.tsx,Footer.scss,Footer.test.tsx}`; LOC ported: Angular 41 →
  React 41 (+25 test). Review points: `div.app-footer` wrapper stands in for the `<app-footer>` host element;
  `#footer` id kept for the theme rules; not mounted until the wave 3 app shell.

### core/settings (wave 1)

- Angular source: `src/app/core/settings/` (197 LOC)
- React target: `react/src/core/Settings/` — `Settings()`
- Depends on: foundation (`useSettings`)
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/833
- ROI: files touched: `react/src/core/Settings/{Settings.tsx,Settings.scss,Settings.test.tsx}`. LOC ported: Angular
  197 → React 156 (+151 test, 9 parity tests). Human review points: number inputs apply only on keyup, like Angular
  (spinner/wheel changes don't persist) and are uncontrolled (`defaultValue`); radios use `onChange` instead of
  `(click)`; Angular quirks kept (number inputs share `name="theme"`, checkbox text isn't wrapped in a label).

### feeds/item (wave 1)

- Angular source: `src/app/feeds/item/` (134 LOC)
- React target: `react/src/feeds/Item/` — `Item({ item })`
- Depends on: foundation (`useSettings`, `formatCommentCount`, `hasUrl`)
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/832
- ROI: files touched `react/src/feeds/Item/{Item.tsx,Item.scss,Item.test.tsx}`; LOC ported Angular 134 → React 155
  (+131 LOC parity test, 13 tests). Review points: root `<div class="item item-block">` replaces the Angular host
  element plus the template's outer div (Feed renders `<Item>` directly in each `<li>`); `routerLinkActive` →
  `NavLink` `active` class; job items render only `time_ago` in both subtexts; `target`/`rel` omitted (not empty)
  when `openLinkInNewTab` is off.

### item-details/comment (wave 1)

- Angular source: `src/app/item-details/comment/` (125 LOC)
- React target: `react/src/item-details/Comment/` — `Comment({ comment })`, recursive
- Depends on: foundation
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/835
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
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/837
- ROI: files touched: `react/src/core/Header/{Header.tsx,Header.scss,Header.test.tsx}`. LOC ported: Angular
  202 → React 202 (+111 test, 16 parity tests). Human review points: `routerLinkActive` → `NavLink` without `end`
  (active on `/x/1` and descendants, not `/x/2`); image paths use `import.meta.env.BASE_URL` instead of relying on
  Angular's `<base href="/">`; separators rendered via `Fragment` so the DOM matches the template (no wrappers).

### feeds/feed (wave 2)

- Angular source: `src/app/feeds/feed/` (181 LOC)
- React target: `react/src/feeds/Feed/` — `Feed({ feedType })`, reads `:page`
- Depends on: feeds/item, shared/loader, shared/error-message
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/839
- ROI: files touched `react/src/feeds/Feed/{Feed.tsx,Feed.scss,Feed.test.tsx}`; LOC ported Angular 181 → React 170
  (+177 LOC parity test, 16 tests). Review points: root `<div class="app-feed">` replaces the Angular host; the bare
  `a` rule is scoped to `.job-header a, .nav a` (Angular encapsulation kept it off the nested items); on page/feed
  change the loader replaces the previous list while fetching (Angular kept the stale list); the always-true
  `feedType !== 'new'` guard on the `<ol>` and `routerLinkActive` on Prev/More (never active on the current page)
  are dropped.

### item-details (wave 2)

- Angular source: `src/app/item-details/` (282 LOC incl. module)
- React target: `react/src/item-details/ItemDetails/` — `ItemDetails()`, reads `:id`
- Depends on: item-details/comment, shared/loader, shared/error-message
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/838
- ROI: files touched: `react/src/item-details/ItemDetails/{ItemDetails.tsx,ItemDetails.scss,ItemDetails.test.tsx}`.
  LOC ported: Angular 282 → React 260 (105 tsx + 155 scss; plus 227 LOC of parity tests). Review points: element
  selectors (`p`, `a`, `ul`, `li`, `.pollContent *`) are narrowed to this template's elements so they do not leak
  into nested `.app-comment` trees or `[innerHTML]` content (Angular's emulated encapsulation); `head-margin` is
  dropped because it bound to `item.text`, which the model/API never provide; the loader shows again when `:id`
  changes (Angular kept the previous item until the new one arrived); back button uses `navigate(-1)`; title,
  user and comment-count links are `NavLink`s to keep `routerLinkActive="active"`; `item.content` and poll
  option content are injected unsanitised via `dangerouslySetInnerHTML`.

### user (wave 2)

- Angular source: `src/app/user/` (145 LOC incl. module)
- React target: `react/src/user/User/` — `User()`, reads `:id`
- Depends on: shared/loader, shared/error-message
- Status: ported
- PR: https://github.com/COG-GTM/angular2-hn/pull/836
- ROI: 3 files touched (`User.tsx`, `User.scss`, `User.test.tsx`); Angular 145 → React 129 LOC (+132 LOC parity
  test). Review points: `:host >>> pre` became `.app-user pre` (the root div replaces the `<app-user>` host);
  `goBack()`/`Location.back()` is `navigate(-1)`; the Angular component has no scroll-to-top, so none is added;
  switching `:id` now resets to the Loader (Angular kept the previous user until the new one arrived); `about` is
  rendered with `dangerouslySetInnerHTML`, same trust model as `[innerHTML]` minus Angular's sanitizer.

### app shell + routing (wave 3)

- Angular source: `src/app/app.component.*`, `app.routes.ts`, `app.module.ts` (138 LOC)
- React target: `react/src/App.tsx`, `react/src/routes.tsx`
- Routes: `/` → `/news/1`; `/news|newest|show|ask|jobs/:page`; `/item/:id`; `/user/:id`. Bare `/news` etc.
  redirect to `/<feed>/1` (intentional difference: Angular matched no route there and rendered an empty outlet).
  Unknown paths keep the shell with an empty outlet, as in Angular.
- Depends on: core/header, core/footer, feeds/feed, item-details, user
- Status: ported
- PR: PR_URL_PLACEHOLDER
- ROI: files touched: `react/src/{App.tsx,App.scss,App.test.tsx,routes.tsx,main.tsx}`, `react/index.html`, icons in
  `react/public/` (`favicon.ico`, apple-touch/mstile/safari-pinned-tab). LOC ported: Angular 138 → React 90
  (App 24 + routes 24 + App.scss 26 + main 16; +201 LOC parity test, 18 tests). Human review points: `div.app-root`
  wraps the theme div (stands in for the `<app-root>` host, keeps the template's `class="{{ settings.theme }}"`
  div unchanged); `Feed` is keyed by `feedType` so switching feeds remounts it; `SettingsProvider` + `BrowserRouter`
  live in `main.tsx` so `App` renders inside any router; `index.html` copies the Angular title/meta verbatim minus
  the PWA manifest, `browserconfig.xml` (its tile path was broken in Angular too), `og:image`/`twitter:image`
  (asset never existed), the GA snippet, and the pre-bootstrap splash + skip link (the skip link targeted the
  splash); the `<noscript>` message is kept. Deployment of `react/` (Firebase rewrites) is out of scope.

## Route parity

| Angular route | React route | Status |
| --- | --- | --- |
| `''` → `news/1` | `/` → `/news/1` | ported |
| `news\|newest\|show\|ask\|jobs/:page` (`FeedComponent`, `data.feedType`) | same, `<Feed feedType key={feedType}>` | ported |
| `news\|newest\|show\|ask\|jobs` (no match, empty outlet) | redirect to `/<feed>/1` | intentional difference |
| `item/:id` (lazy `ItemDetailsModule`) | `/item/:id` → `<ItemDetails>` | ported |
| `user/:id` (lazy `UserModule`) | `/user/:id` → `<User>` | ported |
