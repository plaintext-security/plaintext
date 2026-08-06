## 1. Scaffold & conventions (gate the rest)

- [x] 1.1 Create `tracks/11-ztna-oss500/` at the same depth as `tracks/11-ztna/`, mirroring the original's
      module directory names (incl. the `10-vpn-ztna-migration` / `10-workload-identity-mtls` quirk);
      finalize the directory name (design D-open) and record it. → dir name resolved to `11-ztna-oss500`;
      all 12 module dirs created.
- [x] 1.2 Author the Plaintext-local **visual-conventions doc** (adapted from OSS-500 `DIAGRAMS.md`):
      Mermaid-as-code, diagram-type-follows-concept table, placement/compression rule, theme-safe/no
      inline colors, one-idea-per-diagram, copyable examples. → `VISUAL-CONVENTIONS.md` at **repo root**
      (out of `docs_dir` to avoid orphan-page `--strict` failures; foldable into CONTRIBUTING on promote).
- [x] 1.3 Write a one-page **methodology delta note** (in the change or the track README preface):
      the three ported moves + the case-study seam + what is *not* ported (quizzes/tracker/receipts).
      → shipped as the "experimental *edition*" admonition atop the track README.

## 2. Track overview

- [x] 2.1 Re-author `tracks/11-ztna-oss500/README.md` in edition style: thesis, a **phase Mermaid
      diagram** (the four-phase dependency chain + where later phases reuse/attack earlier infra),
      module table, phases with phase-project descriptions, capstone + rubric, AI & automation section.
- [x] 2.2 Confirm every cross-track relative link (Foundations, Track 05) resolves from the new depth.
      → `mkdocs build --strict` exits 0; not-yet-authored modules link to the original track meanwhile.

## 3. Lock the reference module end-to-end (`01-zero-trust-principles`)

- [x] 3.1 README: self-contained teaching of the ZT tenets and why the perimeter failed; a "perimeter →
      per-request" diagram; demote current Learn links to optional `[depth]`; exercise the "commodity
      history may still link out" judgment (D3) with a one-line rationale. → 3 Mermaid diagrams
      (attack-chain, PEP/PDP loop, five pillars) + perimeter-vs-request table; NIST/CISA kept as cited
      `[depth]` with an inline per-topic rationale callout.
- [x] 3.2 Standalone `lab.md` to the full cognitive-load template, wrapping the existing
      `plaintext-labs/ztna/01-zero-trust-principles` environment; every rail validated against it. → real
      (non-symlink) file; rails match the actual `make demo` + `data/corp-access-map.md` (the shipped env
      has no `colonial-timeline.md` the old prose referenced — rails corrected to the real stack).
- [x] 3.3 Case-study anchor with a resolving authoritative writeup. → **kept Colonial Pipeline 2021**
      (Blount Senate testimony + CISA/FBI AA21-131A) rather than the design's placeholder Aurora→BeyondCorp:
      it is the original's anchor, stronger for the flat-interior lesson, and already primary-sourced.
