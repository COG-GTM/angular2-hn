# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.
Even if you have little to no experience with React, I'll be more than happy to help. :)

## Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature or bug fix
4. `npm install`
5. Run `npm start` and open the printed URL (`http://localhost:5173` by default) in a browser
6. Work your magic
7. Before pushing, make sure the checks that run in CI pass locally:
  * `npm run typecheck`
  * `npm run lint`
  * `npm test`
  * `npm run build`
  * `npm run test:e2e` if you touched behaviour covered by the Playwright suite
8. To test service worker changes (they are inactive in development):
  * `npm run build` to generate `dist/`, including `sw.js` and `manifest.webmanifest`
  * `npm run preview` to serve the production build with the service worker registered
9. Add yourself to the [contributor's list](https://github.com/hdjirdeh/angular2-hn#contributors) in the README!
10. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
11. Push your branch to your fork
12. Create a pull request from your branch on your fork to `master` on this repo
13. Have your branch get merged in! :star2:

## Tests

Unit and component tests live next to the code they cover (`*.test.ts` / `*.test.tsx`) and run with Vitest, Testing Library and MSW. Shared test setup and fixtures are in `src/test`.

End-to-end tests run with Playwright via `npm run test:e2e`. Intercept network calls with `page.route` rather than relying on the live Hacker News API, which is often slow or unavailable.

If you experience a problem at any point, please don't hesitate to file an issue or send me a message!
