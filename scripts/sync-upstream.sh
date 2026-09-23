#!/usr/bin/env bash
# Pull the latest ECC upstream into engine/ as a squashed git subtree.
# Usage: scripts/sync-upstream.sh [ref]   (default: latest vX.Y.Z release tag)
#
# Release tags are preferred over main: upstream main can carry tests that
# are red until the next release.
set -euo pipefail

UPSTREAM_URL="https://github.com/affaan-m/ECC.git"
REF="${1:-$(git ls-remote --tags --refs "$UPSTREAM_URL" 'v*' \
  | awk -F/ '{print $3}' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)}"
if [ -z "$REF" ]; then
  echo "Could not resolve the latest upstream release tag; pass a ref explicitly." >&2
  exit 1
fi
echo "Syncing engine/ to ECC upstream $REF"

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean; commit or stash first." >&2
  exit 1
fi

git remote get-url ecc-upstream >/dev/null 2>&1 || git remote add ecc-upstream "$UPSTREAM_URL"
git fetch ecc-upstream "$REF"
git subtree pull --prefix engine ecc-upstream "$REF" --squash \
  -m "Sync engine/ with ECC upstream ($REF)"

# Keep the marketplace entry's engine version in step with engine/VERSION.
node -e '
const fs = require("fs");
const file = ".claude-plugin/marketplace.json";
const version = fs.readFileSync("engine/VERSION", "utf8").trim();
const marketplace = JSON.parse(fs.readFileSync(file, "utf8"));
const engine = marketplace.plugins.find(p => p.name === "ecc");
if (engine.version !== version) {
  engine.version = version;
  fs.writeFileSync(file, JSON.stringify(marketplace, null, 2) + "\n");
  console.log("marketplace.json: ecc version -> " + version);
}
'

node scripts/qz.js validate

cat <<'NEXT'

Engine synced. Before pushing:
  1. npm run test:engine        (upstream suite)
  2. npm test                   (Qualizeal pack + demo)
  3. Skim engine/CHANGELOG.md for renamed or removed agents/skills the QE pack references.
  4. Commit the marketplace.json version bump if one was made.
NEXT
