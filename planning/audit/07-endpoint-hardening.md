# Audit — Track 07 Endpoint & Host Hardening

**Verdict:** Mostly solid; 2 empty-Learn-subsection BLOCKERs and a track-README/nav mismatch (12 & 13 missing from README, never demo-validated) are the gating items. Meridian de-naming verified clean in both repos.

## Track-level
- [CONSISTENCY] README lists only 11 modules and its Phases/capstone stop at 11, but 12-config-drift & 13-fleet-migration exist with full prose+lab+env and ARE in mkdocs nav. README must add them (and likely a Phase 4 / re-scope phases).

## Per module
- 01-endpoint-threat-model: clean (seed files `endpoint-profile.md`/`threat-model-template.md` match lab.md refs; no Meridian residue).
- 02-windows-hardening: [BLOCKER] Learn has empty "**Group Policy as code**" subsection header with no links/content under it; [POLISH] no BASELINE/DELUXE resource tags (track-wide convention absent — likely N/A).
- 03-linux-hardening: clean (Dockerfile+compose, Makefile up/down/reset/demo/shell; data/ empty but lab is container-driven).
- 04-exploit-mitigations: [BLOCKER] Learn has empty "**Exploit mitigations — the mechanisms**" subsection header with no links; [CONSISTENCY] lab.md step `aa-status | grep webapp` finds nothing — shipped profile confines `/usr/bin/python3*` with no "webapp" profile name.
- 05-endpoint-telemetry: [POLISH] Learn lists osquery `.../introduction/sql/` twice (as "documentation" and "schema reference"); "Wazuh osquery integration guide" link points at osquery docs root, not a Wazuh page. (Env has `make seed`/`shell` + `data/atomic/T1053.003.{md,yaml}` — earlier blocker claim was stale.)
- 06-configuration-management: [POLISH] lab.md uses `-i inventory` while env inventory is at `/lab/inventory` (path nuance — verify it resolves).
- 07-compliance-auditing: clean.
- 08-patch-vuln-management: clean.
- 09-privesc-defense: clean (real GTFOBins + ATT&CK T1548 anchors, full validated env).
- 10-detecting-host-compromise: clean (real EVTX-ATTACK-SAMPLES anchor + ATT&CK IDs, full fetch/up/convert/demo env).
- 11-host-boot-integrity: [POLISH] lab.md Setup carries a "pending validation / Docker unavailable" note though env is fully built (Makefile up/down/reset/shell/tamper/check/demo + scripts/data) — reconcile the stale caveat.
- 12-config-drift: [BLOCKER] lab.md Setup says "no `plaintext-labs` directory built yet" + carries a "to-be-built-at-promotion" spec, but env exists with full Makefile; env `VALIDATION.md` = "SCAFFOLDED, NOT YET RUN" so `make demo` never run green → not "done" per CLAUDE.md validated-lab bar. README prose itself is excellent.
- 13-fleet-migration: [BLOCKER] same as 12 — lab.md claims no env / to-be-built while env exists (Makefile up/health/roll/rollback/demo/shell/reset/down, playbook/inventory, fleet-health.sh); `VALIDATION.md` = "SCAFFOLDED, NOT YET RUN" → not demo-validated. README/lab prose is full-depth (CrowdStrike 2024 + Strangler Fig anchors), not a stub.

## Counts
- BLOCKER: 4 (02 empty Learn subsection; 04 empty Learn subsection; 12 lab.md-vs-env contradiction + unvalidated; 13 lab.md-vs-env contradiction + unvalidated)
- CONSISTENCY: 2 (track README missing 12/13; 04 `grep webapp` mismatch)
- POLISH: 4 (05 duplicate/mislabeled Learn links; 06 inventory path; 11 stale validation note; BASELINE/DELUXE absent track-wide)

## Top-3 fixes
1. Fill the two empty Learn subsection headers in 02 ("Group Policy as code") and 04 ("Exploit mitigations — the mechanisms") — both currently have a bold header with zero links under it.
2. Reconcile 12 & 13 lab.md "no env built / to-be-built-at-promotion" language with their now-existing lab envs, and run `make demo` to flip VALIDATION.md from SCAFFOLDED→validated (definition-of-done bar).
3. Add 12-config-drift and 13-fleet-migration to the track README (module table + Phases + capstone scope), then fix 04's `aa-status | grep webapp` to match the shipped `python3*` profile name.
