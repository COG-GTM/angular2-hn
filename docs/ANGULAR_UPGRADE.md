# Angular upgrade: 9 -> 22

Upgraded major-by-major with `ng update`, running `ng build --configuration production` after each step.

## Landed on

Angular **22.1.7** (CLI / build-angular 22.1.8), TypeScript 6.0, Node 22.

Pinned to 22.1.x rather than 22.2.0 because 22.2.0 was published less than a week before this upgrade.

## What's blocking the next major

Nothing in this app. Angular 23 has not been released yet (npm `latest` is 22.2.0, `next` is 22.2.0-rc.0).
The next step is moving to 22.2.x once it has been out for a week, then 23 when it ships.

## Notable changes along the way

- `codelyzer` bumped to v6 (v5 peer-pinned Angular < 10, blocking v11).
- `rxjs/Observable` deep import replaced with `rxjs`; `>>>` replaced with `::ng-deep` (removed from Sass).
- Angular 21 migrations converted templates to `@if` / `@for` control flow and added `provideZoneChangeDetection()` to bootstrap.
- Angular 22 migrations added `ChangeDetectionStrategy.Eager` to components (preserves the old default).
- TypeScript 6: removed deprecated `baseUrl`; set `strict: false` explicitly (TS 6 defaults to strict and the app is not strict-clean); removed the `extendedDiagnostics` block the v22 migration added, since it requires `strictTemplates`.
- `.travis.yml` Node bumped from 6.9 to 22 so CI can build.

## Known gaps / follow-ups

- Tooling migrations failed in-process on some steps (v13, v14, v20) and were re-run with `ng update --migrate-only`.
- No lint target: TSLint/codelyzer are deprecated and `ng lint` isn't configured. Add `@angular-eslint`.
- No unit specs exist; `ng test` has nothing to run.
- Turn on `strict` / `strictTemplates` and fix the ~30 resulting TS errors (uninitialised properties, implicit `any`).
- Consider migrating from `@angular-devkit/build-angular:browser` (webpack) to the `application` builder (esbuild), and to standalone components.
- Sass `@import` deprecation warnings remain (non-fatal).
