---
description: Evaluate an LLM, RAG, or agentic system against a golden/adversarial dataset and rubric, and return a threshold-based PASS / CONDITIONAL / FAIL verdict.
argument-hint: <dataset dir or transcripts.jsonl> [--rubric <path>] [--baseline <report>]
---

# /qz-ai-eval

Use the `qz-ai-quality-evaluator` agent on: `$ARGUMENTS`

Follow the `qz-llm-evaluation` skill. Write `qa/ai-eval/eval-report.md` with
per-case scores, category aggregates, the verdict, and fix-layer
recommendations.
