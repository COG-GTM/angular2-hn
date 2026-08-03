---

description: "Task list for the Saved Stories feature"
---

# Tasks: Saved Stories

**Input**: Design documents from `/specs/001-saved-stories/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/saved-stories-service.md)

**Tests**: Test tasks ARE included. Constitution Principle V (Unit Tests Ship With Every Feature,
NON-NEGOTIABLE) requires them, and the feature request asked for the service's unit spec explicitly.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and
demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Angular project. All source lives under `src/app/` following the existing
`core/` · `feeds/` · `shared/` layout; specs live beside the file they cover as `*.spec.ts`
(no separate `tests/` tree — see plan.md "Structure Decision").

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing, unused test harness actually runs before writing the repo's
first specs against it.

- [X] T001 Verify the Karma harness runs by adding a temporary trivial spec and executing `CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) NODE_OPTIONS=--openssl-legacy-provider npm test -- --watch=false --browsers=ChromeHeadless`; confirm it reports 1 passing spec, then delete the temporary file (baseline today is "Executed 0 of 0", exit 1)
- [X] T002 Confirm the baseline `npm run lint` violation count and record it, so Phase 6 can prove no new violations were added

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The saved-set model and the service that owns it. Every user story reads or writes
through this service.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create the `SavedStory` model in `src/app/shared/models/saved-story.ts` as `export interface SavedStory extends Story { savedAt: number; }` per data-model.md; do NOT modify `src/app/shared/models/story.ts` — the existing `Story` already carries every rendered field, so extending it is all that is needed
- [X] T004 Implement `SavedStoriesService` in `src/app/shared/services/saved-stories.service.ts`: `@Injectable({providedIn: 'root'})`, public `savedStories: SavedStory[]` hydrated once in the constructor from the `savedStories` localStorage key, plus `isSaved(id: number): boolean`, `save(story: Story): void`, `remove(id: number): void`, and `toggleSaved(story: Story): boolean`. Mirror `SettingsService`: mutate the array in place (never reassign — contract C2) and persist after every mutation (C3). New entries are `unshift`ed so the array stays newest-first (depends on T003)
- [X] T005 Add read/write hardening to `src/app/shared/services/saved-stories.service.ts`: wrap the constructor read in `try/catch` falling back to `[]` when parsing throws or yields a non-array (C5); normalize entries per data-model.md (drop entries without a numeric `id`; default `url` to `''`, `comments`/`poll` to `[]`, `savedAt` to `0`); omit `comments` and `poll` when serializing; wrap every write in `try/catch` so a throwing `setItem` never propagates (C4) (depends on T004)
- [X] T006 Write `src/app/shared/services/saved-stories.service.spec.ts` covering: hydration from a pre-populated key; empty-storage default; save/remove/toggle; `toggleSaved` return value (C6); dedupe on repeated save (C1); newest-first order; array reference stability (C2); a write occurring on every mutation (C3); corrupt JSON → `[]` (C5); `spyOn(Storage.prototype, 'setItem').and.throwError(...)` → no exception (C4); and that the persisted payload omits `comments`/`poll`. Clear `localStorage` in `beforeEach` (depends on T005)
- [X] T007 Register `SavedStoriesService` alongside `SettingsService` in the `providers` array of `src/app/app.module.ts` (the service is `providedIn: 'root'`, so this is only for consistency with the existing module — skip if the team prefers root-only provision)

**Checkpoint**: The saved set is fully implemented and unit-tested with no UI. User stories can begin.

---

## Phase 3: User Story 1 - Bookmark a story from the feed (Priority: P1) 🎯 MVP

**Goal**: A star on every feed row that saves and unsaves a story, with the state surviving reloads.

**Independent Test**: Star a story on `/news/1`, reload, confirm it is still starred; toggle it off,
reload, confirm it is not. Save on `/news/1` and confirm the same story shows as saved on
`/newest/1`.

### Tests for User Story 1

- [X] T008 [P] [US1] Write `src/app/feeds/item/item.component.spec.ts` with a stub `SavedStoriesService`: the star renders for a story; its pressed state follows `isSaved`; clicking calls `toggleSaved` with the bound story; `aria-pressed` updates after the click

### Implementation for User Story 1

- [X] T009 [US1] Inject `SavedStoriesService` into `src/app/feeds/item/item.component.ts` (constructor, beside the existing `SettingsService`) and add `get isSaved(): boolean` delegating to `this._savedStoriesService.isSaved(this.item.id)` plus `toggleSaved(): void` delegating to `toggleSaved(this.item)`. Leave the `@Input() item: Story` contract unchanged
- [X] T010 [US1] Add the star control to `src/app/feeds/item/item.component.html` as a real `<button type="button">` with `(click)="toggleSaved()"`, `[attr.aria-pressed]="isSaved"`, and an `[attr.aria-label]` of "Save story" / "Remove from saved". Per research R6 this deliberately does not copy the header cog's non-keyboard-operable `<img (click)>` (depends on T009)
- [X] T011 [P] [US1] Style the saved and unsaved star states in `src/app/feeds/item/item.component.scss`, using the existing theme variables so all themes (including `night`) work; keep the control from shifting the row's layout (depends on T010)
- [X] T012 [US1] Run the unit suite and confirm T008 passes against the real implementation

**Checkpoint**: Bookmarking works everywhere `<item>` is rendered; persistence is observable via a
reload. This is the MVP.

---

## Phase 4: User Story 2 - Browse the saved page (Priority: P2)

**Goal**: A `/saved` page listing saved stories with the existing `<item>` presentation, an empty
state, and live removal.

**Independent Test**: With three stories saved, open `/saved` (typed directly — the nav link is
US3) and confirm all three render like feed rows; unstar one and watch it leave the list without a
reload; unstar the rest and see the empty state.

### Tests for User Story 2

- [X] T013 [P] [US2] Write `src/app/feeds/saved/saved.component.spec.ts` with a stub `SavedStoriesService`: renders one `<item>` per saved story; renders the empty state and no list when the set is empty; the rendered list shrinks when an entry is removed from the service's array

### Implementation for User Story 2

- [X] T014 [US2] Create `src/app/feeds/saved/saved.component.ts` with `selector: 'app-saved'`, injecting `SavedStoriesService` and exposing its `savedStories` array directly (`this.savedStories = this._savedStoriesService.savedStories`) — the same reference-sharing pattern `HeaderComponent` uses with `SettingsService`, which is what makes removal update the list with no reload (research R2)
- [X] T015 [US2] Create `src/app/feeds/saved/saved.component.html`: an `<ol>` of `<li class="post"><item class="item-block" [item]="story"></item></li>` mirroring `feed.component.html`, plus an `*ngIf` empty state telling the reader to star stories from a feed. No loader and no error message — nothing is fetched (depends on T014)
- [X] T016 [P] [US2] Create `src/app/feeds/saved/saved.component.scss`, reusing the list/spacing rules from `src/app/feeds/feed/feed.component.scss` so saved rows are visually identical to feed rows (depends on T015)
- [X] T017 [US2] Declare `SavedComponent` in the `declarations` array of `src/app/app.module.ts`, beside `FeedComponent` and `ItemComponent` (eager, not a lazy module — see research R5) (depends on T014)
- [X] T018 [US2] Register `{path: 'saved', component: SavedComponent}` in `src/app/app.routes.ts`, placed after the feed routes and before the lazy `item` / `user` routes; leave the `{path: '', redirectTo: 'news/1'}` default untouched (depends on T017)
- [X] T019 [US2] Run the unit suite and confirm T013 passes against the real component

**Checkpoint**: `/saved` is reachable by URL and fully functional; US1 still works unchanged.

---

## Phase 5: User Story 3 - Reach the saved page from the header (Priority: P3)

**Goal**: A `saved` entry in the header nav available on every page.

**Independent Test**: From any page, click `saved` in the header and land on `/saved` with the link
showing the `active` style; open `/saved` directly in a new tab and get the same page.

### Tests for User Story 3

- [X] T020 [P] [US3] Write `src/app/core/header/header.component.spec.ts` asserting a nav link with the text `saved` exists and its `routerLink` resolves to `/saved`

### Implementation for User Story 3

- [X] T021 [US3] Add `<a routerLink="/saved" routerLinkActive="active" (click)="scrollTop()">saved</a>` to the `.header-nav` strip in `src/app/core/header/header.component.html`, after `jobs`, separated by the existing `|` pattern. No change to `header.component.ts` is required
- [X] T022 [US3] Check the header on a narrow viewport (`.subtext-palm` breakpoints in `src/app/core/header/header.component.scss`) and adjust only if the fifth link wraps or overflows (depends on T021)
- [X] T023 [US3] Run the unit suite and confirm T020 passes

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T024 Run the full unit suite and confirm every spec passes with a non-zero spec count — this is the first time the repo's Karma setup executes real tests (quickstart.md "Run the unit tests")
- [X] T025 Run `NODE_OPTIONS=--openssl-legacy-provider npm run build` and confirm it succeeds within the existing bundle budgets in `angular.json`
- [X] T026 Run `npm run lint` and confirm the violation count matches the T002 baseline — no new violations
- [ ] T027 [P] Walk quickstart.md scenarios V1–V3 manually in the dev server
- [ ] T028 [P] Walk quickstart.md V4 (offline) against a production build with the service worker active, confirming `/saved` renders with no network
- [ ] T029 [P] Walk quickstart.md V5 (corrupt `savedStories` value, throwing `setItem`) and confirm feeds keep working with no unhandled error
- [ ] T030 Verify keyboard-only operation of the star and the header link, and that `aria-pressed` reflects state (FR-013)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 only
- **User Story 2 (Phase 4)**: Depends on Phase 2 only. US2 renders `<item>`, so it *displays* the
  star from US1 when both are present, but its own list/empty-state behavior is testable without US1
- **User Story 3 (Phase 5)**: Depends on Phase 2; the link is only useful once US2 exists, but the
  route/page it targets can be stubbed for its own test
- **Polish (Phase 6)**: Depends on all shipped stories

### Within Each User Story

- Write the spec first (T008, T013, T020) and confirm it fails before implementing
- Component class before template before styles
- Module declaration before route registration

### Parallel Opportunities

- T003 is the only Phase 2 task with no predecessor; T004 → T005 → T006 are strictly sequential
  (same file, then its spec)
- Once Phase 2 is done, Phases 3, 4, and 5 can be staffed in parallel — they touch disjoint files
  except `app.module.ts` (US2 only)
- Within US1: T011 (SCSS) is parallel to nothing else in flight but touches a distinct file
- Within US2: T016 (SCSS) is independent of T017/T018
- Phase 6: T027, T028, T029 are independent manual passes

---

## Parallel Example: after Phase 2

```bash
# Three developers, disjoint files:
Developer A: T008–T012  # src/app/feeds/item/*
Developer B: T013–T019  # src/app/feeds/saved/*, app.module.ts, app.routes.ts
Developer C: T020–T023  # src/app/core/header/*
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 → Phase 2 → Phase 3
2. **STOP and VALIDATE**: star a story, reload, confirm it persists
3. Ship: readers can bookmark, even before a page exists to browse the bookmarks

### Incremental Delivery

1. Setup + Foundational → the saved set exists and is unit-tested
2. + US1 → bookmarking works (MVP)
3. + US2 → `/saved` is browsable by URL
4. + US3 → the page is discoverable from the header

---

## Notes

- [P] tasks = different files, no dependencies
- Every task names the exact file it touches
- Commit after each task or logical group; commit messages must include "feature" or "bug"
- The only pre-existing file this feature modifies beyond wiring is
  `src/app/feeds/item/item.component.*`; `src/app/shared/models/story.ts` is intentionally left
  untouched
