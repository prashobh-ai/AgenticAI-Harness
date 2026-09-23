#!/usr/bin/env bash
# Run the ECC engine suite from a standalone copy of engine/.
#
# Upstream tests assume the engine is the git repository root (e.g. project
# names derived from the toplevel directory) and some write to tracked files
# such as yarn.lock. Running from a throwaway copy matches upstream CI and
# keeps engine/ pristine.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/qz-engine-XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

tar -C "$ROOT/engine" --exclude=node_modules -cf - . | tar -C "$WORK" -xf -
cd "$WORK"
git init -q
git add -A
git -c user.name=qz-ci -c user.email=qz-ci@localhost commit -q -m "engine snapshot"

npm ci --ignore-scripts --no-audit --no-fund
npm test
