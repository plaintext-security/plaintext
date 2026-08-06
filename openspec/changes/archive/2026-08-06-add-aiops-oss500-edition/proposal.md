## Why

Track 11 (ZTNA) was rebuilt in the **OSS-500 self-contained methodology** and the owner promoted that
model — self-contained teaching, near-universal Mermaid diagrams (click-to-enlarge), a per-module
real-incident **case-study seam**, a **"Go deeper"** (formerly "Learn") optional-links section, and
**cognitive-load labs** (flight card → warm-up → folded concepts → "On track if:" rails → recall → one
finish line), all on the honor system. This change applies the same, now-standard treatment to
**Track 12 — AI-Augmented Security Operations** (11 modules). The infrastructure it needs already
ships repo-wide: `VISUAL-CONVENTIONS.md` and `javascripts/mermaid-zoom.js`.

## What Changes

- **Rebuild all 11 Track 12 module READMEs in place** (`tracks/12-ai-augmented-ops/modules/<NN>/README.md`):
  self-contained teaching prose; 2–4 theme-safe Mermaid diagrams per module authored to
  `VISUAL-CONVENTIONS.md`; the external-links section renamed **"Learn" → "Go deeper (~N hrs · optional)"**
  and demoted to optional `[depth]`; and a **case-study seam** anchoring each module to a real AI-security
  incident/finding (e.g. Slack-AI prompt-injection data-exfil, malicious models on Hugging Face,
  the Air-Canada/Chevrolet chatbot failures, OWASP LLM Top-10 / MITRE ATLAS techniques) — mechanism
  taught in our own prose, the attack narrative linked to an authoritative source.
- **Rewrite all 11 lab bodies in the cognitive-load format** at `plaintext-labs/ai-augmented-ops/<NN>/lab.md`
  (the canonical symlink targets), each wrapping its **existing, unchanged** env (Ollama / RAG / MCP /
  garak — `make up`/`demo`/`down` as they really are). Every rail matches real output.
- **Rebuild the track overview** (`tracks/12-ai-augmented-ops/README.md`) with a phase diagram.
- **Authored in place** (promote-and-replace is the decided disposition — no staging directory).
- **Honor system preserved** (no quizzes/tracker/receipts); lab **environments unchanged**; every link validated.

## Non-Goals

- **Not** changing lab **environments** (`Makefile`/`docker-compose.yml`/`data/`) — only `lab.md` instructions.
- **Not** adding grading/quizzes/receipts.
- **Not** re-authoring other tracks or amending `CLAUDE.md`/`CONTRIBUTING.md` here (the methodology is
  already proven; a global rulebook update can follow separately).

## Capabilities

### New Capabilities
- `aiops-track-oss500-curriculum`: The self-contained, diagram-rich prose curriculum for Track 12 —
  the rebuilt overview and 11 module READMEs with the case-study seam and "Go deeper" sections,
  honor-system and original-voice preserved.
- `aiops-track-oss500-labs`: The 11 cognitive-load `lab.md` bodies (in `plaintext-labs`, symlinked into
  `tracks/`), wrapping the unchanged AI lab environments, with authorization notes where an AI system is attacked.

### Modified Capabilities
<!-- None. Track 12 is rebuilt in place; the two new capabilities above govern the result. -->

## Impact

- **`tracks/12-ai-augmented-ops/`** — 11 module `README.md` + the overview rewritten (cheat sheets kept).
- **`plaintext-labs/ai-augmented-ops/`** — 11 `lab.md` bodies rewritten; envs untouched.
- **Untouched:** other tracks, all lab environments, `CLAUDE.md`, `CONTRIBUTING.md`.
