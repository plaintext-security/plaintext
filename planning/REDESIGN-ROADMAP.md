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
  · this roadmap · the completed **type pass** (`type-pass/`). **Next:** amend `CONTRIBUTING.md` to point
  module-shape questions at `AUTHORING.md` (one paragraph).

### Wave 1 — Land the two prototypes (prove the promotion pipeline end-to-end)
The cloud (`cloud-track-d/`) and foundations (`foundations-d/`) Verdict rewrites are prose-complete in
`planning/`. Promote them into `tracks/` and build their labs:
- Resolve all `VALIDATE` links; strip `AUTHOR'S NOTE` blocks.
- Apply the foundations retrofits the type pass found: **02 → Decision/ADR**, **10 → Tool-Build** (name them).
- Build/validate the lab backfills listed in each `STATUS.md` (cloud 02/04/07/11/12/15 targets; foundations
  01 cert-check, 06 beacon capture, 09 ECB step) in `plaintext-labs`.
- Add the cloud **KMS/Data-Protection** module (the one real topical hole; Type 7+3).
- `mkdocs build --strict` green; nav updated. **Outcome:** two fully-converted tracks + a repeatable promotion checklist.

### Wave 2 — The four systemic constructs (the prioritized roadmap, construct-driven)
Highest leverage; each spans tracks. Build the construct once, apply it everywhere flagged.
1. **Eval Harness (#13)** — *the #1 gap.* Build a dedicated **ai-ops "AI Eval & Observability" module**
   (shared held-out set + scorecard + regression gate that 04/05/06 plug into; add an eval row to the
   ai-ops capstone). Then **upgrade-in-place**: defensive 09, cloud 15, malware 13, AD 09 each gain a
   held-out corpus + regression gate. Generalise ai-ops 07 as the template.
2. **Migration (#12)** — build the **ZTNA VPN→ZTNA** module (the missing centerpiece) first; then
   **automation click-ops→gated-IaC**, **cryptography PQC/crypto-agility**, **endpoint fleet-rollout**.
3. **Decision/ADR (#11)** — seed the construct at **foundations 02** (done in Wave 1), then retrofit the
   latent ones: automation 01, ai-ops 01, a cryptography "choosing your crypto", endpoint 01/03. Copy
   ztna 04's format.
4. **Adversarial Review (#14)** — generalise **python 10**'s pattern into a real lab beat at **offensive
   17 (reporting)**, **defensive (review AI detections)**, **forensics (trust the AI summary?)**, **malware**.

### Wave 3 — Full track conversion, ordered by leverage × mismatch-load
Each track gets the proven pipeline (DESIGN spine → author to types → build/validate labs → STATUS).
Order and per-track scope below.

## Per-track conversion plan

*Health = how close the shipped track already is. Size = S/M/L. "Already-coherent" tracks are light.*

| Order | Track | Type health | Fix (mismatches) | Add (gap modules) | Size | Wave |
|---|---|---|---|---|---|---|
| — | 05 cloud | prototyped | 02/04 build halves, 01 misconception, 15 eval | KMS (#7) | M | 1 |
| — | 00 foundations | prototyped | 02→ADR, 10→Tool-Build | — | S | 1 |
| 1 | 01 offensive | strong spine (#3/#5) | 17→Adv-Review, 01/03→Tool-Build, make detect artifacts deliverables | a light Eval/verify beat | M | 3 |
| 2 | 02 defensive | strong build/detect | 08/09/10 → Eval Harness | Detection-Drift (#16), Review-AI-Detections (#14) | L | 3 |
| 3 | 12 ai-augmented-ops | build-on-vibes | 04/05/06/08 pair an eval; name 01 an ADR | **AI Eval & Observability (#13)** | L | 2→3 |
| 4 | 11 ztna | design-heavy, healthy | 09 add drift/eval | **VPN→ZTNA Migration (#12)**, promote red-team-your-design (#10) | M | 2→3 |
| 5 | 10 automation | build/gate spine | 01→Autopsy, 04 drift, 05 running-gate, 09 eval | **click-ops→IaC Migration (#12)** | M | 2→3 |
| 6 | 08 cryptography | misconception spine | 03 add failure anchor | **PQC/crypto-agility Migration (#12)**, a Crypto ADR | M | 3 |
| 7 | 04 malware | reconstruct spine | 13→Eval Harness, 01→ADR | named-family Autopsy opener, Review-AI-analysis (#14) | M | 3 |
| 8 | 03 forensics | reconstruct spine | 02→Build/ADR, 13 worksheet→hands-on | Forensic Eval Harness (#13), Trust-the-AI-summary (#14) | M | 3 |
| 9 | 06 active-directory | clean (all ✓) | (light) | AD Detection Eval (#13), Brownfield Tiering (#12), Posture Drift (#16) | M | 3 |
| 10 | 07 endpoint | clean (all ✓) | Windows coverage past 02 | Drift module (#16), Fleet-Migration (#12); 01/03 → ADR | M | 3 |
| 11 | 09 python | cleanest Tool-Build | 09→exercise Red-team-AI | name an Eval Harness; optional async build | S | 3 |

*Rationale for the order: most-mismatched/highest-leverage and most-marketable first (offensive,
defensive, ai-ops), the Migration-dependent build tracks next (ztna, automation, crypto), then the
already-coherent tracks last with light retrofits. ai-ops/ztna/automation/crypto conversions consume the
Wave-2 constructs they need.*

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
- **CONTRIBUTING.md amendment is a prerequisite** for promotion (so the new shapes pass review) — do it in Wave 1.
