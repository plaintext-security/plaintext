# Phase 3 Project — Off-the-Box Investigation

*Forensics · Phase 3 (modules 09–12) · ~6–8 hrs · Prereqs: finish modules 09, 10, 11, 12 first.*

> The host told one part of the story. The project is the **integration**: extend the investigation off the
> box — reconstruct sessions and files from PCAP, pivot through endpoint and cloud logs, catch the
> anti-forensic tampering, and hand the malware artifacts off to deep analysis (→ T04) — fused into one
> off-host narrative.

## Why this is a project, not another module

Each Phase-3 module left findings from one source beyond the disk. Alone they're four separate notes; fused
they extend the timeline past the endpoint:

- **09 · Network forensics** → `network-findings.md` + `analysis.sh` — sessions and files reconstructed from
  PCAP with `zeek`/`tshark`, cited by log field.
- **10 · Log & cloud forensics** → `timeline.md` + `attack-mapping.md` — the merged endpoint + cloud
  timeline (Event IDs, CloudTrail `eventName`s) mapped to ATT&CK.
- **11 · Anti-forensics** → `anti-forensics-finding.md` + `detect_timestomping.py` — the timestamp
  discrepancy caught with `istat`, and the detector.
- **12 · Malware artifacts in IR** → `rules/custom.yar` + `capability-analysis.md` — the dropper interpreted
  and a YARA rule for the handoff to deep analysis.

## Build it

1. **Reconstruct the off-host activity.** Run your `analysis.sh` (09) to pull sessions and carved files from
   the PCAP, then merge the endpoint + cloud timeline (10) so network, host-log, and cloud-trail events sit
   on **one** off-host timeline mapped to ATT&CK. The fused cross-source timeline *is* the new work.
2. **Catch the tampering.** Run `detect_timestomping.py` (11) over the evidence and fold any timestamp
   discrepancy into the timeline as a flagged gap — the analyst sees where the record was manipulated, not
   just the clean events.
3. **Hand off the malware.** Use your YARA rule and capability analysis (12) to package the malware artifacts
   for deep analysis (→ T04), then produce a combined `off-host-investigation.md` whose narrative leads with
   a two-sentence *what crossed the boundary, how it was confirmed, where it went* and traces every claim to
   an artifact.

## Success criteria

- [ ] Network sessions/files, endpoint logs, and cloud trails land on **one** off-host timeline mapped to
  ATT&CK.
- [ ] The timestomping detector runs and any discrepancy is flagged on the timeline.
- [ ] The malware artifacts are packaged with a YARA rule and capability note for the T04 handoff, and the
  narrative opens with a verdict.

## Deliverable

An `off-host-investigation/` folder in your repo: the **fused narrative `off-host-investigation.md`**, your
`analysis.sh`, `detect_timestomping.py`, `rules/custom.yar`, and your committed module notes
(`network-findings.md`, `timeline.md`, `attack-mapping.md`, `anti-forensics-finding.md`,
`capability-analysis.md`). Reference the evidence — **do not** commit the PCAP, `.evtx`/CloudTrail JSON,
`disk.img`, PE binaries, or any credentials (see `.gitignore`).

## Self-check rubric

Grade your own `off-host-investigation/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Off-host coverage** | One source (network *or* cloud) | Network sessions/files, endpoint logs, and cloud trails fused into one timeline | A file carved from PCAP tied to a cloud-trail action that moved it |
| **ATT&CK mapping** | Findings unmapped | Each finding mapped to a technique ID and tactic | Mapping reasons stated; technique chain reads as a campaign |
| **Anti-forensics** | Tampering missed | Timestamp discrepancy caught and flagged on the timeline | Detector reusable; the gap is reasoned about, not just noted |
| **Malware handoff** | No rule, or hash-only | YARA rule with meta + a capability note ready for T04 | Rule is behaviour-based; false-positive risk addressed |
| **Hygiene** | PCAP/images/JSON committed | No PCAP/`.evtx`/CloudTrail/binaries/secrets in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 13 — Incident Response Process](modules/13-ir-process/README.md)** opens Phase 4, which ends in the **[track capstone](README.md#capstone)**.
