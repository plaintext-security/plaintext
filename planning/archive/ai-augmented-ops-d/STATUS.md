# AI-Augmented Ops "Verdict" conversion — status

*Wave 3, track 3. Drafted in `planning/ai-augmented-ops-d/` (modules 01–10; **module 11 · AI Evaluation
& Observability already landed in Wave 2**). Live `tracks/12-ai-augmented-ops` untouched. Honor-system.*

## Done (this push)
- **DESIGN.md** spine; **10 modules converted** (11 already shipped in Wave 2):
  - 01 hybrid → **Decision/ADR** (Air Canada 2024 liability; routing ADR; confidence ≠ accuracy)
  - 02 local models → **Build-&-Operate** (already measures quality+throughput; points at module 11)
  - 03 prompt patterns → **Adversarial Review + Eval Harness** (held-out scored set + regression gate + injection review)
  - 04 RAG → **Build-&-Operate + Eval** (labelled query set + recall@k/groundedness + gate — the "RAG-without-eval-is-a-vibe" fix)
  - 05 MCP → **Tool-Build** (+ tool-call correctness/hostile-input tests; tool = attack surface → 09)
  - 06 SoC copilot → **Build-&-Operate + end-to-end Eval** (tool-selection + retrieval + answer-quality scorecard — the flagship is now scored)
  - 07 detection-triage → **Eval Harness** (the distributed exemplar module 11 generalizes; named explicitly)
  - 08 SOAR+AI → **Build-&-Operate + Gate** (branch-logic test fixture; never silently no-op; threshold = ADR-shaped)
  - 09 securing-AI → **Red-team-the-AI** (Chevy $1-bot + EchoLeak/CVE-2025-32711; "just prompt it not to" misconception → regression eval)
  - 10 attacking-AI → **Red-team-the-AI + Eval Harness** (garak breadth + promptfoo regression; named incidents)
- **The headline fix:** every build module (03/04/05/06/08) now pairs a minimal eval that plugs into module 11 — "eval gates, not vibes" is now distributed across the track, not concentrated in 07/10.
- Honor-system; build-first (predict-then-reveal only for 01 + the 09/10 misconception); Meridian scrubbed from prose.

## Promotion remaining (for the ai-ops merge)
1. **Lab-env builds** (specs in the labs; build + validate in `plaintext-labs/ai-augmented-ops/`): the paired
   evals for 03/04/06/08 (labelled sets + scorecards + gates wired to module 11's harness shape), 05's tool
   test suite, 09's attack→regression-eval, 10's garak/promptfoo CI suite. Reuse module 11 + 07 patterns.
2. **Add the eval row to the ai-ops capstone rubric** (retrieval/answer quality is *measured*).
3. **Resolve ~5 VALIDATE clusters** (Air Canada ruling, Chevy-bot, EchoLeak/CVE-2025-32711, RAGAS, MCP
   tool-poisoning links). Strip AUTHOR'S NOTE; scrub Meridian from live envs; nav unchanged (11 already wired);
   `mkdocs --strict`; merge.
