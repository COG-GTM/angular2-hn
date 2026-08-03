# Feature Specification: Saved Stories

**Feature Branch**: `devin/1785786011-speckit-init`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Reuse the existing architecture. Add a SavedStoriesService (shared/services) that stores saved stories in localStorage, mirroring SettingsService. Add a star toggle to feeds/item/item.component bound to the service. Add a SavedComponent under feeds that renders saved stories with the existing <item> component + an empty state. Register a /saved route in app.routes.ts and a "saved" link in core/header."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save a story from a feed (Priority: P1)

A reader scrolling a feed spots a story they want to come back to later. They mark it with a star
directly from the list, without leaving the feed or losing their place. The star immediately shows
the story as saved, and starring it again removes it.

**Why this priority**: Nothing else in the feature has value without the ability to save. This
story alone is a usable slice: readers can mark stories and see the marks persist.

**Independent Test**: Star a story in any feed, reload the page, and confirm the story still shows
as starred. Star it again and confirm the mark is removed and stays removed after reload.

**Acceptance Scenarios**:

1. **Given** a feed of stories with none saved, **When** the reader activates the star on a story,
   **Then** that story is marked as saved and the mark persists after a page reload.
2. **Given** a story that is already saved, **When** the reader activates its star again,
   **Then** the story is no longer marked as saved and stays unsaved after a page reload.
3. **Given** a story is saved from one feed, **When** the reader opens another feed containing the
   same story, **Then** it appears as saved there too.

---

### User Story 2 - Browse saved stories (Priority: P2)

A reader wants to review everything they have set aside. They open a dedicated saved view and see
their saved stories presented exactly like stories in any other feed, so nothing about the reading
experience changes.

**Why this priority**: Saving is only useful once the reader can retrieve the set. It depends on
Story 1 but is a distinct, independently demonstrable slice.

**Independent Test**: With at least one saved story, open the saved view and confirm the story is
listed with the same information (title, domain, score, author, age, comment count) as in a feed.

**Acceptance Scenarios**:

1. **Given** the reader has saved three stories, **When** they open the saved view,
   **Then** all three are listed with the same details as in a regular feed.
2. **Given** the reader has saved no stories, **When** they open the saved view,
   **Then** they see a message explaining the list is empty and how to add to it.
3. **Given** the reader is in the saved view, **When** they unsave a story from that view,
   **Then** it is removed from the list without a page reload.

---

### User Story 3 - Reach the saved view from anywhere (Priority: P3)

A reader can navigate to their saved stories from the app's main navigation on any page, and can
also return to it directly by URL or bookmark.

**Why this priority**: Discoverability. The feature works without it if the reader knows the URL,
but adoption depends on the entry point being visible.

**Independent Test**: From any page, activate the "saved" navigation link and confirm the saved
view opens; then load the saved view's URL directly in a new tab and confirm it opens the same view.

**Acceptance Scenarios**:

1. **Given** the reader is on any page, **When** they activate the "saved" navigation entry,
   **Then** the saved view opens.
2. **Given** the reader loads the saved view's address directly, **When** the app finishes loading,
   **Then** the saved view is shown with their saved stories.

---

### Edge Cases

- **No saved stories**: the saved view shows an explanatory empty state, never a blank page or an
  error.
- **Local storage unavailable or full** (private browsing, quota exceeded): saving fails without
  breaking the page; the reader can continue browsing feeds normally and the app does not crash.
- **Corrupted or unreadable stored data**: the app treats the saved set as empty rather than
  failing to start.
- **Story no longer available upstream**: an entry saved earlier still renders from the details
  captured at save time, and the reader can remove it.
- **Same story saved from two places** (a feed and the saved view): the saved set contains it once;
  toggling from either place produces one consistent result.
- **Two browser tabs open**: each tab reflects its own actions correctly; the saved set is not
  corrupted by concurrent toggles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every story shown in a feed MUST offer a save/unsave control that reflects the
  story's current saved state.
- **FR-002**: Activating the control on an unsaved story MUST add it to the reader's saved set;
  activating it on a saved story MUST remove it.
- **FR-003**: The saved set MUST persist across page reloads and browser restarts on the same
  device and browser, without any account or sign-in.
- **FR-004**: The saved set MUST be stored only on the reader's device; no saved data may be sent
  to or stored on a server.
- **FR-005**: The system MUST provide a dedicated saved view listing the reader's saved stories
  using the same story presentation as feeds.
- **FR-006**: The saved view MUST show an empty state, explaining how to save stories, when the
  saved set is empty.
- **FR-007**: The saved view MUST offer the same save/unsave control, and removing a story there
  MUST update the list immediately.
- **FR-008**: The saved view MUST be reachable from a persistent navigation entry available on
  every page, and MUST have its own address so it can be linked or bookmarked.
- **FR-009**: A story MUST appear at most once in the saved set regardless of how many times or
  from where it is saved.
- **FR-010**: Saved entries MUST retain enough story detail to be rendered without re-fetching, so
  the saved view works offline and for stories that are no longer served.
- **FR-011**: The saved state of a story MUST be consistent everywhere it appears within the app.
- **FR-012**: When device storage is unavailable or rejects the write, the app MUST continue to
  function for browsing; it MUST NOT show an unhandled error or lose the existing saved set.
- **FR-013**: The save/unsave control MUST be operable by keyboard and expose its current state to
  assistive technology.

### Key Entities

- **Saved Story**: a story the reader has set aside. Identified by the story's own identifier, and
  carrying the details needed to display it in a list (title, link, source domain, score, author,
  age, comment count) plus the moment it was saved.
- **Saved Set**: the collection of saved stories for this reader on this device. Contains each
  story at most once and defines the order the saved view presents.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reader can save a story from a feed in a single interaction, without navigating
  away from the feed.
- **SC-002**: 100% of saved stories are still listed after a full page reload and after closing and
  reopening the browser on the same device.
- **SC-003**: The saved view renders its list within the same perceived time as an existing feed
  view, and does so with no network connection.
- **SC-004**: A reader with no saved stories sees an explanatory empty state 100% of the time,
  never a blank list or an error.
- **SC-005**: The saved state shown for a story matches the reader's last action in 100% of cases
  across all views the story appears in.

## Assumptions

- Saved stories are per-device and per-browser, tied to the reader's local storage; there is no
  account, sync, or cross-device behavior. This follows from the app having no backend.
- The saved view lists stories newest-saved first; no manual reordering, folders, tags, or search
  are in scope.
- There is no cap on the number of saved stories beyond what the browser's local storage allows.
- Only stories can be saved; comments and user profiles cannot.
- Saved entries are snapshots taken at save time; scores and comment counts are not refreshed after
  saving.
- The existing story presentation and the existing navigation shell are reused as-is, so the
  feature introduces no new visual language.
