---
name: qz-risk-based-testing
description: Risk-based test prioritisation - scoring likelihood and impact with evidence, mapping risk scores to test depth and levels, and right-sizing effort. Use when planning a test strategy, cutting scope under time pressure, or explaining to stakeholders why some areas get more testing than others.
metadata:
  origin: Qualizeal
---

# Risk-Based Testing

## When to Activate

- Writing a test strategy or sprint test plan
- Deadline pressure forces scope decisions
- Deciding where to invest in automation

## Scoring

Likelihood (1-3) — evidence: code complexity, change volume, new technology,
integration count, defect history, team unfamiliarity.

Impact (1-3) — evidence: money movement, safety, regulatory exposure, PII,
number of users, reputational visibility, recoverability.

`Score = Likelihood x Impact` -> High (6-9), Medium (3-4), Low (1-2).

## Depth mapping

| Risk | Design techniques | Automation | Other |
| --- | --- | --- | --- |
| High | All applicable techniques, negative and adversarial cases | Multiple levels (unit + API, E2E for the critical journey) | Exploratory charter, security and resilience checks |
| Medium | Primary technique per rule (EP/BVA or decision table) | Cheapest effective level | Targeted exploratory |
| Low | Representative happy path | Smoke | None unless cheap |

## Heuristics

- Anything that moves money, grants access, or is irreversible starts at High
  impact.
- Retries, time, and concurrency raise likelihood — they are rarely covered by
  existing suites.
- A green suite that only tests happy paths does **not** lower likelihood.
- Re-score after each defect cluster: defects cluster, so raise likelihood
  for neighbouring components.
