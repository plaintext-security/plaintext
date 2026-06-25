# AI-Augmented Ops track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual
**labs** (where the skew shows), not just the concept objectives. The frame is adapted for a track
that is **build-oriented by nature** — building AI/MCP/RAG/agent tooling for security is the point —
so the question is not "find vs. build" but **"does the lab build the AI tool AND rigorously
*evaluate / red-team* it?"** The distinctive half here is the *verify-the-AI* half: an eval set, a
quantitative metric, a fails-closed proof, an adversarial re-test — not just "run it and read the
answer."*

## TL;DR

This track is **already build-and-evaluate heavy and largely in good shape** — exactly what the
charter predicts for an AI track. Every lab ends in an owned, committed artifact (a script, an MCP
server, a copilot patch, a workflow, an attack suite), and the back third (07–10) is a model of the
*verify* half: 07 scores against labeled ground truth (confusion matrix / precision / recall / F1),
09 runs attack→mitigate→re-attack, 10 runs `garak` + `promptfoo` with pass-rate thresholds. The skew
is **very narrow**: **one early build lab (04 RAG) builds a real AI tool but stops at *narrative*
evaluation** — it judges retrieval relevance by eye and its required "Automate & own it" is an
*operational* dedup feature, not an eval harness, so the learner can finish without ever *measuring*
retrieval. (03 is borderline-balanced — it already ships a gated PASS/FAIL check that must fire a
FAIL; it only lacks a *fixed* eval-case set, a minor tighten.) A **structural eval-harness /
regression-gate module** is defensible but **overlaps 09/10 and 07 heavily — a decision, not a
default; "none" is an honest answer.** Recommendation: one surgical deepen (04), a minor anchor on
03, and an *optional* decision on an eval-harness unit. No teardown — and lighter than the cloud and
ZTNA audits, which each needed a brand-new validated module.

## What "build & operate + verify the AI" means here

