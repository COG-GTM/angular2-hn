---
name: verify-react-hn
description: Verify the React Hacker News PWA end-to-end before pushing - lint, format, coverage thresholds, build, dev-server smoke test of every route, and the Playwright e2e suite under CI conditions. Use before opening or updating any PR in angular2-hn.
---

# Verify the React HN app

Run from `~/repos/angular2-hn`. All steps must pass before `git push`.

## 1. Static checks and unit coverage

```bash
npm ci
npm run lint
npm run format:check
npm run test:coverage 2>&1 | tail -20
```

The coverage summary must show lines/branches/functions/statements all >= 80% (Vitest fails the run otherwise). If a threshold fails, add tests for the file with the lowest column — do not lower the threshold in `vite.config.ts`.

## 2. Build

```bash
npm run build 2>&1 | grep -E "error|✓ built|PWA"
```

Confirm the PWA plugin emits `dist/react-hnpwa/manifest.webmanifest` and a service worker.

## 3. Dev-server smoke test

```bash
(npm run dev > /tmp/vite.log 2>&1 &); sleep 6
for p in / /news/1 /newest/1 /show/1 /ask/1 /jobs/1 /item/1 /user/pg; do
  printf "%s -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4200$p"
done
```

Every route must return 200. Then open http://localhost:4200 in the browser and check: header nav, a feed page with items, an item page with nested comments, the settings panel (theme/font/spacing toggles persist across reload), and the footer.

Known external limitation: `https://node-hnapi.herokuapp.com/user/:id` returns 404 as of 2026-09, so `/user/:id` shows the error state with live data. That is not a regression; e2e specs stub the API.

## 4. Playwright e2e under CI conditions

```bash
npx playwright install --with-deps chromium   # browsers are not in the snapshot
CI=1 npx playwright test 2>&1 | tail -8
```

`CI=1` matches the GitHub Actions job (no server reuse, 1 worker, 2 retries). If a spec fails only under `CI=1`, check `playwright.config.ts` `webServer` binds `127.0.0.1` with `--strictPort`.

## 5. Clean up

```bash
pkill -f "vite" || true
git status --short   # no stray dist/, playwright-report/, test-results/
```
