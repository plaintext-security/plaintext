# Conversion Audit — Remediation List

*Produced 2026-06-24. A 13-track audit (one auditor per track) of every module's prose (README)
and lab (lab.md + env) against the hybrid-model **Definition of done** in `CLAUDE.md`/`CONTRIBUTING.md`.
Per-track detail lives in [`planning/audit/<NN-track>.md`](audit/). This file is the consolidated,
**reconciled** action list.*

## Reconciliation — what the auditors got wrong (don't chase these)

The auditors were reliable on **prose** but several over-flagged **lab state** from stale `lab.md`
banners without checking the live `plaintext-labs` submodule or the survey results. Verified ground truth:

- **De-Meridian is complete.** `grep -rli meridian plaintext-labs` = **0**. Ignore every "labs still
  ship Meridian / `corp-domain.md` won't resolve" claim (forensics, AD auditors). Already done.
- **Forensics/python/defensive labs are fetch-wired to real data** (loghub, EVTX-ATTACK-SAMPLES, MTA
  PCAPs, abuse.ch, Suricata). Ignore "labs ship synthetic stand-ins" for these — dimension-2 closed them.
- **The "missing" lab envs exist.** forensics 15/16, AD 12/13, ai-ops 03 all have Makefiles. Ignore
  "no env built."
- **Lab build failures were version bit-rot, not content** — diagnosed from the first survey and
  **fixed in labs PR #17** (osquery/plaso/zeek/chainsaw/step/testssl re-pins, etc.). Re-run the survey
  after PR #17 merges before acting on any "lab broken" item.
- **"Validation deferred / to-be-built banner"** items (endpoint 12/13, crypto 11/12, python ~8) are
  **dimension 3** — the Labs Survey + `.ci-demo` promote loop already in flight handles these. The fix
  is to *drop the stale banners* once the survey is green, not to rebuild.

What remains below is the **real** work, prose-heavy and high-confidence.

---

## A. Systemic / cross-cutting (fix once, applies broadly)

### A1 — Normalize the type-tag scheme  ·  CONSISTENCY · high confidence
Two schemes coexist: `*Type N · …*` (144 modules) and `*Variant D · …*` (**34 modules**). Normalize the
34 to `*Type N · …*` (or formally adopt one scheme in `CONTRIBUTING.md`). The 34:
- **00-foundations:** 01, 03, 04, 05, 06, 07, 08, 09, 11, 12
- **05-cloud:** 01–16 (all except 17)
- **10-automation:** 01, 03, 09, 10  ·  **11-ztna:** 01, 04  ·  **12-ai-augmented-ops:** 05, 10

### A2 — Decide the formatting tier  ·  EDITORIAL
**4 DELUXE** modules (offensive/06, defensive/08, defensive/18, defensive/19) carry the rich Material
furniture — `!!! abstract "In 60 seconds"`, `!!!/???` admonitions, `!!! question "Check yourself"` —
that the other **174 BASELINE** modules lack. This is the inconsistency that prompted the audit.
**Decision needed:** (a) roll the deluxe pattern out to all modules (big, high-polish), (b) keep the 4
as sanctioned exemplars and document it, or (c) strip them to baseline for uniformity.
*Recommendation:* (b) now + (a) incrementally — the deluxe furniture is genuinely better; make it the
template for new/edited modules rather than a blocking back-fill.

### A3 — Fill/remove empty Learn sub-headers  ·  POLISH · high confidence
Conversion artifact: a bold Learn sub-header with **zero links** under it. Found in: foundations 01,
malware 03/05/09, endpoint 02/04, crypto 02/03/06, python 01. Fill with a real resource or delete the header.

### A4 — Refresh stale track-root READMEs  ·  CONSISTENCY
Track READMEs not updated after modules were added: **crypto** (says "ten modules", missing 11/12),
**python** (missing 11 + capstone), **automation** (says "eleven", clickops orphaned), **ai-ops** (says
"ten", missing 11), **endpoint** (missing 12/13 in table/phases/capstone). Update tables, phase maps, nav.

