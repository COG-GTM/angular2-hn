# Test Plan — Angular→React migration (PR #591, HEAD 333c4a9)

Environment: dev server `npm start` (running on http://localhost:4201; port 4200 was occupied).
Production check via `npm run build` + `npm run preview`.
Data: live https://node-hnapi.herokuapp.com (verified 200, 30 items/page).

Evidence sources: App.tsx:34-41 (routes + `key`), settings-context.tsx:16-24 (localStorage init, theme flash fix),
feed.component.tsx:16,29,50-74 (listStart, scrollTo, jobs header, prev/more), item.component.tsx:11-33 (font-size,
spacing, target=_blank), item-details.component.tsx:63,103,120-135 (back button, user link, poll bars),
comment.component.tsx:8-31 (collapse toggle, deleted comment), vite.config.ts:11 (PWA enabled only on build).

## T1 — `/` redirect + news feed correctness
1. Load http://localhost:4201/ → URL must become `/news/1`.
2. List shows exactly 30 `<li>`, first rank `1.`, last rank `30.`.
PASS iff URL is /news/1, 30 stories, ranks 1..30, no console errors.

## T2 — Pagination + rank continuity + scroll-to-top
1. On /news/1, scroll to bottom, click "More ›".
2. URL → /news/2, first visible rank must be `31.`, last `60.`, viewport scrolled to top (header visible).
3. Click "‹ Prev" → back to /news/1, first rank `1.`.
FAIL if ranks restart at 1 on page 2 or the page stays scrolled down.

## T3 — Feed switching shows no stale stories (the `key` fix)
1. From /news/1 note the first story title.
2. Click header "jobs".
3. Immediately screenshot: the page must show either the loader OR jobs content — it must NOT show the news
   story titles under the jobs route. Jobs page must show the "These are jobs at startups that were funded by
   Y Combinator" header paragraph and no rank/points from news.
4. Repeat for "ask", "show", "new": each shows loader-then-own content, ask/show/new show 30 items.
FAIL if any previous feed's titles paint under the new route.

## T4 — Item detail: metadata, content, comments, collapse, deleted, author link, back
Use poll item http://localhost:4201/item/126809 (type=poll, 3 poll options, 25 comments, contains a deleted comment).
1. Poll bars render with per-option "N points" and non-zero widths proportional to points (bars visibly different widths).
2. Click `[-]` on the first top-level comment → glyph becomes `[+]` and that comment's text + its replies hide;
   click again → `[-]` and text reappears.
3. A "[deleted] | Comment Deleted" row is present.
4. Click a comment author username → navigates to /user/<name> showing karma/created; browser Back returns to /item/126809.
5. Also open a regular story (top news item) → title, "N points by user", time ago, comment count, nested comments render.
6. Click the mobile/laptop back button (`.back-button`) is only visible on mobile widths — instead verify browser back.
FAIL if poll bars are all 0-width/NaN, collapse doesn't hide replies, or navigation errors.

## T5 — Settings: 3 themes, new-tab links, font size, spacing + persistence + no theme flash
1. Click cog in header → modal titled "Settings" appears (heading not oversized/broken).
2. Select "Night" → page background darkens immediately (no reload). Select "Black (AMOLED)" → background pure black.
3. Check "Open links in a new tab" → a story title anchor must now have target="_blank" (verify by clicking a story
   title and confirming a NEW tab opens); uncheck later.
4. Set Font size to 26 and List spacing to 30 → story titles visibly larger and rows visibly further apart
   (compare screenshot before/after).
5. With amoledblack + newtab on + font 26 + spacing 30 saved, reload the page. Assert:
   - Reloaded page is still black, font still large, spacing still large, checkbox still checked.
   - NO white/light flash during reload: take a screenshot as early as possible after reload; also verify by
     recording — background must never be light.
FAIL if any setting resets, or a light flash is visible on reload.

## T6 — Deep links + browser back/forward
1. Direct load /item/126809, /user/pg, /ask/2 in the address bar → each renders correct content (not a blank page
   or 404), /ask/2 ranks start at 31.
2. Use browser Back/Forward across news→jobs→item→user chain; each step shows the correct page content.

## T7 — Production build + service worker + manifest + offline
1. `npm run build` succeeds; dist/react-hnpwa contains sw.js and manifest.webmanifest.
2. `npm run preview`, load the site; confirm `navigator.serviceWorker.getRegistration()` returns a registration
   (Application panel or console one-liner) and `<link rel="manifest">` is present in the DOM.
3. Enable DevTools offline (Network → Offline), reload → app shell still renders (header/logo visible), not the
   browser's dino/"no internet" page.
FAIL if SW does not register or offline reload shows the browser error page.

Throughout: watch the browser console; any error is reported.
