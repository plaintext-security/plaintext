## Context

Two educational models are in tension in this workspace:

- **Plaintext (hybrid / bridge)** — `CLAUDE.md` makes a philosophical case for *not* re-teaching what
  the internet covers better: write original prose only for the bridge (mental model, practitioner
  translation, synthesis, judgment), and curate the raw explanation as an external *Learn* path. The
  worry it guards against is "waste" (out-explaining the best free explainer) and "thin" (a link list
  that doesn't teach).
- **OSS-500 (self-contained)** — one narrow domain on one reference stack (kind + Helm), authored as
  ~40 notes that teach the whole mechanism, external links demoted to optional `[depth]`. It adds a
  formal Mermaid-diagram convention (39/40 notes carry a diagram) and a cognitive-load lab template. It
  can afford full self-containment because it is *one integrated stack*, so teaching-it-all is natural
  and non-redundant.

The owner wants the self-contained + visual feel on a Plaintext track without paying OSS-500's
assessment overhead (quizzes/tracker/receipts, which Plaintext deliberately removed). **Track 11
(Zero Trust Network Access, 12 modules, 4 phases)** is chosen because it maps almost one-to-one onto
OSS-500's own material — its five-model ZTNA note, the `d1-ztna-*` broker labs (Pomerium, OpenZiti,
NetBird, Boundary/Teleport), Keycloak identity, OPA authz, and SPIFFE/SPIRE workload identity — so
OSS-500's real notes and diagrams are available as shape/reference (not copy) source.

Key repo fact that shapes the design: **Track 11 `lab.md` files are symlinks into `plaintext-labs/`**
(`tracks/11-ztna/modules/<m>/lab.md -> ../../../../plaintext-labs/ztna/<m>/lab.md`). Prose lives in
real `README.md` files in this repo; lab *instructions* live in `plaintext-labs`. So a prose/diagram
change is zero-labs-impact, and only the lab-template change reaches labs — via copies, not edits.

Note the original track's directory numbering has a known quirk: module **12** (Workload Identity &
mTLS) lives in `modules/10-workload-identity-mtls/` alongside `modules/10-vpn-ztna-migration/`. The
edition mirrors the existing directory names verbatim so nav and cross-links stay predictable.

## Goals / Non-Goals

**Goals**
- A complete, browsable, side-by-side **A/B edition** of Track 11 in the OSS-500 model.
- Prove three separable moves on real content: (1) self-contained teaching, (2) diagram discipline,
  (3) the cognitive-load lab template — plus the **case-study seam**.
- Zero risk to the shipped track and the shipped lab environments.

**Non-Goals**
- Changing the original track, the lab environments, the honor system, or the global rulebook.
- Adopting OSS-500's grading/tracker/receipt machinery.

## Decisions

### D1 — A parallel track directory, both editions in nav for A/B
The edition lives at `tracks/11-ztna-oss500/`, a sibling of `tracks/11-ztna/` at the **same directory
depth** so cross-track relative links (`../../../00-foundations/…`) port unchanged, mirroring the
original's module directory names. Both editions are wired into `mkdocs.yml` nav; the new one sits
under a clearly-labelled *"Zero Trust Network Access — OSS-500 edition (experimental)"* section.
Rationale: `mkdocs build --strict` fails on orphan pages, and side-by-side rendering is the whole point
of a review artifact. The original is never edited.

### D2 — Standalone labs re-instruct the *same* environment; no env fork
The edition's `lab.md` files are **real files, not symlinks**, re-authored to the cognitive-load
template. They point the learner at the **same** `plaintext-labs/ztna/<module>/` environment
(`make up`/`demo`/`down`) — we re-skin the *instructions*, we do **not** copy or fork the compose/Make/
seed stack. Every `▸ On track if:` rail must map to a command the real environment actually supports.
Rationale: the methodology is about pedagogy, not the container stack; forking environments would
multiply maintenance and is out of scope.

### D3 — Self-containment is decided per topic, not blanket
Author each module against this rule:

```
   well-covered fundamental  ──►  teach the bridge; a curated link may still carry the deep basics
   bridge / synthesis / niche ──►  teach it fully, self-contained; links are optional [depth]
   the REAL ATTACK (case study) ──►  link an authoritative external writeup (the one deliberate link-out)
```

Rationale: keeps the good of the hybrid model (don't out-explain the best free explainer of OIDC or
WireGuard) while buying self-containment where Plaintext adds value (the synthesis across the five ZTNA
models, the OSS↔managed-cloud translation, the judgment). It also makes the edition an honest test: if
reviewers find the per-topic line hard to hold, that is a finding about the model.

### D4 — Adopt the diagram + lab-template discipline; do NOT adopt the assessment machinery
Port from OSS-500: the `DIAGRAMS.md` conventions and the lab template (flight card, warm-up retrieval,
concept-folded-per-step, `▸ On track if:` rails, recall check, one finish line + definition of done).
**Do not** port: checkpoint quizzes, the objective-code tracker, or any receipt/credential. Plaintext's
honor-system stance (measurable self-checked success criteria + a committed portfolio deliverable) is
retained verbatim. Rationale: the visual + cognitive-load gains are separable from the grading model,
and the grading model was removed on purpose.

