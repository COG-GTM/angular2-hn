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
 - `npm run dev` to run the Vite dev server
 - `npm run build` to type-check and produce the production bundle in `dist/`
 - `npm run preview` to serve `dist/` locally (service worker included)
 - `npm test` to run the Vitest suite, `npm run lint` for ESLint

The API base URL defaults to `https://node-hnapi.herokuapp.com` and can be overridden with
`VITE_HN_API_BASE_URL`.

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
