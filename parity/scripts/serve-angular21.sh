#!/usr/bin/env bash
# Production build of the Angular 21 app (this checkout) served on port 4200.
set -euo pipefail
PARITY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PARITY_DIR/.." && pwd)"
PORT="${ANGULAR21_PORT:-4200}"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm install 24 >/dev/null
    nvm use 24 >/dev/null
fi

cd "$REPO_DIR"
[ -d node_modules ] || npm ci --no-audit --no-fund
npx ng build
exec node "$PARITY_DIR/scripts/static-server.js" dist/angular-hnpwa/browser "$PORT"
