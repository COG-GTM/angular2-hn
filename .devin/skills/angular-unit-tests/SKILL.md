---
name: angular-unit-tests
description: Add focused Jasmine/Karma unit tests for Angular components in COG-GTM/angular2-hn, using the FeedComponent tests in PR 820 as a reference.
---

# Add Angular component unit tests

Use this procedure when asked to add or extend a component's `.spec.ts` in this repository. The reference is [PR 820's FeedComponent spec](https://github.com/COG-GTM/angular2-hn/blob/devin/1790218326-feed-component-tests/src/app/feeds/feed/feed.component.spec.ts). That PR is separate from `master`; read it via `git show origin/devin/1790218326-feed-component-tests:src/app/feeds/feed/feed.component.spec.ts` if it is not yet merged. Confirm the branch's `package.json` and `karma.conf.js` before using these commands, since open upgrade and coverage PRs may differ from `master`.

1. Read the component class, template, collaborators, and route declarations. Identify input streams, success/error/completion behavior, and meaningful DOM states. Place the spec beside its component so `src/test.ts` discovers it automatically.
2. Configure `TestBed` with `RouterTestingModule`, the component, and a `HackerNewsAPIService` provider replaced by `jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed'])`. Return `of(stories)` for success and `throwError(new Error('boom'))` for errors. Never call the live HN API in a component test. Use `NO_ERRORS_SCHEMA` when testing the parent's behavior without child components; declare the real children and their dependencies only when asserting their rendered output.
3. Replace `ActivatedRoute` with controllable `data` and `params` observables. The PR 820 spec uses two `Subject`s and emits `{ feedType: 'news' }` before `{ page: '2' }` after the first `fixture.detectChanges()`; this makes fetch timing and refetch assertions explicit. `BehaviorSubject`s are useful when the test should receive an initial route value immediately. Stub `window.scrollTo` with `spyOn(window, 'scrollTo').and.stub()`.
4. Cover behavior and DOM, not just creation: feed type and default/parsed page, `fetchFeed` arguments and refetches on param changes, returned stories, `listStart = (pageNum - 1) * 30 + 1`, scroll on completion, failure message without success-only effects, loader/list/error transitions, jobs header, and Prev/More links on full versus short pages. Call `fixture.detectChanges()` after emissions before asserting rendered DOM. Keep fixtures small except when the 30-story pagination boundary is under test.
5. On the current Node 20/Angular 9 checkout, run this exact working local command from the repo root:

   ```sh
   NODE_OPTIONS=--openssl-legacy-provider CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) npm test -- --watch=false
   ```

   The unmodified first run in the PR 820 session exited 1; adding `NODE_OPTIONS=--openssl-legacy-provider` made all 16 tests pass. Use `npx tslint -p tsconfig.spec.json src/app/feeds/feed/feed.component.spec.ts` for the reference spec, replacing the path with the spec you wrote. Run repository lint/build as appropriate and report any baseline failures separately.
6. If a target branch already contains PR 821's coverage configuration, use its `npm run test:ci` script with the same `NODE_OPTIONS` and `CHROME_BIN` to verify the CI coverage gate. Do not assume that script or `ChromeHeadlessCI` launcher exists on `master` before PR 821 merges. Avoid importing lazy modules just to inspect route configuration; assert on route metadata without loading chunks when suitable.
