---
name: qz-test-automation-standards
description: Qualizeal test automation standards for API, UI (Playwright), and unit/component tests - structure, naming, hermetic data, waits, assertions, flake prevention, and CI reporting. Use when writing or reviewing automated tests in any project so they stay reliable and maintainable.
metadata:
  origin: Qualizeal
---

# Test Automation Standards

## When to Activate

- Writing new automated tests
- Reviewing test code in a pull request
- A suite has become slow, flaky, or hard to read

## Principles

1. **Fit in.** Use the project's runner, helpers, and style. New frameworks
   need a written justification.
2. **Right level.** Assert business rules at the API or unit level; reserve UI
   tests for journeys that only exist in the UI.
3. **One behaviour per test**, named with the TC-ID and the behaviour.
4. **Hermetic.** Each test creates or resets its own state; no dependence on
   execution order or shared mutable data.
5. **Deterministic.** Inject clocks and random seeds; never `sleep` — wait for
   a condition with a timeout.
6. **Assert outcomes, not implementation.** Status + error code + state change
   (e.g. both balances), not internal calls.

## API tests

- Assert status, response schema, error `code`, and side effects via a
  follow-up read.
- Cover contract edges: missing fields, wrong types, extra fields, oversize
  bodies, unsupported methods.
- For idempotent endpoints, replay the exact request and assert identical
  response identity and a single side effect.

## UI tests (Playwright)

- Locators: `getByRole` / `getByLabel` / `getByTestId`; avoid CSS/XPath chains.
- Use web-first assertions (`await expect(locator).toHaveText(...)`).
- Isolate with fresh browser contexts and API-seeded data; log in via stored
  auth state, not the UI, except in the login test itself.
- Capture trace, screenshot, and video on failure only.

## Flake prevention

Flake sources in order of frequency: shared state, time, async waits,
test-order coupling, environment capacity. Fix the cause; quarantine only with
an owner and an expiry date — never delete a failing test to get green.

## CI reporting

Emit JUnit XML (or the runner's equivalent) and keep failure artifacts. The
run report lists command, environment, totals, and failing TC-IDs.
