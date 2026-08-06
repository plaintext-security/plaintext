## Why

Tracks 11 (ZTNA), 12 (AI-Aug), and 05 (Cloud) were rebuilt in the **OSS-500 self-contained methodology**
and merged; the owner is rolling it across the curriculum. This change applies the same standard to
**Track 09 — Python for Security** (9 modules). Track 09 is a recent, deliberate redesign (regrounded on
real Suricata EVE JSON, intermediate-plus altitude, a single evolving spine tool **`sift`**), so this
change is **enhancement, not transformation**: it renames "Learn" → "Go deeper", adds the missing
**diagrams** (the track currently has zero), makes the real-artifact anchor explicit, and rewrites the
labs in the cognitive-load format — while **preserving the `sift` spine, the intermediate-plus altitude,
and the "parse, don't trust" through-line**.

## What Changes

- **Enhance all 9 module READMEs in place** (`tracks/09-python-for-security/modules/<NN>/README.md`):
  keep the strong intermediate-plus prose; add **2–4 theme-safe Mermaid diagrams per module** (data
  pipelines, the `sift` architecture, async concurrency models, parse-don't-validate boundaries, MCP
  architecture); rename "Learn" → **"Go deeper (~N hrs · optional)"** (`[depth]`); and make each module's
  real anchor explicit (real Suricata EVE JSON, `torchtriton`, command-injection, prompt-injection).
- **Rewrite all 9 lab bodies in the cognitive-load format** at
  `plaintext-labs/python-for-security/<NN>/lab.md` (the canonical symlink targets), each wrapping its
  **existing, unchanged** env — **preserving the single evolving `sift` tool** (each lab adds its stage
  to the same tool) and the **intermediate-plus altitude** (objective-level SIGNAL rails, not transcribed
  commands, for a learner who already writes Python and pairs with a copilot).
- **Rebuild the track overview** (`tracks/09-python-for-security/README.md`) with a phase diagram.
- **Authored in place** (promote-and-replace is the decided disposition — no staging dir).
- **Honor system preserved**; lab **environments unchanged**; every link validated.

## Non-Goals

- **Not** changing lab **environments**, the `sift` spine design, the intermediate-plus altitude, the
  "parse, don't trust" through-line, or the dissector Stretch thread.
- **Not** adding grading/quizzes/receipts; **not** re-authoring other tracks or the global rulebook.

## Capabilities

### New Capabilities
- `python-track-oss500-curriculum`: The diagram-enhanced, self-contained prose curriculum for Track 09 —
  the rebuilt overview and 9 module READMEs with "Go deeper" sections and explicit real anchors,
  preserving the intermediate-plus altitude and honor system.
- `python-track-oss500-labs`: The 9 cognitive-load `lab.md` bodies (in `plaintext-labs`, symlinked into
  `tracks/`), wrapping the unchanged envs, preserving the evolving `sift` spine and objective-level
  altitude, with authorization notes where the learner attacks their own tool.

### Modified Capabilities
<!-- None. Track 09 is enhanced in place; the two new capabilities above govern the result. -->

## Impact

- **`tracks/09-python-for-security/`** — 9 module `README.md` + the overview enhanced (cheat sheets kept).
- **`plaintext-labs/python-for-security/`** — 9 `lab.md` bodies rewritten; envs and the `sift` spine unchanged.
- **Untouched:** other tracks, all lab environments, `CLAUDE.md`, `CONTRIBUTING.md`.
