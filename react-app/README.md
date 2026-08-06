# React HN (react-app)

React + TypeScript port of angular2-hn, built with [Vite](https://vite.dev/).

## Development

```bash
npm install
npm run dev       # Vite dev server on http://localhost:5173
```

## Scripts

- `npm run build` — type-check (`tsc -b`) and produce a production build (including the PWA service worker) in `dist/`
- `npm run preview` — serve the production build locally (use this to test the service worker)
- `npm run lint` — ESLint (flat config in `eslint.config.js`, using `typescript-eslint`)
- `npm run test` — Vitest unit tests (React Testing Library)
- `npm run e2e` — Playwright end-to-end tests (hits the live `node-hnapi.herokuapp.com` API)

See the root `CONTRIBUTING.md` for the full workflow.
