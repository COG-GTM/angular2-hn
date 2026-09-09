---
name: dependency-upgrade
description: >
  Upgrade one or more npm/yarn packages WITHOUT missing the downstream packages
  in package.json that depend on (or peer-depend on) the thing being upgraded.
  Use whenever asked to bump, upgrade, update, or remediate a vulnerability in
  a dependency, or when a previous upgrade PR failed install/build with
  ERESOLVE / peer-dependency / "requires a peer of" errors.
---

# Dependency upgrade (no dependents left behind)

The recurring failure mode: a package is bumped in isolation, `npm install`
appears to work, then CI/build fails because a *manifest* dependent (something
already listed in `package.json`) declares a peer/direct range that excludes the
new version. Each miss costs a full PR iteration. This skill front-loads the
dependent analysis so every affected manifest entry moves in ONE change.

## Rules

1. Never bump a single line of `package.json` by hand and stop there.
   Every upgrade goes through the **Blast radius** step below first.
2. Upgrade the whole *cohort*, not one package: everything in the manifest that
   `peerDependencies`/`dependencies` on the target, plus everything the target
   peer-depends on, plus siblings released in lockstep (see Cohorts).
3. Use the framework's own migration tool when one exists (`ng update`,
   `npx @next/codemod`, etc.) — it computes the cohort for you.
4. Use the package manager that owns the *tracked* lockfile
   (`git ls-files | grep -iE 'lock'`): `yarn.lock` → yarn, `package-lock.json`
   → npm, `pnpm-lock.yaml` → pnpm. Never add a second lockfile. On `master` of
   this repo only `yarn.lock` is tracked (a local `package-lock.json` is
   untracked noise — do not commit it); React-migration branches track
   `package-lock.json`. Commands below use `<pm>`; substitute:

   | step | npm | yarn (v1) | pnpm |
   |---|---|---|---|
   | add/bump | `npm install a@x b@y` | `yarn add a@x b@y` (`-D` for devDeps) | `pnpm add a@x b@y` |
   | explain | `npm explain <p>` | `yarn why <p>` | `pnpm why <p>` |
   | validate tree | `npm ls --all` | `yarn check --integrity` | `pnpm ls --depth Infinity` |
   | clean install from lockfile | `npm ci` | `yarn install --frozen-lockfile` | `pnpm install --frozen-lockfile` |
   | transitive pin | `overrides` | `resolutions` | `pnpm.overrides` |
5. Finish with a frozen-lockfile clean install, lint, build, test. Do not open
   a PR until all four pass.

## Procedure

### 0. Snapshot the manifest
```bash
git checkout -b devin/$(date +%s)-upgrade-<pkg>
node -v && npm -v                      # must satisfy package.json "engines" if set
cat package.json | jq '{dependencies, devDependencies, peerDependencies, overrides, resolutions, engines}'
```

### 1. Blast radius — who in the manifest cares about `<pkg>`?
Run the helper; it inspects the *installed* metadata of every manifest entry and
prints those whose `peerDependencies`/`dependencies`/`optionalDependencies`
mention the target(s):
```bash
node .agents/skills/dependency-upgrade/scripts/find-dependents.mjs <pkg> [<pkg2> ...]
```
Cross-check with the lockfile view (who *actually* pulls it in):
```bash
<pm> why <pkg>            # yarn why / pnpm why; npm: npm explain <pkg>
```
Also list what the target itself peer-requires at the *new* version:
```bash
npm view <pkg>@<new> peerDependencies dependencies engines
```
Every manifest entry surfaced by these three commands is in the **cohort**.

### 2. Resolve the cohort's versions
For each cohort member, find the version compatible with `<pkg>@<new>`:
```bash
npm view <member> versions --json | tail -20
npm view <member>@<candidate> peerDependencies
```
Well-known lockstep cohorts (bump all together, same major):
- **Angular**: `@angular/*` (incl. `compiler-cli`, `language-service`,
  `service-worker`), `@angular-devkit/build-angular`, `@angular/cli`,
  `typescript` (check the supported range for that Angular major), `zone.js`,
  `rxjs`, `tslib`. Prefer `NG_DISABLE_VERSION_CHECK=1 npx ng update @angular/core@<N> @angular/cli@<N>`.
- **React**: `react`, `react-dom`, `@types/react`, `@types/react-dom`,
  `react-test-renderer`, `@testing-library/react`, `react-router` +
  `react-router-dom` (same version).
- **Vite**: `vite`, `vitest`, `@vitejs/plugin-react`, `vite-plugin-pwa`,
  `@vitest/coverage-*`, `@vitest/ui` (vitest packages share a version).
- **Karma/Jasmine**: `karma`, `karma-jasmine`, `karma-jasmine-html-reporter`,
  `jasmine-core`, `@types/jasmine`.
- **TypeScript**: `typescript` + `ts-node`, `tslint`/`eslint` plugins,
  `@typescript-eslint/*` (parser + plugin same version).
- **Testing Library / Jest**: `jest`, `ts-jest`, `babel-jest`, `@types/jest`,
  `jest-environment-*`.

### 3. Apply the cohort in one install
```bash
<pm> add <pkg>@<new> <member1>@<v1> <member2>@<v2> ...   # npm: npm install ...
```
(`npm view` works for registry metadata regardless of which manager owns the lockfile.)
Do NOT use `--legacy-peer-deps` or `--force` to make it "work" — those hide the
exact problem this skill exists to prevent. An ERESOLVE at this step means the
cohort is incomplete: read the error (it names the dependent), add it, repeat.

If a transitive (non-manifest) package is the blocker and has no compatible
release, add a targeted `overrides` (npm) / `resolutions` (yarn) / `pnpm.overrides` entry and
leave a one-line PR note explaining why.

### 4. Verify — nothing missed
```bash
node .agents/skills/dependency-upgrade/scripts/find-dependents.mjs <pkg> --check   # exits 1 on unsatisfied ranges
<pm validate tree>          # npm ls --all / yarn check --integrity; non-zero = invalid/missing/peer problems
rm -rf node_modules && <pm clean install>   # npm ci / yarn install --frozen-lockfile; proves the lockfile is self-consistent
<pm> run lint && <pm> run build && CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) <pm> test -- --watch=false   # yarn: drop the extra `--`
```
Also grep the source for API changes called out in the target's changelog
(`npm view <pkg>@<new> homepage`, then CHANGELOG / migration guide).

### 5. PR
Summary must list the full cohort as a table: package, old → new, and *why it
is in the cohort* (target / peer of target / lockstep sibling / override).
Include the exact `find-dependents` output in a collapsed block so reviewers can
see nothing was skipped.

## Quick checklist
- [ ] `find-dependents` run for every target; cohort written down before editing
- [ ] `npm view <pkg>@<new> peerDependencies` reviewed
- [ ] Package manager chosen from the tracked lockfile; no second lockfile created
- [ ] All cohort members bumped in ONE add/install, no `--force`/`--legacy-peer-deps`
- [ ] `find-dependents --check` and tree validation clean
- [ ] Frozen-lockfile clean install + lint + build + test green
- [ ] Only the repo's tracked lockfile changed
- [ ] PR lists cohort table + rationale
