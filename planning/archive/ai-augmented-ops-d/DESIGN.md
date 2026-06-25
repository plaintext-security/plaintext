# AI-Augmented Ops Track (12) — "Verdict" conversion spine

*Wave 3, track 3. Converts `tracks/12-ai-augmented-ops` (modules 01–10; **module 11 · AI Evaluation &
Observability already landed in Wave 2**). Drafted in `planning/ai-augmented-ops-d/`; live track untouched.
Honor-system: NO grading/receipts/grade.yaml.*

## Thesis

This track's headline gap (from the type pass): the build spine **builds on vibes** — 04 RAG, 05 MCP,
06 Copilot, 08 SOAR ship working systems with **no eval paired to them**. Wave 2 already built the fix as
a first-class unit (**module 11 · AI Evaluation & Observability** — the shared held-out-set + scorecard +
regression-gate harness). So this conversion's core move is: **pair a minimal eval onto each build module
that plugs into module 11** ("eval gates, not vibes"), name **01 an ADR**, keep **07** as the
distributed eval exemplar, and anchor **09/10 (Red-team-the-AI)** on *named* real AI incidents.

Verbs are mostly **build** (Family II) closing into **attack** (Family V) — so build-first throughout;
reserve predict-then-reveal for 01 (confidence ≠ accuracy) and the 09/10 "just tell it not to" misconception.

## House rules
- Two files; lab.md is the symlinked source-of-truth in `plaintext-labs/ai-augmented-ops/`.
- Preserve real tool content (ollama/llama.cpp, chromadb/nomic-embed, fastmcp, n8n/Shuffle, garak/promptfoo).
- Build-first; predict-then-reveal only for 01 and the 09/10 misconception.
- **Each build module's added eval PLUGS INTO module 11** (reference it; reuse 07's confusion-matrix shape
  and 11's held-out+gate pattern) — don't reinvent the harness.
- Real anchors (named AI incidents), no invented URLs (`<!-- VALIDATE -->`), scrub "Meridian", honor-system.

---

## Per-module spine (convert 01–10; 11 is done)

> Source = `tracks/12-ai-augmented-ops/modules/<same-name>`; draft → `planning/ai-augmented-ops-d/modules/<name>/`.

**01 · The Hybrid AI Pattern** — **Type 11 Decision/ADR** (+ predict-then-reveal).
- **Anchor:** **Air Canada 2024** — its support chatbot confidently invented a bereavement-refund policy; a
  tribunal held the airline liable for what its bot said (cite the ruling/coverage). Predict: *"the model
  was confident — wasn't it right?"* → reveal: **confidence ≠ accuracy**; route by stakes (local / frontier /
  human-in-the-loop), and you own the output. **Deliverable:** name it an **ADR** — the routing decision
  (which tasks go local vs frontier vs human), defended (Context · Options · Decision · Consequences).
  Seeds/reuses the ADR construct (ztna 04 is the template).

**02 · Running Local Models** — **Type 7 Build-&-Operate** (clean; already evaluates).
- The rare build module that already measures (throughput *and* quality against your own alerts/hardware).
  Light touch: name the type, frame "your alerts, your hardware — measure, don't trust a leaderboard," and
  point its quality-measurement at module 11's harness as the generalized version.

**03 · Prompt Patterns** — **Type 14 Adversarial Review + Type 13 Eval Harness**.
- Keep "prompts belong in git, tested like detection rules" + the CI schema-check. **Make #13 real:** add a
  **held-out scored prompt set + a regression gate** (a prompt change that regresses output fails CI) — plug
  into module 11. Adversarial-review half: catch the prompt-injection-via-data and the brittle-format failures.

**04 · RAG** — **Type 7 Build-&-Operate + Type 13 Eval (the canonical "RAG-without-eval-is-a-vibe" fix)**.
- Preserve the chromadb/nomic-embed RAG. **Add the retrieval eval:** a **labelled query set** + **recall@k /
  groundedness** scorecard + a regression gate — runs against module 11's harness. Mental model: a confident
  answer over the wrong context is the silent failure; measure retrieval, not vibes. **Deliverable:** the RAG
  + its retrieval eval.

