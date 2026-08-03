# Implementation Plan: Saved Stories

**Branch**: `001-saved-stories` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-saved-stories/spec.md`

## Summary

Let readers star a story from any feed and revisit the set in a dedicated `/saved` view, persisted
per-device with no backend. The design reuses the existing architecture end to end: a new
`SavedStoriesService` in `shared/services` that owns a `SavedStory[]` and mirrors
`SettingsService`'s localStorage-on-every-mutation pattern; a star control added to the existing
`ItemComponent` so every story everywhere gains it; a new `SavedComponent` under `feeds/` that
renders the saved set with the same `<item>` component plus an empty state; an eager `/saved` route
in `app.routes.ts`; and a `saved` link in the existing `core/header` nav strip.

## Technical Context

**Language/Version**: TypeScript `~3.7.5`, Angular `~9.0.1`

**Primary Dependencies**: `@angular/core`, `@angular/router`, `@angular/common`, RxJS `~6.5.4`.
No new runtime dependencies.

**Storage**: Browser `localStorage`, single key `savedStories` holding a JSON array. No backend.

**Testing**: Karma + Jasmine (`ng test`), specs as `*.spec.ts` next to their subject.
Requires `CHROME_BIN` and `NODE_OPTIONS=--openssl-legacy-provider`.

**Target Platform**: Evergreen desktop + mobile browsers, installed PWA, offline-capable.

**Project Type**: Single-page Angular PWA (frontend only).

**Performance Goals**: No added network calls; `/saved` renders from localStorage synchronously on
component init. No measurable change to initial bundle beyond one component and one service.

**Constraints**: Offline-capable (the saved view must work with no connection); must not break
service-worker precaching or the App Shell; must stay within the existing `initial` bundle budget
(2 MB warning / 5 MB error in `angular.json`).

**Scale/Scope**: One new service, one new component, one new model, one new route, one nav link,
one modified component (`ItemComponent`), plus specs for each. Saved sets are expected in the tens
to low hundreds of entries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Mandated Stack Fidelity | Angular 9 + TypeScript + SCSS + RxJS only; no new framework, state library, or styling system | **PASS** — new component styles are SCSS; no new dependencies; no state-management library (see Research R2) |
| II. Existing Structure Conformance | Code lands in `core` / `feeds` / `shared`; reusable logic in `shared` | **PASS** — service + model in `shared/`, view in `feeds/saved/`, nav in `core/header`; no new top-level directory |
| III. Client-Side Persistence Only | `localStorage` only, via an injectable service mirroring `SettingsService`; components never touch `localStorage` | **PASS** — `SavedStoriesService` is the sole storage owner; `ItemComponent` and `SavedComponent` call service methods |
| IV. English (en-US) Everywhere | All identifiers, comments, docs, UI text in en-US | **PASS** |
| V. Unit Tests Ship With Every Feature | Tests in the same PR; every new/modified service covered, including localStorage read/write | **PASS** — `saved-stories.service.spec.ts`, `saved.component.spec.ts`, `item.component.spec.ts` are in scope (see `quickstart.md`) |

Post-Phase-1 re-check: **PASS**, no changes. No entries in Complexity Tracking.

One standing note, not a violation: this feature adds the repository's first `*.spec.ts` files, so
it also establishes the test conventions Principle V depends on.

## Project Structure

### Documentation (this feature)

```text
specs/001-saved-stories/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification (/speckit-specify output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify output)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── saved-stories-service.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/app/
├── app.module.ts                                 # MODIFIED: declare SavedComponent
├── app.routes.ts                                 # MODIFIED: add /saved route
├── core/
│   └── header/
│       ├── header.component.html                 # MODIFIED: add "saved" nav link
│       └── header.component.spec.ts              # NEW: nav link renders and routes
├── feeds/
│   ├── item/
│   │   ├── item.component.ts                     # MODIFIED: inject service, toggleSaved(), isSaved
│   │   ├── item.component.html                   # MODIFIED: star button
│   │   ├── item.component.scss                   # MODIFIED: star styles
│   │   └── item.component.spec.ts                # NEW
│   └── saved/
│       ├── saved.component.ts                    # NEW
│       ├── saved.component.html                  # NEW: <item> list + empty state
│       ├── saved.component.scss                  # NEW
│       └── saved.component.spec.ts               # NEW
└── shared/
    ├── models/
    │   └── saved-story.ts                        # NEW: SavedStory
    └── services/
        ├── saved-stories.service.ts              # NEW
        └── saved-stories.service.spec.ts         # NEW
```

**Structure Decision**: Single Angular project, existing layout. `feeds/saved/` sits beside
`feeds/feed/` and `feeds/item/` because the saved view *is* a feed of stories rendered with the
same `<item>` component — it differs only in where the list comes from. The service and model go in
`shared/` because `ItemComponent` (feeds), `SavedComponent` (feeds), and potentially item details
all consume them. `SavedComponent` is declared eagerly in `AppModule` alongside `FeedComponent` and
`ItemComponent` rather than in a lazy module, matching how every feed route is already registered;
lazy loading is reserved for `item-details` and `user` in this codebase.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Table intentionally empty.