Not just "build an AI tool and read its output," but: build the owned artifact **and** prove it works
*and prove it fails safely* — run it against a labeled **eval set** and report a number, **red-team**
the prompt and show the injection is blocked, verify it **fails-closed** (rejects malformed output /
refuses to hallucinate a finding) rather than silently passing. 07/09/10 already deliver this bar;
the audit is about where the *verify* half is present but only **narrative** (looked at by eye, not
gated by a repeatable check).

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Builds **+ rigorously evaluates** an AI tool? | Verdict |
|---|--------|-----------------|------------------------------------------------|---------|
| 01 | The Hybrid AI Pattern | fill a routing decision matrix, stress-test 2 tasks against `tinyllama`, write `check_routing.py` heuristic router | builds (`check_routing.py`); eval is "confirm output matches your manual decisions" | **By design** — governance/orientation primer (the track's "orient yourself" entry, like cloud 01 / ztna 01); the artifact is a policy + router, not a model under test |
| 02 | Running Local Models | benchmark 5 prompts, record latency/throughput, mark Correct/Partial/Wrong, write `benchmark.py` | yes — builds the benchmark harness **and** evaluates quality + throughput quantitatively | **Balanced (proactive)** — `benchmark.py` *is* an eval harness |
| 03 | Prompt Patterns | validate 3 patterns + author Pattern 9, classify hallucination/off-format/overconfidence, write `validate-patterns.py` whose schema check **must fire ≥1 FAIL on a real bad output** | **mostly yes** — the *required* `validate-patterns.py` is a genuine gated format-check (a FAIL must fire), and step 4 forces failure-mode classification; the only softness is it runs against the learner's own picks, not a *fixed* known-good/known-bad set | **Balanced (minor: anchor to a fixed case set)** — already gated; tighten by shipping the eval cases |
| 04 | RAG | build ingest+query pipeline, run 3 queries + a "nothing in corpus" probe by eye, tune chunk size, extend `ingest.py` (dedup) | **partial** — builds a real pipeline; evaluation is **narrative only** ("were the chunks relevant?"), no retrieval metric, and "Automate & own it" is *incremental ingestion*, not an eval harness | **Promote the eval half** — add a small labeled query→expected-doc set + a retrieval@k / grounding check the learner runs and gates on |
| 05 | Building MCP Servers | build a 4th tool, write a test client, add input validation (length/charset, fails-closed error dict) | yes — builds the server **and** verifies it (test client + adversarial-input validation that returns an error not an exception) | **Balanced (proactive)** — the validation step *is* the fails-closed verify |
| 06 | SoC Copilot (MCP+RAG) | validate copilot on 5 questions, diagnose one failure's root cause, patch `copilot.py`, write `batch-query.py` with a hallucination heuristic over `eval-questions.txt` | yes — builds the copilot **and** runs a batch eval with a hallucination-on-context check (heuristic, but a real owned gate over an 8-question set) | **Balanced** — eval is heuristic not labeled, but it is a repeatable owned harness; fine as-is |
| 07 | AI Detection & Triage | triage 50 alerts, `make eval` → confusion matrix + precision/recall/F1 vs `ground-truth.json`, tune prompt, threshold-split artifact | **yes — the gold standard.** Labeled ground truth, quantitative metric, false-negative analysis | **Balanced (proactive)** — exemplar of the verify half |
| 08 | SOAR + AI | validate n8n playbook, **implement the error branch**, prove `AI_UNAVAILABLE` fires with Ollama stopped, write `trigger.py` | yes — builds the orchestration **and** proves the fails-closed branch (AI down → human review, audit log entry) | **Balanced (proactive)** — the error-branch proof is a real fails-closed verify |
| 09 | Securing the AI You Run | reproduce 3 attacks (injection, corpus poisoning, tool abuse), implement a mitigation each, **re-attack**, write `attack-suite.py` (VULNERABLE/MITIGATED) | yes — attack→mitigate→**re-attack** loop with an owned pass/fail attack suite | **Balanced (proactive)** — model of red-team-your-own-tool |
| 10 | Attacking AI Systems | run `garak` (pass-rate thresholds) + `promptfoo` assertions, write threat model, add a test case, `scan.sh` failure-count gate | yes — systematic automated red-team with pass-rate gates and an owned scan script | **Balanced (proactive)** — the systematic eval/red-team capstone-feeder |

**Tally:** ~8 balanced/proactive (02, 03, 05, 06, 07, 08, 09, 10 — 03 already runs a gated
check, just not against a fixed case set) · 1 "by design" pure (01 governance primer) · **1
build-with-narrative-eval that should promote a graded eval/verify half (04 — the one real gap)**,
plus a minor anchor-the-cases tightening on 03. Optionally 1 structural hole (a generalised
eval-harness / regression-gate module — defensible but overlaps 07/10; a *decision*, not a default).
The track is the *inverse* shape of the cloud/ZTNA findings — there the gap was a missing *build*
half on audit labs; here it is at most a missing *rigorous-verify* half on **one** early build lab
(04). Narrow skew, not a teardown — and lighter than either prior track.

## The one narrative-eval lab (04), plus a minor tighten (03)

The real gap is a single lab; both it and 03 already *build* the AI tool, but 04 never *measures* its
output and 03 measures against an ad-hoc set. Promote the eval to a core, graded step:

- **04 — add a retrieval eval set + a grounding gate (the one real fix).** Today: step 3 runs three queries and asks
  "were the chunks relevant?" / "did the answer reflect them?" — judged narratively; step 4 probes
  empty-corpus behaviour by eye; the required automation is *incremental ingestion* (a build nicety,
  not an eval). Add: a tiny **`query → expected-source-doc` labeled set** and a check that reports
  **retrieval@k** (did the right doc come back?) and a **grounding flag** (does the answer assert a
  fact absent from the retrieved chunks?), run as `make eval`. This is the exact gap the cloud/ZTNA
  audits flagged in a different costume — the lab proves the build, never *measures* it.
- **03 — anchor the gate to a fixed case set (minor tighten).** 03 *already* requires
  `validate-patterns.py` to fire ≥1 FAIL on a bad output, so it is essentially balanced; the only
  softness is the cases are the learner's own picks. Ship a small committed known-good/known-bad case
  set so the gate is reproducible across learners. Low priority — 03 is not the gap, 04 is.

Each change touches the module `README.md` (objective + key concepts, in `plaintext`) and the lab
`lab.md` Do-steps + success criteria + a small `data/` eval set + a check script (in
`plaintext-labs`), and must keep `make up`/`make demo` validated.

## The one structural hole: a generalised eval-harness / regression-gate module

The track teaches *building* AI tools thoroughly and *red-teaming* them thoroughly (09–10), and 07
shows a beautiful **labeled, quantitative eval** — but that discipline lives **inside the triage
lab**, specific to one task. The cross-cutting practitioner skill — *build a reusable eval harness
that gates any AI security tool you ship: a labeled eval set, regression assertions wired into CI,
and a "the model got worse" alarm* — is never its own unit. This is the AI-engineering analogue of
the missing-pillar holes the cloud (KMS) and ZTNA (workload identity) audits found: it is
**almost-entirely build-and-operate**, it generalises what 07/06/10 each do partially, and it is the
thing that turns "I prompted a model" into "I can prove my AI tool didn't regress." A candidate
slots after 07 or as a Phase-2 capstone-feeder: **`promptfoo`/`deepeval` over a labeled SOC eval set,
a pass-rate threshold, and a GitHub Actions gate that fails the build when accuracy drops** (10's
stretch already gestures at exactly this — promote it to a module).

*This is a decision, not a default* (as in both prior audits): it is the larger,
lab-validation-heavy piece and overlaps 07/10, so confirm scope before building — it may be better
realised as **deepening 07 into a reusable harness + a CI gate** than as an 11th module. Either way,
the gap is real and build-shaped.

## Rebalance plan (sequenced, smallest-disruption first)

1. **04 — add the retrieval eval set + grounding gate (the one real fix)** *(S–M, mostly
   promotable).* The env already runs Ollama + ChromaDB + `ingest.py`/`query.py`; reframe the
   required "Automate & own it" from incremental-ingest dedup to **`eval_rag.py`** + a tiny labeled
   `query→expected-doc` set (incl. a not-in-corpus case), run as `make eval` (retrieval@k + grounding
   flag, exit non-zero below threshold); keep dedup as a stretch. **Rests on the already-validated
   three-container env** — adds one script + a `make eval` target, but `make eval` must be
   **re-validated** (Docker + model pulls required → follow-up if the sandbox lacks Docker/RAM).
   Mirror 07's `eval.py` shape. Realign the concept objective + key concepts to name retrieval
   evaluation as co-equal.
2. **03 — anchor the gate to a fixed case set** *(S, promotable, low priority).* 03 already ships a
   gated `validate-patterns.py`; just add a committed known-good/known-bad case file so the FAIL is
   reproducible across learners. **Promotable on the already-validated env — cheap, no new services.**
3. **(Optional) New unit — eval-harness / regression-gate** *(M–L, structural decision; needs NEW validation).*
   Either an 11th module or a deepening of 07 into a reusable harness + CI gate. Needs a labeled SOC
   eval set, a `promptfoo`/`deepeval` config, a pass-rate threshold, and a validated GitHub Actions
   gate — i.e. **new env scaffolding built + `make up`/`make demo` validated**, plus concept + nav +
   track map + landing counts if it becomes a module. **Confirm scope first** (deepen-07 vs.
   new-module) before building, because shipping an unvalidated module would violate the charter's
   labs-built-and-validated definition of done. Docker/model availability is the validation risk.

## Non-goals / cautions

- **Don't overcorrect.** This track is already the most build-and-evaluate-heavy we have — 02, 05,
  06, 07, 08, 09, 10 are all build+verify and should be left alone. 01 is a pure governance/routing
  primer (the artifact *is* the policy + a heuristic router, not a model under test) — like cloud
  01/14 and ztna 01/04, do not bolt a model-eval half onto it. The fix is narrow: two early labs and
  one decision.
- **Promotable vs. needs-validation:** 04 (the real fix) rests on its validated three-container env
  but adds a check that must be **re-run** to count as done. 03 is essentially free (a small static
  case file on an existing required script, no new services). The eval-harness unit is the only
  genuinely new build — and it overlaps 07/09/10, so scope it (deepen-07 vs. new-module) before
  committing; "none" is a defensible answer.
- Any change touches **both repos** (prose in `plaintext`, lab env in `plaintext-labs`) and must keep
  `mkdocs build --strict` green and ship a validated `make up`/`make demo`. Several labs need Docker +
  multi-GB model pulls (Ollama `tinyllama`/`nomic-embed`) to validate — if the authoring sandbox lacks
  Docker or RAM, the validation is a follow-up, stated honestly (as the ZTNA module-10 status did).
