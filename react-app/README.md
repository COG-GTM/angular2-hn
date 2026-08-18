# angular2-hn — React 18 + TypeScript port

Standalone React port of the Angular HNPWA in this repo. The Angular app is untouched; this
directory is additive.

- React 18, TypeScript (strict), Vite, `react-router-dom` v6, SCSS
- Same routes: `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page`,
  `/item/:id`, `/user/:id` (`/` redirects to `/news/1`)
- Same SCSS theme engine (Default / Night / AMOLED black), same localStorage keys
  (`theme`, `openLinkInNewTab`, `titleFontSize`, `listSpacing`), same `prefers-color-scheme` default
- `HackerNewsAPIService` ported to native `fetch` with `AbortController`
- Item and user routes are code-split with `React.lazy`, mirroring the Angular lazy modules
- PWA assets (manifest, favicon, icons) copied to `public/`

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # oxlint
npm run build    # tsc -b && vite build
```

## Notes

- Comment/item bodies come from the API as HTML and are rendered with `dangerouslySetInnerHTML`,
  matching the Angular `[innerHTML]` binding.
- Angular's `ViewEncapsulation` is emulated by scoping each component's SCSS under its custom
  element wrapper (`app-feed`, `app-comment`, `item`, …), which are declared as intrinsic JSX
  elements in `src/custom-elements.d.ts` and rendered with `display: inline` where Angular's
  default inline hosts affect layout.
- The upstream API (`node-hnapi.herokuapp.com`) is partially dead: `/user/:id` returns
  `Cannot GET`. Feeds/items still work; visual tests use fixtures for both apps (see
  `../visual-tests/README.md`).
