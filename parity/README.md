# Parity suite (Playwright)

The same specs run against both apps and check what a user sees:

| Project | App | URL | Node |
|---|---|---|---|
| `legacy` | Angular 9, branch `master` (production build) | http://localhost:4000 | 14 |
| `angular21` | Angular 21, this branch (production build) | http://localhost:4200 | 24 |

| Spec | Covers |
|---|---|
| `specs/feeds.spec.ts` | news list (30 stories, points, author, comment count), More/Prev pagination, header nav (new/show/ask/jobs), jobs header, logo link |
| `specs/story.spec.ts` | story page from the feed, title/domain/points/author, full comment tree, collapse/expand, author link to profile |
| `specs/user.spec.ts` | user profile: id, karma, account age, about |
| `specs/settings.spec.ts` | settings popup, theme toggle (Default/Night/AMOLED) persisted across reload, open links in new tab, font size and list spacing |
| `specs/pwa.spec.ts` | web app manifest, `ngsw.json`, `ngsw-worker.js` registered and the app shell loading offline |

## Run

```bash
cd parity
nvm use 24
npm ci
npx playwright install chromium

npx playwright test                       # both projects
npx playwright test --project=legacy      # Angular 9 only
npx playwright test --project=angular21   # Angular 21 only
npx playwright show-report report/html
```

Playwright starts the servers it needs (`scripts/serve-legacy.sh`, `scripts/serve-angular21.sh`) and reuses
any already listening on 4000/4200:

- `serve-legacy.sh` checks out `origin/master` into `../.parity-legacy` (git worktree, ignored), switches to
  Node 14 with nvm, installs, runs `ng build --prod` and serves `dist/angular-hnpwa` on 4000.
  Set `LEGACY_DIR` to reuse an existing master checkout, `REBUILD=1` to force a rebuild.
- `serve-angular21.sh` switches to Node 24, runs `ng build` (production, service worker included) and serves
  `dist/angular-hnpwa/browser` on 4200.

Both are served by `scripts/static-server.js` (no dependencies, SPA fallback). `PARITY_NO_SERVER=1` skips
starting servers; `LEGACY_PORT` / `ANGULAR21_PORT` change the ports.

## Data

By default every Hacker News API call (`node-hnapi.herokuapp.com`, `api.hnpwa.com`) is answered from
`fixtures/`, recorded from the live API, so both apps render the same stories and the specs assert exact
text. `PARITY_LIVE=1` uses the live API instead (story assertions are skipped, the rest check shape only).

`node-hnapi` no longer serves `/user/:id`, so the legacy profile page is broken against the live API. In live
mode the suite forwards that call to `api.hnpwa.com/v0/user/:id.json` (same JSON shape, the endpoint the
Angular 21 app uses); with fixtures both URLs return the same recorded user.

Service workers are blocked in every spec except `pwa.spec.ts`, so the API mocks always apply.

Full-page screenshots of every test end up in `report/screenshots/<project>/` for side-by-side review.

## Expected state

`legacy` is fully green. On `angular21`, specs for features that are still placeholders on
`devin/angular21-base` (feeds, story page, user profile, header/settings) fail until those feature PRs merge;
`pwa.spec.ts` passes.
