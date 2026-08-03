# React HNPWA

React + TypeScript + Vite port of the Angular Hacker News client that lives at the repository root. Both apps
coexist while the migration is in progress; the Angular app is removed once parity is reached.

## Commands

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the Vite dev server on `localhost:5173`   |
| `npm run build`        | Typecheck and build the production bundle       |
| `npm run preview`      | Serve the production bundle                     |
| `npm test`             | Run the Vitest unit/component suite             |
| `npm run test:coverage`| Run tests with a v8 coverage report             |
| `npm run lint`         | ESLint over `src`                               |
| `npm run typecheck`    | `tsc -b` with no emit                           |
| `npm run format`       | Prettier (4-space tabs, single quotes, 120 cols)|

## Layout

- `src/router` — route table, including the feed routes that carry a feed type
- `src/shared` — models, API access, stores and shared components
- `src/core` — app shell: header, footer, settings
- `src/features` — feed, item details and user features
- `src/styles` — SCSS theme engine ported from the Angular app
