# React migration foundation

These foundation notes are retained for reference. The React 18 app now lives at the repository root; the original Angular app has been removed.

## Run

Use Node.js 24+ and npm from the repository root:
```sh
npm ci
npm run dev
```

`npm run lint`, `npm test`, and `npm run build` validate the app.
`npm run preview` serves the production build locally.

## Module map / parallel ownership

- `src/models/index.ts`: shared interfaces, ItemType, FeedType, FEED_TYPES and Theme. The source's `User.crated_time` spelling is retained.
- `src/api/hackerNewsApi.ts`: promise API, optional AbortSignal, HTTP error rejection and awaited poll aggregation.
- `src/settings/`: SettingsProvider and useSettings. The hook returns `settings`, `toggleSettings`, `toggleOpenLinksInNewTab`, `setTheme`, `setFont`, and `setSpacing`.
- `src/styles/`: shared global themes/media variables and root layout.
- `src/utils/formatCommentCount.ts`: comment label formatter.
- `src/components/Loader/`, `src/components/ErrorMessage/`: shared ports (ErrorMessage accepts `message`).
- **Feeds owner:** `src/pages/FeedPage.tsx` receives `feedType: FeedType`, reads `:page`.
- **Item owner:** `src/pages/ItemDetailsPage.tsx` reads `:id`; future comments belong with this feature.
- **User owner:** `src/pages/UserPage.tsx` reads `:id`.
- **Shell/settings owner:** `src/components/Header/Header.tsx`, `Footer/Footer.tsx`, `Settings/Settings.tsx`.
- `src/App.tsx`: layout; `src/routes.tsx`: shared route table; `src/main.tsx`: router/provider composition.

Page and shell components are deliberately TODO placeholders; no API calls are wired to them yet.
Later owners should consume shared contracts rather than edit other owners' files.

Settings retain the Angular localStorage keys. System theme changes continue to override and persist the theme, as in Angular. Public Theme uses `amoled`; the layout maps it to the existing `amoledblack` CSS class and accepts legacy saved `amoledblack` values.
Feed titles should apply `settings.titleFontSize + 'px'`, item containers `settings.listSpacing + 'px'`; external links use `target="_blank"` and `rel="noopener"` when `openLinkInNewTab` is true. These values are exposed, not applied globally.
