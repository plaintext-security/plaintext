# Audit — Track 12 · AI-Augmented Security Operations

**Verdict:** Prose is excellent (strong bridge, real anchors, consistent eval thesis) but the rewrite outran the labs: 5 labs describe an eval/gate deliverable whose `make` targets, scripts, and fixtures are **absent** in plaintext-labs. Not shippable until the lab environments catch up to the lab.md prose.

## Per-module findings

- **Track README** — [CONSISTENCY] Phase 3 says "(09–10)" and "ten modules"/"The ten modules" but track has 11 modules; module 11 (AI Evaluation) is orphaned from the phase map though it's a prerequisite for 04/06/07/09/10.
- **01-hybrid-ai-pattern** — clean. (P1 `Type 11 · Decision/ADR`, full anatomy, Moffatt v. Air Canada anchor, lab env + Makefile present, ADR + `check_routing.py` deliverable.)
- **02-running-local-models** — [POLISH] No P1 type tag on the prose `<!-- module-meta -->` line is fine but README opening tag is `Type 7` while lab.md header says `Type 7` — consistent; lab env + `results/` + benchmark deliverable present. clean otherwise.
- **03-prompt-patterns** — [BLOCKER] lab.md drives `make eval`, `make review`, `make gate`, `make gate SCHEMA_MIN=…` and reads `data/promptset.jsonl`, `data/injection-cases.jsonl`, `data/outputs-{good,regressed,injection}.json`, `data/REGRESSION.md`, `scripts/eval.py`, `scripts/review.py` — **none exist** (lab dir has only `scripts/run-pattern.py` + `data/prompt-patterns.md`; Makefile = up/down/reset/shell/demo). The entire scored-harness deliverable (L4) is unbuilt. [CONSISTENCY] P1 uses `Type 14` scheme.
- **04-rag** — [BLOCKER] lab.md Part B drives `make eval`, `make gate`, `make ingest CHUNK_SIZE=120` and reads `data/eval-queries.json`, `scripts/eval.py`, `results/retrieval-scorecard.md` — **absent** (Makefile lacks eval/gate; no `eval.py`; no `eval-queries.json`; `results/` has stale `rag-evaluation.md`, not the referenced scorecard). Retrieval-eval deliverable unbuilt.
- **05-building-mcp-servers** — [CONSISTENCY] P1 type tag is `Variant D · build-first` — the ONLY module not on the `Type N · …` scheme (lab.md header uses `Type 9`); reconcile to `Type 9 · Tool-Build`. Lab env (server/, tests workflow described) + real abuse.ch/Tor seed shapes are good; otherwise clean.
- **06-soc-copilot** — [BLOCKER] lab.md Part B drives `make eval`, `make gate` and `scripts/eval.py` — **absent** (lab has `copilot/copilot.py` + `ingest.py` only; Makefile lacks eval/gate). `data/eval-questions.json` + LastPass KB + Log4Shell seed all present and consistent (L5/L6 good) — only the scorer/gate is missing.
- **07-ai-detection-triage** — clean. Makefile has demo/triage/eval; held-out 50-alert corpus + ground-truth + confusion-matrix eval present; Log4Shell anchor real. (`--threshold`/`--min-recall` are learner-added in Automate step, acceptable.)
- **08-soar-ai** — [BLOCKER] lab.md Part B drives `make gate` + `make trigger-low` and `scripts/branch_gate.py` + `results/branch-scorecard.md` — `gate`, `trigger-low`, and `branch_gate.py` **absent** (lab has `trigger.py`, targets trigger-high/critical/export only). Branch-logic-gate deliverable unbuilt. [POLISH] Connects-forward links Module 11 as `[Module 11](../../README.md)` → points to track README, not module 11.
- **09-securing-ai** — [BLOCKER] lab.md drives `make gate` and reads `eval/attack_eval.py` + `eval/attack-set.jsonl` — **absent** (`scripts/` is empty; no `eval/` dir; Makefile lacks `gate`). [CONSISTENCY] `results/security-assessment.md` is pre-committed in the lab dir though it's named as the learner deliverable. Attack scenarios + `real-incidents.json` + poisoned-runbook present; EchoLeak CVE-2025-32711 anchor real (P6 good).
- **10-attacking-ai** — [CONSISTENCY] P1 type tag is `Variant D · attack-first` (off-scheme like 05; lab.md header says `Type 15`); reconcile. Lab/Makefile consistent (demo/garak-fast/garak-full/promptfoo-eval all present) — the one red-team lab whose interface matches its prose. EchoLeak/ATLAS anchors real.
- **11-ai-evaluation** — [POLISH] Anchor for the *lab* is Equifax/GAO (fine), but README anchor link `platform.claude.com/docs/en/docs/test-and-evaluate/...` has a **doubled `/docs/`** vs module 06's single-`/docs/` form of the same Anchropic page — one is wrong; pick one. Lab is fully built and offline-deterministic (best-built lab in track).

## Cross-cutting

- [CONSISTENCY] P1 type-tag scheme split: 9 modules use `Type N · …`; **05 and 10 use `Variant D · …`** — normalize.
- [CONSISTENCY] Anthropic "Define success criteria" link appears in 3 forms; `docs/en/docs/` (03, 11) vs `docs/en/` (06) — at least one resolves wrong; standardize.
- [INFO] P5 BASELINE/DELUXE tier convention is not used anywhere in this track (models scale via `OLLAMA_MODEL=phi3:mini` ad hoc in 02). If P5 is a track requirement, it is uniformly absent; if not, n/a.
- [INFO] No `.ci-demo` markers on any lab — consistent with learner-exercise/unfinished-build labs; acceptable per CLAUDE.md, but the 5 BLOCKER labs couldn't earn one regardless since their `make` interface is incomplete.

## Counts
- BLOCKER: 5 (modules 03, 04, 06, 08, 09 — missing eval/gate scripts, fixtures, and Makefile targets the lab.md requires)
- CONSISTENCY: 6 (type-tag scheme 05/10; Anthropic link form; track-README phase/count; 08 Module-11 link; 09 pre-committed deliverable)
- POLISH: 3 (08 link target, 11 doubled-docs URL, 02 minor)
- Clean: 01, 02, 05*, 07, 10*, 11 prose; capstone scaffold solid (* = clean but for one consistency tag)

## Top-3 fixes
1. **Build the missing eval/gate harnesses (BLOCKER).** Ship `eval.py`/`review.py`/`branch_gate.py`/`attack_eval.py` + their held-out fixtures (`promptset.jsonl`, `eval-queries.json`, `alert-fixtures`→`branch-scorecard`, `attack-set.jsonl`) and the `eval`/`gate`/`review`/`trigger-low` Makefile targets for labs 03, 04, 06, 08, 09 — the lab.md Part-B deliverables are currently unbuildable. Validate `make up && make demo` (and `make gate` going red→green) on a Linux runner.
2. **Normalize the P1 type-tag scheme** — convert 05 (`Variant D · build-first`→`Type 9 · Tool-Build`) and 10 (`Variant D · attack-first`→`Type 15 · Red-team-the-AI`) to match the other 9 modules and their own lab.md headers.
3. **Fix link + reference defects** — standardize the Anthropic "Define success criteria" URL (drop the doubled `/docs/en/docs/` in 03 & 11); repoint 08's `[Module 11](../../README.md)` to `../11-ai-evaluation/README.md`; reconcile track-README phase map to 11 modules; remove the pre-committed `results/security-assessment.md` from lab 09 (it's the learner's deliverable).
