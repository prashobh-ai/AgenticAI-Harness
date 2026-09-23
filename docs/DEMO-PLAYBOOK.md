# Demo Playbook (15-20 minutes)

Audience: client engineering, QA, and delivery leaders.
Story: **"Your CI is green. Is your release safe?"**

Facilitator answer key: [demo/FACILITATOR-NOTES.md](../demo/FACILITATOR-NOTES.md)
(keep it off screen).

## Before the session (5 minutes)

```bash
git clone https://github.com/prashobh-ai/AgenticAI-Harness.git
cd AgenticAI-Harness
npm test                        # QE pack + demo app: all green
```

In Claude Code, from the repo root:

```text
/plugin marketplace add ./
/plugin install qualizeal-qe@qualizeal-harness
```

Run the full pipeline once as a dry run so you know the timings, then reset
with `rm -rf qa && git checkout -- demo/ && git clean -fd demo/`.

## Run of show

| Min | Act | Do | Say |
| --- | --- | --- | --- |
| 0-2 | The setup | Open `demo/requirements/funds-transfer.md`; run `npm --prefix demo/sample-app test` (6/6 green) | "A typical feature: clear stories, a passing suite. Would you ship it?" |
| 2-5 | Requirements | `/qz-analyze-requirements demo/requirements/funds-transfer.md` | Point at the ambiguity log - e.g. idempotency key reused with a different body. "Testers find gaps before code, not after." |
| 5-7 | Strategy | `/qz-test-strategy "retail banking, money movement, release this week"` | Risk register: limits and idempotency rank High because money moves. "Effort goes where failure is expensive." |
| 7-10 | Design | `/qz-design-tests` | Show BVA rows 9,999.99 / 10,000.00 / 10,000.01 and daily-limit sequences, each labelled with its technique; show the RTM. |
| 10-13 | Automation | `/qz-automate P1` | New tests fail. "The agent did **not** change the assertions to make them pass. Failing tests are findings." |
| 13-15 | Triage | `/qz-triage` | Four `DEF-*.md` files, each with a curl repro and `file:line` root cause. |
| 15-17 | AI quality | `/qz-ai-eval demo/ai-eval` | Hallucinated wire fee (AI-003), data leak via injection (AI-005), wrong limit (AI-007) -> **FAIL**. "Same discipline for your AI features." |
| 17-18 | Release gate | `/qz-release-gate` | **NO-GO** with a path to GO. "This is what your steering committee reads." |
| 18-20 | Close | Show `qa/` tree and the architecture diagram | Human gates, portability (Kiro, Codex), engine guardrails, and how an engagement starts. |

Short on time? Run `/qz-stlc demo/requirements/funds-transfer.md --target demo/sample-app --auto`
and narrate the artifacts as they appear.

## Talking points by audience

- **QA leaders:** traceability and technique-labelled cases make coverage
  auditable; testers move from writing cases to reviewing and steering.
- **Engineering leaders:** tests land in the existing framework, on the
  existing CI; nothing proprietary to maintain.
- **Risk / compliance:** every decision has an artifact, an ID, and a named
  human approver.
- **AI product owners:** thresholds and critical categories turn "is the bot
  good enough?" into a measurable release criterion.

## Likely questions

| Question | Answer |
| --- | --- |
| Does it replace our testers? | No. It removes the mechanical work; people own gates, assumptions, and exploratory testing. |
| Which tools does it support? | Claude Code natively; Kiro and Codex via `scripts/qz.js install`; the engine adds Cursor, Copilot, Gemini, OpenCode adapters. |
| Can it use our Jira / ADO / TestRail? | Yes, via MCP servers configured in your project; artifacts are Markdown and map cleanly to test-management imports. |
| Is our code sent anywhere new? | Only to the model provider your agent tool already uses, under your existing agreement. |
| What stops agents going rogue? | Guardrails in every agent, engine hooks, human gates, and review of every artifact. |
