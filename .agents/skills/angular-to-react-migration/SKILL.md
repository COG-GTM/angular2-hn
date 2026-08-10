---
name: angular-to-react-migration
description: Migrate an Angular component, service, pipe or feature area of this repo (angular2-hn) to the React target at react-app/. Use for any "port X to React" / "migrate the Angular Y" task — it defines the target project layout, the Angular→React construct mapping, SCSS porting rules, Vitest conventions, and the parallel-workstream + stacked-PR workflow.
---

# Angular → React migration (angular2-hn)

The Angular app under `src/` is the source of truth and stays untouched. The React port lives
alongside it at `react-app/` so both can run side by side for visual comparison.

## Target project

`react-app/` — Vite + React 19 + TypeScript, `react-router-dom`, `sass`, Vitest +
`@testing-library/react` (jsdom, globals, setup file `src/test/setup.ts`).

```
react-app/src/
  main.tsx                      BrowserRouter > SettingsProvider > App
  App.tsx                       routes + themed `.wrapper` shell
  styles.scss                   global: @use "./shared/scss/themes" + wrapper/body-cover rules
  shared/
    models/                     Story, Settings, User, Comment, PollResult (interfaces)
    services/hackerNewsApi.ts   fetchFeed / fetchItemContent / fetchPollContent / fetchUser
    services/settingsContext.tsx SettingsProvider + useSettings()
    pipes/<name>.ts             pipes as plain functions
    components/<Name>/          Name.tsx + Name.scss + Name.test.tsx
    scss/                       _media, _theme_variables, _themes (copied from Angular)
  <feature>/<Name>/             Name.tsx + Name.scss + Name.test.tsx
```

Commands (run from `react-app/`): `npm install`, `npm run dev`, `npm run test`,
`npm run typecheck`, `npm run build`, `npm run lint`. All four must pass before opening a PR.
Known-acceptable lint noise: `react(only-export-components)` warnings from
`src/shared/services/settingsContext.tsx`.

Running the original Angular app for comparison needs Node 20 **and** the legacy OpenSSL flag:

```bash
source ~/.nvm/nvm.sh && nvm use 20
NODE_OPTIONS=--openssl-legacy-provider npm start   # http://localhost:4200
```

## Construct mapping

| Angular | React |
| --- | --- |
| `@Component` + `templateUrl` | function component returning the same JSX DOM/classes |
| `@Input() foo` | prop `{ foo }` |
| getter (e.g. `hasUrl`) | plain `const` in the component body |
| `*ngIf="c"` | `{c && <X/>}` / ternary |
| `*ngFor="let x of xs"` | `xs.map(x => ...)` with a stable `key` |
| `[class.foo]="c"` | `className={c ? 'a foo' : 'a'}` |
| `[ngStyle]="{'font-size': n+'px'}"` | `style={{ fontSize: `${n}px` }}` |
| `[attr.target]="c ? '_blank' : null"` | `target={c ? '_blank' : undefined}` (undefined omits it) |
| `[routerLink]="['/item', id]"` | `<Link to={`/item/${id}`}>` |
| route `data` / `params` | `useParams()` (feed type became a URL segment: `/:feedType/:page`) |
| `@Pipe` + `transform()` | exported function, e.g. `formatCommentCount(n)` |
| `@Injectable` service with RxJS | plain `async` functions returning promises |
| injectable holding UI state (`SettingsService`) | React context + hook (`useSettings()`), immutable state |
| `ngOnInit` + `subscribe` | `useEffect` + `useState`, cleanup via `AbortController` |

Fetch/effect pattern — always abort on cleanup and ignore aborted responses so a stale response
cannot overwrite newer state, and keep Angular's `complete`-callback side effects (e.g.
`window.scrollTo(0, 0)`) after the request settles:

```tsx
useEffect(() => {
    const controller = new AbortController();
    setItems(null); setErrorMessage('');
    fetchFeed(feedType, pageNum, controller.signal)
        .then(
            data  => { if (!controller.signal.aborted) setItems(data); },
            ()    => { if (!controller.signal.aborted) setErrorMessage(`Could not load ${feedType} stories.`); }
        )
        .then(() => { if (!controller.signal.aborted) { /* post-settle side effects */ } });
    return () => controller.abort();
}, [feedType, pageNum]);
```

Keep user-visible strings byte-identical to the Angular originals (error text, "‹ Prev",
"More ›", job header copy).

## SCSS porting rules

1. Copy the component's `.scss` next to the `.tsx` and import it (`import './Item.scss';`).
2. Rewrite the shared-partial imports as `@use` — Dart Sass modern API, `@import` is deprecated:
   `@use "../../shared/scss/media" as *;` / `@use "../../shared/scss/theme_variables" as *;`
   (adjust the relative depth for the new file location).
3. Modernise removed built-ins: `$x / 8` → `math.div($x, 8)` (add `@use "sass:math";`),
   `darken($c, 33%)` → `color.adjust($c, $lightness: -33%)` (add `@use "sass:color";`).
4. Angular scoped styles per component (view encapsulation); a `.scss` imported from a `.tsx` is
   **global**. Nest every ported rule under the component's stable root class (e.g. `.item-block`,
   `.main-content`) so bare `p {}` / `a {}` / `ol {}` selectors do not leak. Otherwise keep the
   rules, selectors and media queries byte-identical.
5. Theme colours come from the global `_themes.scss`, which keys off the theme class on the app
   root and selectors like `.wrapper a`, `.subtext-palm`, `.loader` — so preserve those class
   names exactly or theming silently breaks.

## Tests (required per migrated file)

One `*.test.tsx` next to each component; Vitest + Testing Library. Render inside `MemoryRouter`
(with the right `initialEntries` when the component reads route params) and `SettingsProvider`
when the tree uses `useSettings()`. Mock services with `vi.mock('../../shared/services/...')`.
Cover: rendering of each conditional branch, props, route links (`to`/`href`), pipe formatting
edge cases (0 / 1 / n), loading vs error vs loaded states, and effects (`fetchX` call args,
refetch on param change, `window.scrollTo`). Services/pipes get plain `*.test.ts` covering URL
construction, `AbortSignal` forwarding and rejection.

## Verification

Beyond unit tests, run both apps and compare screenshots at desktop **and** ~375px mobile widths
(the templates swap `.subtext-palm` / `.subtext-laptop` at the 768px breakpoint), plus the dark
theme via `localStorage.theme = 'night'`. Story content differs between runs — compare layout,
typography, spacing and colour, not text.

## Workflow for a multi-component area

1. **Foundation first, alone.** Port the shared services/models/pipes/components/SCSS the target
   components import, land it on a base branch, and push it before anything else starts.
2. **One session per component**, all branched off the foundation branch, each owning a disjoint
   file set (`react-app/src/<feature>/<Name>/*` only). Overlapping edits cause merge conflicts.
   Add placeholder stubs on the foundation branch for the components the others import so every
   branch compiles on its own.
3. **Stacked PRs**, bottom-up: foundation → `master`, then each component PR based on the branch
   below it (rebase onto it before opening), assembled with `git_stack`. This repo is a fork —
   always target `COG-GTM/angular2-hn`, never upstream. Commit messages include `feature` or `bug`.
