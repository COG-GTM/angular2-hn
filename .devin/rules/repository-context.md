# Work in the intended repository and toolchain

- Work in `COG-GTM/angular2-hn`, targeting its `master` branch unless the request says otherwise. A similarly named fork is also available; confirm the remote before making changes.
- Read the checked-out `package.json`, tracked lockfile, and test configuration before choosing Angular, Node, or CI commands. On the current `master`, this is Angular 9 with the Angular CLI/Karma, TSLint, and `yarn.lock`; `package-lock.json` is not tracked. Do not infer that an open upgrade or coverage PR has merged.
- If changing dependency installation in CI, use the lockfile actually committed on the target branch. `npm ci` and `setup-node` with `cache: npm` need a committed npm lockfile; an untracked local `package-lock.json` does not count.
