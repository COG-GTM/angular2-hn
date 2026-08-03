# Phase 0 Research: Saved Stories

No `NEEDS CLARIFICATION` markers were carried into Technical Context. The open questions were all
"how does this codebase already do it", answered by reading the existing sources cited below.

## R1 — Storage shape and key

**Decision**: One `localStorage` key, `savedStories`, holding a JSON array of `SavedStory` objects,
newest-saved first. Read once in the service constructor, rewritten in full on every mutation.

**Rationale**: `SettingsService` uses one key per scalar setting (`theme`, `titleFontSize`, …)
because each is independent. A collection is a single value with ordering and dedupe rules, so one
key keeps reads/writes atomic and avoids the key-enumeration a per-story scheme would need. Reading
once at construction matches `SettingsService`, which hydrates its `settings` object inline at
field initialization.

**Alternatives considered**:
- One key per story (`savedStory:<id>`): requires scanning `localStorage` keys to list, and has no
  natural place to hold order. Rejected.
- Storing only IDs and re-fetching details: breaks FR-010 (offline rendering) and adds N network
  calls on `/saved`. Rejected.

## R2 — How the view stays in sync with the service

**Decision**: The service exposes its `SavedStory[]` array directly (`savedStories`), mutating it in
place on add/remove; `SavedComponent` binds `*ngFor` to that same array reference, and
`ItemComponent` asks `isSaved(id)` for its star state. No `BehaviorSubject`, no store.

**Rationale**: This is exactly the `SettingsService` pattern — components hold a reference to the
service's state object (`this.settings = this._settingsService.settings`) and Angular's default
change detection re-renders on mutation. It satisfies "removing a story updates the list
immediately" (FR-007) with no extra machinery, and Constitution Principle II asks new work to
follow the existing pattern.

**Alternatives considered**:
- `BehaviorSubject<SavedStory[]>` + `async` pipe: more idiomatic RxJS and would be the right call
  if multiple unrelated consumers needed a stream, but here it duplicates the source of truth for
  one list and one view. Constitution Principle I mandates RxJS for asynchronous and event-driven
  logic; saved-set mutations are synchronous local state, so a plain array is not a violation. If a
  future consumer needs a stream, adding `savedStories$` on top of the same array is a
  backward-compatible change.
- NgRx or another store: forbidden by Principle I and grossly oversized for one list.

## R3 — Surviving unavailable or corrupt storage

**Decision**: Wrap the constructor read in `try/catch` and fall back to `[]` on either a throw or a
non-array parse result; wrap every write in `try/catch` and swallow the failure after leaving the
in-memory array as the user expects it for the session.

**Rationale**: FR-012 requires browsing to keep working when storage is unavailable (Safari private
mode historically throws on `setItem`, and quotas can be exhausted). `JSON.parse` on hand-edited or
truncated data throws, which would otherwise break service construction and, because the service is
`providedIn: 'root'` and injected by `ItemComponent`, take down every feed.

**Alternatives considered**:
- Surfacing a user-facing error toast on write failure: the app has no toast/notification
  primitive, and adding one exceeds this feature's scope. Rejected; the star simply does not
  persist.
- Feature-detecting storage once at startup: does not catch mid-session quota exhaustion.

## R4 — What a saved entry stores

**Decision**: Persist the full `Story` snapshot minus the heavy, view-irrelevant fields (`comments`,
`poll`), plus a `savedAt` timestamp. Rehydrate the omitted fields to safe empties on read.

**Rationale**: `ItemComponent` renders `title`, `url`, `domain`, `points`, `user`, `time_ago`,
`type`, `comments_count`, and `id`, and its `hasUrl` getter calls `item.url.indexOf(...)`, so `url`
must be a string, never `undefined`. Keeping the entry assignable to `Story` lets `SavedComponent`
pass it straight to `<item [item]="story">` with no adapter. Dropping `comments` matters: an item
detail payload can carry a full comment tree, which would blow the storage quota after a handful of
saves.

**Alternatives considered**:
- Storing the raw object as-is: risks persisting entire comment trees. Rejected.
- A narrow DTO plus a mapper to `Story`: more code and a second shape to keep in sync for no gain.

**Known consequence**: `time_ago` and `points` are captured at save time and are not refreshed —
already documented as an assumption in the spec.

## R5 — Where the route and component live

**Decision**: Eagerly declare `SavedComponent` in `AppModule` and register a top-level
`{path: 'saved', component: SavedComponent}` route in `app.routes.ts`.

**Rationale**: `app.routes.ts` registers every feed route eagerly and reserves `loadChildren` for
`item-details` and `user`. `AppModule` already declares `FeedComponent` and `ItemComponent`
directly. A lazy module for a single component that reuses already-eager `<item>` would add a chunk
without removing anything from the initial bundle.

**Alternatives considered**:
- `feeds/saved/saved.module.ts` lazy-loaded: consistent with `user`/`item-details` but inconsistent
  with the feeds it belongs to, and it would need to import whatever module declares `ItemComponent`
  (today: `AppModule`), forcing a larger refactor. Rejected as out of scope.
- Reusing `FeedComponent` with a `data: {feedType: 'saved'}` route: `FeedComponent` is built around
  `HackerNewsAPIService.fetchFeed()` and pagination; branching it on a non-network source would make
  it harder to read than a separate 30-line component. Rejected.

## R6 — Star control accessibility

**Decision**: A real `<button type="button">` inside `ItemComponent`, with `aria-pressed` bound to
the saved state and an `aria-label` that names the story action ("Save story" / "Remove from
saved").

**Rationale**: FR-013 requires keyboard operability and state exposure. The existing settings
toggle in the header is a `<img>` with a `(click)` handler and is not keyboard operable; copying
that pattern would fail the requirement, so this is a deliberate, documented departure from
surrounding markup rather than an oversight.

**Alternatives considered**:
- `<span (click)>` styled as a star, matching the existing settings cog: not focusable, no state
  for assistive technology. Rejected on FR-013.

## R7 — Test setup for the repository's first specs

**Decision**: Karma + Jasmine as already configured (`karma.conf.js`, `src/test.ts`,
`tsconfig.spec.json` all exist and already glob `src/**/*.spec.ts`). Specs live next to their
subject. Service tests clear `localStorage` in `beforeEach` and use `spyOn(Storage.prototype, ...)`
to simulate failures; component tests use `TestBed` with a stub service.

**Rationale**: No configuration change is needed — the harness is present and unused (the repo has
zero `*.spec.ts` files today). Running it requires `CHROME_BIN` and
`NODE_OPTIONS=--openssl-legacy-provider` on modern Node; with no specs present Karma currently
exits non-zero having run 0 tests, which this feature incidentally fixes.

**Alternatives considered**:
- Adding Jest: a new dependency and a new runner config, forbidden by Principle I's "no parallel
  idioms" intent and unnecessary. Rejected.
