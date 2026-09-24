---
description: Apply whenever a PR adds or upgrades an npm dependency in this repo, or when the `security/snyk` PR check fails.
---

# Snyk PR check

Every PR in this repo runs the `security/snyk (Cognition-default)` status check.

- It fails only on vulnerabilities **introduced by the PR**. `master` already carries ~190 known findings from the legacy Angular 9 toolchain; those do not fail the check and are not yours to fix unless the task says so.
- When adding a dependency, pick the latest stable release (`npm view <pkg> version`, prefer versions published >= 7 days ago) instead of a version from memory. Model-memory pins are usually 1–2 years stale and are exactly what Snyk flags.
- Before the first push of a PR that touches `package.json`, run `npm audit --omit=dev` and resolve anything `high`/`critical` in packages you added.
- If Snyk fails after push, fix only the packages the Snyk report names. Do not bulk-upgrade unrelated dependencies, wipe lockfiles, or change major versions the task pinned (e.g. a requested React Router major) to make the check go green — if a requested version is the thing Snyk flags, tell the user and let them decide.
- `package-lock.json` is the only lockfile; do not add `yarn.lock` back.
