# Contract: Saved Stories

This app exposes no network API. Its contracts are (1) the public surface of the shared service
that other parts of the app depend on, (2) the route, and (3) the persisted storage format. Those
are the things a change could break for a consumer.

## 1. `SavedStoriesService` — `src/app/shared/services/saved-stories.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class SavedStoriesService {
  /** Newest-saved first. Same array reference for the service's lifetime; mutated in place. */
  savedStories: SavedStory[];

  /** True when a story with this id is in the saved set. */
  isSaved(id: number): boolean;

  /** Adds the story if absent, removes it if present. Persists either way. Returns the new state. */
  toggleSaved(story: Story): boolean;

  /** Adds the story if absent. No-op (including savedAt and order) if already saved. */
  save(story: Story): void;

  /** Removes the story if present. No-op otherwise. */
  remove(id: number): void;
}
```

**Guarantees**

| # | Guarantee |
|---|-----------|
| C1 | `savedStories` never contains two entries with the same `id`. |
| C2 | The array reference returned by `savedStories` never changes, so template bindings stay live. |
| C3 | Every mutating call persists synchronously before returning. |
| C4 | No method throws — storage failures are caught and swallowed (the in-memory set still reflects the call for the rest of the session). |
| C5 | Construction never throws, whatever `localStorage` contains. |
| C6 | `toggleSaved` returns `true` when the story ended up saved, `false` when removed. |
| C7 | The service is the only code in the app that reads or writes the `savedStories` key. |

**Consumers**: `ItemComponent` (star state + toggle), `SavedComponent` (list source).

## 2. `ItemComponent` — unchanged input contract

```ts
@Input() item: Story;   // unchanged; SavedStory is assignable
```

The star control is added inside the component, so every existing usage
(`feed.component.html`, and now `saved.component.html`) gains it with no call-site change. This is
the reason `SavedStory extends Story`.

## 3. Route contract

| Path | Component | Loading | Notes |
|------|-----------|---------|-------|
| `/saved` | `SavedComponent` | eager (declared in `AppModule`) | No params, no pagination; bookmarkable and deep-linkable (FR-008) |

Registered in `app.routes.ts` after the feed routes and before the lazy `item` / `user` routes. The
existing `{path: '', redirectTo: 'news/1'}` default is untouched.

## 4. Storage contract

| Key | Owner | Format |
|-----|-------|--------|
| `savedStories` | `SavedStoriesService` | JSON array of `SavedStory`, newest first, `comments` and `poll` omitted |

Forward compatibility: unknown extra fields on a stored entry are preserved through a read/write
cycle only if they survive `JSON.parse`/`JSON.stringify` — they do, since normalization only fills
in missing fields and never allow-lists. Entries that fail validation (no numeric `id`) are dropped
silently on read.

## 5. Header contract

`core/header/header.component.html` gains one nav entry, `saved`, in the existing `.header-nav`
strip beside `new | show | ask | jobs`, using the same `routerLink` + `routerLinkActive="active"` +
`(click)="scrollTop()"` pattern. No changes to `HeaderComponent`'s class.
