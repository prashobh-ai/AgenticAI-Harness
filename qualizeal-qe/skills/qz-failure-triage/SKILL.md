---
name: qz-failure-triage
description: Decision tree and evidence standards for triaging test failures into product defects, test defects, environment or data issues, flaky tests, and requirement gaps, plus severity/priority rules. Use whenever a test fails, CI is red, or someone labels a failure as flaky.
metadata:
  origin: Qualizeal
---

# Failure Triage

## When to Activate

- A test run has failures
- A failure is being dismissed as "flaky" or "environment"
- Deciding which failures block a release

## Decision tree

1. **Does it reproduce in isolation on a clean state?**
   - No -> re-run once. Passes now? Collect timing/ordering evidence -> `FLAKY`
     (still needs a fix owner). Fails differently? -> `ENVIRONMENT` or
     `TEST_DATA` with evidence.
2. **Is the test's expected result derived from the requirement?**
   - No, or it asserts implementation details -> `TEST_DEFECT`.
3. **Is the requirement itself clear on this behaviour?**
   - No -> `REQUIREMENT_GAP`, link the `Q-ID`.
4. Otherwise -> `PRODUCT_DEFECT`. Localise root cause to `file:line`.

## Severity (impact) vs priority (urgency)

| Severity | Meaning |
| --- | --- |
| Critical | Data loss or corruption, money created/destroyed, security breach, no workaround |
| High | Core rule violated (limits, authorisation), incorrect financial outcome, or blocks a main journey |
| Medium | Incorrect behaviour with a workaround, or validation gap without direct loss |
| Low | Cosmetic, messaging, or minor usability |

Priority is set with the product owner; propose it from severity x exposure.

## Evidence standard

A defect report is complete when a developer can reproduce it in under five
minutes from the report alone: exact request or test command, environment,
expected vs actual, and the requirement it violates.
