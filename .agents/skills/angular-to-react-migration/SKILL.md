---
name: angular-to-react-migration
description: >
  Rewrite an existing Angular (2+ / CLI) frontend as a Vite + React 18 +
  TypeScript app while preserving routes, behaviour, markup, SCSS, theming and
  PWA support. Use when asked to "migrate/port/convert Angular to React",
  "rewrite the frontend in React", or to modernise an Angular CLI project.
  Covers inventory, stack scaffold, a component-by-component porting recipe,
  the pitfalls that differ between the frameworks, and the verification gate.
---

# Angular → React migration

Goal: same product, new framework. Every URL, API call, class name, theme and
persisted setting keeps working; only the rendering layer changes. Treat the
Angular templates as the spec — read every `.html`/`.scss` before porting it.

## 0. Inventory first (read-only, ~15 min)

Produce a short checklist file (e.g. `~/migration-checklist.md`) before editing:

1. **Routes** — `app.routes.ts` / `*-routing.module.ts`: paths, redirects,
   `data` (e.g. `feedType`), lazy `loadChildren`, guards, `pathMatch`.
2. **Components** — every `*.component.ts` with its `.html` + `.scss`;
   note `@Input`/`@Output`, `:host`, `::ng-deep`/`>>>`, `ViewEncapsulation`.
3. **Services** — data/API services (RxJS, `HttpClient`, `unfetch`) and state
   services (settings, auth, localStorage keys, `BehaviorSubject`s).
4. **Pipes / directives / guards** — become plain functions or hooks.
5. **Models** — interfaces under `shared/models`; port unchanged.
6. **Global assets** — `src/index.html` (`<head>` meta, manifest, GA snippet,
   pre-boot loader, `<noscript>`), `styles.scss`, `assets/`, `manifest.json`,
   `ngsw-config.json`, favicons, `environments/`.
7. **Tooling to delete** — `angular.json`, `karma.conf.js`, `tslint.json`,
   `ngsw-config.json`, `browserslist`, `e2e/`, `polyfills.ts`, `test.ts`,
   `tsconfig.app/spec.json`, `yarn.lock` (if switching to npm), all
   `@angular/*`, `zone.js`, `rxjs`, `unfetch`, `codelyzer`, `karma-*`,
   `jasmine-*`, `protractor`, `tslint`.
8. **Repo docs & CI** — `README.md`, `CONTRIBUTING.md`, `.travis.yml` /
   `.github/workflows`, `firebase.json` (output dir), Devin blueprint commands.
   These must be updated in the same PR (reviewers flag stale Angular steps).

## 1. Scaffold the target stack

Stack: Vite, React 18, TypeScript (strict), `react-router-dom@6`, `sass`,
`vite-plugin-pwa`, ESLint (`@typescript-eslint`, `react-hooks`,
`react-refresh`). Pin versions published ≥ 7 days ago; run `npm audit` after
install and bump Vite/others to the patched release if flagged.

Files to create (keep `src/` as the source root so relative SCSS paths stay
short):

```
index.html            # root, replaces src/index.html
vite.config.ts
tsconfig.json tsconfig.node.json
.eslintrc.cjs
src/main.tsx          # createRoot + BrowserRouter + providers + registerSW
src/App.tsx           # theme class wrapper, <Routes>, analytics effect
src/styles.scss       # was src/styles.scss (global)
src/shared/scss/      # was src/app/shared/scss (unchanged content)
src/models/           # was src/app/shared/models
src/services/         # API modules
src/context/          # settings / auth providers
src/utils/            # pipes → functions
src/components/       # core (header/footer/settings), shared (loader/error)
src/views/            # one folder per routed page (+ child components)
src/types/*.d.ts      # globals like `window.ga`
```

`package.json` scripts:
`dev`/`start`: `vite`, `build`: `tsc --noEmit && vite build`,
`preview`: `vite preview`, `lint`: `eslint . --ext ts,tsx`.

`index.html`: copy the old `<head>` verbatim (title, meta, icon links, GA
inline script, `<link rel=manifest>` only if not emitted by the PWA plugin),
keep the skip-link, the pre-boot loader and `<noscript>`, and replace
`<app-root>` with `<div id="root"></div>` followed by
`<script type="module" src="/src/main.tsx"></script>`. If the loader relied on
`app-root:empty`, rewrite the selector as `#root:empty + .app-loader`.

