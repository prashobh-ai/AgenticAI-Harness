---
description: Evaluate release readiness against exit criteria, coverage, open defects, and AI-eval results, and issue an evidence-backed GO / CONDITIONAL GO / NO-GO.
argument-hint: [release name] [--rerun]
---

# /qz-release-gate

Use the `qz-release-gatekeeper` agent for: `$ARGUMENTS`

With `--rerun`, execute the automated suite first. Write
`qa/06-release/readiness.md` and print the three-line executive summary.
