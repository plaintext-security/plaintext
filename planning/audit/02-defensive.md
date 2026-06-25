# Audit — Track 02-defensive (conversion consistency/quality)

**Verdict:** Track is in strong shape — all 19 modules have full anatomy, type tags, `*Last reviewed*`, original bridge prose, and validated lab envs (Makefile + real artifacts) present. No structural BLOCKERs. Main spread: 3 DELUXE exemplars (08/18/19) vs 16 BASELINE that lack the admonition furniture (`In 60 seconds`/`Check yourself`/`!!!` blocks). Two real README↔lab platform mismatches (15 MISP, and "stand up X" drift in 01/06) plus off-by-one module cross-references in lab Connects-forward (16, possibly 14).

Scope: READ-ONLY. Per-module findings below; "clean" = no findings.

## Per-module findings

- **01-telemetry** — BASELINE — [CONSISTENCY] README "Do" says stand up Elasticsearch+Kibana but shipped env is a Python `pipeline.py` container (ES/Kibana spun up separately); reconcile concept vs harness. Anchor: loghub OpenSSH_2k (real brute-force).
- **02-endpoint-telemetry** — BASELINE — clean. Anchor: EVTX-ATTACK-SAMPLES (Sysmon, rundll32 LOLBin), ATT&CK DS0009.
- **03-linux-telemetry** — BASELINE — clean. Anchor: loghub Linux_2k + auditd ART T1136.001, osquery.
- **04-network-monitoring** — BASELINE — clean. Anchor: Malware-Traffic-Analysis.net NetSupport RAT PCAP, Zeek.
- **05-intrusion-detection** — BASELINE — [POLISH] no explicit authorization note in lab.md (analyzes only a public PCAP, low risk, but sibling labs carry it). Anchor: ET Open ruleset + same MTA.net PCAP, Suricata.
- **06-siem** — BASELINE — [CONSISTENCY] README/Learn teach Wazuh but shipped lab is a custom Python+SQLite `siem.py` harness (no Wazuh in env); reconcile. Anchor: Equifax GAO-18-559.
- **07-log-parsing** — BASELINE — clean. Anchor: loghub OpenSSH_2k/Apache_2k + ECS; `.ci-demo` present.
- **08-detection-as-code** — DELUXE (confirmed) — clean. Anchor: Sigma/sigma-cli, ATT&CK T1059.001, EVTX-ATTACK-SAMPLES, Atomic Red Team; `.ci-demo` present.
- **09-detection-testing** — BASELINE — clean. Anchor: Atomic Red Team, EVTX-ATTACK-SAMPLES; eval/gate Makefile targets exist.
- **10-attack-coverage** — BASELINE — [POLISH] thinnest in set (4 Learn links, 4-step Do, no command hints) — within bounds. Anchor: ATT&CK Navigator, DeTT&CT.
- **11-hunting-endpoint** — BASELINE — clean. Anchor: Velociraptor, EVTX-ATTACK-SAMPLES; hunt.py 7-step chain, learner adds step 8.
- **12-hunting-network** — BASELINE — clean. Anchor: RITA, Zeek, MTA.net; C2 IP consistent w/ module 11 connect-forward.
- **13-powershell-logging-hunting** — BASELINE — clean (internally consistent on offensive module 15 ref). Anchor: ATT&CK T1059.001 + Emotet.
- **14-triage-ir** — BASELINE — [CONSISTENCY] README/title/Marketable-proof promise TheHive but lab ships a Python `triage.py` harness (lab text openly acknowledges no TheHive instance); title "Run an Incident in TheHive" misleading. [CONSISTENCY] Deliverable labels it "Phase 2 capstone" while 16 is "Track 02 capstone" — reconcile phase/capstone labeling. Anchor: Target breach / NIST 800-61.
- **15-threat-intel** — BASELINE — [CONSISTENCY] README Type tag + Marketable proof + lab repeatedly center MISP ("ingest into MISP", "MISP, abuse.ch") but env ships NO MISP — only `enrich.py` over a ThreatFox CSV (lab softens with "or pull it directly"); platform advertised ≠ platform delivered. [POLISH] thinnest "Do" of the IR set (4 generic objectives, no harness-specific steps); `make demo` exists but not shown in Setup. Anchor: SUNBURST, abuse.ch ThreatFox.
- **16-soar** — BASELINE — [CONSISTENCY] lab Connects-forward off-by-one: "14 (threat-intel enrichment), 13 (TheHive case management)" should be 15=threat-intel, 14=TheHive — labs written against older numbering. [POLISH] thinnest Learn path (3 links, ATT&CK double-purposed) for a capstone-feeding module. Anchor: Shuffle.
- **17-kev-driven-defense** — BASELINE — clean (strongest baseline prose; near-DELUXE depth, no admonitions). Anchor: CVE-2021-44228 Log4Shell + CISA KEV + Vulhub; auth note + `.ci-demo` present.
- **18-detection-drift** — DELUXE (confirmed) — clean. All admonitions + referenced corpus/data files + Makefile targets exist. Anchor: Gary Katz drift writeup, CISA, encoded-PowerShell corpus.
- **19-reviewing-ai-detections** — DELUXE (confirmed) — [POLISH] verify planted-error inventory in lab Setup maps cleanly to shipped `ai-drafts/` files (e.g. fabricated `T1047.002` lives in `03_wmic_process_create`); `fixed/` dir correctly learner-created not shipped. Anchor: arXiv + SigmaHQ + ATT&CK; `solution/findings.md` answer key present.

## Counts

- Modules audited: 19
- DELUXE: 3 (08, 18, 19) · BASELINE: 16
- BLOCKER: 0
- CONSISTENCY: 6 (01, 06, 14×2, 15, 16)
- POLISH: 6 (05, 10, 15, 16, 19, + DELUXE-furniture gap across all 16 baselines)
- Lab envs missing Makefile/artifacts: 0

## Top-3 fixes

1. **Platform mismatches (15, 06, 14, 01):** README/Type-tag/Marketable-proof name a heavyweight product (MISP / Wazuh / TheHive / ES+Kibana) the lab does not ship — add a reconciling sentence ("you'll learn the concept on a minimal harness; the real-product path is optional") and stop promising the product in the Type tag. 15 (MISP) is the sharpest gap.
2. **Off-by-one module cross-references in lab Connects-forward (16, audit 14):** labs reference 14=threat-intel/13=TheHive; correct to 15=threat-intel/14=TheHive. Reconcile "Phase 2 capstone" vs "Track 02 capstone" labeling between 14 and 16.
3. **DELUXE-furniture spread:** 16 baseline modules lack the `In 60 seconds` / `Check yourself` / `!!!` admonitions of 08/18/19 — decide whether to uplift (start with the highest-value 06/15/17) or accept as intentional tiering. Add the missing auth note to 05.
