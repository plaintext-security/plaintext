---
name: project-lab-status
description: Current lab validation status and key build patterns for the Plaintext curriculum
metadata: 
  node_type: memory
  type: project
  originSessionId: 91371537-f8b8-4daf-825d-97396eb4e43f
---

## Lab validation status (as of 2026-06-08)

**Defensive track (10/15 done)**
- [x] 01-telemetry — SSH log pipeline (Python stdlib, no ext deps)
- [x] 03-linux-telemetry — Ubuntu + osquery 5.12.1 (arm64 TARGETARCH fix), audit_events.txt
- [x] 04-network-monitoring — Zeek TSV logs + Python analyzer; local .gitignore negates *.log for seed data
- [x] 05-intrusion-detection — Suricata eve.json analyzer
- [x] 07-log-parsing
- [x] 08-detection-as-code
- [x] 09-detection-testing — purple-team loop: atomics → Sigma matcher → FIRED/MISSED/FP
- [x] 10-attack-coverage — ATT&CK Navigator layer generator
- [x] 14-threat-intel — ThreatFox CSV feed enrichment
- [ ] 02-endpoint-telemetry — bundle Sysmon-shaped EVTX/JSON
- [ ] 06-siem — Wazuh or lighter option
- [ ] 11-hunting-endpoint
- [ ] 12-hunting-network — RITA over Zeek logs
- [ ] 13-triage-ir
- [ ] 15-soar

**Offensive track (1/16 done)**
- [x] 06-web-injection
- (rest TBD)

**Foundations track (0/12 done)**

## Open PR
PR #10 on plaintext repo (feat/defensive-labs branch) — covers 7 labs from this session.

## Key build patterns
- Seed `.log` files: gitignored; use `audit_events.txt` naming OR add `data/zeek/.gitignore` with `!*.log` negation
- osquery in container: `ARG TARGETARCH` (no default) + GitHub release URL with `${TARGETARCH}` = amd64|arm64
- `*.pcap` files cannot be committed — ship pre-generated Zeek logs or Suricata eve.json instead
- `navigator_layer.json` from ATT&CK coverage script uses non-zero exit when gaps exist (intentional)

**Why:** Continuing lab-validation backfill for the Plaintext curriculum.
**How to apply:** Pick up from the remaining defensive labs; suggested order: 02-endpoint-telemetry, 11/12 hunting, 06-siem/Wazuh, 13-triage-ir, 15-soar.
