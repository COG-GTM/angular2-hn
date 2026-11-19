#!/usr/bin/env bash
# Production build of the Angular 9 app (branch master) served on port 4000.
# Uses a git worktree of origin/master unless LEGACY_DIR points at an existing checkout.
set -euo pipefail
PARITY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PARITY_DIR/.." && pwd)"
LEGACY_DIR="${LEGACY_DIR:-$REPO_DIR/.parity-legacy}"
PORT="${LEGACY_PORT:-4000}"

if [ ! -d "$LEGACY_DIR" ]; then
    git -C "$REPO_DIR" fetch origin master
    git -C "$REPO_DIR" worktree add --detach "$LEGACY_DIR" origin/master
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm install 14 >/dev/null
    nvm use 14 >/dev/null
fi

cd "$LEGACY_DIR"
[ -d node_modules ] || npm install --no-audit --no-fund
[ -f dist/angular-hnpwa/ngsw-worker.js ] && [ -z "${REBUILD:-}" ] || npx ng build --prod
exec node "$PARITY_DIR/scripts/static-server.js" dist/angular-hnpwa "$PORT"
