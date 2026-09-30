# React HN

React 19 + TypeScript + Vite port of the Angular 9 Hacker News PWA in the parent directory. The UI, routes,
data layer, settings and themes mirror the Angular app one-to-one and are verified against it with
screenshot diffs and interaction tests (see [Verification](#verification)).

## Run

Requires Node 20+ (tested with Node 22).

```bash
cd react
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build to dist/
npm run preview      # serve dist/
npm run lint         # oxlint
npm run typecheck    # tsc -b (app + e2e)
```

The original Angular app still runs from the repo root and needs Node 14 (Angular 9 does not build on newer Node):

```bash
nvm use 14
npm install
npm start            # ng serve on http://localhost:4200
```

## Structure

| Angular (`src/app`) | React (`react/src`) |
| --- | --- |
| `app.routes.ts` (+ lazy `item-details`/`user` modules) | `AppRouter.tsx` (React Router, `React.lazy` for item/user) |
| `app.component.*` | `App.tsx`, `styles/App.scss` |
| `shared/services/hackernews-api.service.ts` | `services/hackernewsApi.ts` |
| `shared/services/settings.service.ts` | `settings/SettingsContext.tsx`, `settings/useSettings.ts` |
| `shared/pipes/comment.pipe.ts` | `services/commentCount.ts` |
| `shared/models/*` | `models/index.ts` |
| `shared/components/loader`, `error-message` | `shared/Loader.tsx`, `shared/ErrorMessage.tsx` |
| `shared/scss/*`, `styles.scss` | `styles/_themes.scss`, `_theme_variables.scss`, `_media.scss`, `global.scss` |
| `core/header`, `footer`, `settings` | `core/Header.tsx`, `Footer.tsx`, `Settings.tsx` |
| `feeds/feed`, `feeds/item` | `feeds/Feed.tsx`, `feeds/Item.tsx` |
| `item-details`, `item-details/comment` | `item-details/ItemDetails.tsx`, `item-details/Comment.tsx` (recursive) |
| `user` | `user/UserProfile.tsx` |

Routes are identical: `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page`, `/item/:id`,
`/user/:id`, and `/` redirects to `/news/1`. The API service uses the same `node-hnapi.herokuapp.com` endpoints
and 30-item pages (“More ›” only when a page returns 30 items). Settings persist to the same localStorage keys
(`theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`), and the initial theme follows
`prefers-color-scheme` like `SettingsService`.

Angular's emulated view encapsulation is reproduced by scoping each component stylesheet under its root
selector while keeping selector specificity below the theme rules wherever the Angular version relied on the
theme winning (e.g. `.domain`, `.meta`, mobile `.item-header`).

## Intentional differences

- **No service worker / offline mode.** `@angular/service-worker` (`ngsw-config.json`) is not ported; the app
  is a plain SPA. The web manifest and icons are kept.
- **Protractor / Karma not ported.** Replaced by the Playwright suite in `e2e/`.
- **Google Analytics snippet removed** from `index.html`.
- **User profiles fall back to the official HN API.** `node-hnapi`'s `/user/:id` endpoint currently returns
  404 upstream, so the Angular app shows “Could not load user …” for every user. `fetchUser` tries
  `node-hnapi` first and, on failure, maps `hacker-news.firebaseio.com/v0/user/:id.json` into the same shape.
- **HTML from the API is sanitized with DOMPurify** before `dangerouslySetInnerHTML`, standing in for
  Angular's built-in `[innerHTML]` sanitizer.
- **Font size / list spacing inputs apply on `change`** (typing and the spinner arrows); Angular only listened
  to `keyup`, so the spinner arrows did nothing there.

## Verification

All e2e tests run against recorded API fixtures (`e2e/fixtures/*.json`) so both apps render identical data.

```bash
# (optional) re-record fixtures from the live API
npm run e2e:record-fixtures

# Angular reference screenshots -> e2e/screenshots/angular (committed); needs `npm start` running at the repo root
npm run e2e:capture:angular

# React screenshots, pixel diff vs Angular, and interaction tests (starts Vite automatically)
npm run e2e

# Interaction tests against the Angular app
BASE_URL=http://localhost:4200 npm run e2e:interactions
```

`e2e:compare` writes diff images and `e2e/screenshots/diff/report.json`; it fails if any state differs by
more than 0.2% of pixels (`MAX_MISMATCH_RATIO`) or has different page dimensions.

Verified states (desktop 1280×800 unless noted; all 26 match Angular with identical page dimensions and ≤ 0.01% differing pixels):

- Feeds: `news/1`, `newest/1`, `show/1`, `ask/1`, `jobs/1`, `news/2`
- Themes: `news/1`, `item/:id`, `user/:id` and the settings dialog in Default, Night and AMOLED Black
- `item/:id` with expanded nested comments, with the first thread collapsed, and an Ask HN item with body text
- `user/:id` profile and the user error state
- Mobile (375×812): `news/1`, `jobs/1`, `item/:id`, `user/:id`, `news/1` Night, settings dialog

Interaction tests (`e2e/interactions.spec.ts`, pass against both apps): `/` redirect, header navigation with
active link, pagination (More/Prev and list numbering), opening item comments and collapsing a thread, opening
user profiles from the feed and item page, unknown-user error, theme switching with persistence across reload,
and settings for new-tab links, title font size and list spacing.
