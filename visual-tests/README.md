# Visual regression harness (Angular source vs React port)

Captures the same screenshot matrix from the Angular app (`/`) and the React port
(`react-app/`), then compares every pair with `pixelmatch`. Screenshots and diffs are
generated locally and are git-ignored.

## Setup

```bash
cd visual-tests
npm install
npx playwright install chromium
```

Run both dev servers:

```bash
# Angular source (Angular 9 needs the legacy OpenSSL provider on Node 17+)
NODE_OPTIONS=--openssl-legacy-provider npm start          # http://localhost:4200

# React port
cd react-app && npm run dev -- --port 4300 --strictPort   # http://localhost:4300
```

## Capture and compare

```bash
npx tsx capture-both.ts   # or capture-source.ts / capture-react.ts individually
npx tsx compare.ts        # writes screenshots/diff/*.png and prints a pass/fail table
```

`compare.ts` fails if any pair exceeds 2% pixel mismatch.

## Determinism

- `mocks.ts` intercepts every request to `https://node-hnapi.herokuapp.com/**` via Playwright
  routing and fulfils it with the JSON fixtures in `fixtures/`, so both apps render identical
  content regardless of upstream availability.
- The upstream `/user/:id` endpoint is dead (`Cannot GET /user/alexeigannon`), so
  `fixtures/user.json` is a synthetic but deterministic profile.
- Error states are produced by aborting the intercepted request.
- Animations/transitions are disabled via an injected stylesheet, and each capture waits for
  `networkidle`, `document.fonts.ready`, and the view's key selector.

## Matrix

`matrix.ts` lists 19 views (feeds with pagination, all feed types, themes, typography settings,
settings panel open, item detail incl. ask/night/collapsed-comment states, user profile, and
error states), each captured at 1280x800 and 375x812 → 38 pairs.
