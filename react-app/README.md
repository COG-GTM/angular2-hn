# angular2-hn — React + TypeScript

React 19 + TypeScript (Vite) port of the Angular Hacker News PWA in the repository root.
Routes, markup, styles, settings and PWA metadata mirror the Angular app so the two
render identically; the Angular app is kept in place as the pixel-parity baseline.

## Scripts

```bash
npm install
npm run dev         # dev server on http://localhost:5173
npm run build       # strict typecheck + production build
npm run lint
npm run typecheck
```

## Pixel parity harness

`parity/parity.spec.ts` renders the same route in both apps and compares full-page
screenshots with `pixelmatch`. Both dev servers must be running:

```bash
# Angular baseline (Node 20 needs the legacy OpenSSL provider for Angular 9/webpack)
NODE_OPTIONS=--openssl-legacy-provider npx ng serve --port 4200   # from the repo root
npm run dev                                                       # from react-app

npm run parity:fixtures   # optional: refresh the recorded API payloads
npm run parity
```

Both apps' calls to `node-hnapi.herokuapp.com` are intercepted and served from
`parity/fixtures/`, so results do not drift with live Hacker News data. The suite covers
the news/newest/show/ask/jobs feeds (including pagination), a link story, a text story
and a user profile, each at desktop (1280x900) and mobile (375x720) in the default and
night themes. A case fails when the page heights differ by more than 2px or the diff
ratio exceeds 0.001. Screenshots and diffs are written to `parity/screenshots/`
(git-ignored).