**05 · Building MCP Servers** — **Type 9 Tool-Build + Type 7** (+ a tool-call test; Red-team link to 09).
- Preserve the fastmcp tool + the tool-trust-boundary prose. **Add a test suite** for tool-call correctness +
  input-validation (a malformed/hostile tool arg is rejected). Note forward to 09 (Red-team-the-AI) that an
  MCP tool is an *attack surface*. **Deliverable:** the packaged MCP tool + its correctness/validation tests.

**06 · SoC Copilot (MCP + RAG)** — **Type 7 Build-&-Operate + Type 13 Eval (the capstone target — must be scored)**.
- Integrate RAG + MCP + LLM with "show its work" auditability. **Add the end-to-end eval** the type pass
  flagged as missing: an answer-quality + retrieval-relevance + tool-selection scorecard (plug into module 11) —
  because the most consequential system is currently the least evaluated. **Deliverable:** the copilot + its
  end-to-end scorecard. (Also: add a "retrieval/answer quality is *measured*" row when the capstone is converted.)

**07 · AI-Assisted Detection & Triage** — **Type 13 Eval Harness (the distributed exemplar; keep)**.
- Already the exemplar (50 alerts vs ground-truth → confusion matrix → monthly re-eval at threshold). Keep it;
  frame it explicitly as the per-system eval that module 11 generalizes, and that 04/06 borrow.

**08 · SOAR + AI** — **Type 7 Build-&-Operate + Type 8 Gate** (+ a branch-logic test fixture).
- Preserve the HITL-threshold playbook + "model fails → escalate, never → no action" gate thinking. **Add a
  test fixture** proving the branch logic holds across alert types (a labelled set of alerts → expected
  branch). **Deliverable:** the operating playbook + the branch-logic test. (Its threshold choice is an
  ADR-shaped decision — reference 01's ADR.)

**09 · Securing the AI You Run** — **Type 15 Red-team-the-AI** (+ Audit→Build→Verify).
- Attack the module-06 copilot (prompt injection / corpus poisoning / tool abuse) → mitigate → document
  residual risk. **Anchor on NAMED incidents:** the **Chevrolet dealership bot** jailbroken to "sell a car for
  $1" (2023) and **agentic prompt-injection** (e.g. the M365-Copilot "EchoLeak" zero-click data-exfil, 2025;
  cite). Predict-then-reveal the "just add a system prompt telling it not to" misconception. **Deliverable:**
  the working exploit → the mitigation → a regression eval (Type 13) that catches it.

**10 · Attacking AI Systems** — **Type 15 Red-team-the-AI + Type 13 Eval Harness** (the strong close).
- garak (statistical probe pass-rates) + promptfoo (expected-output regression suite) = systematic red-team
  *and* eval-as-regression. **Anchor named incidents** (Air Canada / Chevy-$1 / agentic injection) rather than
  generic OWASP/ATLAS. **Deliverable:** the threat model + the garak/promptfoo regression suite.

## Phases (reframed)
- **Phase 1 · Run & ground (01–04 + 11)** — the hybrid ADR, local models, tested prompts, an *evaluated* RAG,
  with module 11 as the shared eval harness.
- **Phase 2 · Build the copilot (05–08)** — MCP tools (tested), the copilot (scored end-to-end), AI triage
  (the eval exemplar), SOAR+AI (branch-tested).
- **Phase 3 · Secure & attack (09–10)** — red-team the copilot you built; systematic attack + regression eval.

## Promotion notes
- Lab-env builds: the paired evals for 03/04/05/06/08 (labelled sets + scorecards + gates, wired to module
  11's harness shape) in `plaintext-labs/ai-augmented-ops/`. Add the eval row to the ai-ops capstone rubric.
- Resolve VALIDATE; scrub Meridian from live envs; strip AUTHOR'S NOTE; nav unchanged (11 already wired); `mkdocs --strict`; merge.
