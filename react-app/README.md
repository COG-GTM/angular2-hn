# react-app

React + TypeScript (Vite) skeleton for the in-progress migration of the Angular Hacker News PWA.
It currently contains only the framework-agnostic data layer; components, routing and templates
still live in the Angular app at the repo root.

- `src/models/` — interfaces ported from `src/app/shared/models/`
- `src/services/hackernewsApi.ts` — promise-based port of `HackerNewsAPIService`
- `src/App.tsx` — placeholder component that calls `fetchFeed('news', 1)` and renders the result

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # vitest unit tests for the API client
npm run build
npm run lint
```
