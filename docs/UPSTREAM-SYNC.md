# Upstream Sync

`engine/` is [ECC](https://github.com/affaan-m/ECC) vendored as a **squashed
git subtree**. It is never edited in place, so updating is a clean merge.

## Update the engine

```bash
npm run sync:upstream                  # latest vX.Y.Z release tag (default)
bash scripts/sync-upstream.sh v2.3.0   # or a specific tag/branch/commit
```

Currently pinned: **v2.2.1**. Prefer release tags over upstream `main`: at
the time of the initial import, `main` (unreleased 2.2.2) had 25 failing
upstream tests that v2.2.1 does not.

The script:

1. refuses to run on a dirty tree,
2. resolves the latest release tag (unless a ref is given), adds the
   `ecc-upstream` remote if needed, and fetches the ref,
3. runs `git subtree pull --prefix engine ... --squash`,
4. bumps the `ecc` version in `.claude-plugin/marketplace.json` to `engine/VERSION`,
5. runs `scripts/qz.js validate` (which also catches QE-pack names that now
   collide with new engine names).

Then run `npm run test:engine` and `npm test`, skim `engine/CHANGELOG.md` for
renamed agents or skills that `qualizeal-qe/` references (for example
`code-reviewer`, `e2e-runner`, `security-reviewer`, `verification-loop`), and
open a pull request.

## Find the pinned upstream commit

```bash
git log --grep "git-subtree-dir: engine" --format='%h %s%n%b' | grep -E "git-subtree-split|Squashed"
```

## If the engine needs a change

1. Prefer contributing upstream.
2. Otherwise override from `qualizeal-qe/` (a `qz-` agent or skill).
3. Last resort: patch `engine/` in a dedicated commit titled `engine-patch: ...`
   and list it below so the next sync resolves conflicts deliberately.

## Local engine patches

None.
