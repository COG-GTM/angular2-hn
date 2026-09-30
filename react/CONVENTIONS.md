# React port — conventions

The React app in `react/` is a 1:1 port of the Angular 9 app in `src/`. Visual parity is verified by
pixel-diffing Playwright screenshots against `reference-screenshots/` (see `../e2e-visual/README.md`),
so **markup, ids and class names must mirror the Angular templates exactly**.

## Stack

Vite 6 + React 18 + TypeScript 5 (strict), React Router 6 (data router), Sass (`@use` modules, no
CSS Modules), Vitest + Testing Library, ESLint 9 flat config. Node 20.

```
npm install
npm run dev        # http://localhost:5173
npm run lint && npm run typecheck && npm test
npm run build && npm run preview   # http://localhost:4173 (used by e2e-visual)
```

## Directory layout and ownership

| Path | Angular source | Owner |
|---|---|---|
| `src/api/types.ts` | `shared/models/*` | shared (frozen contract) |
| `src/api/hackernews.ts` | `shared/services/hackernews-api.service.ts` | Session 2 |
| `src/pages/FeedPage.tsx`, `src/components/feed/*` | `feeds/feed`, `feeds/item` | Session 2 |
| `src/pages/ItemPage.tsx`, `src/components/item/*` | `item-details`, `item-details/comment` | Session 3 |
| `src/pages/UserPage.tsx` | `user` | Session 3 |
| `src/settings/*` | `shared/services/settings.service.ts`, `shared/models/settings.ts` | Session 4 (keep the `SettingsApi` contract) |
| `src/components/layout/*` (`Header`, `Footer`, `SettingsPanel`) | `core/*` | Session 4 |
| `src/App.tsx`, `src/App.scss`, `src/styles/_themes.scss`, `src/styles/global.scss`, `index.html` | `app.component.*`, `shared/scss/_themes.scss`, `styles.scss`, `index.html` | Session 4 |
| `src/components/shared/*` (`Loader`, `ErrorMessage`) | `shared/components/*` | shared (done) |
| `src/utils/commentLabel.ts` | `shared/pipes/comment.pipe.ts` | shared (done) |
| `src/hooks/useAsync.ts` | `lazyFetch` observable semantics | shared (done) |
| `src/routes.tsx`, `src/main.tsx` | `app.routes.ts`, `app.module.ts` | shared — coordinate before changing |
| `src/styles/_media.scss`, `src/styles/_theme_variables.scss` | `shared/scss/*` | shared (verbatim copies) |

Only edit files you own; if a shared file must change, keep the change minimal and additive.

## Routes (mirror `app.routes.ts`)

`/` → redirect `/news/1`; `/{news,newest,show,ask,jobs}/:page` → `<FeedPage feedType>`;
`/item/:id` and `/user/:id` are lazy route modules (`export function Component`); unknown paths render
an empty outlet.

## Markup / class conventions (theming depends on these)

1. **Theme class at the app root.** `<App>` renders exactly the Angular root structure:
   ```html
   <div class="{theme}">          <!-- default | night | amoledblack -->
     <div class="body-cover"></div>
     <div class="wrapper"> header, <Outlet/>, footer </div>
   </div>
   ```
   `_themes.scss` styles descendants as `.{theme} .wrapper …`, so nothing else may add theme classes.
2. **Same ids/classes as the Angular templates.** Copy each Angular template's elements, ids and classes
   verbatim (`#header`, `#footer`, `.main-content`, `.nav .prev/.more`, `.subtext-laptop`,
   `.subtext-palm`, `.domain`, `.meta`, `.deleted-meta`, `.item-header`, `.back-button`, `.popup`,
   `.logo-inner`, `.main-details .name/.right`, `.pollContent .pollBar`, …). Theme rules target these.
3. **Host wrapper = Angular host element.** Each ported component renders a root `<div>` whose class is
   the Angular selector, standing in for the custom host element:
   `app-header`, `app-footer`, `app-settings`, `app-feed`, `app-item item-block` (Angular:
   `<item class="item-block">`), `app-item-details`, `app-comment`, `app-user`, `app-loader`,
   `app-error-message`.
4. **Emulated encapsulation → nest under the host class.** Angular scoped each component's SCSS to its
   own template. Port a component's SCSS into a sibling `.scss` file imported by the component, with all
   rules nested under its host class (`.app-feed { a {…} ol {…} }`). Where a parent rule would now leak
   into a child component (e.g. `.app-feed a` reaching links inside `.app-item`), constrain it with child
   combinators or `:not(.app-item *)` so the result matches Angular. `:host >>> x` becomes `.app-x x`.
5. **Sass:** use `@use '../styles/media' as *;` / `@use '../styles/theme_variables' as *;` instead of
   `@import`; replace `/` division with `math.div`.
6. **Structural directives:** `*ngIf` → conditional render; `[hidden]` → `hidden` attribute;
   `[innerHTML]` → `dangerouslySetInnerHTML` (the API already returns sanitized HN HTML, as in Angular);
   `routerLink` → `<Link>`; `routerLinkActive="active"` → `<NavLink>` (adds `active`); `(click)` → `onClick`.
   Keep whitespace-sensitive text (e.g. `{{item.points}} points by`) identical.
7. **Settings.** Read settings via `useSettings()` from `src/settings/SettingsContext.ts`
   (`settings.theme | openLinkInNewTab | titleFontSize | listSpacing | showSettings` plus the
   `toggleSettings / toggleOpenLinksInNewTab / setTheme / setFont / setSpacing` actions). localStorage keys
   match `SettingsService`: `theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`.
8. **Data.** Call `hackerNewsApi` from `src/api/hackernews.ts` through `useAsync` (aborts on
   unmount/param change). API base stays `https://node-hnapi.herokuapp.com` so the e2e harness can
   serve fixtures for it. Loading → `<Loader/>`; error → `<ErrorMessage message=…/>` with the same
   messages as Angular (`Could not load {feed} stories.`, `Could not load item comments.`,
   `Could not load user {id}.`).

## Not ported (intentional)

Service worker / `ngsw-config.json` / Workbox, Protractor e2e and Karma unit tests (replaced by
Vitest + Playwright visual e2e), Google Analytics pageview tracking, Firebase hosting config.
