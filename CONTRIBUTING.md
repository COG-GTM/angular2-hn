# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.
Even if you have little to no experience with React, I'll be more than happy to help. :)

## Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature or bug fix
4. `npm install`
5. Run `npm run dev` and open `localhost:5173` in a browser
6. Work your magic
7. Run `npm run lint`, `npm test` and `npm run build` and make sure nothing is broken
8. To run the end-to-end suite: `npx playwright install chromium` once, then `npm run build && npm run e2e`
9. To test service worker changes:
  * `npm run build` to generate `dist/` including `sw.js`
  * `npm run preview` to serve the production build with the service worker registered
10. Add yourself to the [contributor's list](https://github.com/hdjirdeh/angular2-hn#contributors) in the README!
11. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
12. Push your branch to your fork
13. Create a pull request from your branch on your fork to `master` on this repo
14. Have your branch get merged in! :star2:

If you experience a problem at any point, please don't hesitate to file an issue or send me a message!
