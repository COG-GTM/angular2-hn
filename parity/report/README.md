# Parity report: Angular 9 baseline vs Angular 21 upgrade

Same Playwright specs run against the baseline (`:4000`) and the upgraded app (`:4200`). All specs except `live.spec.ts` serve recorded API responses from `parity/fixtures`, so both apps render identical data. `retries: 1` is set because `live.spec.ts` hits the public HN APIs.

**Result:** baseline 23/23 passed, upgraded 23/23 passed.

| Page / flow | Baseline | Upgraded |
|---|---|---|
| feeds.spec.ts › root redirects to /news/1 | pass | pass |
| feeds.spec.ts › news page 1 lists 30 stories with titles, points and pagination | pass | pass |
| feeds.spec.ts › More goes to page 2, numbering continues at 31, Prev goes back | pass | pass |
| feeds.spec.ts › header nav "new" opens the newest feed | pass | pass |
| feeds.spec.ts › header nav "show" opens the show feed | pass | pass |
| feeds.spec.ts › header nav "ask" opens the ask feed | pass | pass |
| feeds.spec.ts › header nav "jobs" opens the jobs feed | pass | pass |
| feeds.spec.ts › logo link returns to news page 1 | pass | pass |
| feeds.spec.ts › feed shows an error message when the API is unreachable | pass | pass |
| item.spec.ts › comments link opens the story with its comment tree | pass | pass |
| item.spec.ts › collapsing a comment hides its text and replies | pass | pass |
| item.spec.ts › ask item without external url links to itself and shows its text | pass | pass |
| item.spec.ts › poll item shows options with their points | pass | pass |
| live.spec.ts › live: news feed loads from the public API | pass | pass |
| live.spec.ts › live: user profile loads from api.hnpwa.com | pass | pass |
| settings.spec.ts › settings popup opens and closes | pass | pass |
| settings.spec.ts › theme "Night" applies and persists across reload | pass | pass |
| settings.spec.ts › theme "Black (AMOLED)" applies and persists across reload | pass | pass |
| settings.spec.ts › font size and list spacing change the feed layout and persist | pass | pass |
| settings.spec.ts › "Open links in a new tab" sets target=_blank on story links | pass | pass |
| user.spec.ts › author link opens the user profile | pass | pass |
| user.spec.ts › profile page renders directly by URL | pass | pass |
| user.spec.ts › unknown user shows the error message (non-JSON API response, as served live) | pass | pass |

## Screenshots (baseline left, upgraded right)

| Screen | Pixel diff | Size (baseline / upgraded) |
|---|---|---|
| [feed-ask.png](side-by-side/feed-ask.png) | 0.00% | 1280x1979 / 1280x1979 |
| [feed-error.png](side-by-side/feed-error.png) | 0.00% | 1280x1053 / 1280x1053 |
| [feed-jobs.png](side-by-side/feed-jobs.png) | 0.00% | 1280x2122 / 1280x2122 |
| [feed-newest.png](side-by-side/feed-newest.png) | 0.00% | 1280x2063 / 1280x2063 |
| [feed-show.png](side-by-side/feed-show.png) | 0.00% | 1280x2063 / 1280x2063 |
| [item-ask.png](side-by-side/item-ask.png) | 0.00% | 1280x1053 / 1280x1053 |
| [item-poll.png](side-by-side/item-poll.png) | 0.00% | 1280x6942 / 1280x6942 |
| [item-story.png](side-by-side/item-story.png) | 0.00% | 1280x2165 / 1280x2165 |
| [news-page-1.png](side-by-side/news-page-1.png) | 0.00% | 1280x2063 / 1280x2063 |
| [news-page-2.png](side-by-side/news-page-2.png) | 0.00% | 1280x2063 / 1280x2063 |
| [settings-font-spacing.png](side-by-side/settings-font-spacing.png) | 0.00% | 1280x2657 / 1280x2657 |
| [settings-open.png](side-by-side/settings-open.png) | 0.00% | 1280x2063 / 1280x2063 |
| [theme-amoledblack.png](side-by-side/theme-amoledblack.png) | 0.00% | 1280x2059 / 1280x2059 |
| [theme-night.png](side-by-side/theme-night.png) | 0.00% | 1280x2063 / 1280x2063 |
| [user-gumby.png](side-by-side/user-gumby.png) | 0.00% | 1280x900 / 1280x900 |
| [user-pg.png](side-by-side/user-pg.png) | 0.00% | 1280x900 / 1280x900 |

Regenerate: serve both apps, then `cd parity && npm test; npm run report`.
