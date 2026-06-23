# Curriculum redesign — conversion roadmap

*Branch: `feat/verdict-redesign` (both repos). The goal: convert all 13 tracks to the type-driven model
(`MODULE-TYPE-LIBRARY.md` + `AUTHORING.md`). This sequences the work from the foundation we just laid
through full conversion — the prioritized-gap work first, then every remaining track to end-state.*

## End-state (what "converted" means)

A track is **converted** when:
1. Every module is **tagged with a type** and **written to that type's template** (predict-then-reveal
   vs build-first scaled correctly per `AUTHORING.md`).
2. Every module is **anchored** on a real, cited artifact — no `VALIDATE` markers left.
3. The track's **shape mismatches are fixed** and its **coverage-gap modules are added** (per
   `type-pass/<track>.md`).
4. Every lab is **built and validated** (`make demo` green), with **observable, self-checkable Success
   criteria** (honor system — no grader), living in `plaintext-labs/<track>/`.
5. `mkdocs build --strict` is green and the nav is updated.

The curriculum is **done** when all 13 tracks meet that bar and the four systemic constructs (Eval
Harness, Migration, ADR, Adversarial Review) are present everywhere the type pass flagged them.

## Principles

- **Two axes of work**: *construct-driven* (add a missing type wherever it belongs — fast, high-leverage)
  and *track-driven* (convert one track fully). We do the highest-leverage **constructs first**, then go
  **track by track** to end-state. This is the "prioritized roadmap, then move past it."
- **Don't lose what's good.** Tracks that are already coherent (AD, endpoint, python) need *light* touches
  (anchors, an eval, an ADR), not rewrites. Convert effort to where the mismatches are.
- **Prose and lab ship together.** A converted module with an unvalidated lab is half-done (the standing
  rule). Each module: author prose → build/colocate lab → `make demo` → observable Success criteria.
- **Proven pipeline** (from the cloud/foundations prototypes): write a track `DESIGN.md` spine (anchors +
  per-module type) → author modules to type (parallelizable) → colocate/build labs → scrub/validate →
  `STATUS.md`. Reuse it per track.

## The waves

### Wave 0 — Foundation ✅ (this branch)
- Branches in both repos · the filled-out **type library** (16 templates) · **`AUTHORING.md`** (v2 guide)
  · this roadmap · the completed **type pass** (`type-pass/`) · `CONTRIBUTING.md` pointed at `AUTHORING.md`
  · the **grade system fully removed** (honor-system; no receipts/credentials). **✅ DONE.**

### Wave 1 — Land the two prototypes (prove the promotion pipeline end-to-end)
- **Foundations: ✅ DONE.** Promoted into `tracks/00-foundations` — 02→ADR & 10→Tool-Build retrofits applied,
  all VALIDATE links web-verified, AUTHOR'S NOTE stripped, 4 lab backfills built (cert-check, encoded-PS
  4688 event, SUNBURST beacon capture, ECB-vs-salt step), `mkdocs --strict` green. (Also: the two labs
  clones were consolidated — `cloud-rebalance` merged in, so the **KMS module 17 lab** is already on the
  branch; both clones + the submodule point at `feat/verdict-redesign`.)
- **Cloud: ⏳ pending.** `cloud-track-d/` is prose-complete in `planning/`; promote it (same pipeline) —
  resolve VALIDATE, strip notes, build the cloud lab backfills, and convert/wire the already-merged KMS
  module 17 (currently an orphan lab in the old form). **Folded into Wave 3** now that Wave 3 leads with the build tracks.

