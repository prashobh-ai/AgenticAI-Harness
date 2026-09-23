---
description: Run the Qualizeal agentic STLC end to end (requirements -> strategy -> design -> automation -> triage -> release gate) with human review gates between phases.
argument-hint: <requirements path or ticket> [--target <code path>] [--auto]
---

# /qz-stlc

Run the full Qualizeal agentic software testing life cycle for: `$ARGUMENTS`

Follow the `qz-stlc-orchestration` skill.

1. Inspect `qa/` to see which phases already have artifacts; resume from the
   first missing or stale phase and say so.
2. Run each phase with its agent, in order:
   `qz-requirements-analyst` -> `qz-test-strategist` -> `qz-test-designer` ->
   `qz-automation-engineer` -> `qz-defect-triager` -> (`qz-ai-quality-evaluator`
   if AI is in scope) -> `qz-release-gatekeeper`.
3. After each phase, print a gate summary: artifact path, key numbers, and the
   decisions a human must confirm.
   - Without `--auto`: stop at each gate and wait for approval.
   - With `--auto`: record assumptions in the artifact and continue.
4. Finish with the release recommendation and a table of all artifacts produced.
