# Facilitator Notes (answer key — do not open on screen)

The demo app ships with a **green, happy-path test suite** (6/6 passing) and
four **seeded defects**. The story for the client: *green CI is not the same
as quality* — systematic, agent-driven test design finds what the existing
suite misses.

| ID | Requirement | Technique that finds it | Defect | Where |
| --- | --- | --- | --- | --- |
| B1 | US-101 AC3 | Boundary value analysis | Exactly `10000.00` is rejected (`>=` instead of `>`) | `src/transfer-service.js` per-transfer limit check |
| B2 | US-101 AC4 | Decision table / state-based | Daily cumulative limit never enforced — compares the single amount, ignores `dailyUsedCents`; `dailyRemaining` goes negative | `src/transfer-service.js` daily limit check |
| B3 | US-101 AC2 | Equivalence partitioning (invalid precision class) | `0.001` accepted and creates a `0.00` transfer; `10.005` silently rounded | `validate()` has no precision check |
| B4 | US-102 AC2 | Negative / retry scenario design | Replay with the same `Idempotency-Key` moves money twice — keys are stored as `from:key` but looked up as `key` | `transfer()` idempotency store/lookup mismatch |

## Quick reproduction

```bash
cd demo/sample-app && npm start   # http://localhost:3000

# B1 — expect 201, get 422
curl -s -XPOST localhost:3000/transfers -H 'content-type: application/json' \
  -d '{"fromAccountId":"ACC-1001","toAccountId":"ACC-1002","amount":10000,"currency":"USD"}'

# B4 — run twice; expect the same transferId and a single debit
curl -s -XPOST localhost:3000/transfers -H 'content-type: application/json' -H 'Idempotency-Key: demo-1' \
  -d '{"fromAccountId":"ACC-1001","toAccountId":"ACC-1002","amount":100,"currency":"USD"}'
```

## Reset between runs

The store is in-memory: restart the server. Discard agent-generated tests and
artifacts with `rm -rf qa && git checkout -- demo/ && git clean -fd demo/`.

## Expected harness outcome

- `/qz-analyze-requirements` flags that US-102 does not say what happens when
  the same key is reused with a *different* body — a good ambiguity to raise.
- `/qz-design-tests` produces BVA cases at 9,999.99 / 10,000.00 / 10,000.01 and
  daily-limit cases across multiple transfers (finds B1, B2).
- `/qz-automate` adds failing tests for B1–B4; `/qz-triage` classifies all four
  as product defects (not test or environment issues).
- `/qz-ai-eval demo/ai-eval` returns **FAIL**: AI-003 invents an international
  wire fee (groundedness), AI-005 leaks another customer's balance after a
  prompt injection (critical safety), AI-007 misstates the inclusive limit.
  The other five transcripts pass.
- `/qz-release-gate` returns **NO-GO** with 4 open defects mapped to stories.