### Wave 2 — The systemic constructs
- **Eval Harness (#13): ✅ DONE** — *the #1 gap.* Built the flagship **ai-ops 11 · AI Evaluation &
  Observability** module (held-out corpus + `eval.py` + a CI regression gate; `make demo` goes GREEN on a
  good system and RED on a planted regression where accuracy hides the recall collapse) and
  **upgraded-in-place** the four detection modules — **defensive 09, cloud 15, malware 13,
  active-directory 09** — each now ships a held-out corpus + precision/recall/FP scorecard + a regression
  gate (RED on a too-broad or too-narrow rule). `mkdocs --strict` green; both repos committed.

The other three constructs are **built during their track conversions in Wave 3** (where they belong),
not as a separate construct-only push:
- **Migration (#12)** → built in the ztna (VPN→ZTNA), automation (click-ops→IaC), cryptography (PQC), and
  endpoint (fleet-rollout) conversions.
- **Decision/ADR (#11)** → seeded at **foundations 02 (✅ done)**; retrofit automation 01, ai-ops 01,
  cryptography, endpoint during their conversions. **ztna 04 is the template.**
- **Adversarial Review (#14)** → added as a lab beat in offensive 17, defensive, forensics, malware during
  their conversions. **python 10 is the template.**

### Wave 3 — Full track conversion, ordered by leverage × mismatch-load
Each track gets the proven pipeline (DESIGN spine → author to types → build/validate labs → STATUS).
Order and per-track scope below.

## Per-track conversion plan

*Health = how close the shipped track already is. Size = S/M/L. "Already-coherent" tracks are light.*

*Order reflects the maintainer's Wave-3 priority: **automation, ztna, ai-augmented-ops first.** ✅ marks
work already landed in earlier waves.*

| Order | Track | Type health | Fix (mismatches) | Add (gap modules) | Size | Status |
|---|---|---|---|---|---|---|
| ✅ | 00 foundations | **converted** | 02→ADR ✅, 10→Tool-Build ✅ | — | S | **done (Wave 1)** |
| **1** | **10 automation** | build/gate spine | 01→Autopsy, 04 drift, 05 running-gate, 09 eval | **click-ops→IaC Migration (#12)** | M | **✅ drafted** (`automation-d/`) · promote pending |
| **2** | **11 ztna** | design-heavy, healthy | 09 add drift/eval | **VPN→ZTNA Migration (#12)**, **Red-team-your-design (#10)**; ztna 04 = ADR template | M | **✅ drafted** (`ztna-d/`) · promote pending |
| **3** | **12 ai-augmented-ops** | build-on-vibes | 04/05/06/08 pair an eval; name 01 an ADR | AI Eval & Observability (#13) ✅ | L | **✅ drafted** (`ai-augmented-ops-d/`) · promote pending |
| 4 | 05 cloud | prototyped in `planning/` | 02/04 build halves, 01 misconception, 15 eval ✅ | KMS module 17 (#7) wire-in + convert | M | pending (2nd prototype) |
| 5 | 01 offensive | strong spine (#3/#5) | 17→Adv-Review, 01/03→Tool-Build, make detect artifacts deliverables | a light Eval/verify beat | M | |
| 6 | 02 defensive | strong build/detect | 08/10 → Eval Harness (09 eval ✅) | Detection-Drift (#16), Review-AI-Detections (#14) | L | |
| 7 | 08 cryptography | misconception spine | 03 add failure anchor | **PQC/crypto-agility Migration (#12)**, a Crypto ADR | M | |
| 8 | 04 malware | reconstruct spine | 13→Eval Harness ✅, 01→ADR; scrub Meridian | named-family Autopsy opener, Review-AI-analysis (#14) | M | |
| 9 | 03 forensics | reconstruct spine | 02→Build/ADR, 13 worksheet→hands-on | Forensic Eval Harness (#13), Trust-the-AI-summary (#14) | M | |
| 10 | 06 active-directory | clean (all ✓) | (light); 09 eval ✅ | Brownfield Tiering (#12), Posture Drift (#16) | M | |
| 11 | 07 endpoint | clean (all ✓) | Windows coverage past 02 | Drift module (#16), Fleet-Migration (#12); 01/03 → ADR | M | |
| 12 | 09 python | cleanest Tool-Build | 09→exercise Red-team-AI | name an Eval Harness; optional async build | S | |

*Rationale: the maintainer prioritized the **build/design/AI tracks (automation, ztna, ai-augmented-ops)**
first — they're where the new constructs (Migration, ADR, Build-&-Operate, the Eval Harness already
landed) do the most work and the curriculum is least mature. Cloud (the second prototype, already
prose-drafted) and the analysis tracks follow; the already-coherent tracks (AD, endpoint, python) come
last with light retrofits. Each conversion builds its own Migration/ADR/Adversarial-Review pieces.*

## Per-module conversion workflow (reuse the proven pipeline)

1. Write/extend the track `DESIGN.md`: assign each module a **type** + a **real anchor** (from `SOURCES.md`).
2. Author the module to its type's template (parallelizable across modules; one author per module).
3. Build or colocate the lab; **run `make demo`**; make the Success criteria observable and self-checkable.
4. Resolve `VALIDATE` links; scrub any fictional persona; honesty pass.
5. `mkdocs build --strict`; update nav; write the track `STATUS.md`.

## Definition of done & tracking
- Per-track `STATUS.md` tracks: modules converted, mismatches fixed, new modules added, labs validated,
  `VALIDATE` resolved.
- A top-level checklist (this file's per-track table) tracks wave progress.
- The curriculum is done when every row is complete and the four constructs are present everywhere flagged.

## Non-goals / risks
- **Don't over-rotate to Verdict.** Half the curriculum is build/design/measure — forcing predict-then-
  reveal there is the failure mode `AUTHORING.md` guards against. Pick the type honestly.
- **Lab validation is the bottleneck**, not prose. Budget real time for `make demo` on every lab,
  especially the new Eval Harness and Migration labs (corpora, multi-state environments).
- **Keep `main` shippable.** Convert on `feat/verdict-redesign`; merge track-by-track once each is green,
  so the live site never regresses.
- **CONTRIBUTING.md** points module-shape questions at `AUTHORING.md` (✅ Wave 0) so the new shapes pass review.
- **Honor system** — no grading/receipts/credentials anywhere (✅ Wave 0); a lab is "done" by observable,
  self-verified Success criteria, not a grader.