- [x] 3.4 **Review gate:** owner reviewed the reference module and **locked the template** ("looks amazing").
      Two refinements folded in and applied track-wide: (a) rename the "Learn" section → **"Go deeper"**;
      (b) **click-to-enlarge Mermaid** (`javascripts/mermaid-zoom.js` + CSS) since diagrams render small.
      **Disposition decided by owner: PROMOTE & REPLACE** — the edition replaces the original Track 11
      (supersedes design D1's "keep both for A/B"). See §10–§12.

## 4. Phase 1 — Principles & identity (`02`–`03`)

- [x] 4.1 `02-identity-control-plane` — README (OIDC/SAML federation self-contained + token-hop sequence
      diagram) + standalone lab (Keycloak) + case study (Golden SAML / IdP-trust abuse).
- [x] 4.2 `03-device-trust-posture` — README (device posture + hardware-bound auth) + lab
      (Tailscale/Headscale, FIDO2) + case study.
- [x] 4.3 Phase-1 project page re-authored; links resolve; `mkdocs build --strict` green.

## 5. Phase 2 — Architectures & access (`04`–`06`)

- [x] 5.1 `04-ztna-architectures` — README (five-model synthesis; broker-topology diagrams; reference
      OSS-500's ZTNA-models note for *shape only*, original prose) + lab + case study.
- [x] 5.2 `05-sase-cloud-delivered` — README + lab (Cloudflare Zero Trust free tier) + case study.
- [x] 5.3 `06-identity-aware-access` — README (no-inbound-ports posture; request-hop diagram) + lab
      (Pomerium/Tailscale) + case study (a VPN-appliance RCE the posture negates).
- [x] 5.4 Phase-2 project page re-authored; links resolve; build green.

## 6. Phase 3 — Segment, govern & monitor (`07`–`09`)

- [x] 6.1 `07-microsegmentation` — README (blast-radius; east-west topology diagram) + lab (Cilium) +
      case study (NotPetya lateral movement).
- [x] 6.2 `08-policy-as-code` — README (policy-decision flowchart) + lab (OPA) + case study.
- [x] 6.3 `09-monitoring-detection` — README + lab (Sigma) + case study.
- [x] 6.4 Phase-3 project page re-authored; links resolve; build green.

## 7. Phase 4 — Migrate, validate & identity (`10`–`12`) + capstone

- [x] 7.1 `10-vpn-ztna-migration` — README (strangler-fig migration state diagram) + lab
      (WireGuard→Pomerium) + case study.
- [x] 7.2 `11-redteam-zt-deployment` — README (attack→regression-check loop) + lab + case study
      (a documented ZTNA/proxy bypass); authorization note in the lab.
- [x] 7.3 `10-workload-identity-mtls` (module 12) — README (SPIFFE/SPIRE attestation sequence diagram;
      reference OSS-500's workload-identity note for shape) + lab + case study.
- [x] 7.4 Re-author the **capstone** (Phase-4 project + rubric) in edition style; confirm the
      no-inbound-ports → policy-as-code → audit-trail loop reads self-contained.

## 8. Verify all authored modules (before promotion)

- [x] 8.1 Resolve every `<!-- VALIDATE -->` marker the authoring agents left (NVD/CISA/CSRB/vendor URLs);
      confirm each link resolves or replace it. Collected markers: mod-02 (CISA SolarWinds, CSRB
      Storm-0558), 03 (LastPass blog), 04 (CISA KEV + 3× NVD CVE), 05 (CISA ED 24-01), + waves as they land.
- [x] 8.2 Consistency pass: every module has the front-matter shape, a "Go deeper" (not "Learn") section,
      2–4+ theme-safe Mermaid diagrams, honor-system (no grading), and a lab whose rails match the real
      `plaintext-labs/ztna/<dir>` env (agents already grounded rails; spot-check the container labs).
- [x] 8.3 Cheat sheets: carry over the original per-module `cheatsheet.md` unchanged (flight card does not
      replace them); confirm each still applies.
- [x] 8.4 Interim `mkdocs build --strict` green with the edition wired in (temporary nav) + diagram spot-check.

## 9. Capstone & track overview finalize

- [x] 9.1 Re-author the **capstone** (Phase-4 project + rubric) in edition style (no-inbound-ports →
      policy-as-code → audit-trail), self-contained; wraps the real `plaintext-labs/ztna/capstone`.
- [x] 9.2 Finalize `tracks/11-ztna-oss500/README.md` module table so every row links to its edition module.

## 10. PROMOTE & REPLACE (owner decision — supersedes design D1)

Preserve the repo's architecture: **README lives in `plaintext` repo; `lab.md` body lives in
`plaintext-labs` and is symlinked into `tracks/`.**

- [x] 10.1 Strip edition-only framing so it reads as the canonical track (not "an experiment"): drop the
      "· OSS-500 edition" review tags, the track README's "experimental edition" admonition + title suffix,
      and each lab's "re-instructs the same env as [original]" self-reference.
- [x] 10.2 `plaintext` repo: replace `tracks/11-ztna/modules/<NN>/README.md` with the edition READMEs and
      `tracks/11-ztna/README.md` with the edition overview. Keep the existing `cheatsheet.md` files.
- [x] 10.3 `plaintext-labs` repo: replace `ztna/<NN>/lab.md` with the edition lab bodies (env files —
      Makefile/compose/data — unchanged). Ensure `tracks/11-ztna/modules/<NN>/lab.md` symlinks still resolve.
- [x] 10.4 Delete `tracks/11-ztna-oss500/` and remove its temporary `mkdocs.yml` nav section (the canonical
      "Zero Trust Network Access" nav stays and now serves the new content).
- [x] 10.5 `mkdocs build --strict` green; render spot-check (overview + a container lab + a design lab).
- [x] 10.6 Reconcile change specs to the promote-and-replace reality (the "original untouched / parallel
      edition" requirements become "edition replaces original in place").

## 11. Commit & push (GATED on branch decision)

- [ ] 11.1 **Branch decision:** both repos are on `feat/replace-localstack-with-floci`. Do NOT commit ZTNA
      onto the floci branch — create a dedicated branch (e.g. `track11-ztna-oss500`) in each repo. **Confirm
      with owner before pushing** (push is outward-facing/hard to reverse).
- [ ] 11.2 Commit `plaintext-labs` (new lab bodies) on its branch; commit `plaintext` (READMEs, overview,
      VISUAL-CONVENTIONS.md, mermaid-zoom.js, extra.css, mkdocs.yml, deletion of 11-ztna-oss500) on its branch.
- [ ] 11.3 Push both branches; open PRs (or per owner's preference).

## 12. Archive the change

- [ ] 12.1 `openspec validate add-ztna-oss500-edition --strict` green; then `openspec archive` (syncs specs,
      moves the change to `openspec/changes/archive/`). Commit the archive.
