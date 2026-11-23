# Angular → React parity suite

The same Playwright specs run against the Angular 9 app (`baseline`) and the React app in `react-app/` (`react`).
Both HN APIs are served from `fixtures/` (recorded from node-hnapi and HNPWA), so runs are deterministic and offline.

```bash
# baseline: Angular 9 needs Node 12 to build
git worktree add ../angular2-hn-baseline origin/master
(cd ../angular2-hn-baseline && npm ci && nvm exec 12 npx ng build --prod)
node parity/serve.mjs ../angular2-hn-baseline/dist/angular-hnpwa 4000

# react
(cd react-app && npm ci && npm run build && npm run preview)   # http://localhost:4300

# suite
cd parity && npm ci && npx playwright install chromium
npx playwright test            # both projects; or --project=baseline / --project=react
npm run report                 # side-by-side screenshots + pixel diff in report/
```

Specs assert what a user sees (text, counts, links, computed theme colors, localStorage keys), never component internals.
