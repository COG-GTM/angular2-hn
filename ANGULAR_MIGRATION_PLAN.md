# Angular Migration Plan: Version 9 to Version 19

This document provides a comprehensive, phased migration plan for upgrading the Angular2-HN application from Angular 9.0.1 to Angular 19. The migration must proceed sequentially through each major version as Angular does not support skipping major versions.

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Migration Overview](#migration-overview)
3. [Pre-Migration Preparation](#pre-migration-preparation)
4. [Phase 1: Angular 9 to 10](#phase-1-angular-9-to-10)
5. [Phase 2: Angular 10 to 11](#phase-2-angular-10-to-11)
6. [Phase 3: Angular 11 to 12](#phase-3-angular-11-to-12)
7. [Phase 4: Angular 12 to 13](#phase-4-angular-12-to-13)
8. [Phase 5: Angular 13 to 14](#phase-5-angular-13-to-14)
9. [Phase 6: Angular 14 to 15](#phase-6-angular-14-to-15)
10. [Phase 7: Angular 15 to 16](#phase-7-angular-15-to-16)
11. [Phase 8: Angular 16 to 17](#phase-8-angular-16-to-17)
12. [Phase 9: Angular 17 to 18](#phase-9-angular-17-to-18)
13. [Phase 10: Angular 18 to 19](#phase-10-angular-18-to-19)
14. [Post-Migration Tasks](#post-migration-tasks)
15. [Testing Strategy](#testing-strategy)
16. [Rollback Strategy](#rollback-strategy)

## Current State Assessment

### Current Versions (from package.json)

The application currently uses the following key dependencies:

| Package | Current Version | Notes |
|---------|----------------|-------|
| @angular/core | ~9.0.1 | 10 major versions behind |
| @angular/cli | ~9.0.2 | 10 major versions behind |
| TypeScript | ~3.7.5 | Needs upgrade to 5.5+ |
| RxJS | ~6.5.4 | Will need upgrade to 7.x |
| Zone.js | ~0.10.2 | Needs upgrade to 0.14+ |
| TSLint | ~5.15.0 | Deprecated, migrate to ESLint |
| rxjs-compat | ^6.5.2 | Legacy compatibility layer, should be removed |

### Known Issues to Address

The following issues have been identified in the codebase that must be addressed during migration:

**1. Deprecated RxJS Imports**

Several files use the old deep import paths instead of importing directly from `rxjs`:

- `src/app/user/user.component.ts` - Line 4: `import { Subscription } from 'rxjs/Subscription';`
- `src/app/shared/services/hackernews-api.service.ts` - Line 2: `import { Observable } from 'rxjs/Observable';`
- `src/app/item-details/item-details.component.ts` - Line 4: `import { Subscription } from 'rxjs/Subscription';`

These should be changed to:
```typescript
import { Subscription, Observable } from 'rxjs';
```

**2. Deprecated Zone.js Import**

`src/polyfills.ts` (Line 58) uses the deprecated import path:
```typescript
import 'zone.js/dist/zone';
```

This should be changed to:
```typescript
import 'zone.js';
```

**3. Removed Configuration Option**

`angular.json` contains the `extractCss` option (Line 48) which was removed in Angular 11:
```json
"extractCss": true,
```

This option should be removed as CSS extraction is now the default behavior in production builds.

**4. TSLint Deprecation**

The project uses TSLint (`tslint.json`) which has been deprecated since 2019. The project should migrate to ESLint using the Angular ESLint schematic.

**5. Legacy rxjs-compat Package**

The `rxjs-compat` package in dependencies is a migration helper for RxJS 5 to 6 and is no longer needed. It should be removed.

**6. Service Worker Configuration**

The `ngsw-config.json` may need updates for newer Angular versions, particularly around the manifest file references.

## Migration Overview

The migration path follows this sequence, with each phase representing a major version upgrade:

```
Angular 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
```

Each phase should be completed and tested before proceeding to the next. The Angular Update Guide at https://update.angular.io provides detailed, version-specific migration instructions and should be referenced alongside this plan.

### Estimated Timeline

| Phase | Version Upgrade | Estimated Effort | Complexity |
|-------|----------------|------------------|------------|
| Pre-Migration | Preparation | 2-4 hours | Low |
| Phase 1 | 9 → 10 | 2-4 hours | Low |
| Phase 2 | 10 → 11 | 4-6 hours | Medium |
| Phase 3 | 11 → 12 | 4-6 hours | Medium |
| Phase 4 | 12 → 13 | 4-6 hours | Medium |
| Phase 5 | 13 → 14 | 4-6 hours | Medium |
| Phase 6 | 14 → 15 | 4-6 hours | Medium |
| Phase 7 | 15 → 16 | 4-6 hours | Medium |
| Phase 8 | 16 → 17 | 6-8 hours | High |
| Phase 9 | 17 → 18 | 4-6 hours | Medium |
| Phase 10 | 18 → 19 | 4-6 hours | Medium |
| Post-Migration | Cleanup & Optimization | 4-8 hours | Medium |

**Total Estimated Effort: 45-65 hours**

## Pre-Migration Preparation

Before beginning the migration, complete the following preparatory steps:

### 1. Environment Setup

Ensure you have the appropriate Node.js version management tool installed (nvm recommended):

```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# For Angular 9-10, use Node.js 12.x
nvm install 12
nvm use 12
```

### 2. Create a Migration Branch

```bash
git checkout -b feature/angular-migration
```

### 3. Fix Deprecated RxJS Imports

Before starting the version upgrades, fix the deprecated RxJS imports:

**File: `src/app/user/user.component.ts`**
```typescript
// Change from:
import { Subscription } from 'rxjs/Subscription';

// To:
import { Subscription } from 'rxjs';
```

**File: `src/app/shared/services/hackernews-api.service.ts`**
```typescript
// Change from:
import { Observable } from 'rxjs/Observable';

// To:
import { Observable } from 'rxjs';
```

**File: `src/app/item-details/item-details.component.ts`**
```typescript
// Change from:
import { Subscription } from 'rxjs/Subscription';

// To:
import { Subscription } from 'rxjs';
```

### 4. Remove rxjs-compat

Remove the legacy compatibility package:

```bash
npm uninstall rxjs-compat
```

### 5. Verify Current Build

Ensure the application builds and runs correctly before starting migration:

```bash
npm install
npm run build
npm run test
npm start
```

### 6. Document Current Functionality

Create a checklist of all features to verify after each migration phase:
- Home feed loads correctly
- Navigation between feeds works (news, newest, show, ask, jobs)
- Item details page displays correctly
- Comments render with proper nesting
- User profile page works
- Settings panel functions correctly
- Theme switching works
- Service worker caches assets properly

## Phase 1: Angular 9 to 10

**Reference:** https://update.angular.io/?v=9.0-10.0

### Node.js Requirement
- Minimum: Node.js 10.13
- Recommended: Node.js 12.x

### Key Changes in Angular 10
- TypeScript 3.9 support
- New date range picker in Angular Material
- Warnings for CommonJS imports
- Optional stricter settings for new projects
- Updated browser support (IE9/10 and mobile IE deprecated)

### Migration Steps

#### Step 1: Update Angular CLI and Core

```bash
ng update @angular/core@10 @angular/cli@10
```

#### Step 2: Update TypeScript

Angular 10 requires TypeScript 3.9:

```bash
npm install typescript@~3.9.7
```

#### Step 3: Update tslib

```bash
npm install tslib@^2.0.0
```

#### Step 4: Update package.json Dependencies

Update the following in `package.json`:

```json
{
  "dependencies": {
    "@angular/animations": "~10.0.0",
    "@angular/common": "~10.0.0",
    "@angular/compiler": "~10.0.0",
    "@angular/core": "~10.0.0",
    "@angular/forms": "~10.0.0",
    "@angular/platform-browser": "~10.0.0",
    "@angular/platform-browser-dynamic": "~10.0.0",
    "@angular/router": "~10.0.0",
    "@angular/service-worker": "~10.0.0",
    "tslib": "^2.0.0",
    "zone.js": "~0.10.3"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~0.1000.0",
    "@angular/cli": "~10.0.0",
    "@angular/compiler-cli": "~10.0.0",
    "@angular/language-service": "~10.0.0",
    "typescript": "~3.9.7"
  }
}
```

#### Step 5: Address CommonJS Warnings

Angular 10 warns about CommonJS dependencies. The `unfetch` and `node-fetch` packages may trigger warnings. Consider using the Angular HttpClient instead, or suppress warnings in `angular.json`:

```json
"build": {
  "options": {
    "allowedCommonJsDependencies": [
      "unfetch",
      "node-fetch"
    ]
  }
}
```

#### Step 6: Verify and Test

```bash
npm install
npm run build
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] All tests pass
- [ ] Application runs correctly in development mode
- [ ] All navigation works
- [ ] Data loads from API correctly

## Phase 2: Angular 10 to 11

**Reference:** https://update.angular.io/?v=10.0-11.0

### Node.js Requirement
- Minimum: Node.js 10.19 or 12.11
- Recommended: Node.js 12.x

### Key Changes in Angular 11
- TypeScript 4.0 support
- **`extractCss` option removed** (CSS extraction is now default in production)
- Stricter type checking enabled by default
- Updated Hot Module Replacement (HMR) support
- Font inlining for improved performance
- Webpack 5 support (opt-in)

### Migration Steps

#### Step 1: Update Angular CLI and Core

```bash
ng update @angular/core@11 @angular/cli@11
```

#### Step 2: Update TypeScript

```bash
npm install typescript@~4.0.0
```

#### Step 3: Remove extractCss Option

**This is a critical step for this project.** Remove the `extractCss` option from `angular.json`:

```json
// Remove this line from configurations.production:
"extractCss": true,
```

CSS extraction is now the default behavior in production builds.

#### Step 4: Update Zone.js Import

Update `src/polyfills.ts`:

```typescript
// Change from:
import 'zone.js/dist/zone';

// To:
import 'zone.js';
```

#### Step 5: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~11.0.0",
    "@angular/common": "~11.0.0",
    "@angular/compiler": "~11.0.0",
    "@angular/core": "~11.0.0",
    "@angular/forms": "~11.0.0",
    "@angular/platform-browser": "~11.0.0",
    "@angular/platform-browser-dynamic": "~11.0.0",
    "@angular/router": "~11.0.0",
    "@angular/service-worker": "~11.0.0",
    "zone.js": "~0.11.4"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~0.1100.0",
    "@angular/cli": "~11.0.0",
    "@angular/compiler-cli": "~11.0.0",
    "@angular/language-service": "~11.0.0",
    "typescript": "~4.0.0"
  }
}
```

#### Step 6: Verify and Test

```bash
npm install
npm run build
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] No warnings about extractCss
- [ ] Zone.js loads correctly
- [ ] All tests pass
- [ ] Application runs correctly

## Phase 3: Angular 11 to 12

**Reference:** https://update.angular.io/?v=11.0-12.0

### Node.js Requirement
- Minimum: Node.js 12.14
- Recommended: Node.js 14.x

### Key Changes in Angular 12
- Ivy is now the default (View Engine deprecated)
- TypeScript 4.2 support
- Webpack 5 by default
- Strict mode enabled by default for new projects
- Nullish coalescing in templates
- Style improvements with Sass
- **TSLint support removed from Angular CLI**

### Migration Steps

#### Step 1: Upgrade Node.js

```bash
nvm install 14
nvm use 14
```

#### Step 2: Update Angular CLI and Core

```bash
ng update @angular/core@12 @angular/cli@12
```

#### Step 3: Update TypeScript

```bash
npm install typescript@~4.2.0
```

#### Step 4: Migrate from TSLint to ESLint

This is a critical step as TSLint support is removed. Use the Angular ESLint migration schematic:

```bash
# Add Angular ESLint
ng add @angular-eslint/schematics

# Convert TSLint to ESLint
ng g @angular-eslint/schematics:convert-tslint-to-eslint angular-hnpwa
```

After migration:
- Delete `tslint.json`
- Remove `tslint` and `codelyzer` from devDependencies
- Update the lint script in `package.json` if needed

#### Step 5: Update angular.json for ESLint

The lint configuration in `angular.json` should be updated:

```json
"lint": {
  "builder": "@angular-eslint/builder:lint",
  "options": {
    "lintFilePatterns": [
      "src/**/*.ts",
      "src/**/*.html"
    ]
  }
}
```

#### Step 6: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~12.0.0",
    "@angular/common": "~12.0.0",
    "@angular/compiler": "~12.0.0",
    "@angular/core": "~12.0.0",
    "@angular/forms": "~12.0.0",
    "@angular/platform-browser": "~12.0.0",
    "@angular/platform-browser-dynamic": "~12.0.0",
    "@angular/router": "~12.0.0",
    "@angular/service-worker": "~12.0.0",
    "zone.js": "~0.11.4"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~12.0.0",
    "@angular/cli": "~12.0.0",
    "@angular/compiler-cli": "~12.0.0",
    "@angular/language-service": "~12.0.0",
    "@angular-eslint/builder": "~12.0.0",
    "@angular-eslint/eslint-plugin": "~12.0.0",
    "@angular-eslint/eslint-plugin-template": "~12.0.0",
    "@angular-eslint/schematics": "~12.0.0",
    "@angular-eslint/template-parser": "~12.0.0",
    "@typescript-eslint/eslint-plugin": "~4.28.0",
    "@typescript-eslint/parser": "~4.28.0",
    "eslint": "~7.26.0",
    "typescript": "~4.2.0"
  }
}
```

#### Step 7: Remove Deprecated Packages

```bash
npm uninstall tslint codelyzer
```

#### Step 8: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] ESLint runs successfully
- [ ] TSLint files removed
- [ ] All tests pass
- [ ] Application runs correctly

## Phase 4: Angular 12 to 13

**Reference:** https://update.angular.io/?v=12.0-13.0

### Node.js Requirement
- Minimum: Node.js 12.20 or 14.15 or 16.10
- Recommended: Node.js 16.x

### Key Changes in Angular 13
- View Engine no longer supported (Ivy only)
- TypeScript 4.4 support
- RxJS 7.4 support
- IE11 support removed
- Angular Package Format (APF) updates
- Persistent build cache
- End of Protractor support (consider migrating to Cypress or Playwright)

### Migration Steps

#### Step 1: Upgrade Node.js

```bash
nvm install 16
nvm use 16
```

#### Step 2: Update Angular CLI and Core

```bash
ng update @angular/core@13 @angular/cli@13
```

#### Step 3: Update TypeScript

```bash
npm install typescript@~4.4.0
```

#### Step 4: Update RxJS to Version 7

```bash
npm install rxjs@~7.4.0
```

RxJS 7 has some breaking changes. Review your code for:
- `toPromise()` is deprecated, use `firstValueFrom()` or `lastValueFrom()`
- Some operator signatures changed

#### Step 5: Remove IE11 Polyfills

If you have any IE11-specific polyfills in `src/polyfills.ts`, remove them as IE11 is no longer supported.

#### Step 6: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~13.0.0",
    "@angular/common": "~13.0.0",
    "@angular/compiler": "~13.0.0",
    "@angular/core": "~13.0.0",
    "@angular/forms": "~13.0.0",
    "@angular/platform-browser": "~13.0.0",
    "@angular/platform-browser-dynamic": "~13.0.0",
    "@angular/router": "~13.0.0",
    "@angular/service-worker": "~13.0.0",
    "rxjs": "~7.4.0",
    "zone.js": "~0.11.4"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~13.0.0",
    "@angular/cli": "~13.0.0",
    "@angular/compiler-cli": "~13.0.0",
    "@angular/language-service": "~13.0.0",
    "typescript": "~4.4.0"
  }
}
```

#### Step 7: Consider E2E Testing Migration

Protractor is deprecated. Consider migrating to:
- **Cypress** (recommended): `ng add @cypress/schematic`
- **Playwright**: Manual setup required

#### Step 8: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] RxJS 7 operators work correctly
- [ ] All tests pass
- [ ] Application runs correctly
- [ ] No IE11-related code remains

## Phase 5: Angular 13 to 14

**Reference:** https://update.angular.io/?v=13.0-14.0

### Node.js Requirement
- Minimum: Node.js 14.15 or 16.10
- Recommended: Node.js 16.x or 18.x

### Key Changes in Angular 14
- TypeScript 4.6 support
- Standalone components (preview)
- Strictly typed reactive forms
- Enhanced template diagnostics
- Angular CLI auto-completion
- `ng cache` command for build cache management

### Migration Steps

#### Step 1: Update Angular CLI and Core

```bash
ng update @angular/core@14 @angular/cli@14
```

#### Step 2: Update TypeScript

```bash
npm install typescript@~4.6.0
```

#### Step 3: Consider Typed Forms Migration

Angular 14 introduces strictly typed reactive forms. If using reactive forms, consider migrating:

```typescript
// Before (untyped)
form = new FormGroup({
  name: new FormControl('')
});

// After (typed)
form = new FormGroup({
  name: new FormControl<string>('')
});
```

Note: This project primarily uses template-driven approaches, so this may have minimal impact.

#### Step 4: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~14.0.0",
    "@angular/common": "~14.0.0",
    "@angular/compiler": "~14.0.0",
    "@angular/core": "~14.0.0",
    "@angular/forms": "~14.0.0",
    "@angular/platform-browser": "~14.0.0",
    "@angular/platform-browser-dynamic": "~14.0.0",
    "@angular/router": "~14.0.0",
    "@angular/service-worker": "~14.0.0",
    "rxjs": "~7.5.0",
    "zone.js": "~0.11.5"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~14.0.0",
    "@angular/cli": "~14.0.0",
    "@angular/compiler-cli": "~14.0.0",
    "@angular/language-service": "~14.0.0",
    "typescript": "~4.6.0"
  }
}
```

#### Step 5: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] All tests pass
- [ ] Forms work correctly
- [ ] Application runs correctly

## Phase 6: Angular 14 to 15

**Reference:** https://update.angular.io/?v=14.0-15.0

### Node.js Requirement
- Minimum: Node.js 14.20 or 16.13 or 18.10
- Recommended: Node.js 18.x

### Key Changes in Angular 15
- TypeScript 4.8 support
- Standalone components stable
- Directive composition API
- Image directive improvements
- Functional router guards
- Better stack traces
- `providedIn: 'any'` deprecated

### Migration Steps

#### Step 1: Upgrade Node.js

```bash
nvm install 18
nvm use 18
```

#### Step 2: Update Angular CLI and Core

```bash
ng update @angular/core@15 @angular/cli@15
```

#### Step 3: Update TypeScript

```bash
npm install typescript@~4.8.0
```

#### Step 4: Update Zone.js

```bash
npm install zone.js@~0.12.0
```

#### Step 5: Consider Standalone Components

Angular 15 makes standalone components stable. Consider migrating components:

```typescript
// Traditional NgModule-based component
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent {}

// Standalone component
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ExampleComponent {}
```

This is optional but recommended for new components.

#### Step 6: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~15.0.0",
    "@angular/common": "~15.0.0",
    "@angular/compiler": "~15.0.0",
    "@angular/core": "~15.0.0",
    "@angular/forms": "~15.0.0",
    "@angular/platform-browser": "~15.0.0",
    "@angular/platform-browser-dynamic": "~15.0.0",
    "@angular/router": "~15.0.0",
    "@angular/service-worker": "~15.0.0",
    "rxjs": "~7.5.0",
    "zone.js": "~0.12.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~15.0.0",
    "@angular/cli": "~15.0.0",
    "@angular/compiler-cli": "~15.0.0",
    "@angular/language-service": "~15.0.0",
    "typescript": "~4.8.0"
  }
}
```

#### Step 7: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] All tests pass
- [ ] Application runs correctly
- [ ] Service worker functions properly

## Phase 7: Angular 15 to 16

**Reference:** https://update.angular.io/?v=15.0-16.0

### Node.js Requirement
- Minimum: Node.js 16.14 or 18.10
- Recommended: Node.js 18.x

### Key Changes in Angular 16
- TypeScript 4.9/5.0 support
- Signals (preview)
- Required inputs
- Router inputs
- Server-side rendering improvements
- Hydration (developer preview)
- Jest and Web Test Runner support (experimental)

### Migration Steps

#### Step 1: Update Angular CLI and Core

```bash
ng update @angular/core@16 @angular/cli@16
```

#### Step 2: Update TypeScript

```bash
npm install typescript@~5.0.0
```

#### Step 3: Update Zone.js

```bash
npm install zone.js@~0.13.0
```

#### Step 4: Update tsconfig.json

Angular 16 may require updates to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false
  }
}
```

#### Step 5: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~16.0.0",
    "@angular/common": "~16.0.0",
    "@angular/compiler": "~16.0.0",
    "@angular/core": "~16.0.0",
    "@angular/forms": "~16.0.0",
    "@angular/platform-browser": "~16.0.0",
    "@angular/platform-browser-dynamic": "~16.0.0",
    "@angular/router": "~16.0.0",
    "@angular/service-worker": "~16.0.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~16.0.0",
    "@angular/cli": "~16.0.0",
    "@angular/compiler-cli": "~16.0.0",
    "@angular/language-service": "~16.0.0",
    "typescript": "~5.0.0"
  }
}
```

#### Step 6: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] TypeScript 5.0 compiles correctly
- [ ] All tests pass
- [ ] Application runs correctly

## Phase 8: Angular 16 to 17

**Reference:** https://update.angular.io/?v=16.0-17.0

### Node.js Requirement
- Minimum: Node.js 18.13
- Recommended: Node.js 18.x or 20.x

### Key Changes in Angular 17
- TypeScript 5.2 support
- Signals stable
- New control flow syntax (`@if`, `@for`, `@switch`)
- Deferrable views (`@defer`)
- Built-in control flow migration schematic
- New application builder (esbuild-based)
- SSR improvements
- New logo and documentation site

### Migration Steps

#### Step 1: Update Angular CLI and Core

```bash
ng update @angular/core@17 @angular/cli@17
```

#### Step 2: Update TypeScript

```bash
npm install typescript@~5.2.0
```

#### Step 3: Update Zone.js

```bash
npm install zone.js@~0.14.0
```

#### Step 4: Migrate to New Control Flow (Optional but Recommended)

Angular 17 introduces a new control flow syntax. Use the migration schematic:

```bash
ng generate @angular/core:control-flow
```

This converts:
```html
<!-- Old syntax -->
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item }}</div>

<!-- New syntax -->
@if (condition) {
  <div>Content</div>
}
@for (item of items; track item) {
  <div>{{ item }}</div>
}
```

#### Step 5: Consider New Application Builder

Angular 17 introduces a new esbuild-based builder. Update `angular.json`:

```json
"build": {
  "builder": "@angular-devkit/build-angular:application",
  "options": {
    "outputPath": "dist/angular-hnpwa",
    "index": "src/index.html",
    "browser": "src/main.ts",
    "polyfills": ["zone.js"],
    "tsConfig": "tsconfig.app.json",
    "assets": [
      "src/favicon.ico",
      "src/assets",
      "src/manifest.json",
      "src/manifest.webmanifest"
    ],
    "styles": ["src/styles.scss"],
    "scripts": []
  }
}
```

Note: The new builder uses `browser` instead of `main` and `polyfills` as an array.

#### Step 6: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~17.0.0",
    "@angular/common": "~17.0.0",
    "@angular/compiler": "~17.0.0",
    "@angular/core": "~17.0.0",
    "@angular/forms": "~17.0.0",
    "@angular/platform-browser": "~17.0.0",
    "@angular/platform-browser-dynamic": "~17.0.0",
    "@angular/router": "~17.0.0",
    "@angular/service-worker": "~17.0.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~17.0.0",
    "@angular/cli": "~17.0.0",
    "@angular/compiler-cli": "~17.0.0",
    "@angular/language-service": "~17.0.0",
    "typescript": "~5.2.0"
  }
}
```

#### Step 7: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] New control flow syntax works (if migrated)
- [ ] All tests pass
- [ ] Application runs correctly
- [ ] Build performance improved with new builder

## Phase 9: Angular 17 to 18

**Reference:** https://update.angular.io/?v=17.0-18.0

### Node.js Requirement
- Minimum: Node.js 18.19
- Recommended: Node.js 20.x or 22.x

### Key Changes in Angular 18
- TypeScript 5.4 support
- Zoneless change detection (developer preview)
- Material 3 design system
- Improved hydration
- Route redirects with functions
- Forms events
- Fallback content for `ng-content`

### Migration Steps

#### Step 1: Upgrade Node.js

```bash
nvm install 20
nvm use 20
```

#### Step 2: Update Angular CLI and Core

```bash
ng update @angular/core@18 @angular/cli@18
```

#### Step 3: Update TypeScript

```bash
npm install typescript@~5.4.0
```

#### Step 4: Update Zone.js

```bash
npm install zone.js@~0.14.0
```

#### Step 5: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~18.0.0",
    "@angular/common": "~18.0.0",
    "@angular/compiler": "~18.0.0",
    "@angular/core": "~18.0.0",
    "@angular/forms": "~18.0.0",
    "@angular/platform-browser": "~18.0.0",
    "@angular/platform-browser-dynamic": "~18.0.0",
    "@angular/router": "~18.0.0",
    "@angular/service-worker": "~18.0.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~18.0.0",
    "@angular/cli": "~18.0.0",
    "@angular/compiler-cli": "~18.0.0",
    "@angular/language-service": "~18.0.0",
    "typescript": "~5.4.0"
  }
}
```

#### Step 6: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] All tests pass
- [ ] Application runs correctly
- [ ] Hydration works correctly (if using SSR)

## Phase 10: Angular 18 to 19

**Reference:** https://update.angular.io/?v=18.0-19.0

### Node.js Requirement
- Minimum: Node.js 18.19 or 20.11 or 22.0
- Recommended: Node.js 22.x

### Key Changes in Angular 19
- TypeScript 5.5+ support
- Standalone components by default
- Incremental hydration
- Improved signals
- Resource API for async data
- LinkedSignal for derived state
- Route-level render mode
- Hot Module Replacement for styles

### Migration Steps

#### Step 1: Upgrade Node.js

```bash
nvm install 22
nvm use 22
```

#### Step 2: Update Angular CLI and Core

```bash
ng update @angular/core@19 @angular/cli@19
```

#### Step 3: Update TypeScript

```bash
npm install typescript@~5.5.0
```

#### Step 4: Update Zone.js

```bash
npm install zone.js@~0.15.0
```

#### Step 5: Consider Standalone Migration

Angular 19 makes standalone the default. Consider migrating the entire application:

```bash
ng generate @angular/core:standalone
```

This will:
- Convert all components, directives, and pipes to standalone
- Remove unnecessary NgModules
- Update imports throughout the application

#### Step 6: Update package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "~19.0.0",
    "@angular/common": "~19.0.0",
    "@angular/compiler": "~19.0.0",
    "@angular/core": "~19.0.0",
    "@angular/forms": "~19.0.0",
    "@angular/platform-browser": "~19.0.0",
    "@angular/platform-browser-dynamic": "~19.0.0",
    "@angular/router": "~19.0.0",
    "@angular/service-worker": "~19.0.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~19.0.0",
    "@angular/cli": "~19.0.0",
    "@angular/compiler-cli": "~19.0.0",
    "@angular/language-service": "~19.0.0",
    "typescript": "~5.5.0"
  }
}
```

#### Step 7: Verify and Test

```bash
npm install
npm run build
npm run lint
npm run test
npm start
```

### Verification Checklist
- [ ] Application builds without errors
- [ ] All tests pass
- [ ] Application runs correctly
- [ ] Standalone components work properly
- [ ] Service worker functions correctly

## Post-Migration Tasks

After completing all migration phases, perform these final tasks:

### 1. Code Cleanup

Remove any deprecated code patterns:
- Remove unused imports
- Update deprecated API usage
- Clean up any migration-related comments

### 2. Performance Optimization

Take advantage of new Angular 19 features:
- Implement signals for reactive state management
- Use the new control flow syntax throughout
- Consider zoneless change detection for performance-critical components
- Implement lazy loading for routes if not already done

### 3. Update Dependencies

Review and update remaining dependencies:

```bash
npm outdated
npm update
```

### 4. Security Audit

Run a security audit:

```bash
npm audit
npm audit fix
```

### 5. Update Documentation

Update any documentation to reflect:
- New Angular version
- Changed build commands
- Updated development setup instructions

### 6. Final package.json

The final `package.json` should look similar to:

```json
{
  "name": "angular-hnpwa",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "~19.0.0",
    "@angular/common": "~19.0.0",
    "@angular/compiler": "~19.0.0",
    "@angular/core": "~19.0.0",
    "@angular/forms": "~19.0.0",
    "@angular/platform-browser": "~19.0.0",
    "@angular/platform-browser-dynamic": "~19.0.0",
    "@angular/router": "~19.0.0",
    "@angular/service-worker": "~19.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~19.0.0",
    "@angular/cli": "~19.0.0",
    "@angular/compiler-cli": "~19.0.0",
    "@angular/language-service": "~19.0.0",
    "@angular-eslint/builder": "~18.0.0",
    "@angular-eslint/eslint-plugin": "~18.0.0",
    "@angular-eslint/eslint-plugin-template": "~18.0.0",
    "@angular-eslint/schematics": "~18.0.0",
    "@angular-eslint/template-parser": "~18.0.0",
    "@typescript-eslint/eslint-plugin": "~7.0.0",
    "@typescript-eslint/parser": "~7.0.0",
    "eslint": "~8.57.0",
    "@types/jasmine": "~5.1.0",
    "@types/node": "^20.0.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.5.0"
  }
}
```

## Testing Strategy

### Unit Testing

After each migration phase:

1. Run all existing unit tests:
   ```bash
   npm run test
   ```

2. Fix any failing tests due to API changes

3. Update test configurations if needed (Karma, Jasmine versions)

### Integration Testing

1. Test all user flows manually:
   - Browse different feed types
   - View item details and comments
   - View user profiles
   - Change settings and themes
   - Test offline functionality

2. Test on multiple browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge

### Performance Testing

1. Run Lighthouse audits before and after migration
2. Compare bundle sizes
3. Measure Time to First Contentful Paint (FCP)
4. Measure Time to Interactive (TTI)

### PWA Testing

1. Verify service worker registration
2. Test offline functionality
3. Test app installation on mobile devices
4. Verify manifest.json is served correctly

## Rollback Strategy

If issues are encountered during migration:

### Immediate Rollback

1. Discard changes and return to the previous version:
   ```bash
   git checkout .
   git clean -fd
   ```

2. Restore node_modules:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Version-Specific Rollback

1. Create a branch for each successful migration phase
2. If a phase fails, return to the previous successful branch:
   ```bash
   git checkout angular-v{previous-version}
   ```

### Backup Strategy

Before each migration phase:

1. Create a tagged commit:
   ```bash
   git tag -a v{version}-pre-migration -m "Before Angular {version} migration"
   ```

2. Push tags to remote:
   ```bash
   git push origin --tags
   ```

## Resources

### Official Documentation
- Angular Update Guide: https://update.angular.io
- Angular Documentation: https://angular.dev
- Angular Blog: https://blog.angular.dev

### Migration Tools
- Angular CLI: `ng update`
- Angular ESLint: https://github.com/angular-eslint/angular-eslint
- RxJS Migration: https://rxjs.dev/guide/v6/migration

### Community Resources
- Angular GitHub: https://github.com/angular/angular
- Stack Overflow Angular Tag: https://stackoverflow.com/questions/tagged/angular

## Conclusion

This migration plan provides a structured approach to upgrading the Angular2-HN application from Angular 9 to Angular 19. By following each phase sequentially and thoroughly testing after each upgrade, the migration can be completed safely while minimizing risk to the application.

Key success factors:
1. Complete each phase fully before moving to the next
2. Test thoroughly after each migration step
3. Keep backups and use version control effectively
4. Reference the official Angular Update Guide for version-specific details
5. Address deprecation warnings promptly

The estimated total effort is 45-65 hours, but this may vary based on the complexity of issues encountered and the depth of modernization desired (e.g., adopting standalone components, signals, new control flow syntax).
