# Track 02 — Defensive Operations

Detection engineering, SIEM, log analysis, and incident triage at scale. Learn to find
attackers in the noise and respond before they reach their goal. This track treats
detection as code: telemetry in, tested detections out, mapped to attacker behaviour.

## What you'll be able to do

- Build a telemetry pipeline from hosts, network, and cloud into a searchable store.
- Write, test, and version detections mapped to MITRE ATT&CK (detection-as-code).
- Hunt proactively across endpoint and network data instead of waiting for alerts.
- Triage and respond to an incident with a repeatable process and clear documentation.

## The arc

| Phase | Modules | Focus |
|-------|---------|-------|
| Get the data | 01–03 | Centralise host, network, and endpoint telemetry |
| Find the attacker | 04–06 | Detection engineering and threat hunting |
| Respond | 07–08 | Triage, response, and threat intelligence |

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Telemetry & Log Centralisation | What to collect and how to ship it into one searchable place | `elastic`, `fluent-bit`, `vector` |
| 02 | Network Security Monitoring | Turning packets into protocol logs and connection records | `zeek`, `arkime` |
| 03 | Endpoint Detection & Host Telemetry | Process, file, and auth events from Windows and Linux hosts | `wazuh`, `osquery`, `sysmon`, `auditd` |
| 04 | Intrusion Detection | Signature and anomaly detection on the wire | `suricata` |
| 05 | Detection Engineering (detection-as-code) | Writing, testing, and versioning rules mapped to ATT&CK | `sigma`, ATT&CK Navigator |
| 06 | Threat Hunting | Hypothesis-driven hunting across endpoint and network data | `zeek`, `jupyter` |
| 07 | Incident Triage & Response | A repeatable IR process from alert to root cause | `TheHive`, `Velociraptor` |
| 08 | Threat Intelligence | Managing IOCs and enriching detections with context | `MISP`, `OpenCTI` |

## Prerequisites

Complete Track 00 — Foundations first.

> All labs use open source tooling and freely available sample datasets
> (e.g. Malware-Traffic-Analysis.net, public PCAP repositories, EVTX-ATTACK-SAMPLES).
> Only analyse data you are authorised to handle.

## Standards & further reading

- MITRE ATT&CK and the ATT&CK Navigator for coverage mapping
- Sigma rule specification for portable detections
- NIST SP 800-61 (Computer Security Incident Handling Guide)
- The Pyramid of Pain for prioritising indicator types
