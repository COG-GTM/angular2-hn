# Visual e2e: Angular vs React screenshot comparison

Deterministic Playwright screenshots of both apps with **identical data**: every request to
`https://node-hnapi.herokuapp.com/**` is intercepted and answered from `fixtures/` (recorded once), and
Google Analytics is blocked. Each shot runs in a fresh browser context with `localStorage.theme` preset
and `prefers-color-scheme: light`.

Matrix (`config.mjs`): routes `news/1`, `newest/1`, `show/1`, `ask/1`, `jobs/1`, `item/49887343`,
`user/laurenth`, plus `settings` (news/1 with the settings popup open) × themes `default`, `night`,
`amoledblack` × viewports `desktop` 1280×800 and `mobile` 390×844 → 48 full-page PNGs named
`{route}--{theme}--{viewport}.png`.

```bash
cd e2e-visual
npm install && npx playwright install chromium   # Node 20

# Reference set (Angular 9 app, Node 14):  cd .. && nvm use 14 && npx ng serve   -> :4200
node capture.mjs --base-url http://localhost:4200 --out ../reference-screenshots

# React app:  cd ../react && npm run build && npm run preview   -> :4173
node capture.mjs --base-url http://localhost:4173 --out ../react-screenshots

# Pixel diff (writes diff PNGs + report.md/report.json; non-zero exit if any shot > 1% different)
node diff.mjs --ref ../reference-screenshots --actual ../react-screenshots --out ../screenshot-diffs

# Subset:  node capture.mjs --base-url ... --out ... --only '^item--'
```

`node record-fixtures.mjs` re-records fixtures from the live API (then recapture the references).
node-hnapi's `/user/:id` endpoint currently returns 404 live, so the user fixture is recorded from
`api.hnpwa.com` (same JSON schema) — see `FIXTURE_SOURCE_OVERRIDES`.

## Interaction checks

`node interactions.mjs --base-url <app>` drives the golden paths on fixtured data and exits non-zero on failure:
root redirect, More/Prev pagination (`ol[start]` 31 ↔ 1), header nav to every feed, feed → comments
(nested tree), comment collapse `[-]`/`[+]`, item → user profile, settings theme switch to
Night/Black/Default with `localStorage.theme` persisted across reload, and open-links-in-new-tab.
Passes 10/10 against both the Angular app and the React port.
