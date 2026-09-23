---
name: qz-traceability-matrix
description: Build and maintain a requirements traceability matrix (RTM) linking requirements to risks, test cases, automated tests, results, and defects, with coverage-gap reporting. Use during test design, after test runs, and when preparing release readiness or audit evidence.
metadata:
  origin: Qualizeal
---

# Requirements Traceability Matrix

## When to Activate

- After test design (create), after each run (update), before release (report)
- Audit or compliance evidence is requested
- Someone asks "is requirement X tested?"

## Format

`qa/03-design/rtm.md`:

| Req ID | Risk | Test cases | Automated test (file::name) | Last result | Defects | Coverage status |
| --- | --- | --- | --- | --- | --- | --- |

Coverage status values: `COVERED-PASS`, `COVERED-FAIL`, `DESIGNED-NOT-AUTOMATED`,
`NOT-COVERED`, `BLOCKED (Q-ID)`.

## Rules

1. Forward coverage: every in-scope requirement has at least one case.
2. Backward coverage: every case maps to a requirement or a named risk —
   orphan cases are removed or justified.
3. Automated tests carry the `TC-ID` in their name so the matrix can be
   rebuilt by searching the test code.
4. Summarise at the top: totals per status, weighted by risk.