## 2. Porting recipe (do it in this order)

1. **Models** → `src/models/*.ts`, unchanged. Add fields the templates use
   but the interface omitted (e.g. `content?: string`) and note it in the PR.
2. **API service → plain module.** One `getJson<T>(url)` helper over
   `window.fetch` that throws on `!res.ok`; export `async` functions named
   `fetchX`. Convert `Observable` chains to `await`. Any fire-and-forget
   inner `subscribe` that enriched data (e.g. poll options) becomes
   `Promise.allSettled` — never `Promise.all` — so one failed sub-request
   doesn't hide the parent record.
3. **State service → Context.** `SettingsProvider` + `useSettings()` that
   throws outside the provider. Preserve the exact settings shape, every
   `localStorage` key and default, and setter names (`toggleX`, `setX`).
   Re-create `matchMedia('(prefers-color-scheme: dark)')` subscriptions in a
   `useEffect` with cleanup; keep the "persist on first load when no saved
   value" semantics only if the Angular code did that.
4. **Routes → `<Routes>` in `App.tsx`.** Route `data` becomes props
   (`<Feed feedType="news" />`), `redirectTo` → `<Navigate replace>`,
   `loadChildren` → `React.lazy` + `<Suspense fallback={<Loader/>}>`.
   Keep `:param` names identical so deep links survive.
5. **Components, one at a time**, deepest leaf first (loader, error, item,
   comment → feed, item-details, user → header, footer, settings → App).
   Copy the HTML, then translate mechanically:

   | Angular | React |
   |---|---|
   | `*ngIf="x"` / `*ngIf="x; else t"` | `{x && ...}` / ternary |
   | `*ngFor="let s of list; let i = index"` | `list.map((s, i) => ... key=...)` |
   | `[class.foo]="c"` / `[ngClass]` | template-string `className` |
   | `[ngStyle]="{width: w}"` | `style={{ width: w }}` |
   | `(click)="f()"` | `onClick={f}` |
   | `routerLink="/x"`, `routerLinkActive` | `<Link to>`, `<NavLink className={({isActive}) => ...}>` |
   | `[innerHTML]="html"` | `dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}` (see §3) |
   | `[hidden]="c"` | `hidden={c}` |
   | `(ngModelChange)` / `[(ngModel)]` | controlled input `value` + `onChange` |
   | `data \| async` | `useState` + `useEffect` fetch with an `ignore` flag in cleanup |
   | `x \| somePipe` | `formatX(x)` from `src/utils` |
   | `location.back()` | `useNavigate()(-1)` |
   | `window.scrollTo(0,0)` in `ngOnInit` | inside the fetch `.then` / effect |
   | `ga(...)` in router subscription | `useLocation()` effect in an `<Analytics/>` component |

   Keep class names, ids, element nesting and text identical unless there is
   a concrete reason; the SCSS and the reviewer's diff depend on it.
6. **Pipes / directives** → pure functions in `src/utils` with the same
   branching (e.g. `0 → "discuss"`, `1 → "1 comment"`, `n → "n comments"`).
7. **SCSS.** Move each component's `.scss` next to its `.tsx` and `import`
   it there. Then:
   - Angular emulated view-encapsulation made every component stylesheet
     local; in React they are global. Wrap each ported file in a root class
     (`.app-feed { ... }`) and put that class on the component's root
     element. `:host` → the root class; `:host >>> x` / `::ng-deep x` →
     `.app-comp x`. Check for shared selectors (`.subtext`, `.title`, `p`,
     `a`) that would otherwise collide across components.
   - Modernise Sass: `@import` → `@use "..." as *`, `a / b` → `math.div`
     with `@use "sass:math"`, `darken()`/`lighten()` → `color.adjust`. Fix
     until `vite build` prints no Sass deprecation warnings (the legacy JS
     API warning is from Vite itself and is fine).
   - Theme classes/mixins (`.night`, `.amoledblack`, …) stay untouched;
     they target the same class names.
