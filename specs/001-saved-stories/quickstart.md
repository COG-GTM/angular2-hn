# Quickstart & Validation: Saved Stories

How to run and prove the feature works. Design details live in [plan.md](./plan.md),
[data-model.md](./data-model.md), and [contracts/](./contracts/saved-stories-service.md).

## Prerequisites

- Node 20 (repo default). Every Angular CLI command below needs
  `NODE_OPTIONS=--openssl-legacy-provider` on modern Node.
- Dependencies installed: `npm install`.

## Run the app

```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
# http://localhost:4200
```

## Run the unit tests

```bash
CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) \
NODE_OPTIONS=--openssl-legacy-provider \
npm test -- --watch=false --browsers=ChromeHeadless
```

Baseline note: before this feature the repo contains no `*.spec.ts`, so Karma reports
"Executed 0 of 0" and exits non-zero. After implementation this command MUST report a passing run
with a non-zero spec count — that transition is itself part of the acceptance evidence.

## Build (must stay green)

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
npm run lint   # pre-existing violations exist; the count MUST NOT grow
```

## Manual validation scenarios

Each maps to a user story in [spec.md](./spec.md). Start from a clean slate:
DevTools → Application → Local Storage → delete the `savedStories` key.

### V1 — Save and unsave from a feed (User Story 1)

1. Open `/news/1`.
2. Activate the star on the first story. **Expect**: the star switches to its saved appearance
   immediately; `localStorage.savedStories` contains one entry with that story's `id` and a
   `savedAt`.
3. Reload the page. **Expect**: the star is still in the saved state.
4. Activate the star again, reload. **Expect**: unsaved, and `savedStories` is `[]`.
5. Save a story on `/news/1`, then find the same story on `/newest/1`. **Expect**: shown as saved
   there too (FR-011).

### V2 — Browse the saved view (User Story 2)

1. Save three stories from any feed(s).
2. Open `/saved`. **Expect**: all three listed, newest-saved first, rendered identically to a feed
   row (title, domain, points, user, age, comment count).
3. Unstar one from within `/saved`. **Expect**: it disappears from the list with no reload.
4. Unstar the remaining two. **Expect**: the empty state appears, explaining how to save stories.

### V3 — Navigation (User Story 3)

1. From any page, activate `saved` in the header. **Expect**: `/saved` opens and the link shows the
   `active` style.
2. Open `http://localhost:4200/saved` directly in a new tab. **Expect**: the saved view renders with
   the same set.
3. Tab to the star with the keyboard and press Enter/Space. **Expect**: it toggles, and its
   `aria-pressed` reflects the new state (FR-013).

### V4 — Offline (SC-003, FR-010)

1. Save two stories, then build and serve the production bundle so the service worker is active
   (`npm run build && npm run static-serve`, per `package.json`).
2. DevTools → Network → Offline, then load `/saved`. **Expect**: both stories render from storage
   with no network requests for story data.

### V5 — Hostile storage (FR-012, C5)

1. In DevTools, set `savedStories` to the literal text `not json` and reload. **Expect**: the app
   starts normally and `/saved` shows the empty state — no console error breaking the feed.
2. In the console, run `Storage.prototype.setItem = () => { throw new Error('quota'); }`, then
   star a story. **Expect**: no unhandled error; feeds keep working; the star reflects the change
   for the session but does not survive a reload.

## Automated coverage expected

| Spec file | Must cover |
|-----------|------------|
| `saved-stories.service.spec.ts` | Hydration from an existing key; empty-storage default; add/remove/toggle; dedupe (C1); newest-first order; persistence written on every mutation (C3); corrupt JSON → `[]` (C5); `setItem` throwing → no exception (C4); `comments`/`poll` omitted from the written payload |
| `item.component.spec.ts` | Star renders; reflects `isSaved`; click calls `toggleSaved` with the story; `aria-pressed` tracks state |
| `saved.component.spec.ts` | Renders one `<item>` per saved story; shows the empty state when the set is empty; list shrinks when a story is removed |
| `header.component.spec.ts` | The `saved` link exists and points at `/saved` |
