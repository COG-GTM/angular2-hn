# Phase 1 Frozen Contract (React migration)

These shapes are frozen at the end of Phase 1. Phase 2 feature sessions must consume them as-is and must not modify files under `src/shared/`, `src/App.tsx`, or `src/main.tsx` without coordination.

## Models (`src/shared/models`)

- `Story` — `{ id, title, points, user, time, time_ago, type: FeedType, url, domain?, content?, text?, comments: Comment[], comments_count, poll?: PollResult[], poll_votes_count?, deleted?, dead? }`
- `Comment` — `{ id, level, user, time, time_ago, content, deleted, comments: Comment[] }`
- `User` — `{ id, created_time, created, karma, avg, about? }`
- `PollResult` — `{ points, content }`
- `FeedType` — `'poll' | 'story' | 'job'`
- `Settings` — `{ showSettings, openLinkInNewTab, theme, titleFontSize, listSpacing }`

## API (`src/shared/api/hackernews.ts`)

Base URL: `https://node-hnapi.herokuapp.com`

- `fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]>`
- `fetchItemContent(id: number, signal?: AbortSignal): Promise<Story>` — for `type === 'poll'`, fetches each poll option (`id + 1 … id + n`) and sums `poll_votes_count`
- `fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult>`
- `fetchUser(id: string, signal?: AbortSignal): Promise<User>`

Use `AbortController` in effects to cancel in-flight requests on unmount/param change.

## Settings context (`src/shared/settings/SettingsContext.tsx`)

`useSettings(): { settings: Settings, toggleSettings(), toggleOpenLinksInNewTab(), setTheme(theme), setFont(fontSize), setSpacing(listSpacing) }`

localStorage keys preserved: `openLinkInNewTab`, `titleFontSize`, `listSpacing`, `theme`. `prefers-color-scheme` listener switches `default`/`night` when no saved theme.

## Shared components / utils

- `Loader`, `ErrorMessage({ message })` from `src/shared/components`
- `formatCommentCount(count): string` from `src/shared/utils/comment-count` (port of `comment.pipe`)
- Theme SCSS: `src/shared/scss/{_media,_theme_variables,_themes}.scss` — component SCSS should `@import` `media` and `theme_variables` like the Angular sources did.

## Routing (owned by shell, `src/App.tsx`)

- `/` → `/news/1`; `/news|newest|show|ask|jobs/:page` → `FeedPage feedType=...`; `/item/:id`, `/user/:id` lazy-loaded.
- Feature pages are default exports: `src/features/feed/FeedPage.tsx` (props `{ feedType }`), `src/features/item/ItemDetailsPage.tsx`, `src/features/user/UserPage.tsx`. Phase 2 replaces these placeholder bodies in place — routing does not change.
