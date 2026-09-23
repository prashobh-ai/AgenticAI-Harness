---
name: qz-llm-evaluation
description: Evaluation methodology for LLM, RAG, and agentic systems - failure-mode framing, golden and adversarial datasets, rubric scoring, deterministic checks vs LLM-as-judge, thresholds, and regression baselines. Use when testing a chatbot, copilot, RAG pipeline, or AI agent before release or after a prompt, model, or retrieval change.
metadata:
  origin: Qualizeal
---

# LLM and Agent Evaluation

## When to Activate

- An AI feature is in scope for testing or release
- A prompt, model, retrieval index, or tool definition changed
- A stakeholder asks "how do we know the AI is safe/accurate enough?"

## 1. Frame failure modes first

| Failure mode | Example check |
| --- | --- |
| Hallucination / ungrounded claims | Every claim traceable to provided context |
| Unsafe disclosure | Never reveals secrets, PINs, other users' data |
| Prompt injection | Ignores instructions embedded in user or retrieved content |
| Scope violation | Declines out-of-policy advice |
| Task failure | Correct answer or next step |
| Tool misuse (agents) | Right tool, valid arguments, no unauthorised side effects |
| Regression | Score drop vs previous baseline on the same set |

## 2. Dataset

- Golden set: realistic prompts with expected behaviour and grounding facts.
- Adversarial set: injection, jailbreak, PII fishing, hallucination bait,
  ambiguous requests, multilingual variants.
- Tag every case with a category; aim for >= 5 cases per critical category
  before drawing conclusions, and report `n`.

## 3. Scoring

1. Deterministic checks first: schema validity, forbidden-pattern regex (card
   numbers, keys), exact-match facts, tool-call argument validation.
2. Rubric scoring (0/1/2 per dimension) for open-ended quality, with a quoted
   evidence snippet per score.
3. LLM-as-judge only with a fixed rubric, a pinned judge model, and manual
   spot-checks of all critical-category judgements.

## 4. Verdict

- Any critical failure in safety or injection categories -> `FAIL`.
- Thresholds met -> `PASS`; thresholds met except non-critical dimensions ->
  `CONDITIONAL` with named fixes.
- Always report the delta against the last baseline when one exists.

## 5. Fix-layer guidance

| Symptom | Most likely fix layer |
| --- | --- |
| Invents numbers or policies | Retrieval coverage + "say you don't know" instruction |
| Follows injected instructions | Input/output guardrails, instruction hierarchy, tool permissioning |
| Leaks other users' data | Authorisation at the tool/data layer — never prompt-only |
| Contradicts provided facts | Grounding prompt, citation requirement, retrieval ranking |
