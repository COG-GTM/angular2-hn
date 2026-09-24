---
description: Apply before pushing any commit to a branch that has (or will have) a pull request in this repo.
---

# Run what CI runs before pushing

CI is `.github/workflows/ci.yml` (jobs `build` and `e2e`). CI failures that could have been caught locally cost a full CI cycle each; run the same commands locally first.

On the React/Vite toolchain (post-migration):

```bash
npm ci                     # not `npm install` — CI uses the lockfile verbatim
npm run lint
npm run format:check       # prettier: 4-space indent, single quotes, printWidth 120
npm run test:coverage      # vitest, 80% lines/branches/functions/statements thresholds
npm run build              # tsc --noEmit && vite build
CI=1 npx playwright test   # CI=1 disables reuseExistingServer and uses CI retries/workers
```

Rules of thumb:

- Run lint with the exact plugin versions from the lockfile (`npm ci`, not a stale `node_modules`); ESLint `react-hooks` rules differ between the rc and stable plugin releases.
- Playwright's `webServer` must bind to `127.0.0.1` (or `0.0.0.0`) with an explicit `--port` and `--strictPort`; a server bound to `localhost` only is not reachable in the CI runner.
- Playwright browsers are not preinstalled in the Devin snapshot: run `npx playwright install --with-deps chromium` once per session before `npm run e2e`.
- Fix CI failures with one targeted commit per cause; never amend or force-push.

On the legacy Angular toolchain (pre-migration `master`): `npm run lint`, `CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) npm test -- --watch=false`, `npm run build`.
