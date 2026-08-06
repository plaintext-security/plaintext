## Context

Track 12 (AI-Augmented Security Operations, 11 modules) is in the same starting state Track 11 was
before its rebuild: competent, somewhat self-contained prose, but using "Learn" (not "Go deeper"),
~1 diagram per module, and original-format labs. Its `lab.md` files are **symlinks** into
`plaintext-labs/ai-augmented-ops/<NN>/lab.md`, and **all 11 modules have a real container env**
(Ollama, RAG/Chroma, FastMCP, garak/promptfoo). The OSS-500 methodology and its shipped infrastructure
(`VISUAL-CONVENTIONS.md`, `mermaid-zoom.js`) transfer directly.

## Goals / Non-Goals

**Goals:** rebuild Track 12 to the proven OSS-500 standard (self-contained teaching, diagrams,
case-study seam, "Go deeper", cognitive-load labs) with zero change to lab environments, on the honor
system, every link validated.
**Non-Goals:** changing envs; adding grading; re-authoring other tracks; amending the global rulebook.

## Decisions

### D1 — Author in place (no staging dir)
Because promote-and-replace is the decided disposition (learned from Track 11), author directly into
`tracks/12-ai-augmented-ops/` and `plaintext-labs/ai-augmented-ops/`. This drops the staging directory,
the framing-strip pass, and the promotion copy — the content is canonical from the first keystroke.
Recoverable via git if a module needs redo.

### D2 — Reuse the shipped, global visual + lab infrastructure
`VISUAL-CONVENTIONS.md` and `mermaid-zoom.js` already ship repo-wide (from Track 11). No new infra;
modules just follow the convention and inherit click-to-enlarge.

### D3 — Case-study seam, AI-security edition
Each module anchors to a real AI-security incident/finding and links an authoritative writeup; the
mechanism is taught in our prose. Non-binding starting anchors:

| # | Module | Candidate anchor |
|---|--------|------------------|
| 01 | Hybrid AI pattern | An LLM hallucination with real consequences (Air-Canada tribunal ruling; Chevrolet $1 chatbot) |
| 03 | Prompt patterns | A prompt-injection jailbreak class (OWASP LLM01) |
| 04 | RAG | RAG data-leak / indirect prompt injection via poisoned documents |
| 05 | MCP servers | MCP tool-abuse / over-broad tool scope (a documented finding) |
| 06 | SoC copilot | Slack-AI / M365-Copilot indirect-prompt-injection data-exfil research |
| 09 | Securing the AI | OWASP LLM Top-10 / MITRE ATLAS (authoritative frameworks) |
| 10 | Attacking AI | A garak/promptfoo-class finding; malicious models on Hugging Face (supply chain) |
| 11 | AI evaluation | A model-regression / eval-gap incident |

Rule: never invent a URL — reuse links already in the original module (validated); mark any uncertain
new link `<!-- VALIDATE -->` and resolve before ship.

### D4 — Cognitive-load labs wrap the real, unchanged envs
Every `lab.md` re-instructs the existing env; rails must match real output. AI-specific honesty: where a
step needs a model download or is nondeterministic (LLM output), the rail asserts a *robust* signal
(exit code, a schema field, "a non-empty response") rather than exact text.

### D5 — Honor system, original voice (unchanged from Track 11)
No quizzes/tracker/receipts. Original prose per `CLAUDE.md`; preserve all real links/IDs/gotchas.

### D6 — Reference module first, then parallel fan-out
Author `01-hybrid-ai-pattern` end-to-end as the locked exemplar, then rebuild modules 02–11 with
parallel subagents anchored on it + `VISUAL-CONVENTIONS.md` + each module's real source and env.
Verify (strict build, link validation, rail honesty), then commit/push/merge.

## Risks / Trade-offs

- **Nondeterministic AI labs.** LLM output varies; rails must assert robust signals (D4). Spot-check.
- **Thin case studies for some modules** (e.g. prompt patterns). Use a technique/framework anchor
  (OWASP LLM, ATLAS) rather than force a breach; that is still a real, citable seam.
- **In-place redo risk.** A bad agent output overwrites the original — git-recoverable; the reference
  gate (D6) catches template drift early.
- **CDN Mermaid race (pre-existing).** Same as Track 11: diagrams render on deploy; a local preview may
  stall. Tracked; a self-host follow-up remains open.

## Open Questions

- Cheat sheets: keep the existing per-module `cheatsheet.md` (lean: keep unless a flight card makes one redundant).
- Whether to also self-host Mermaid in this change or keep it a separate follow-up (lean: separate).
