## Why

Plaintext's current editorial identity is the **hybrid / "bridge" model** (enshrined in `CLAUDE.md`):
write original prose *only* for the bridge, and **curate** the raw explanation as an external *Learn*
path rather than teach it in-repo. The sibling course [`oss-500`](../../../oss-500) proves out the
opposite model — **self-contained teaching** (the note teaches the whole mechanism; external links are
optional `[depth]`), near-universal **Mermaid diagrams** authored to a formal convention, and a rigid
**cognitive-load lab template** (flight card → warm-up → concept-folded-per-step → rails → recall →
one finish line). The owner wants to *see* what one Plaintext track looks like rebuilt in that model
before deciding whether to adopt it — for **self-containment** (survives link-rot, one coherent voice,
reads like a book not a reading list) and **far better visualization** to break up walls of text.

This change produces a **parallel "OSS-500 edition" of Track 11 — Zero Trust Network Access** as a
reviewable A/B artifact. ZTNA is a strong pilot because it sits squarely on OSS-500's own turf: OSS-500
already ships a five-model ZTNA note, `d1-ztna-*` broker labs (Pomerium, OpenZiti, NetBird, Boundary,
Teleport), Keycloak identity, and SPIFFE/SPIRE workload identity — so its real notes and diagrams are
available as *shape/reference* (not copy) source for many modules. The original track is left fully
intact; the two editions render side by side so the methodology can be judged on real content, not in
the abstract. The global authoring rulebook is **not** amended here — a promote-or-retire decision
follows review.

## What Changes

- **New parallel track `tracks/11-ztna-oss500/`** — a re-authored edition of all 12 ZTNA modules plus
  the track overview, built to the OSS-500 methodology. The existing `tracks/11-ztna/` is untouched, so
  reviewers can compare module-for-module. The edition mirrors the original's module directories
  (including the existing display-vs-directory numbering, e.g. module 12 in `10-workload-identity-mtls/`).
- **Self-contained teaching prose** — each module `README.md` teaches the mechanism in original prose
  that stands on its own; external resources are demoted from "the spine" to optional `[depth]` links.
  Self-containment is decided **per topic** (design D3): the bridge/synthesis/niche is taught in full;
  a genuinely-better-covered fundamental may still lean on a curated link rather than be out-explained.
- **The case-study seam** — every module is anchored to a **real incident or CVE**; the *mechanism* is
  taught self-contained, but the *narrative of the real attack* links an **authoritative external
  writeup** (breach report, CVE analysis, ATT&CK case). This is the one deliberate link-out: we own
  "how it works," we borrow "here's how it played out in the wild." ZTNA's canonical anchors are rich —
  Operation Aurora → Google BeyondCorp, flat-network lateral movement (NotPetya / Target), IdP-trust
  abuse (Golden SAML / Okta-Lapsus$).
- **Visual/diagram discipline** — adopt OSS-500's `DIAGRAMS.md` conventions (Mermaid-as-code,
  diagram-type-follows-concept, placed atop the section it summarizes with the prose compressed against
  it, theme-safe, one idea per diagram) and ship a Plaintext-local conventions doc. ZTNA is unusually
  diagram-friendly: broker topologies, request-hop sequences (OIDC/PKCE, mTLS handshake, SPIFFE
  attestation), and policy-decision flowcharts all map cleanly to a diagram type.
- **Standalone cognitive-load labs** — each `lab.md` is a **real file (not a symlink)** re-authored to
  the OSS-500 lab template (flight card, warm-up, folded concept, `▸ On track if:` rails, recall, one
  finish line + definition of done). These standalone copies **wrap the same, unchanged
  `plaintext-labs/ztna/` environment** — only the *instructions* are re-skinned (design D2).
- **Nav wiring** — add the edition to `mkdocs.yml` under a clearly-labelled *experimental edition*
  section so `mkdocs build --strict` stays green and both editions are browsable.

## Non-Goals

- **Not** editing the original `tracks/11-ztna/` track (kept intact as the A/B baseline).
- **Not** forking or modifying the `plaintext-labs/ztna/` lab **environments** (docker-compose,
  Makefiles, seed data) — the standalone labs re-instruct the *same* stack.
- **Not** porting OSS-500's **assessment machinery** — no checkpoint quizzes, no objective-code
  tracker, no receipts/credentials. Plaintext's **honor system** is preserved deliberately (design D4).
- **Not** amending the global `CLAUDE.md` / `CONTRIBUTING.md` hybrid-model rules. Whether this model is
  promoted repo-wide, kept as one edition, or retired is an explicit post-review decision (D5).
- **Not** re-authoring any other track.

## Capabilities

### New Capabilities
- `ztna-track-oss500-curriculum`: The self-contained, diagram-rich prose curriculum for the OSS-500
  edition of Track 11 — the re-authored track overview and 12 module READMEs, plus the Plaintext-local
  visual-conventions doc, authored under self-contained-teaching + case-study-seam rules while
  preserving the honor system and original-voice requirements.
- `ztna-track-oss500-labs`: The standalone (non-symlinked) cognitive-load `lab.md` files for the
  edition — flight-card/rails/recall structure wrapping the unchanged `plaintext-labs/ztna/`
  environments, with authorization notes and honor-system self-verification preserved.

### Modified Capabilities
<!-- None. The original Track 11 prose and the plaintext-labs environments are unchanged; this change
     adds a parallel edition governed entirely by the two new capabilities above. -->

## Impact

- **`tracks/11-ztna-oss500/`** — new: 1 track `README.md` + 12 module dirs (`README.md` + real
  `lab.md` + optional `cheatsheet.md`), mirroring the original's directory names.
- **`tracks/` (repo root)** — new visual-conventions doc (standalone `tracks/VISUAL-CONVENTIONS.md` or a
  `CONTRIBUTING.md` appendix — decided in D-open).
- **`mkdocs.yml`** — new nav section for the experimental edition.
- **Untouched:** `tracks/11-ztna/**`, `plaintext-labs/**`, `CLAUDE.md`, `CONTRIBUTING.md`.
- **Reviewer deliverable:** both editions live in one built site for module-for-module comparison; a
  promote/retire recommendation is captured at the review gate.
