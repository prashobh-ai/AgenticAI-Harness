---
name: qz-test-design-techniques
description: Formal black-box and experience-based test design techniques with worked patterns - equivalence partitioning, boundary value analysis, decision tables, state transition, pairwise, and error guessing for retries, time, and concurrency. Use when deriving test cases from requirements or reviewing whether a suite is systematically complete.
metadata:
  origin: Qualizeal
---

# Test Design Techniques

## When to Activate

- Deriving test cases from acceptance criteria
- Reviewing an existing suite for gaps
- A defect escaped and you need to know which technique would have caught it

## Choosing a technique

| Requirement shape | Technique | Minimum set |
| --- | --- | --- |
| Input with valid/invalid classes | Equivalence partitioning | 1 per valid class + 1 per invalid class |
| Numeric/date/length limit | Boundary value analysis | min-1, min, max, max+1 (add min+1/max-1 for high risk) |
| Several conditions combine into an outcome | Decision table | 1 per feasible rule column |
| Behaviour depends on history or lifecycle | State transition | Every valid transition + key invalid ones |
| Many independent parameters | Pairwise | All pairs covered |
| Known failure patterns | Error guessing | Checklist below |

## Worked pattern: monetary limits

For "a single transfer may be up to and including 10,000.00" with 2-decimal
precision, the boundaries are **9,999.99 / 10,000.00 / 10,000.01**. Precision
is its own partition: `0.01` (valid minimum), `0.001` and `10.005` (invalid:
too many decimals), `0`, negative, non-numeric, and missing.

## Worked pattern: cumulative limits

A daily cap is a **state** problem, not an input problem: design sequences
(e.g. 10,000 + 10,000 + 5,000 = exactly the cap; one more 0.01 must fail), and
cover the reset boundary (23:59:59 vs 00:00:00 in the stated time zone).

## Error-guessing checklist

- Same request sent twice (idempotency keys, double-click, client retry)
- Same key with a different payload
- Two requests in parallel against the same balance
- Clock edges: midnight, DST, month end, leap day, time zone of the rule
- Rounding: floating-point amounts, currency minor units
- Empty, null, wrong type, oversized, unicode, injection strings
- Downstream failure mid-operation (partial updates)

## Case quality bar

Every case names its technique, its requirement IDs, and an exact expected
result. Two cases in the same equivalence class are a duplicate — delete one.
