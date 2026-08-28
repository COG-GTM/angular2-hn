# react-app

React + TypeScript + Vite rewrite of the Hacker News client. It lives alongside the Angular app
(`../src`) while the migration is in progress; the Angular sources are removed in the final PR of
the migration series, at which point this app moves to the repository root.

## Scripts

Run from this directory (`react-app/`), it has its own `package.json` and `node_modules`:

```bash
npm install
npm run dev          # dev server on http://localhost:5173
npm run build        # type-check + production build into dist/
npm run lint         # ESLint
npm run format       # Prettier (settings match the Angular app's prettier config)
```

## Styles and assets

`src/styles/` holds the global stylesheet and theme partials ported from `../src/styles.scss` and
`../src/app/shared/scss/`. Deprecated Sass APIs (`@import`, `darken()`, `/` division) were replaced
with their `@use` / `sass:color` / `sass:math` equivalents so the stylesheet compiles warning-free
with modern dart-sass. Icons, images, `favicon.ico` and `manifest.json` are copied into `public/`.
