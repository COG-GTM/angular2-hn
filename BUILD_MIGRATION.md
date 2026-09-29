# Build migration: legacy Angular CLI 9 -> Angular 22 application builder

## Summary

The project was on Angular 9 with the webpack-based `@angular-devkit/build-angular:browser`
builder, which does not run on current Node.js (the dev environment is Node 24). The build now uses
the current esbuild/Vite-based builders from `@angular/build`, and Angular itself was upgraded to
22.1.7 (the builder package is versioned in lockstep with the framework, so the builder cannot be
upgraded on its own).

`ng build --configuration production` now succeeds (exit 0, ~348 kB initial / ~93 kB transfer).

## What changed

### Dependencies (`package.json`, `yarn.lock`)

| Package | Before | After |
| --- | --- | --- |
| `@angular/*` | ~9.0.x | 22.1.7 |
| `@angular-devkit/build-angular` | ~0.900.2 | removed |
| `@angular/build` | - | 22.1.7 |
| `@angular/platform-browser-dynamic` | ~9.0.x | removed (not needed with AOT-only builder) |
| `typescript` | ~3.7.5 | ~6.0.3 |
| `rxjs` | ~6.5.4 | ~7.8.2 |
| `rxjs-compat` | ^6.5.2 | removed |
| `zone.js` | ~0.10.2 | ~0.16.3 |
| `tslib` | ^1.10.0 | ^2.8.1 |
| Karma / Jasmine | Angular 9 era | karma 6.4, jasmine 5.1 |
| Protractor, TSLint, codelyzer, ts-node, `node-fetch` | present | removed |

Added scripts: `build:prod` (`ng build --configuration production`) and `watch`.

### `angular.json`

- `build`: `@angular-devkit/build-angular:browser` -> `@angular/build:application`
  - `main` -> `browser: "src/main.ts"`
  - `polyfills: "src/polyfills.ts"` -> `polyfills: ["zone.js"]`
  - `outputPath` uses the object form (`{ base: "dist/angular-hnpwa", browser: "" }`) so files
    are still emitted directly in `dist/angular-hnpwa/` (no `browser/` subfolder).
  - Removed options that no longer exist (`aot`, `buildOptimizer`, `vendorChunk`).
  - `production` is the default configuration; a `development` configuration was added.
  - Service worker: `serviceWorker: true` + `ngswConfigPath` -> `serviceWorker: "ngsw-config.json"`.
- `serve`: `@angular/build:dev-server` (default `development`).
- `test`: `@angular/build:karma` (no `main: src/test.ts` needed).
- `extract-i18n`: `@angular/build:extract-i18n`.
- Removed the `lint` (TSLint) and `e2e` (Protractor) targets.

### TypeScript config

- `tsconfig.json`: `target`/`lib` ES2022, `module: preserve`, `moduleResolution: bundler`,
  `isolatedModules`, `esModuleInterop`, `skipLibCheck`. `strict: false` is set explicitly (see assumptions).
- `tsconfig.app.json` / `tsconfig.spec.json`: modern layout; spec config no longer references `src/test.ts`.

### Removed files

- `src/polyfills.ts`, `src/test.ts` (replaced by builder options)
- `browserslist` (Angular's default browser targets are used)
- `tslint.json`, `e2e/` (TSLint and Protractor are end-of-life)

### Source changes required by the upgrade

- `src/main.ts`: `platformBrowserDynamic()` -> `platformBrowser()`, and zone-based change detection
  is provided explicitly via `provideZoneChangeDetection()` (Angular 22 defaults to zoneless).
- All components/pipes: `standalone: false` (Angular 19+ defaults to standalone; the app still uses NgModules).
- All components: `changeDetection: ChangeDetectionStrategy.Eager`. Angular 22 changed the default
  strategy to OnPush; the app mutates component fields from subscriptions and relies on the old
  default, and without this the feed stayed on the loading spinner even though data had loaded.
- RxJS: `rxjs/Observable` / `rxjs/Subscription` deep imports -> `import { ... } from 'rxjs'`.
- `Story` model: added optional `text` and `content` fields that the templates already read
  (the new compiler type-checks templates).
- SCSS: deprecated `:host >>>` selectors -> `:host ::ng-deep`.
- `ngsw-config.json`: asset reference `/manifest.webmanifest` -> `/manifest.json` (the file that actually exists).
- `karma.conf.js`: dropped the `@angular-devkit/build-angular` Karma plugin/framework.
- Added `src/app/shared/pipes/comment.pipe.spec.ts` so the test target has at least one spec.
- `.gitignore`: ignore `/.angular/cache`.

## Verification

- `ng build --configuration production` -> exit 0. Remaining output is warnings only (Sass
  `@import`, slash-division and global built-in function deprecations).
- `ng test --watch=false --browsers=ChromeHeadless` -> `TOTAL: 3 SUCCESS`.
- Served `dist/angular-hnpwa/` with an SPA-fallback static server and loaded it in Chrome:
  - `/news/1` renders 30 stories; `/item/<id>` renders the story and its comments.
  - `ngsw-worker.js` registers and activates.
  - `/user/<id>` shows the app's "Could not load user" message because the upstream
    `node-hnapi.herokuapp.com/user/*` endpoint currently returns 404 (independent of this change).
- `ng serve` dev server renders the feed as well.

## Assumptions

- "Current builder configuration" means `@angular/build:application` on a current Angular release.
  Angular 22.1.7 was chosen because it is current and supports the Node 24 runtime available here.
- Kept the NgModule architecture and zone.js-based change detection rather than migrating to
  standalone/zoneless/OnPush, to keep the change focused on the build.
- Kept `strict: false` (the codebase was never strict) instead of fixing all strict-mode errors.
- Dropped TSLint and Protractor instead of replacing them with ESLint / a new e2e runner.
- Kept Yarn v1 and the existing `yarn.lock` workflow.

## Suggested follow-ups

- Migrate SCSS from `@import`/`darken()`/`/` division to `@use` + `sass:color`/`sass:math` to clear warnings.
- Add ESLint (`ng add @angular-eslint/schematics`) and an e2e runner (e.g. Playwright).
- Incrementally move to standalone components, signals, and OnPush/zoneless change detection.
- Enable `strict` mode and fix the resulting type errors.
- Replace or self-host the `node-hnapi` backend (user endpoint is currently 404) and update the README's stale Travis badge.
