# Feeds parity: Angular 9 (`master`, :4000) vs Angular 21 (this branch, :4200)

Side-by-side images: legacy left, Angular 21 right, cropped to the feed (`app-feed .main-content`).
Live data from node-hnapi; both apps captured back to back.

| Page | Viewport | Numbering start | Stories | Titles, links, subtext | Prev/More links | Jobs header |
|---|---|---|---|---|---|---|
| /news/1 | desktop + mobile | 1 = 1 | 30 = 30 | identical | More → /news/2 | n/a |
| /news/2 | desktop + mobile | 31 = 31 | 30 = 30 | identical | Prev → /news/1, More → /news/3 | n/a |
| /newest/1 | desktop + mobile | 1 = 1 | 30 = 30 | identical | More → /newest/2 | n/a |
| /show/1 | desktop + mobile | 1 = 1 | 30 = 30 | identical | More → /show/2 | n/a |
| /ask/1 | desktop + mobile | 1 = 1 | 15 = 15 | identical, titles link to /item/:id | none (short page) | n/a |
| /jobs/1 | desktop + mobile | 1 = 1 | 30 = 30 | identical, no points/user/comments | More → /jobs/2 | identical |

Flows (both apps): More → /news/2, list starts at 31, scrolled to top; Prev → back to page 1;
API blocked → "Could not load newest stories." error page.

Layout: list, item, paragraph, subtext and nav boxes measure the same height in both apps (e.g. item 38.391px, list 1841.719px on /news/1 desktop).
The feed starts at a different y offset (71px vs 49.5px) only because the header is still a placeholder on this branch, which shifts sub-pixel rounding by 1px.

Re-run: serve both apps, then `CHROME_BIN=... python3 parity/feeds/parity_shots.py && python3 parity/feeds/flow.py` (Python Playwright + Pillow).
