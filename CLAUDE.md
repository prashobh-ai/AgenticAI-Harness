# CLAUDE.md

Guidance for agents working **on** this repository (not for clients using it).

## Layout

- `qualizeal-qe/` - the Qualizeal QE Claude Code plugin. All Qualizeal agents,
  skills, and commands live here and use the `qz-` prefix.
- `engine/` - ECC upstream as a git subtree. **Never edit files in `engine/`.**
  Update only with `npm run sync:upstream` (see `docs/UPSTREAM-SYNC.md`).
- `demo/` - demo target app and data. The app's defects are intentional; do
  not fix them (see `demo/FACILITATOR-NOTES.md`).
- `scripts/qz.js` - zero-dependency validator and installer.

## Commands

```bash
npm test               # pack validation + tests/ + demo app tests
npm run test:engine    # upstream engine suite (slow; runs from a temp copy
                       # because upstream tests assume engine/ is a repo root)
node scripts/qz.js validate
```

## Conventions for the QE pack

- Agents: `qualizeal-qe/agents/qz-*.md` with `name`, `description`, `tools`,
  `model` frontmatter; name matches filename. Sections: Inputs, Process,
  Output (exact `qa/` path), Guardrails, Handoff.
- Skills: `qualizeal-qe/skills/qz-*/SKILL.md` with inline `description` and a
  `## When to Activate` section; supporting files next to `SKILL.md`.
- Commands: `qualizeal-qe/commands/qz-*.md` with `description` and
  `argument-hint`; delegate to one agent and name its output file.
- Any backticked `qz-*` reference must resolve to a real agent, skill, or
  command (the validator checks this).
- Client-facing tone: concise, evidence-oriented, no hype, no client names.
- Bump `qualizeal-qe/.claude-plugin/plugin.json` and the matching
  `marketplace.json` entry together.
