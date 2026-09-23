---
description: Triage failing tests into product/test/environment/data/flaky/requirement-gap, root-cause product defects to file and line, and write reproducible defect reports.
argument-hint: [test command, CI log path, or failing test names]
---

# /qz-triage

Use the `qz-defect-triager` agent on: `$ARGUMENTS` (default: failures listed in
`qa/05-execution/run-report.md`).

Write `qa/05-execution/defects/DEF-*.md` and update the triage table in the
run report.
