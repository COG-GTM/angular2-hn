# Test Plan — PR #579 React Migration Phase 1 (app shell)

App: Vite dev server at http://localhost:5173. Evidence base: App.tsx (theme class on root div, routes), src/core/header/Header.tsx (nav links), src/shared/settings/SettingsContext.tsx (theme init from localStorage `theme` / prefers-color-scheme).

## Test 1: It should render the app shell and redirect / to /news/1
- Open http://localhost:5173/ (fresh localStorage). PASS: URL becomes /news/1; header shows HN logo + "new | show | ask | jobs"; footer visible; default red theme (header bar red-ish #ff6600-family); feed area shows loader (expected placeholder).
- Console: no errors (warnings OK).

## Test 2: It should navigate via header links and render lazy placeholder routes
- Click "show" → URL /show/1, loader shown. Click "ask" → /ask/1. Click "jobs" → /jobs/1.
- Navigate to /item/1 and /user/pg via address bar. PASS: each renders header/footer + loader placeholder, no error message, no console errors.

## Test 3: It should apply themes from localStorage and follow system dark mode
- Set localStorage.theme='night', reload → dark night theme visible (root div class "night", dark background). Set 'amoledblack', reload → black background. PASS iff visual background changes accordingly.
- Clear localStorage.theme, emulate prefers-color-scheme: dark (DevTools rendering emulation) → night theme applies without stored key. PASS: dark UI; localStorage.theme set to 'night' only after a media change event.

## Test 4: It should render correctly on mobile viewport
- Resize/emulate mobile viewport (~375x812). PASS: header remains fixed/visible at top, nav links accessible, footer renders; no layout breakage.

Global: capture console at end; PASS iff zero errors.