### A5 — Resolve numbering collisions  ·  CONSISTENCY
- **automation:** two `11-*` (`11-clickops-iac-migration`, `11-pipeline-secrets`) → renumber clickops to `12`.
- **ztna:** two `10-*` (`10-vpn-ztna-migration`, `10-workload-identity-mtls`) → renumber.
Update dir name, `mkdocs.yml` nav, track README, and cross-refs.

---

## B. Genuine lab-side work (after PR #17 + a fresh survey)

These are real prose↔env mismatches the survey won't auto-surface — the lab *promises a tool/target the
env doesn't ship*. Verify against the current env, then reconcile prose or build the missing piece:

- **offensive/02-scanning** — lab.md promises Vulhub `nginx/CVE-2017-7529` via `make target-up`; env ships only a custom `victim/`. Wire Vulhub or rewrite the lab to the custom target.
- **offensive/12-pivoting** — lab.md makes `chisel` the primary tool "staged by `make up`"; env ships only `relay.py`. Add chisel or rewrite.
- **defensive 15 (MISP) / 06 (Wazuh) / 14 (TheHive) / 01 (ES+Kibana)** — type-tag/README name a product the lab doesn't run. Ship it or stop promising it (15 is the sharpest).
- **ai-augmented-ops 03/04/06/08/09** — lab.md describes an eval/gate deliverable (`eval.py`/`review.py`/`branch_gate.py`/`attack_eval.py` + held-out fixtures + `make eval/gate/review` targets) absent from the env. Build the harnesses or scope the labs down. *(Verify — auditor read prose; confirm the targets really are missing.)*
- **active-directory/06-lateral-movement** — lab is built on Windows event IDs a Linux Samba DC can't emit; reconcile the artifact story.
- **ztna/09-monitoring-detection** — ships stage 1 of a promised 3-stage build; build the rest or scope down.
- **Spec-only labs to build or mark non-shipping:** automation/11-clickops-iac-migration, ztna/10-vpn-ztna-migration, ztna/11-redteam-zt-deployment (no Makefile).

---

## C. Per-track prose polish (representative; full detail in `planning/audit/`)

| Track | Notable polish items |
|---|---|
| foundations | 03-docker: de-dup the garbled CVE-2019-5736 block in Stretch; 05-windows: add Event ID 4657 to match lab |
| offensive | auth-note boilerplate wrong on 13/14/16/17 ("this app is yours"); dangling "Step 5" in 14; 08 dropped "Deserialization" scope; 13 Cobalt-Strike leftovers vs Sliver reframe |
| defensive | off-by-one Connects-forward cross-refs (16→15, 13→14); "Phase 2" vs "Track 02" capstone labeling; add auth note to 05 |
| malware | 12: Learn link reuses CTI URL under wrong title; 02: README anchors Emotet but lab corpus is Agent Tesla/AsyncRAT |
| cloud | (covered by A1) + standardize auth-note format on 13/15/16; reveal-heading house style |
| AD | 03 live-hash flow; 07 executed (not echoed) forge/DCSync |
| endpoint | 04: `aa-status \| grep webapp` should match shipped `python3*` profile name |
| ai-ops | doubled `/docs/en/docs/` Anthropic URL (03, 11); 08 `[Module 11]` mis-link; drop pre-committed `results/security-assessment.md` (learner deliverable) |

---

## D. Suggested order

1. **A1 + A3 + A4 + A5** — mechanical, high-confidence, single sweep (Haiku/Sonnet-able). Removes the
   visible inconsistencies that prompted this audit.
2. **A2** — your editorial call on the deluxe tier.
3. **Merge labs PR #17 → re-run the survey → promote greens** (already in flight). Then revisit **B**
   with a true red/fail list instead of auditor guesses.
4. **B** — reconcile the genuine prose↔env mismatches (per-track, after the survey).
5. **C** — papercut sweep, low priority.
