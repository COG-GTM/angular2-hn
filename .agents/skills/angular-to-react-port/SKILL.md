---
name: angular-to-react-port
description: Port one Angular component/feature from src/app/<feature> to a React component in src/components or src/pages with matching markup, SCSS, unit test, and removal of the Angular source. Use for any Angular -> React migration step in this repo.
---

# Port an Angular feature to React

Inputs: the Angular feature directory `src/app/<feature>/` (or a single `<name>.component.*` triple).

## 1. Read the source in one pass

```bash
cd ~/repos/angular2-hn/src/app && for f in <feature>/*.ts <feature>/*.html <feature>/*.scss; do echo "=== $f"; cat "$f"; done
```

Note: inputs/outputs, injected services, `*ngIf`/`*ngFor` blocks, pipes, `routerLink`s, and every CSS class in the template.

## 2. Translate

| Angular | React |
|---|---|
| `@Component` class | function component `export function Name(props)` |
| `@Input()` | prop |
| `@Output() x = new EventEmitter()` | `onX` callback prop |
| `*ngIf="cond"` | `{cond && (...)}` / ternary |
| `*ngFor="let s of items; let i = index"` | `{items.map((s, i) => ...)}` with a stable `key` |
| `[routerLink]="[...]"` | `<Link to=...>` (react-router-dom) |
| `ActivatedRoute` params | `useParams()` |
| `HackerNewsAPIService` | functions in `src/api/hackernews.ts` |
| `SettingsService` | `useSettings()` from `src/context` |
| pipes (`domain`, `timeAgo`, …) | pure functions in `src/utils/*.ts` |
| `[class.foo]="cond"` | `className={cond ? 'foo' : ''}` |
| `[innerHTML]` | `dangerouslySetInnerHTML` (only for HN-provided HTML) |
| component `.scss` | copy to `src/components/<Name>.scss`, import from the component, keep selectors unchanged |

Keep class names and element nesting identical to the template; do not rename or "clean up" classes.

## 3. Write files

- `src/components/<Name>.tsx` (or `src/pages/<Name>Page.tsx` for routed views)
- `src/components/<Name>.scss` — `cp src/app/<feature>/<name>.component.scss src/components/<Name>.scss` then fix `@import` paths to `src/styles/`
- `src/components/<Name>.test.tsx` — React Testing Library; cover loading, success, error/empty states and every conditional branch (coverage threshold is 80%)

Batch file creation (several `write` calls in one `scripted_tools` run) rather than one file per turn.

## 4. Remove the Angular source and wire routes

```bash
git rm -rq src/app/<feature>
grep -rn "<feature>/" src --include=*.ts --include=*.tsx   # fix leftovers
```

Add/adjust the route in `src/AppRoutes.tsx` if the feature is a routed view.

## 5. Verify

```bash
npx prettier --write src >/dev/null
npm run lint && npm run test:coverage 2>&1 | grep -E "×|Tests |Test Files|All files|ERROR" 
npm run build 2>&1 | grep -E "error|✓ built"
```

Then start `npm run dev`, load the route in the browser and compare against the Angular markup (see the `verify-react-hn` skill).

## 6. Commit

One commit per feature on a branch cut from the previous phase. PR description: list the Angular files removed and the React files added, and end with `Devin-Org: engineering`.
