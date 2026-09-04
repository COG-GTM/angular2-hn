# React HN

A React + TypeScript port of the Angular Hacker News client that lives in the repository root.

It keeps the original behaviour and design: five feeds (`news`, `newest`, `show`, `ask`, `jobs`)
with pagination, item details with a recursive comment tree, user profiles, the settings panel
(theme, title font size, list spacing, open links in a new tab) and the three SCSS themes
(Default / Night / AMOLED Black).

Data comes from the same public API: `https://node-hnapi.herokuapp.com`.

## Getting started

```bash
npm install
npm start      # http://localhost:3000
npm run build  # production bundle in build/
npx tsc --noEmit
```

## Structure

```
src/
├── components/   Header, Footer, Settings, Loader, ErrorMessage, FeedItem, Comment
├── contexts/     SettingsContext (replaces the Angular SettingsService)
├── models/       Story, Comment, User, Settings, PollResult, FeedType
├── pages/        Feed, ItemDetails, User
├── services/     hackerNewsApi (native fetch, replaces unfetch + RxJS)
├── scss/         theme engine shared with the Angular app
└── utils/        commentFormat (replaces CommentPipe)
```

Component styles are CSS modules that scope a single host class and declare the original
Angular class names inside `:global`, so the shared theme engine in `src/scss/_themes.scss`
keeps matching them unchanged.
