# Angular → React migration

The React + TypeScript (Vite) app lives in `react-app/`. The Angular sources stay under `src/app/` as the
reference implementation until the cleanup phase removes them.

```
react-app/
  index.html               React entry (GA snippet + manifest preserved)
  public/                  assets/, favicon.ico, manifest.json copied from src/
  src/
    api/                   Hacker News API functions + useFetch hook
    components/shared/     Loader, ErrorMessage
    context/               SettingsContext
    models/                data models copied from src/app/shared/models
    styles/                _media.scss, _theme_variables.scss, _themes.scss, global.scss
    utils/                 formatCommentCount
```

Scripts: `npm run dev | build | preview | typecheck | lint` inside `react-app/` (root `package.json`
forwards the same names with `npm --prefix react-app`). Production build outputs to `react-app/dist/`.

## Frozen interface (phase 1 contract)

### Models — `src/models/*`

`Story`, `Comment`, `User`, `PollResult`, `Settings` interfaces and the `FeedType` union
(`'poll' | 'story' | 'job'`), field-for-field copies of `src/app/shared/models/`. Re-exported from
`src/models/index.ts`; import as types:

```ts
import type { Story } from '../../models/story';
```

### API — `src/api/hackernews.ts`

```ts
const BASE_URL = 'https://node-hnapi.herokuapp.com';

function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]>;
function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story>;   // expands poll options + poll_votes_count
function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult>;
function fetchUser(id: string, signal?: AbortSignal): Promise<User>;
```

### Fetch hook — `src/api/useFetch.ts`

Replaces the RxJS `lazyFetch` observable/cancel-token pattern with `useEffect` + `AbortController`.

```ts
interface FetchState<T> { data: T | null; loading: boolean; error: Error | null }

function useFetch<T>(request: (signal: AbortSignal) => Promise<T>, deps: unknown[]): FetchState<T>;
```

```tsx
const { data: stories, loading, error } = useFetch(
    (signal) => fetchFeed(feedType, page, signal),
    [feedType, page]
);
```

### Settings — `src/context/SettingsContext.tsx`

`SettingsProvider` wraps the app (already mounted in `src/main.tsx`). `useSettings()` returns the
settings fields flattened plus the whole object and the actions:

```ts
{
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;          // 'default' | 'night' | 'amoledblack'
    titleFontSize: string;  // px value as string, default '16'
    listSpacing: string;    // px value as string, default '0'
    settings: Settings;
    toggleSettings(): void;
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void;
    setFont(fontSize: string): void;
    setSpacing(listSpacing: string): void;
}
```

`openLinkInNewTab`, `theme`, `titleFontSize` and `listSpacing` are persisted in `localStorage` under those
exact keys; when no theme is stored, the `prefers-color-scheme: dark` listener selects `night`/`default`.

### Shared components — `src/components/shared/`

```tsx
<Loader />                              // no props
<ErrorMessage message="..." />          // ErrorMessageProps { message: string }
```

### Utils — `src/utils/formatCommentCount.ts`

```ts
function formatCommentCount(count: number): string;  // 0 → 'discuss', 1 → '1 comment', n → 'n comments'
```

### SCSS

Shared partials live in `react-app/src/styles/`. From a component under `src/components/<area>/`:

```scss
@import '../../styles/media';
@import '../../styles/theme_variables';
```

`src/styles/global.scss` (imported once in `main.tsx`) pulls in `_themes.scss`, so theme class names
(`default`, `night`, `amoledblack` applied on the root `<div>`) and `.wrapper` / `.body-cover` styling work
unchanged. Per-component SCSS is imported from its `.tsx` file (`import './Feed.scss';`).

### Component layout for the remaining phases

| Angular                                     | React                                     |
| ------------------------------------------- | ----------------------------------------- |
| `core/header/header.component.ts`           | `src/components/core/Header.tsx`          |
| `core/footer/footer.component.ts`           | `src/components/core/Footer.tsx`          |
| `core/settings/settings.component.ts`       | `src/components/core/Settings.tsx`        |
| `feeds/feed/feed.component.ts`              | `src/components/feeds/Feed.tsx`           |
| `feeds/item/item.component.ts`              | `src/components/feeds/Item.tsx`           |
| `item-details/item-details.component.ts`    | `src/components/item-details/ItemDetails.tsx` |
| `item-details/comment/comment.component.ts` | `src/components/item-details/Comment.tsx` |
| `user/user.component.ts`                    | `src/components/user/UserProfile.tsx`     |

Routing, the root `App` shell and the PWA setup are owned by the later phases; component phases must not
edit `src/main.tsx`, `index.html`, `vite.config.ts` or anything under `src/api`, `src/context`,
`src/models`, `src/styles`, `src/utils` or `src/components/shared`.
