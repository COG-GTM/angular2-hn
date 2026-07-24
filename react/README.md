# HN PWA (React + TypeScript + Vite)

A progressive Hacker News client. See the [root README](../README.md) for the full feature list and project background.

## Scripts

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest test suite
npm run lint       # ESLint
npm run typecheck  # TypeScript project check
npm run build      # typecheck + production build (dist/)
npm run preview    # preview the production build (with service worker)
```

## Structure

- `src/api/` — fetch-based clients for node-hnapi (live feeds) and the Algolia HN Search API (date-based browsing)
- `src/models/` — TypeScript interfaces (`Story`, `Comment`, `User`, `PollResult`, settings)
- `src/pages/` — routed pages: `Feed`, `ItemDetails`, `User`, `FrontPage` ("front page on this day")
- `src/components/` — shared UI (header/footer, item row, comment thread, settings panel, loader, error)
- `src/context/` — settings context (theme, link behavior, font size, spacing) persisted to `localStorage`
