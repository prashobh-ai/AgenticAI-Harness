---
name: qz-requirements-testability
description: Checklist and heuristics for reviewing user stories, specs, and API contracts for testability - ambiguity, completeness, boundaries, error paths, implicit non-functional requirements - before test design. Use when analysing requirements or when a test cannot be written because the expected result is unclear.
metadata:
  origin: Qualizeal
---

# Requirements Testability Review

## When to Activate

- New stories or specs arrive for testing
- A tester or agent cannot state an exact expected result
- Refinement sessions where acceptance criteria are drafted

## Checklist (apply per acceptance criterion)

| Check | Question to ask | Typical gap |
| --- | --- | --- |
| Unambiguous | Could two testers expect different results? | "fast", "valid", "appropriate" |
| Measurable | Is there a number, code, or observable state? | Missing units, currency, time zone |
| Boundaries | Are limits inclusive or exclusive? | "up to 10,000" |
| Error paths | What happens on every invalid input? | Only the happy path is specified |
| State & time | What resets it, and when? | "daily" without a time zone |
| Retries & concurrency | What if the same request arrives twice or in parallel? | Idempotency, double submits |
| Data integrity | What must never change or always balance? | Money conservation, audit trail |
| Security & privacy | Who may do this, and what must never leak? | AuthZ, PII in errors or logs |
| Consistency | Does it conflict with another criterion or the API contract? | Different error codes for the same case |
| Non-functional | Latency, availability, accessibility, localisation? | Unstated SLAs |

## Implicit requirements to propose

Money movement, identity, health, and AI features almost always carry
unstated requirements: idempotency, audit logging, rate limiting, input size
limits, graceful degradation, and explainability of AI outputs. Propose them
as `ASSUMPTION` items rather than silently testing them.

## Output shape

Condition lines should read: `Given <state> When <action with concrete data>
Then <exact observable outcome>`.
