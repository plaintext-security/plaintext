# Type pass — Track 12: AI-Augmented Security Operations

*Pass run 2026-06. Library: `planning/MODULE-TYPE-LIBRARY.md` (16 types). The headline test for
this track: every Build-&-Operate module (#7) should be **paired with an Eval Harness (#13)** —
a RAG with no retrieval eval, a triage model with no labelled test set, is a liability built on
vibes. Fit verdict flags every build module that ships no eval as ⚠.*

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 The Hybrid AI Pattern | 11 Decision/ADR | 2 Misconception Reveal | ✓ | Routing matrix = ADR (local vs frontier vs human); "model confidence ≠ accuracy" + the Meridian ToS leak is a real predict-then-reveal anchor. Deliverable should be named an ADR explicitly. |
| 02 Running Local Models | 7 Build-&-Operate | 11 Decision/ADR | ✓ | Genuinely carries an eval: benchmarks throughput *and* quality against your own prompts ("your alerts, your hardware"), not a leaderboard. The rare build module that already measures. |
| 03 Prompt Patterns | 14 Adversarial Review | 13 Eval Harness | ⚠ | Prose nails "prompts belong in git, tested like detection rules" + a CI schema-check job — but the lab only validates 3 patterns ad hoc. Needs a held-out scored set + regression gate to actually be #13, not just assert it. |
| 04 RAG | 7 Build-&-Operate | 13 Eval Harness | ⚠ | **Builds on vibes.** Lab "documents where retrieval succeeds/fails" qualitatively — no retrieval-quality metric (recall@k / labelled query set), no regression gate. The canonical "RAG without a retrieval eval is a vibe" gap. |
| 05 Building MCP Servers | 7 Build-&-Operate | 9 Tool-Build | ⚠ | Strong tool-trust-boundary prose; ships a reusable tool. No eval/test suite for tool-call correctness or input-validation. |
| 06 SoC Copilot (MCP+RAG) | 7 Build-&-Operate | 13 Eval Harness | ⚠ | Integrates RAG+MCP+LLM, "show its work" auditability — but no end-to-end eval of answer quality / retrieval relevance / tool-selection. The capstone target with no scorecard. |
| 07 AI-Assisted Detection & Triage | 13 Eval Harness | 7 Build-&-Operate | ✓ | The exemplar: classifies 50 alerts vs a ground-truth label file → confusion matrix → monthly re-eval at an 80% threshold. This is what #13 looks like; every other build module should borrow this shape. |
| 08 SOAR + AI | 7 Build-&-Operate | 8 Judgment-as-Code/Gate | ⚠ | HITL threshold + "model fails → escalate, never → no action" is real gate thinking, but the workflow is built/triggered, not *evaluated* — no test set proving the branch logic holds across alert types. |
| 09 Securing the AI You Run | 15 Red-team-the-AI | 4 Audit→Build→Verify | ✓ | Attack the Module 06 copilot (injection / corpus-poison / tool-abuse) → mitigate → document residual risk. Real attack→defend→re-attack loop. Anchor could name Air Canada / Chevy-$1-bot explicitly (it stays abstract). |
| 10 Attacking AI Systems | 15 Red-team-the-AI | 13 Eval Harness | ✓ | garak (statistical probe pass-rates) + promptfoo (expected-output regression suite) = systematic red-team *and* the eval-as-regression-test #13 the build modules lack. Threat-model deliverable lands it. |

✓ = type fits and (for build modules) ships/scaffolds an eval. ⚠ = mismatch or builds-on-vibes (no eval).

## Coverage gaps

- **Eval Harness (#13) is present but NOT systematic — the headline finding.** It exists in two
  places only: **07** (confusion matrix vs ground truth) and **10** (promptfoo regression suite).
  The build spine **04 RAG, 05 MCP, 06 Copilot, 08 SOAR** ship working systems with **no eval
  paired to them** — exactly the library's predicted failure ("a RAG without a retrieval-quality
  eval is a vibe; a triage model without a labelled test set is a liability"). The track *teaches*
  measurement late (07) and as red-team tooling (10) but doesn't bake an eval into each system as
  it's built. 03's "tested like detection rules" claim is asserted in prose but the lab under-delivers.
- **#13 is concentrated, not distributed.** Because 07 and 10 own all the eval, the most
  consequential system — the **06 copilot / capstone** — is the least evaluated. The capstone
  rubric grades build→attack→fix but has **no "retrieval is relevant / answers are scored"
  dimension**; "Exemplary" says retrieval is relevant but nothing measures it.
- **Decision/ADR (#11)** is latent: 01 is a genuine ADR but isn't named one, and the ADR construct
  isn't reused (08's HITL-threshold choice is also an ADR-shaped decision left implicit).
- **Misconception Reveal (#15-adjacent predict-then-reveal)** for 09/10 is under-anchored — the
  library wants Air Canada / Chevy-$1-bot / agentic prompt-injection as named anchors; the modules
  argue the mechanism well but cite OWASP/ATLAS generically rather than the documented incidents.
- Not gaps: Build-&-Operate (#7) is well-covered; Red-team-the-AI (#15) is the strong close.
  Migration (#12) and Drift (#16) are correctly absent (not this track's job).

## Suggested additions

1. **A dedicated Eval & Observability module (new, ~between 06 and 07) — highest value.** Make
   #13 a first-class unit: build a held-out eval set + scorecard + regression gate that the RAG (04),
   the MCP tools (05), and the copilot (06) all run against, so eval is a *shared harness* the build
   modules plug into rather than a one-off in 07. Promote 07's confusion-matrix discipline and 10's
   promptfoo into a reusable per-system eval. This directly fixes the "build-on-vibes" ⚠ on 04/05/06.
2. **Retro-fit each build module's lab with a minimal eval deliverable** (lighter than a new module
   if module-count is a constraint): 04 → retrieval recall@k on a labelled query set; 06 → end-to-end
   answer-quality scorecard; 08 → a branch-logic test fixture. Add a "retrieval/answer quality is
   *measured*" row to the capstone rubric so the flagship system is scored, not vibed.
3. **Name 01 an ADR explicitly** (#11) and introduce the ADR construct here so 08's threshold choice
   and the capstone's tool-scoping decisions can reference it — cheap, and seeds a construct the
   automation/ztna tracks also want.
