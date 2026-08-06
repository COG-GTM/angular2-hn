# Test Plan — PR #578 React rewrite of angular2-hn (react-app/, Vite dev server at localhost:5173)

Code evidence: routes App.tsx:43-52 (root → /news/1, feeds, /item/:id, /user/:id); theme class on root div App.tsx:37; settings state/localStorage SettingsContext.tsx (keys: theme, titleFontSize, listSpacing, openLinkInNewTab); cog icon in Header.tsx toggles settings.

## Desktop (maximized browser)

### T1: Feed + pagination
1. Go to http://localhost:5173/ → URL becomes /news/1; 30 stories render numbered 1–30 (verify item 1 shows "1." and last shows "30.").
2. Click "More" → URL /news/2; first item numbered "31.".
3. Navigate back (prev/back link) → /news/1, numbering starts at 1.

### T2: Header nav
Click new, show, ask, jobs in header → URLs /newest/1, /show/1, /ask/1, /jobs/1; active link visually highlighted; content matches section (e.g. Show HN titles under show, no comment links on jobs is optional).

### T3: Item details + comments
From /news/1 click a story's comments link → /item/:id shows title, points/author, comment threads with nested replies visible. Click a comment's collapse toggle ([-]) → its children hide and toggle shows [+]; click again → restored.

### T4: User page
Click a story author's name → /user/:id renders created date and karma (numeric value).

### T5: Settings panel
1. Click cog icon → panel opens showing Theme options, sliders, new-tab toggle.
2. Select Night → root div class becomes "night", page background turns dark. Select AMOLED → class "amoled", black background.
3. Reload page → AMOLED theme persists (localStorage theme=amoled).
4. Move title font size slider to max → story titles visibly larger. Move list spacing slider up → visible gaps between rows.
5. Toggle "open links in new tab" → story links gain target="_blank" (verify one link opens in new tab OR attribute in DOM + visual toggle state).

## Mobile viewport (~375px)
Resize window to ~375px wide (or Chrome device toolbar). Repeat:
- M1: /news/1 feed renders correctly at mobile width (30 stories, no horizontal overflow).
- M2: Open an item's comments → threads readable, collapse works.
- M3: Open settings via cog → panel usable; switch theme to Night → dark colors apply.

Optional: find a poll item (search HN "poll") and check poll bars render — skip if not readily available.

Pass criteria are per-step above; failure of any assertion = flag in report.