### D5 — The global rulebook is not touched; promote/retire is a post-review gate
`CLAUDE.md`'s hybrid-model section and `CONTRIBUTING.md`'s templates are **unchanged** by this change.
After review, a separate change either (a) promotes the model — amending global rules and scheduling
other tracks — (b) keeps it as one edition, or (c) retires it. Rationale: don't rewrite the
constitution to run an experiment.

### D6 — Incremental, phase-gated execution with a locked reference module
Author order: scaffold + conventions → track overview → **one reference module end-to-end to lock the
template** (`01-zero-trust-principles`, which also exercises the "principles module still links out for
the commodity history" judgment and carries the strongest case-study anchor) → then roll phase by
phase. A module is "done" only when: self-contained prose + ≥1 diagram + case-study anchor to a real
incident/CVE + a standalone lab that wraps a real, validated environment + all links resolve.
Rationale: a locked reference prevents 12 modules drifting into 12 shapes; phase gates let the owner
review and course-correct before the whole track is spent.

## Reference module map (case-study anchors)

Non-binding starting anchors so the case-study seam is concrete (finalized per module at authoring):

| # | Module | Candidate real-world anchor (authoritative writeup to link) |
|---|--------|-------------------------------------------------------------|
| 01 | Zero Trust Principles | **Operation Aurora (2009) → Google BeyondCorp** origin (the BeyondCorp papers) |
| 02 | Identity as the Control Plane | Golden SAML / SolarWinds IdP-trust abuse, or Okta–Lapsus$ 2022 |
| 03 | Device Trust & Posture | A stolen-credential-from-unmanaged-device intrusion with a public writeup |
| 06 | Identity-Aware Access | A VPN-appliance RCE that ZTNA's no-inbound-ports posture negates (e.g. a Pulse/Ivanti CISA KEV entry) |
| 07 | Microsegmentation | **NotPetya (2017)** flat-network lateral movement (Andy Greenberg / WIRED) |
| 11 | Red-team Your ZT | A documented ZTNA/identity-aware-proxy bypass CVE or research writeup |
| 12 | Workload Identity & mTLS | A service-to-service spoofing / SSRF-to-internal case answered by SPIFFE identity |

## Risks / Trade-offs

- **Scale.** 12 READMEs + 12 labs + overview + conventions is a multi-session build. *Mitigation:* D6
  phase gates + a locked reference; the change can pause between phases with value already shipped.
- **Redundancy / "waste."** The exact failure the hybrid model warns about — out-explaining a commodity
  basic (OIDC, WireGuard). *Mitigation:* D3's per-topic rule; call it out at the review gate.
- **Two-edition drift & confusion.** A long-lived duplicate track burdens maintenance and can confuse
  learners. *Mitigation:* label experimental (D1); force a promote/retire decision (D5).
- **Lab/instruction mismatch.** A re-skinned lab whose rails don't match the real stack. *Mitigation:*
  D2 requires every rail map to a real command; validate against the actual `plaintext-labs/ztna` env.
- **Voice / originality.** OSS-500 is the owner's own repo, but `CLAUDE.md`'s "original prose, no
  copying" rule still binds — reference OSS-500 for *shape and diagram source*, write Plaintext's prose.
- **Mermaid loads from an external CDN (pre-existing, site-wide — surfaced during the reference-module
  review).** Material 9.7.6 pulls `https://unpkg.com/mermaid@11/dist/mermaid.min.js` at runtime and
  renders on its first `document$` pass. On a slow/cold CDN load that pass can run *before* `window.mermaid`
  is defined, leaving `.mermaid` blocks permanently empty (the source is already consumed and cannot be
  recovered client-side). Reproduced in local preview with the zoom script **disabled**, so it is *not*
  caused by this change. The zoom feature (verified working against real Mermaid SVG) sits on top of
  whatever Material renders. *Candidate fix, separate change:* self-host / vendor `mermaid.min.js` and load
  it before Material's pass (also aligns with the repo's offline/reproducible + no-external-asset ethos).

## Open Questions

- **Conventions-doc home:** standalone `tracks/VISUAL-CONVENTIONS.md`, or an appendix in
  `CONTRIBUTING.md`? (Leaning standalone for the experiment, foldable into CONTRIBUTING on promote.)
- **Directory name:** `11-ztna-oss500` vs `11-ztna-edition-b` vs `experiments/ztna-selfcontained`.
  (Leaning `11-ztna-oss500` for reviewer clarity; nav labels are explicit so there is no number clash.)
- **Cheat sheets:** re-author each `cheatsheet.md`, or carry them over unchanged? (Lean: carry over
  unless the flight card makes a cheat sheet redundant.)
