---
description: Apply when porting, rewriting or refactoring any UI component in this repo, especially Angular -> React migration work.
---

# Migration contract

This repo is being migrated in place from Angular to React (Vite + TypeScript, React Router, Vitest + React Testing Library, Playwright). Keep every phase reviewable and feature-equivalent.

- Before writing a component, read the Angular source next to it: `src/app/<feature>/<name>.component.ts`, `.html` and `.scss`. Reproduce the markup structure and **class names verbatim** — the ported SCSS, unit tests and Playwright specs select on them.
- Ported files live in `src/components/<Name>.tsx` (+ `<Name>.scss`, `<Name>.test.tsx`), `src/pages/<Name>Page.tsx`, `src/context/`, `src/api/`, `src/models/`, `src/utils/`. One SCSS file per component, imported from the component.
- Settings state goes through `SettingsProvider` / `useSettings()` in `src/context/` — never a third-party state library and never a module-level singleton.
- Delete the Angular source for a feature (`git rm -r src/app/<feature>`) in the **same PR** that ports it, so the repo never carries two implementations of one feature.
- Each phase is its own branch cut from the previous phase's branch, one PR per phase, with a PR description that lists the Angular files replaced.
- Keep `npm run test:coverage` at or above the 80% thresholds in every PR; add the ported component's test in the same PR.
- Respect the pinned stack in the task prompt. Do not change major versions (React, React Router, Vite) to satisfy tooling; surface the conflict to the user instead.
