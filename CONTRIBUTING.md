# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.
Even if you have little to no experience with React, I'll be more than happy to help. :)

## Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature or bug fix
4. `cd react && npm install`
5. `npx playwright install chromium` (for e2e tests)
6. Run `npm run dev` and open `localhost:5173` in a browser
7. Before opening a PR: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run e2e`
8. Work your magic
9. Run `npm run build` or `npm run static-serve` to kick off a production build and make sure nothing is broken
10. To test service worker changes:
  * `npm run build` to kick off a fresh build and update the `dist/` directory
  * `npm run precache` to generate the service worker file
  * `npm run static-serve` to load the application along with the service worker asset using [live-server](https://github.com/tapio/live-server)
11. Add yourself to the [contributor's list](https://github.com/hdjirdeh/angular2-hn#contributors) in the README!
12. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
13. Push your branch to your fork
14. Create a pull request from your branch on your fork to `master` on this repo
15. Have your branch get merged in! :star2:

If you experience a problem at any point, please don't hesitate to file an issue or send me a message!
