---
description: Implement designed test cases as automated tests in the project's framework, run them, and record results - without weakening assertions or touching product code.
argument-hint: [TC-IDs or priority, e.g. "P1" or "TC-001..TC-010"]
---

# /qz-automate

Use the `qz-automation-engineer` agent for: `$ARGUMENTS` (default: all cases
marked for automation, highest priority first).

Write tests next to the project's existing tests, run the suite, and write
`qa/05-execution/run-report.md`. Failing tests that expose product defects
stay failing and are handed to `/qz-triage`.
