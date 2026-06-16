# Visual regression tests (Angular baseline vs React port)

Pixel-diff harness that verifies the React port (`../react-hn`) matches the
original Angular app (`..`) across all views, themes, and viewports.

## How it works

- `config.ts` — the screenshot matrix (views, themes, viewports) and fixed IDs.
- `capture-lib.ts` — shared Playwright harness. Intercepts the Hacker News API
  (`node-hnapi.herokuapp.com`) and serves the JSON in `fixtures/` so both apps
  render identical data (the live API changes constantly).
- `capture-angular.ts` / `capture-react.ts` — capture full-page screenshots into
  `screenshots/angular` (committed baseline) and `screenshots/react` (generated).
- `compare.ts` — runs `pixelmatch` per pair, writes diffs to `screenshots/diffs`,
  and fails any view with >2% pixel mismatch.

## Running

```bash
npm install
npx playwright install chromium

# 1. Angular on :4200  (NODE_OPTIONS=--openssl-legacy-provider npm start in ..)
npx ts-node capture-angular.ts

# 2. React on :3000    (npm start in ../react-hn)
npx ts-node capture-react.ts

# 3. Compare
npx ts-node compare.ts
```

`screenshots/react` and `screenshots/diffs` are generated output and are
git-ignored; `screenshots/angular` is the committed reference baseline.
