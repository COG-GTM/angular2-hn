# Angular → React migration: contracts and conventions

`react-app/` is the React 18 + TypeScript + Vite port of the Angular app at the repo root. The Angular app stays untouched until the port is accepted.

```bash
cd react-app && nvm use          # Node 24 (npm 10 crashes on this lockfile)
npm ci
npm run dev                      # http://localhost:5173
npm run typecheck && npm run lint && npx vitest run && npm run build
```

## Layout

| Path | Angular source | Owner |
|---|---|---|
| `src/models/` | `shared/models/` | foundation |
| `src/api/hackernews.ts` | `shared/services/hackernews-api.service.ts` | foundation |
| `src/settings/` | `shared/services/settings.service.ts` | foundation |
| `src/lib/formatCommentCount.ts` | `shared/pipes/comment.pipe.ts` | foundation |
| `src/routes.tsx`, `src/App.tsx`, `src/styles/` | `app.routes.ts`, `app.component.*`, `styles.scss`, `shared/scss/` | foundation |
| `src/features/feeds/` | `feeds/` | feeds |
| `src/features/item-details/` | `item-details/` (incl. `comment/`) | item-details |
| `src/features/user/` | `user/` | user |
| `src/components/core/`, `src/components/shared/` | `core/`, `shared/components/` | chrome |

Feature files that `routes.tsx` and `App.tsx` import keep their **path, default export and props**. Each one currently holds a placeholder:
`features/feeds/FeedPage` (`feedType`), `features/item-details/ItemDetailsPage`, `features/user/UserPage`,
`components/core/{Header,Footer,Settings}`, `components/shared/Loader`, `components/shared/ErrorMessage` (`message`).

## Contracts

```ts
// src/api/hackernews.ts: rejects on network error, non-2xx or non-JSON body
fetchFeed(feedType: FeedType, page: number, signal?): Promise<Story[]>
fetchItemContent(id: number, signal?): Promise<Story>  // polls: options id+1..id+n fetched, poll_votes_count summed
fetchPollContent(id: number, signal?): Promise<PollResult>
fetchUser(id: string, signal?): Promise<User>          // upstream currently 404s, so the error state is expected

// src/settings
useSettings(): {
  settings: { showSettings, openLinkInNewTab, theme: 'default' | 'night' | 'amoledblack', titleFontSize: string, listSpacing: string },
  toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing,
}

formatCommentCount(n): 'discuss' | '1 comment' | `${n} comments`
```

Routes: `/` → `/news/1`, `/:feedType/:page` for `FEED_TYPES` (`FeedPage` is keyed by feed type), and lazy `/item/:id` and `/user/:id`.

## Styling

- Keep the Angular class names. `styles/_themes.scss` themes them globally under the `.default` / `.night` / `.amoledblack` class that `App` renders (for example `.subtext-laptop`, `.loader`, `.error-section`).
- Each component imports its own `Component.scss`, and **every rule is nested under the component's root class**. This mirrors Angular's emulated encapsulation, so component styles don't leak globally. `:host` becomes the root class, and `:host >>> x` becomes `.root x`.
- Do not use CSS Modules, because hashed names break the theme selectors. Bring in partials with `@use '../../styles/media' as *;`.

## Testing

- Use Vitest + React Testing Library, with a colocated `*.test.tsx` per component.
- Mock the API with `vi.mock('../../api/hackernews')`. Never hit the network in unit tests.
- `renderWithProviders(ui, { route: '/item/1', path: '/item/:id' })` from `src/test/` wraps `SettingsProvider` and a memory router. It also renders the current URL in `data-testid="location"`.
- localStorage is cleared after each test, and `window.scrollTo` is stubbed.

## Intentional differences from Angular

- Universal Analytics, Firebase hosting, and Travis config are not ported.
- `vite-plugin-pwa` replaces `@angular/service-worker`, with the same caching policy: the shell is precached, `/assets` is cached at runtime, and API calls are not cached.
- Poll results resolve once all options have loaded. Angular instead patched them in after the first render.
