# Phase 1 Data Model: Saved Stories

## Entities

### `SavedStory` — `src/app/shared/models/saved-story.ts`

A snapshot of a story the reader set aside, extended from the existing `Story` model so it can be
passed to `<item [item]="…">` unchanged.

```ts
import { Story } from './story';

export interface SavedStory extends Story {
  savedAt: number; // epoch milliseconds, set once when the story is first saved
}
```

Inherited from `Story` (`src/app/shared/models/story.ts`): `id`, `title`, `points`, `user`, `time`,
`time_ago`, `type`, `url`, `domain`, `comments`, `comments_count`, `poll`, `poll_votes_count`,
`deleted`, `dead`.

| Field | Source | Persisted | Notes |
|-------|--------|-----------|-------|
| `id` | story | yes | Identity for the set; dedupe key |
| `title`, `url`, `domain`, `points`, `user`, `time`, `time_ago`, `type`, `comments_count` | story | yes | Everything `ItemComponent` renders |
| `poll_votes_count`, `deleted`, `dead` | story | yes | Small scalars; kept for fidelity |
| `comments`, `poll` | story | **no** | Dropped on write, rehydrated as `[]` on read (see R4) |
| `savedAt` | service | yes | Set on add; never updated by a re-save |

**Validation rules**

- `id` MUST be present and numeric; an entry without one is discarded on read.
- `url` MUST be a string after rehydration — default to `''` — because `ItemComponent.hasUrl` calls
  `item.url.indexOf('http')`.
- `savedAt` MUST be a number; default to `0` if absent so ordering stays total.

### Saved Set — in-memory

`SavedStoriesService.savedStories: SavedStory[]`

- **Uniqueness**: at most one entry per `id` (FR-009).
- **Order**: newest-saved first — new entries are `unshift`ed; the persisted array order is the
  display order, so no sort is needed on read.
- **Lifetime**: hydrated once in the service constructor, mutated in place thereafter, mirrored to
  `localStorage` after every mutation.

## Persistence Format

**Key**: `savedStories` (a sibling of the existing `theme`, `openLinkInNewTab`, `titleFontSize`,
`listSpacing` keys written by `SettingsService`).

**Value**: JSON array, newest first.

```json
[
  {
    "id": 8863,
    "title": "My YC app: Dropbox - Throw away your USB drive",
    "points": 111,
    "user": "dhouston",
    "time": 1175714200,
    "time_ago": "18 years ago",
    "type": "link",
    "url": "http://www.getdropbox.com/u/2/screencast.html",
    "domain": "getdropbox.com",
    "comments_count": 71,
    "poll_votes_count": 0,
    "deleted": false,
    "dead": false,
    "savedAt": 1785786011000
  }
]
```

**Read**: `JSON.parse` inside `try/catch`; if it throws, or the result is not an array, fall back to
`[]`. Each element is normalized (drop entries without a numeric `id`; default `url` to `''`,
`comments` and `poll` to `[]`, `savedAt` to `0`).

**Write**: `JSON.stringify` of the array with `comments` and `poll` omitted, inside `try/catch`; a
failure (quota, private mode) leaves the in-memory array untouched and is not surfaced to the user.

## State Transitions

```text
                 toggle(story) where !isSaved(id)
   [not saved] ──────────────────────────────────▶ [saved]
        ▲            unshift + persist                │
        └────────────────────────────────────────────-┘
                 toggle(story) where isSaved(id)
                      splice + persist
```

- Saving an already-saved story is a no-op on `savedAt` and order — it is a removal, per the toggle
  semantics in FR-002.
- Removal from the `/saved` view and removal from a feed are the same transition; there is a single
  code path.

## Relationships

`SavedStory` is a superset of `Story` and carries no references to other entities. Comments are not
saved, so there is no relationship to `Comment`; polls are not saved, so none to `PollResult`.
