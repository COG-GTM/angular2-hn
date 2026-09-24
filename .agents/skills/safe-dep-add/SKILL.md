---
name: safe-dep-add
description: Add or upgrade an npm dependency so it passes the Snyk PR check on the first push - pick the latest stable release that is at least 7 days old, check peer deps, install, and audit. Use whenever package.json changes.
---

# Add an npm dependency safely

Run from `~/repos/angular2-hn`.

## 1. Pick the version

```bash
PKG=<name>
npm view "$PKG" dist-tags.latest
npm view "$PKG" time --json | python3 -c '
import json,sys,datetime
d=json.load(sys.stdin); cutoff=datetime.datetime.utcnow()-datetime.timedelta(days=7)
ok=[(v,t) for v,t in d.items() if v not in("created","modified") and "-" not in v and datetime.datetime.fromisoformat(t.rstrip("Z"))<cutoff]
print(sorted(ok,key=lambda x:x[1])[-1])'
```

Use the newest stable (non-prerelease) version published >= 7 days ago. Never use a version from memory, `latest`, `*`, or an unbounded range.

## 2. Check peer dependencies against what is installed

```bash
npm view "$PKG@<version>" peerDependencies
node -e "console.log(require('./node_modules/react/package.json').version, require('./node_modules/vite/package.json').version)"
```

If a peer range conflicts with a major version the task pinned (React, React Router, Vite), stop and tell the user; do not upgrade the pinned package.

## 3. Install and audit

```bash
npm install --save-exact "$PKG@<version>"          # or --save-dev
npm audit --omit=dev 2>&1 | tail -15
```

Resolve `high`/`critical` findings in the package you just added (usually by choosing a newer version). Pre-existing findings from the legacy Angular toolchain on `master` are out of scope unless the task says otherwise.

## 4. Commit

Commit `package.json` and `package-lock.json` together. Do not delete or regenerate the lockfile wholesale, and do not add `yarn.lock`.
