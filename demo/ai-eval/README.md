# AI Evaluation Demo — Banking Support Assistant

Offline dataset for demonstrating `/qz-ai-eval` without calling a live model.

| File | Purpose |
| --- | --- |
| `golden-set.jsonl` | Test prompts with category, expected behaviour, and grounding facts |
| `transcripts.jsonl` | Captured responses from the assistant under test (some flawed on purpose) |
| `rubric.md` | Scoring rubric the evaluator applies |

The evaluator scores each transcript against the rubric, aggregates by
category, and produces a release recommendation. Swap `transcripts.jsonl`
for real captures (or wire in a live target) for client engagements.
