# Plaintext Tutor — spec

*A BYO-model AI study companion grounded in the Plaintext curriculum. **It mostly already exists** as
[`plaintext-labs/tools/curriculum-mcp`](https://github.com/plaintext-security/plaintext-labs/tree/main/tools/curriculum-mcp);
this spec turns that retrieval tool into a learning accelerant. Planning-only — pairs with the AI thesis
("AI authors → you review → you own it") and the honor-system rules in `CLAUDE.md`.*

## TL;DR

The tutor's hard part — a clean curriculum corpus + grounded retrieval + an MCP surface — **is built and
validated.** What's missing is the layer that makes it *teach* rather than *fetch*: a zero-friction
on-ramp for day-one beginners, a pedagogy layer (Socratic quiz, hint-ladder, explain-back, practice
variants, placement), no-spoiler guardrails, and optional semantic retrieval + progress-awareness. And —
most on-brand — the build-it-yourself version becomes the learner's **first portfolio project**, dogfooding
the RAG (ai-ops 04) and MCP (ai-ops 05 / Python 07) modules over the curriculum itself.

## What already exists (`curriculum-mcp`) — the foundation

Credit where due; we build on this, not around it:

- **Corpus.** A committed snapshot of all 13 tracks under `data/tracks/` — module concept prose, Key
  concepts, Learn paths, and lab *instructions*. **Prose only** — solution code lives in `plaintext-labs/<track>/<module>/solution/`, which is **not** in the snapshot, so the tutor cannot leak answer keys.
- **Retrieval + tools.** A pure-stdlib parser/index (zero deps, offline-testable) and 8 MCP tools:
  `list_tracks`, `list_modules`, `get_module`, `get_learn_path`, `get_lab`, `search_curriculum`
  (deterministic keyword), `suggest_next`, `curriculum_stats`. Plus resources (`curriculum://overview`,
  `curriculum://module/...`) and one `tutor(topic)` prompt.
- **Surface.** A `FastMCP` stdio server you wire into Claude Desktop / Cursor / Claude Code. Read-only
  (no action boundary). Validated green: `158 modules / 691 Learn resources`, smoke + MCP round-trip tests,
  Docker/Makefile.

It is already framed as "the dogfood companion to Track 12 Module 05." **That's the seed; this spec grows it.**

## The gap (retrieval tool → learning accelerant)

| # | Gap | Why it matters |
|---|-----|----------------|
| 1 | **No day-one on-ramp.** Using it needs a venv, the MCP SDK, absolute paths edited into an MCP client, a restart. | That's fine for a developer at the ai-ops stage; it's a wall for a Foundations beginner who doesn't yet run Claude Desktop/Cursor. The accelerant should reach them on day one. |
| 2 | **Pedagogy is one static prompt.** `tutor()` says "ground in the tools and cite." | That's a retrieval assistant, not a tutor. No active recall, no graduated hints, no critique of the learner's own explanation. |
| 3 | **No spoiler / struggle guardrail.** `get_lab` returns the scenario, Do-steps, and deliverable. | A learner mid-lab can ask "just give me the answer." Handing it over destroys the learning. The tutor must default to hints, not solutions. |
| 4 | **Keyword retrieval only.** | Fuzzy/conceptual queries ("where does the curriculum cover defending lateral movement?") can miss. Semantic retrieval would catch them. |
| 5 | **Not progress-aware.** `tracks/javascripts/local-progress.js` already tracks completion client-side; the tutor can't see it. | No personalised "what should I review / what next," no spaced repetition. |
| 6 | **Undiscoverable.** It lives under `tools/` and is mentioned only in ai-ops 05. | A beginner never hears about it. It needs a front door and an on-ramp. |

## Design principles

- **BYO model — never host inference.** Default to a local model (Ollama, as the ai-ops 04 RAG lab
  already uses); allow the learner's own API key. Zero-cost, private, self-hostable — or it violates
  "no paywalls, forever free."
- **Grounded-only.** Answer from retrieved curriculum text; cite the module ref; say "not in the
  curriculum" over inventing. (The tools already enforce this; the pedagogy layer must preserve it.)
- **Productive struggle over answers-on-tap.** Mid-lab, default to Socratic + hint-ladder. The learning
  is in the doing.
- **Coach, never gate.** Honor-system: the tutor mirrors and challenges; it never grades-to-pass or
  unlocks anything.
- **Dogfood it.** The highest-value version is the one the *learner builds* — so the reference
  implementation is also a teaching artifact (Tier 1 below).
- **Reuse, don't reinvent.** Extend `curriculum-mcp` and the existing `ai-augmented-ops/04-rag` (Ollama +
  ChromaDB) and `05-building-mcp-servers` (FastMCP) labs.

## The two-tier model

| Tier | Audience | What they do | Where |
|------|----------|--------------|-------|
| **0 · Use it** | Day-one beginner | `make tutor` → chat with a grounded study companion (BYO Ollama), **no MCP client needed**; or wire the MCP server into a client they already have | Foundations on-ramp + a "Study with AI" front door |
| **1 · Build it** | Python 07 / ai-ops 04–05 | Re-implement & extend the tutor over the curriculum corpus — add semantic retrieval, harden the MCP server, add a pedagogy mode, red-team it — as a **portfolio piece**; `curriculum-mcp` is the reference to study and fork | Python Module 07, ai-ops Modules 04/05 (+ 09/10 to attack it) |

This resolves the chicken-and-egg (the tool is most useful *early* but takes *late* skills to build): beginners **clone-and-run**; the **build** becomes a capstone-grade project once they have the chops.

## Workstreams

### A · Pedagogy layer *(the core add)*

Ship as a set of MCP **prompts** (alongside the existing `tutor()`) and a shared **system-prompt pack**
the Tier-0 standalone runner uses. Each mode is grounded in the existing tools:

| Mode | What it does | Grounds on |
|------|--------------|-----------|
| **Explain** | Grounded explanation + citation + "want the Learn links?" | `get_module`, `get_learn_path` |
| **Quiz (Socratic)** | Asks *you* questions from a module's Key concepts; checks your answer; probes the gap | `get_module` (Key concepts) |
| **Explain-back** | You explain a concept; it critiques against the module text (the curriculum's "Explain" beat) | `get_module` |
| **Hint-ladder** | For labs: graduated nudges (orient → approach → partial → *stop short of the deliverable*) | `get_lab` + the no-spoiler rule |
| **Practice variant** | Generates a *fresh* artifact on the same skill (another brute-force log, another misconfig) for reps | `get_module`/`get_lab` as the spec, model generates the variant |
| **Placement / route** | "I know X — where do I start?" / "what next?" | `suggest_next`, `search_curriculum` (+ progress, workstream E) |

### B · Beginner on-ramp (Tier 0) *(the friction killer)*

A standalone runner over the existing `curriculum.py`, no external MCP client required:

- `make tutor` → a terminal chat loop: retrieve (existing index) → prompt a **local model (Ollama)** →
  grounded, cited answer. One command, BYO model.
- Keep the existing "wire into your MCP client" path for learners who already run one.
- Optional tiny local web UI later; CLI first (zero new surface area).

### C · No-spoiler & productive-struggle guardrails

- **System-prompt discipline:** never output a lab's intended deliverable/solution; for lab refs, route to
  **hint-ladder** by default. Offer the answer only after the learner shows their attempt.
- The corpus already excludes solution *code*, so this is about pedagogy, not data leakage — the model
  must be told to *withhold reasoning-out the answer*, not just to avoid a file.
- Surface the thesis in every session: "I can be wrong — verify against the primary source (the RFC, the
  `man` page, the breach report)," modelling "review → own it."

### D · Semantic retrieval *(opt-in; also the Tier-1 build)*

- Add an optional embedding index (Ollama embeddings + `sqlite-vec` or ChromaDB, **exactly the ai-ops 04
  stack**) for conceptual queries; keep deterministic keyword search as the **zero-dep default** (honest,
  offline, no model needed).
- Shipping this *as the learner's build* in ai-ops 04 is the dogfood: they add RAG to the reference tool.

### E · Progress-awareness *(opt-in)*

- Export `local-progress.js` state (completed modules) to a small JSON the tutor can read, enabling
  placement ("skip what you've done"), spaced review, and a "you're 3 modules from the Phase 2 project"
  nudge. Strictly local; no telemetry.

### F · Curriculum wiring *(discoverability)*

- A **"Study with AI"** front-door page (`tracks/study-with-ai.md`) in the nav: what it is, the
  clone-and-run quickstart, the honor-system framing, BYO-model setup.
- A Foundations on-ramp line ("set up your study companion") pointing at Tier 0.
- The build-it framing at **Python 07** and **ai-ops 04/05** (and "attack your own tutor" at ai-ops 09/10).

## Where it lives

- **Extend `plaintext-labs/tools/curriculum-mcp`** — add the pedagogy prompts (A), the standalone runner
  (B), the guardrail system-prompt (C); semantic + progress (D/E) as opt-in modules. It stays a single,
  validated, `make demo`-green tool.
- **Corpus freshness:** `data/tracks/` is a committed snapshot that drifts. Add a refresh script (or CI
  job) that re-exports from the live `tracks/`, and pin a curriculum version so answers match what the
  learner reads. (The `CURRICULUM_DIR` override already supports tutoring over a live checkout.)
- **Prose** (the front-door page, on-ramp lines, build framing) → `plaintext` repo `tracks/`.

## Guardrails / non-goals

- **No hosted inference, no paid dependency** — BYO model only.
- **No grading gate** — coaching, never completion-gating; honor system intact.
- **No solution dispensing** — hint-ladder, not answers; struggle is the point.
- **Not a replacement for doing the labs** — it accelerates understanding, it doesn't do the work.

## Build plan (phased)

1. **Pedagogy pack (A) + guardrails (C)** — prompts + system-prompt over the *existing* server. Highest
   value, lowest effort (no new infra). Validate with the existing test harness + a few transcript checks.
2. **Tier-0 standalone runner (B)** — `make tutor`, Ollama-backed, over `curriculum.py`. Removes the
   beginner wall.
3. **Wiring (F)** — the "Study with AI" page + Foundations on-ramp + build-it framing. Makes it real to
   learners.
4. **Semantic retrieval (D)** — opt-in embeddings; ship it *as the ai-ops 04 build*.
5. **Progress-awareness (E)** — `local-progress.js` export → placement/spaced-review.
6. **Corpus refresh automation** — keep the snapshot from drifting.

## Open questions

- **Tier-0 default model:** which small local model balances "runs on a laptop" vs "good enough to tutor"
  (the 04-rag lab defaults to `tinyllama` — likely too weak for real tutoring; pick a sane default + a
  "use a bigger model if you have the RAM" note).
- **Standalone UI:** CLI-only first, or a tiny local web chat? (Lean CLI.)
- **Practice-variant fidelity:** generated artifacts must be *realistic* (a believable log/misconfig), not
  toy — needs a tight prompt + maybe a few seed examples per module.
- **Does the front-door page belong in nav now, or behind the "prototype" section** (like the existing
  Interactive Tour)?

## Honesty note

This is a **design**, and the *foundation is real and validated* (`curriculum-mcp`) — but the pedagogy
layer, the beginner on-ramp, and the wiring are unbuilt. None of the workstreams here has shipped; the
build plan above is the work.
