## Context

Track 09 (Python for Security, 9 modules) is a recent, deliberate redesign: regrounded on real Suricata
EVE JSON, **intermediate-plus** altitude (the learner already writes Python and pairs with an AI copilot),
and a **single evolving spine tool `sift`** (ingest EVE → validate → enrich → score → serve CLI/API/MCP)
grown one capability per module, with a "parse, don't trust" through-line (pydantic at input M2,
instructor at LLM output M7, pydantic-evals at measurement M9) and a dissector Stretch thread. Its
`lab.md` files are symlinks into `plaintext-labs/python-for-security/`. Structurally it matches the other
tracks' pre-rebuild state (uses "Learn", **zero diagrams**), so it fits the visual + Go-deeper treatment
— but its labs are fresh and carry a through-line, so the rebuild must preserve, not overwrite, the design.

## Goals / Non-Goals

**Goals:** apply the proven OSS-500 form (self-contained prose, 2–4 diagrams/module, "Go deeper",
cognitive-load labs) while **preserving** the `sift` spine, intermediate-plus altitude, "parse don't
trust" through-line, and dissector Stretch. Honor system; every link validated.
**Non-Goals:** changing envs, the spine design, the altitude, or the through-line; grading; other tracks.

## Decisions

### D1 — Author in place; reuse shipped infra
Author directly into `tracks/09-python-for-security/` and `plaintext-labs/python-for-security/`. Reuse the
global `VISUAL-CONVENTIONS.md` + `mermaid-zoom.js`.

### D2 — Preserve the `sift` spine (the load-bearing constraint)
Each lab ADDS its module's capability to the SAME evolving `sift` tool — labs are NOT reframed as
standalone projects. The reference module 01 lab lands `sift` v0; every later lab continues it. Agents are
briefed explicitly: continue `sift`, keep the "What you add to sift" framing and the through-line.

### D3 — Preserve the intermediate-plus altitude
Cognitive-load rails are **objective-level SIGNALS** (e.g. "▸ On track if: the validator rejects the
truncated event"), NOT transcribed commands. The learner derives the how with their copilot. This is the
one deviation from the other tracks' labs, and it is deliberate — hand-holding would fight the charter.

### D4 — Diagrams are the biggest delta (track has zero)
Add 2–4 theme-safe Mermaid diagrams per module: the `sift` pipeline/architecture, the parse-don't-validate
boundary, async fan-out/backoff, `shell=True`-vs-arg-list, one-core-two-surfaces, the MCP sequence, the
eval/property/supply-chain gates. Very apt for a Python-craft track.

### D5 — Anchors are real artifacts, not forced breaches
Track 09 is a craft track; the anchor is the real Suricata EVE data / a real tool or CVE the code
processes (`torchtriton`, command-injection CWE-78, prompt-injection), not a forced incident narrative.
Reuse existing validated links; agents do NOT web-verify inline (a Track-12 agent stalled on that); mark
uncertain new links `<!-- VALIDATE -->`.

### D6 — Reference module first, then parallel fan-out
Author `01-modern-toolchain` end-to-end as the locked exemplar (README + spine-preserving cognitive-load
lab), then rebuild 02–09 with parallel subagents anchored on it. Verify (strict build, links, spine
preserved), then commit/push/merge — and (per the owner's established QA) a self-containment audit before
merge.

## Risks / Trade-offs

- **Overwriting fresh, deliberate work.** The redesign is recent; the labs have a through-line. *Mitigation:*
  D2/D3 briefs preserve the spine + altitude; a self-containment + spine-integrity check before merge.
- **Altitude drift.** Agents may over-hand-hold (transcribed commands) against the intermediate-plus intent.
  *Mitigation:* explicit D3 instruction + spot-check.
- **CDN Mermaid race (pre-existing).** Renders on deploy; local preview may stall. Separate follow-up.

## Open Questions

- Cheat sheets: keep existing per-module `cheatsheet.md` (lean: keep).
- The optional **dissector** Stretch thread stays in each lab's Stretch — do not fold it into the core.
