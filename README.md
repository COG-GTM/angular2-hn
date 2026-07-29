<p align="center">
  <img alt="Vantage 4% Cash Card" title="Vantage 4% Cash Card" src="public/assets/images/logo.svg" width="120">
</p>

<p align="center">
  A progressive web app for the <strong>Vantage 4% cash back card</strong> — balances, transactions and rewards.
</p>

---

:zap: **Fast:** Angular 20 standalone components with lazy-loaded feature routes and a service worker app shell.

:iphone: **Responsive:** Installable UI that works on phones and desktops.

:moneybag: **4% on everything:** every purchase earns a flat 4% back — the rate is applied in exactly one place and surfaced across the dashboard, transactions and rewards views.

## Features

| Route            | What it shows                                                                        |
| ---------------- | ------------------------------------------------------------------------------------ |
| `/dashboard`     | 4% cash back headline, cash back earned, balances and recent transactions              |
| `/transactions`  | Every transaction with the 4% cash back it earned, filterable by spend category        |
| `/transactions/:id` | A single transaction and how its cash back was calculated                           |
| `/rewards`       | Cash back broken down by category, plus redeemed vs. available balances                |
| `/account`       | Card accounts, credit utilization and display preferences (themes, masking amounts)    |

## Stack

- **Angular 20** — standalone components, signals, `input()`/`computed()`, lazy routes
- **HttpClient** — via `provideHttpClient(withFetch())`
- **`@angular/service-worker`** — PWA/offline support (`ngsw-config.json`)
- **ESLint** (`angular-eslint`) — replaced TSLint/codelyzer
- **Karma + Jasmine** — unit tests
- **Playwright** — end-to-end tests (replaced Protractor)
- **SCSS theme engine** — Default / Night / Black (AMOLED)

## Data

There is no cashback backend yet, so [`CashbackApiService`](src/app/shared/services/cashback-api.service.ts) serves
in-memory fixtures from [`mock-cashback-data.ts`](src/app/shared/data/mock-cashback-data.ts). Set
`environment.apiBaseUrl` to a real API origin and the same methods (`fetchCardAccounts()`, `fetchTransactions()`,
`fetchRewardsSummary()`, `fetchCashbackRate()`) issue `HttpClient` requests instead — no caller changes needed.

Cash back is derived from the single `CASHBACK_RATE = 0.04` constant, so the ledger, the per-transaction amounts and
the rewards breakdown can never disagree.

## Development

```bash
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build into dist/vantage-cashback
npm run lint       # ESLint
npm test           # Karma + Jasmine unit tests
npm run e2e:install && npm run e2e   # Playwright end-to-end tests
```

Regenerate the PWA icons after changing the brand mark with `python3 scripts/generate-icons.py`.

Service worker behaviour is only enabled in production builds; serve `dist/vantage-cashback/browser` with any static
server to exercise it.

## Themes

Built-in theme engine with Default, Night and Black (AMOLED). Themes, font size, list spacing and amount masking are
managed by `SettingsService` and persisted to `localStorage`.

## Deployment

`npm run build` then `firebase deploy` — hosting serves `dist/vantage-cashback/browser` with SPA rewrites
(see [`firebase.json`](firebase.json)). CI runs lint, unit tests, e2e and a production build on every push and pull
request (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Credits

This project began as [angular2-hn](https://github.com/hdjirdeh/angular2-hn), a Hacker News PWA by Houssein Djirdeh and
contributors, and was repurposed into a credit card cash back experience.
