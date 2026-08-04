# React HN

A React port of the Angular app in `src/`. Both apps live side by side in this repository and target the
same [node-hnapi](https://github.com/cheeaun/node-hnapi) backend.

## Commands

```bash
npm install
npm start        # dev server on http://localhost:4200
npm run build    # typecheck + production build into dist/
npm test         # vitest unit tests
npm run lint     # eslint
```

## Structure

| Angular (`src/app/`)                        | React (`react-app/src/`)                  |
| ------------------------------------------- | ----------------------------------------- |
| `app.component.*`                           | `App.tsx`                                 |
| `app.routes.ts`                             | `<Routes>` in `App.tsx`                   |
| `core/header/`                              | `components/core/Header.tsx`              |
| `core/footer/`                              | `components/core/Footer.tsx`              |
| `core/settings/`                            | `components/core/Settings.tsx`            |
| `feeds/feed/`                               | `components/feeds/Feed.tsx`               |
| `feeds/item/`                               | `components/feeds/Item.tsx`               |
| `item-details/`                             | `components/item-details/ItemDetails.tsx` |
| `item-details/comment/`                     | `components/item-details/Comment.tsx`     |
| `user/`                                     | `components/user/UserProfile.tsx`         |
| `shared/components/loader/`                 | `components/shared/Loader.tsx`            |
| `shared/components/error-message/`          | `components/shared/ErrorMessage.tsx`      |
| `shared/services/hackernews-api.service.ts` | `services/hackernewsApi.ts`               |
| `shared/services/settings.service.ts`       | `context/SettingsContext.tsx`             |
| `shared/pipes/comment.pipe.ts`              | `utils/comment.ts`                        |
| `shared/models/`                            | `models/index.ts`                         |
| `shared/scss/`                              | `scss/`                                   |

Component SCSS is copied from the Angular components unchanged, so the three themes (default, night, AMOLED
black), fonts, and spacing settings render identically.
