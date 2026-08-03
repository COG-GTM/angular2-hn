<!--
Sync Impact Report
- Version change: none → 1.0.0 (initial ratification; template placeholders replaced)
- Modified principles: none (all five principles newly defined)
  - [PRINCIPLE_1_NAME] → I. Mandated Stack Fidelity
  - [PRINCIPLE_2_NAME] → II. Existing Structure Conformance
  - [PRINCIPLE_3_NAME] → III. Client-Side Persistence Only
  - [PRINCIPLE_4_NAME] → IV. English (en-US) Everywhere
  - [PRINCIPLE_5_NAME] → V. Unit Tests Ship With Every Feature (NON-NEGOTIABLE)
- Added sections: Technology & Platform Constraints; Development Workflow & Quality Gates
- Removed sections: none
- Follow-up TODOs: none
-->

# angular2-hn Constitution

## Core Principles

### I. Mandated Stack Fidelity

All work MUST be written in Angular 9, TypeScript, SCSS, and RxJS. New UI styling MUST be SCSS
(no plain CSS files, no CSS-in-JS); asynchronous and event-driven logic MUST use RxJS
Observables rather than bare Promises or callbacks. Introducing an alternative framework,
state-management library, or styling system is a constitution violation and MUST be rejected in
review. Upgrading the Angular major version is an amendment, not a feature.

Rationale: the app is an existing, shipped PWA. A single stack keeps the bundle small, keeps the
service-worker/App Shell build reproducible, and avoids the maintenance cost of parallel idioms.

### II. Existing Structure Conformance

New code MUST be placed in the established structure — `src/app/core` (chrome such as header,
footer, settings), `src/app/feeds` (story feeds and list items), `src/app/shared` (services,
models, pipes, reusable components) — and MUST follow the existing feature-module pattern
(`user`, `item-details` as lazy-loaded modules registered in `app.routes.ts`). Reusable logic
MUST live in `shared`; a new top-level directory requires justification in the plan and an
amendment if it changes the layering.

Rationale: the routing and lazy-loading layout is what keeps the initial bundle small; ad-hoc
placement erodes both discoverability and load performance.

### III. Client-Side Persistence Only

Persisted state MUST be written to `localStorage` through an injectable Angular service that
mirrors `SettingsService` (`src/app/shared/services/settings.service.ts`): the service owns a
typed state object, reads existing values from `localStorage` on construction with a defined
default, and writes on every mutation. Components MUST NOT call `localStorage` directly. No
backend, database, or server-side session may be introduced; the Hacker News REST API remains
the only remote data source.

Rationale: the app is a static, Firebase-hosted PWA with no server of its own. Centralizing
storage in a service keeps persistence testable and keeps offline behavior predictable.

### IV. English (en-US) Everywhere

All code identifiers, comments, documentation, log output, commit messages, and user-facing UI
text MUST be written in English using en-US spelling. Localized or translated strings MUST NOT
be introduced without an amendment adding an i18n strategy.

Rationale: a single language keeps review, search, and onboarding unambiguous, and the project
has no translation pipeline to keep alternatives in sync.

### V. Unit Tests Ship With Every Feature (NON-NEGOTIABLE)

Every new feature MUST ship with unit tests in the same pull request, written as
`*.spec.ts` files alongside the code they cover and runnable via the existing Karma + Jasmine
setup. Every new or modified service MUST have unit tests for its public methods, including the
`localStorage` read/write behavior required by Principle III. A feature is not complete until
its tests exist and pass; "tests to follow" is not an acceptable review outcome.

Rationale: the repository currently has no `*.spec.ts` files at all, so every untested addition
compounds the existing gap. Requiring tests per feature is how the suite gets built back up.

## Technology & Platform Constraints

- Runtime dependencies are pinned by `package.json`: Angular `~9.0.1`, TypeScript `~3.7.5`,
  RxJS `~6.5.4`. Changing any of these majors requires an amendment.
- Builds, the dev server, and the test runner require `NODE_OPTIONS=--openssl-legacy-provider`
  on modern Node; this MUST NOT be worked around by upgrading build tooling ad hoc.
- The PWA contract is binding: the App Shell, service-worker precaching, and offline behavior
  MUST keep working. Changes that grow the initial bundle or break offline load MUST be
  justified in the plan.
- Dependencies are added sparingly. A new runtime dependency MUST state, in the plan, why the
  existing stack cannot satisfy the need.

## Development Workflow & Quality Gates

- Feature work follows the Spec Kit flow: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`, with artifacts committed under `specs/`.
- Every pull request MUST pass, and reviewers MUST verify: the production build
  (`npm run build`), the unit test suite, and `npm run lint`. Lint currently reports
  pre-existing violations; a PR MUST NOT add new ones.
- Reviews MUST explicitly check compliance with Principles I–V. A PR that adds a feature
  without unit tests, or that persists state outside a service, MUST be rejected.
- Lockfile churn (`package-lock.json`, `yarn.lock`) MUST NOT be committed incidentally.

## Governance

This constitution supersedes ad-hoc convention and prior practice. Where existing code conflicts
with it, the constitution governs new and modified code; wholesale rewrites of conforming legacy
code are out of scope unless separately specified.

Amendments MUST be made by editing `.specify/memory/constitution.md` in a pull request that
states the rationale, the version bump, and any migration expected of in-flight work. Versioning
is semantic: MAJOR for removing or redefining a principle in a backward-incompatible way, MINOR
for adding a principle or materially expanding guidance, PATCH for clarifications and wording.

Compliance is reviewed per pull request. Any deviation MUST be recorded in the PR description
with its justification and either resolved before merge or converted into an amendment.

**Version**: 1.0.0 | **Ratified**: 2026-08-03 | **Last Amended**: 2026-08-03
