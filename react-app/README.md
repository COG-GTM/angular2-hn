# React HN (migration target)

React rewrite of the Angular app at the repo root. The Angular app stays untouched until cutover.

Stack: Vite, React 19, TypeScript (strict), React Router, TanStack Query, Sass, ESLint + Prettier, Vitest + React Testing Library, Playwright.

Requires Node 20 (`>=20.19`, see `.nvmrc`).

```bash
cd react-app
npm ci
npm run dev        # dev server on http://localhost:5173
npm run lint       # eslint + prettier --check
npm run typecheck
npm test           # vitest
npm run build      # output in react-app/dist
npm run preview
npm run e2e        # playwright (no specs yet)
```

`public/` holds the icons, images, `favicon.ico` and `manifest.json` copied from `src/` of the Angular app.