8. **PWA.** Replace `@angular/service-worker` with `vite-plugin-pwa`
   (`registerType: 'autoUpdate'`, `manifestFilename: 'manifest.webmanifest'`,
   `workbox.navigateFallback: '/index.html'`, `globPatterns` covering
   js/css/html/ico/png/svg/webmanifest). Copy `manifest.json` content into
   the plugin's `manifest` option (name, icons, theme/background colour,
   `display`, `start_url`) and keep `public/manifest.json` + `public/assets`
   so existing icon/manifest links still resolve. Call
   `registerSW({ immediate: true })` in `main.tsx`.
9. **Delete** everything in the inventory §0.8 list, then `npm install`
   from a clean `node_modules` and commit the regenerated `package-lock.json`.
10. **Docs & CI**: README (stack, `npm run dev/build/preview`), CONTRIBUTING
    (no `ng`, port 5173/4173), CI config (Node 20, `npm ci && npm run lint &&
    npm run build`), hosting output dir, blueprint maintenance commands.

## 3. Pitfalls that reviewers/CI will catch — handle up front

- **XSS**: Angular's `[innerHTML]` runs `DomSanitizer`; React's
  `dangerouslySetInnerHTML` does not. Add `dompurify` and a
  `src/utils/sanitize.ts` (`sanitizeHtml = (h) => DOMPurify.sanitize(h ?? '')`)
  and use it at every `__html` site (comments, item text, poll options,
  user bio). Grep for `dangerouslySetInnerHTML` before pushing.
- **`Promise.all` on enrichment requests** hides the parent record when one
  child request fails; use `allSettled` and aggregate over fulfilled results.
- **Race conditions**: every data `useEffect` needs `let ignore = false` +
  cleanup so a fast route change can't apply a stale response; also reset
  `items`/`error` state at effect start so the loader shows again.
- **Route param types**: `useParams()` returns strings; coerce (`+page`) and
  default sensibly.
- **`key`s** in `.map` — use stable ids, never the index, for lists that
  reorder (comments, stories).
- **Number inputs bound to strings**: keep the stored type the Angular code
  used (often `'16'` string) so persisted values stay compatible.
- **Global CSS collisions** from missing encapsulation (see §2.7).
- **Stale lockfile / duplicate manifest tags** — remove the old
  `<link rel="manifest">` and `<meta name="theme-color">` from `index.html`
  if the PWA plugin injects them.
- **Typed globals**: declare `window.ga`, etc. in `src/types/*.d.ts`; use
  optional call `window.ga?.()`. No `any`.
- **Security scanners (Snyk/Dependabot) run on the PR**: run `npm audit`
  before the first push; patch-bump what you can (e.g. Vite). If the only
  fix is a major bump the user ruled out (e.g. `react-router-dom` 6 → 7),
  stop and ask instead of silently upgrading.
- **Commit/PR conventions**: follow repo knowledge (e.g. commit messages
  must contain `feature`/`bug`; PR body must end with the org tag line).

## 4. Verification gate (all required before "done")

Shell (do these yourself, in order):

```bash
npm install
npm run lint
npm run build            # tsc + vite build; zero Sass deprecation warnings
ls dist/index.html dist/manifest.webmanifest dist/sw.js dist/assets
npm run preview &        # :4173 — SW + manifest resolve, SPA fallback works
```

Browser (hand to the testing agent once the PR exists; record it):

1. `/` redirects to the default route; every feed route renders, nav
   highlights the active link, pagination (`More`/`Prev`) and rank numbering
   continue correctly, page scrolls to top.
2. Detail view: title/meta, nested comments indent, collapse/expand toggles,
   HTML content rendered (and sanitized), poll bars sized by share.
3. User view (incl. API 404 → error component), browser back and in-app
   back button return to the previous page.
4. Settings: each theme switches instantly; checkbox/number inputs apply
   live; reload → all values persist under the original `localStorage` keys;
   `prefers-color-scheme` change flips theme when no saved theme.
5. Console clean (router future-flag warnings acceptable); no 404s for
   icons/manifest.

Take one screenshot per route into `~/screens/` and embed the key ones in the
PR description.

## 5. PR description checklist

- Stack summary + why (one paragraph), file-map of new `src/` layout.
- Behavioural deltas called out explicitly (e.g. sanitization added,
  `allSettled` poll fetching, fields added to models, dead bindings fixed).
- Removed files/deps list.
- Verification evidence: commands run, routes checked, screenshots.
- Follow-ups (e.g. tests were not ported because none existed; consider
  Vitest + React Testing Library).
