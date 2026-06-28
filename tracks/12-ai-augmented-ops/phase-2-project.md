# Phase 2 Project — Build the Copilot

*AI-Augmented Ops · Phase 2 (modules 05–08) · ~6–8 hrs · Prereqs: finish modules 05, 06, 07, 08 first.*

> You built an MCP server, wired a copilot, ran cheap local triage, and drafted a SOAR response that waits for a human — separately. The project is the **integration**: an MCP server exposing one real security tool, wired to your RAG corpus into a SoC copilot that triages at volume, with a SOAR + AI playbook that drafts a response and waits for approval.

## Why this is a project, not another module

Each Phase-2 module left a piece of the copilot. Alone they're a server, a scorecard, a classifier, and a playbook; integrated they're the assistant — grounded in your data, wired to your tools, and answerable to a human — that Phase 3 then attacks:

- **05 · Building MCP Servers** → `server/server.py` (with the fourth tool + validation), `requirements.txt`, `server/README.md`, and `tests/test_tools.py` (the packaged, tested MCP server).
- **06 · A SoC Copilot (MCP + RAG)** → `eval-questions.json` (the three-axis held-out set), `scripts/eval.py` (the end-to-end scorer + gate), `copilot/copilot.py` (with your auditability/routing improvement), and `copilot-scorecard.md`.
- **07 · AI-Assisted Detection & Triage** → `scripts/triage.py` (the local triage classifier) + `accuracy-report.md` (the scorecard).
- **08 · SOAR + AI** → `ai-playbook.json` (the workflow **with** the failure branch), `alert-fixtures.json` (the branch-logic fixture), `scripts/branch_gate.py` (the gate), and `branch-scorecard.md`.

## Build it

1. **One copilot, real tools and data.** Wire your MCP server (05) and RAG corpus (Phase 1 + 06) into the copilot (06) so it answers grounded *and* can call a real tool — the end-to-end path a SOC analyst would actually use. The server + retrieval + copilot composed into one assistant is the new work.
2. **Triage at volume, then act.** Feed the local triage classifier (07) into the copilot so high-volume alerts are pre-sorted cheaply, and route an actionable one into the SOAR + AI playbook (08) that drafts a response and **waits for human approval** — with the failure branch proven (low-confidence / model-down → fail-safe).
3. **Score the whole thing.** Run `eval.py` (06) over the held-out set so tool-selection correctness, retrieval relevance, and groundedness are each gated, plus `branch_gate.py` (08) asserting the playbook's routing and fail-safe — one regression in any axis fails the gate.
4. **One operator note.** Open `COPILOT.md` with a two-sentence *what it's grounded in, what tool it can call, and where the human approves* lede — honest about what it still gets wrong.

## Success criteria

- [ ] The copilot answers **grounded in your RAG corpus** and can call a **real tool** via your MCP server.
- [ ] Local triage pre-sorts at volume; an actionable alert routes into a SOAR + AI playbook that **waits for human approval**.
- [ ] The playbook's failure branch is proven (low-confidence / model-down → fail-safe), not just the happy path.
- [ ] `eval.py` gates on tool-selection, retrieval, **and** groundedness; `branch_gate.py` gates the routing — a regression fails.

## Deliverable

A `soc-copilot/` folder in your repo: the **MCP server + tests**, the **copilot + `eval.py` + scorecard**, the **triage classifier + accuracy report**, the **SOAR playbook + branch gate + fixtures**, and `COPILOT.md`. Test prompt-injection/jailbreak techniques only against models and applications **you own or are authorised to assess**. **Do not** commit live run dumps (`results/predictions-*.json`, raw chunk/answer text), raw model-output dumps, or live audit logs (`results/audit-log.jsonl`) — they're gitignored and regenerate from the corpus + fixtures + eval. This copilot is the **attack target for Phase 3**, and these scorecards become the regression tests that prove a Phase 3 mitigation holds.

## Self-check rubric

Grade your own `soc-copilot/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **The copilot** | Bare LLM call, no grounding or tools | MCP server exposing one real tool, grounded in your RAG corpus | Genuinely useful for a SOC task; retrieval relevant, tools scoped |
| **Triage at volume** | Manual, one-at-a-time | Local classifier pre-sorts alerts cheaply, scored for accuracy | Routes confidently-sorted alerts onward; low-confidence escalates |
| **Human-in-the-loop SOAR** | Linear automation, no gate | Drafts a response and waits for approval; failure branch proven | Idempotent; fail-safe on model-down; each action logged for audit |
| **Eval-as-code** | "Looks right" | `eval.py` + `branch_gate.py` gate tool/retrieval/groundedness/routing | A regression in any axis fails the gate; scorecards committed |
| **Hygiene** | Run dumps / audit logs committed | No predictions, raw output, or live logs in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 09 — Securing the AI You Run](modules/09-securing-ai/README.md)** opens Phase 3, which ends in the **[track capstone](README.md#capstone)**.
