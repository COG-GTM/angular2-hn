# Contributing

Thank you for your interest! Issues and pull requests are welcome.

## Setup

1. Fork and clone the repository, then create a branch for your change.
2. Use Node.js 24 or newer and run `npm ci` from the repository root.
3. Run `npm run dev` and open the URL printed by Vite.
4. Make a focused change and add appropriate regression tests.

## Validation

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run e2e
```

On Linux CI, use `npx playwright install --with-deps chromium` to install browser OS
dependencies as well. Playwright builds and serves production on port 4173; stop any
other server on that port first. Tests use deterministic HN API fixtures and cover
desktop and mobile Chromium, including offline app-shell navigation.

For manual PWA checks, run `npm run build` followed by `npm run preview`. The dev server
does not enable the service worker. Wait until the worker controls the page before
testing offline reloads and deep links. API data is deliberately not cached.

## Pull requests

- Keep changes scoped and use shared models, API helpers, and settings contracts.
- Do not commit `dist/`, dependencies, Playwright reports, or credentials.
- Commit your changes, push your branch, and open a pull request targeting `master`.
- Describe the behavior change, test results, and any unverified scenarios. Include
  desktop/mobile evidence for UI changes.

See the [README](README.md) for architecture, scripts, and deployment information and
the [license](LICENSE.md) for licensing terms.
