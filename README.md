<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="HN PWA" title="HN PWA" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client — originally built with Angular, now ported to React + TypeScript + Vite
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

## Stack

| Concern | Angular (before) | React (now) |
| --- | --- | --- |
| Build | Angular CLI / Webpack | [Vite](https://vitejs.dev) |
| UI | Angular 9 components | React 18 + TypeScript |
| Routing | `@angular/router` (`loadChildren` lazy modules) | React Router v6 (`React.lazy` for `/item/:id` and `/user/:id`) |
| Data fetching | `HackerNewsAPIService` (RxJS `lazyFetch`) | plain `fetch` client + TanStack Query hooks (`useFeed`, `useItem`, `useUser`) with `AbortSignal` cancellation |
| Settings | `SettingsService` | Zustand store (`useSettingsStore`) persisted to `localStorage` |
| Styling | SCSS, theme mixin | same SCSS files, theme mixin keyed off the theme class on the app root |
| PWA | `@angular/service-worker` (`ngsw-config.json`) | `vite-plugin-pwa` / Workbox |
| Tests | Karma + Jasmine, Protractor | Vitest + Testing Library |

## Project layout

```
src/
  main.tsx              # React root, QueryClientProvider, BrowserRouter
  App.tsx / App.scss    # app shell: theme class on root, header, routes, footer
  routes.tsx            # /news|newest|show|ask|jobs/:page, lazy /item/:id and /user/:id
  core/                 # Header, Footer, Settings popup
  feeds/                # Feed (list + pagination) and Item (feed row)
  item-details/         # ItemDetails and the recursive Comment
  user/                 # User profile
  shared/
    api/                # hackernews-api.ts (fetch client), hooks.ts (TanStack Query), query-client.ts
    store/settings.ts   # Zustand settings store + prefers-color-scheme listener
    models/             # Story, Comment, User, PollResult, Settings, FeedType
    components/         # Loader, ErrorMessage
    utils/comment.ts    # formatCommentCount (former CommentPipe)
    scss/               # _media, _theme_variables, _themes (theme mixin)
public/                 # manifest.json, favicon, assets/icons, assets/images
```

### Styling conventions

Angular's emulated view encapsulation is replaced by nesting each component's SCSS under a wrapper
class (`.app-header`, `.app-feed`, `.app-comment`, …) that the React component places on its root
element. The theme mixin in `src/shared/scss/_themes.scss` is unchanged; `App.tsx` applies the theme
name (`default`, `night`, `amoledblack`) as a class on the app root.

## Themes

Built in theme engine! Current themes: Default, Night, Black (AMOLED). The app follows the OS
`prefers-color-scheme` until a theme is chosen explicitly.

## Build process

 - `npm install`
 - `npm run dev` to run the Vite dev server (no service worker in dev)
 - `npm run build` to type-check and produce the production bundle in `dist/` (includes `sw.js`,
   `workbox-*.js` and the precache manifest)
 - `npm run preview` to serve `dist/` locally on http://localhost:4173 with the service worker active
 - `npm test` to run the Vitest suite, `npm run lint` for ESLint, `npm run typecheck` for `tsc -b`

The API base URL defaults to `https://node-hnapi.herokuapp.com` and can be overridden with
`VITE_HN_API_BASE_URL` (the service worker API cache rule follows the same variable at build time).

## Progressive Web App

The Angular service worker (`@angular/service-worker` + `ngsw-config.json`) is replaced by
[vite-plugin-pwa](https://vite-pwa-org.netlify.app/) in `generateSW` mode (Workbox), configured in
`vite.config.ts`:

| `ngsw-config.json` | Workbox equivalent |
| --- | --- |
| `app` asset group, `installMode: prefetch` (`index.html`, `*.js`, `*.css`, favicon, manifest) | precache manifest (`globPatterns`), including the lazy `ItemDetails-*.js` / `User-*.js` route chunks so deep links work offline |
| `index: /index.html` | `navigateFallback: /index.html` (SPA shell for every navigation except `/__/*` and file URLs) |
| `assets` group, `installMode: lazy` (`/assets/**`, images, fonts) | `CacheFirst` runtime rule for image/icon/font requests (30 days, 100 entries) |
| — (no API data group) | `NetworkFirst` runtime rule for the Hacker News API (5 s network timeout, 5 min / 60 entries) so the last feed is readable offline |

Registration happens in `src/pwa.ts` (`registerSW` from `virtual:pwa-register`, called from `main.tsx`)
with `registerType: 'autoUpdate'`: a new deployment activates on the next navigation without a prompt.
The web app manifest is the static `public/manifest.webmanifest`, linked from `index.html`.

## Deploy

Travis (`.travis.yml`) runs `npm run lint`, `npm test` and `npm run build` on every push and deploys
`master` to Firebase Hosting with `firebase deploy`. `firebase.json` serves `dist/`, rewrites every
route to `/index.html`, sends `Cache-Control: no-cache` for `index.html`, the app routes, `sw.js`,
`workbox-*.js` and the manifest, and `public, max-age=31536000, immutable` for the hashed files
under `/assets/**`.

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
