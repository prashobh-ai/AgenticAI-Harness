---
name: qz-stlc-orchestration
description: Qualizeal agentic STLC operating model - phases, agent handoffs, artifact layout under qa/, human review gates, and templates. Use when running an end-to-end testing effort with agents, resuming a partially completed one, or deciding which Qualizeal QE agent to call next.
metadata:
  origin: Qualizeal
---

# Qualizeal Agentic STLC

A repeatable, auditable software testing life cycle executed by specialised
agents, with humans approving at each gate.

## When to Activate

- Starting testing for a feature, release, or AI system
- Resuming work where `qa/` artifacts already exist
- A stakeholder asks "where are we?" on quality for a release

## Phases, agents, and artifacts

| # | Phase | Agent | Artifact | Human gate |
| --- | --- | --- | --- | --- |
| 1 | Requirements analysis | `qz-requirements-analyst` | `qa/01-requirements/analysis.md` | Product owner answers blocking questions |
| 2 | Test strategy | `qz-test-strategist` | `qa/02-strategy/test-strategy.md` | QA lead approves scope and exit criteria |
| 3 | Test design | `qz-test-designer` | `qa/03-design/test-cases.md`, `rtm.md` | Peer review of high-priority cases |
| 4 | Automation | `qz-automation-engineer` | test code + `qa/05-execution/run-report.md` | Code review |
| 5 | Triage | `qz-defect-triager` | `qa/05-execution/defects/DEF-*.md` | Dev lead accepts defects |
| 6 | AI evaluation (if AI in scope) | `qz-ai-quality-evaluator` | `qa/ai-eval/eval-report.md` | AI owner accepts verdict |
| 7 | Release readiness | `qz-release-gatekeeper` | `qa/06-release/readiness.md` | Release owner decides |

## Operating rules

1. **Artifacts are the contract.** Each agent reads the previous phase's file
   and writes its own. No hidden state; any phase can be re-run.
2. **Stable IDs everywhere.** `US-*`/`REQ-*` for requirements, `Q-*` for
   questions, `R-*` for risks, `TC-*` for cases, `DEF-*` for defects. IDs never
   get renumbered on re-runs.
3. **Gates are explicit.** After each phase, stop and summarise what the human
   must confirm. In demo or `--auto` mode, record assumptions and continue.
4. **Traceability is continuous.** The RTM is updated in design, automation,
   triage, and release phases.
5. **Evidence over assertion.** Every status claim cites a file, command, or ID.

## Resuming

Inspect `qa/` and start at the first phase whose artifact is missing or older
than its input. Report what exists before doing new work.

## Templates

- `templates/test-strategy.md`
- `templates/defect-report.md`
- `templates/release-readiness.md`

## Composing with the ECC engine

When the engine plugin is installed, reuse its agents rather than
re-implementing: `code-reviewer` for test-code review, `e2e-runner` for browser
journeys, `security-reviewer` for security test ideas, and the
`verification-loop` skill before claiming a phase done.
