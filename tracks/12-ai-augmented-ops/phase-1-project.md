# Phase 1 Project — Run & Ground Models

*AI-Augmented Ops · Phase 1 (modules 01–04) · ~5–7 hrs · Prereqs: finish modules 01, 02, 03, 04 first.*

> You decided what runs where, served a model on modest hardware, hardened your prompts, and grounded answers in a corpus — one capability at a time. The project is the **integration**: a local-model setup (Ollama/llama.cpp) with a reviewable, scored prompt library and a working RAG pipeline over *your own* security notes — with the evidence for when local suffices and when a frontier model earns the call.

## Why this is a project, not another module

Each Phase-1 module left a piece of the "run it yourself, ground it in your data" story. Alone they're a routing doc, a benchmark, a prompt set, and a retriever; integrated they're the local AI substrate the copilot in Phase 2 is built on:

- **01 · The Hybrid AI Pattern** → `routing-adr.md` + `decision-matrix.md` — the defended local-vs-frontier routing decision (the start of the team's AI governance record).
- **02 · Running Local Models** → `benchmark-results.md` + `benchmark.py` — the local-serving evaluation and the reusable measurement script.
- **03 · Prompt Patterns for Security** → `prompt-patterns.md` (with your Pattern 9 and hardened delimited prompts), the scored held-out `promptset.jsonl` (with injection cases), `eval.py`, and `review.md` (the injection-review checklist + threshold justification).
- **04 · Retrieval-Augmented Generation** → `eval-queries.json` (labelled set), `scripts/eval.py` (the recall@k / groundedness gate), your `knowledge-base/<runbook>.md`, and `retrieval-scorecard.md`.

## Build it

1. **One grounded local pipeline.** Wire your local model (02), your hardened prompt library (03), and your RAG retriever (04) into a **single query path**: a question retrieves from *your* corpus, fills a reviewed prompt template, and is answered by the local model. The three stages composed into one grounded answer is the new work.
2. **Score it as code.** Run the held-out query set (04) and prompt set (03) through `eval.py`, producing a combined scorecard with the recall@k / groundedness + prompt-injection gates that fail on a regression — not vibes.
3. **Prove the routing call.** Use `benchmark.py` (02) and `routing-adr.md` (01) to show, on evidence, which queries local handles well and which earn a frontier call — and have the pipeline route accordingly (or flag the escalation honestly).
4. **One honest write-up.** Open `LOCAL-AI.md` with a two-sentence *what runs local, grounded in what, and where it hands off* lede — and name what local models genuinely can't do here.

## Success criteria

- [ ] One query path: retrieve from your corpus → reviewed prompt → **local** model answer.
- [ ] A combined `eval.py` scorecard gates on a retrieval **and** a prompt-injection regression.
- [ ] The local-vs-frontier routing call is backed by `benchmark.py` evidence, not assertion.
- [ ] `LOCAL-AI.md` is honest about what the local setup can't do — local is real, not magic.

## Deliverable

A `local-ai/` folder in your repo: the **grounded pipeline**, the **prompt library + `promptset.jsonl` + `eval.py`**, the **RAG `eval-queries.json` + scorecard + corpus additions**, the **`routing-adr.md` + `benchmark.py`**, and `LOCAL-AI.md`. **Do not** commit model weights, raw API/model-output dumps, live run dumps (`results/`, `predictions-*.json`, regenerated `outputs-*.json`) — they're gitignored and regenerate from the prompts + corpus + eval.

## Self-check rubric

Grade your own `local-ai/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Local serving** | Frontier API only | A local model serves the pipeline on modest hardware | Benchmarked; the local-vs-frontier call is evidence-backed |
| **Grounding** | Ungrounded generation | RAG retrieves from your own corpus into the answer | Retrieval is relevant; groundedness scored, not assumed |
| **Prompt discipline** | Ad-hoc prompts | Reviewable, delimited prompts with injection cases in the set | Injection-review checklist applied; threshold justified |
| **Eval-as-code** | "Looks right" | `eval.py` gates on a retrieval *and* injection regression | One scorecard across both axes; regression actually fails the gate |
| **Hygiene** | Weights/run dumps committed | No weights, API dumps, or run dumps in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 05 — Building MCP Servers](modules/05-building-mcp-servers/README.md)** opens Phase 2.
