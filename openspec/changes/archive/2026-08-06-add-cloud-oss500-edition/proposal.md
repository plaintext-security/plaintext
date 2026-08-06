## Why

Tracks 11 (ZTNA) and 12 (AI-Aug) were rebuilt in the **OSS-500 self-contained methodology** and merged;
the owner is rolling it across the curriculum. This change applies the same standard to **Track 05 —
Cloud & Container Security** (17 modules). Track 05 is the least visually developed of the three
(module 01 has 0 diagrams), so the diagram uplift is the biggest delta, alongside the "Go deeper"
rename, an explicit case-study seam per module, and cognitive-load labs. The shipped infrastructure
(`VISUAL-CONVENTIONS.md`, `javascripts/mermaid-zoom.js`) is reused.

## What Changes

- **Rebuild all 17 Track 05 module READMEs in place** (`tracks/05-cloud/modules/<NN>/README.md`):
  self-contained teaching prose (largely already present — enhance, don't rewrite); **2–4 theme-safe
  Mermaid diagrams per module** authored to `VISUAL-CONVENTIONS.md` (most start from zero); the external
  "Learn" section renamed **"Go deeper (~N hrs · optional)"** and demoted to `[depth]`; and an explicit
  **case-study seam** anchoring each module to a real cloud incident/CVE (Capital One SSRF→IAM, public
  S3 exposures, CVE-2019-5736 runc escape, Tesla K8s cryptojacking, CISA KEV cloud techniques, etc.).
- **Rewrite all 17 lab bodies in the cognitive-load format** at `plaintext-labs/cloud/<NN>/lab.md` (the
  canonical symlink targets), each wrapping its **existing, unchanged** env — including the **floci**
  emulator (post-migration) for the 8 AWS labs and **kind** for the Kubernetes labs (12/13). Rails match
  real output; external-target steps (CloudGoat/flaws.cloud, real free-tier AWS) are labelled as such.
- **Rebuild the track overview** (`tracks/05-cloud/README.md`) with a phase diagram (3 phases).
- **Authored in place** (promote-and-replace is the decided disposition — no staging dir).
- **Honor system preserved**; lab **environments unchanged** (floci/kind/compose untouched); every link validated.

## Non-Goals

- **Not** changing lab **environments** (`docker-compose.yml`/`Makefile`/floci/kind/`data/`) — only `lab.md` instructions.
- **Not** adding grading/quizzes/receipts.
- **Not** re-authoring other tracks or amending `CLAUDE.md`/`CONTRIBUTING.md` here.

## Capabilities

### New Capabilities
- `cloud-track-oss500-curriculum`: The self-contained, diagram-rich prose curriculum for Track 05 — the
  rebuilt overview and 17 module READMEs with the case-study seam and "Go deeper" sections, honor-system
  and original-voice preserved.
- `cloud-track-oss500-labs`: The 17 cognitive-load `lab.md` bodies (in `plaintext-labs`, symlinked into
  `tracks/`), wrapping the unchanged floci/kind/compose environments, with authorization notes where a
  target is attacked (IAM attack paths, container escape, cloud attack techniques).

### Modified Capabilities
<!-- None. Track 05 is rebuilt in place; the two new capabilities above govern the result. -->

## Impact

- **`tracks/05-cloud/`** — 17 module `README.md` + the overview rewritten (cheat sheets kept).
- **`plaintext-labs/cloud/`** — 17 `lab.md` bodies rewritten; envs untouched.
- **Untouched:** other tracks, all lab environments, `CLAUDE.md`, `CONTRIBUTING.md`.
