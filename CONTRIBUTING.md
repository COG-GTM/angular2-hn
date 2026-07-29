# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.

## Setup

1. Fork the repo and clone your fork
2. Make a branch for your feature or bug fix
3. `npm install`
4. `npm start` and open `localhost:4200` in a browser
5. Work your magic
6. Before pushing, run:
   - `npm run lint`
   - `npm test`
   - `npm run e2e` (first time: `npm run e2e:install`)
   - `npm run build`
7. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
8. Push your branch to your fork and open a pull request against `master`

## Notes

- Feature views live under `src/app/<feature>/` and are lazy loaded from `src/app/app.routes.ts`.
- All cashback data flows through `src/app/shared/services/cashback-api.service.ts`; keep new data access there.
- The 4% rate comes from `CASHBACK_RATE` in `src/app/shared/data/mock-cashback-data.ts` — never hard-code it elsewhere.
- Service worker changes are only active in production builds (`npm run build`, then serve `dist/vantage-cashback/browser`).

If you experience a problem at any point, please don't hesitate to file an issue.
