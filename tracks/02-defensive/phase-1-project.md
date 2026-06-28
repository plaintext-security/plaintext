# Phase 1 Project — Host + Network Telemetry Pipeline

*Defensive · Phase 1 (modules 01–07) · ~5–7 hrs · Prereqs: finish modules 01–07 first.*

> You stood up collectors, monitors, and a SIEM one source at a time. The project is the **integration**: one telemetry pipeline that ingests host *and* network data into a searchable SIEM, normalised to a common schema, with a real attack dataset flowing through it.

## Why this is a project, not another module

Each Phase-1 module wired up one source or one stage. Alone they're seven separate configs and notes; integrated they're the substrate every later detection, hunt, and response queries:

- **01 · Telemetry & Log Centralisation** → `telemetry.md` (what you ingested, useful searches, the gap you found).
- **02 · Endpoint Telemetry** → `endpoint-telemetry.md` (the malicious event, its process ancestry, the Event IDs, a detection idea).
- **03 · Linux Telemetry** → `linux-telemetry.md` (your audit rules, the captured event, an osquery query, a detection idea).
- **04 · Network Security Monitoring** → `nsm.md` (the Zeek logs that mattered, the indicators, a detection idea).
- **05 · Intrusion Detection** → `ids.md` (the notable Suricata alerts, how they match the write-up, your custom rule).
- **06 · SIEM Fundamentals** → `siem.md` (the six-alert triage table, the OneDrive-filter answer, the new ProgramData rule).
- **07 · Log Parsing & Normalisation** → `parsing.md` (your parser config, a before/after line, your parse rate, failure handling).

## Build it

1. **Converge the sources.** Wire your endpoint (02), Linux (03), and network (04/05) telemetry into the **one searchable store** from module 06 — so a single query reaches host *and* wire events. The convergence and routing is the new work the per-source modules didn't assign.
2. **Normalise on the way in.** Put your module-07 parser in the path so host and network events land on a **common schema** — a process event from Sysmon and a connection from Zeek share field names where they overlap. A silently mis-parsed source is invisible later; check your parse rate.
3. **Flow a real attack through it.** Replay a real public attack dataset (the PCAP / EVTX you used in the modules, or a generate-it-here option) end to end, and confirm the malicious activity is *searchable* across both host and network — then write `pipeline.md`: the architecture (sources → parse → store), one cross-source query that finds the attack, and the one visibility gap you'd close next.

## Success criteria

- [ ] **One** searchable store holds both host **and** network telemetry, reachable from a single query.
- [ ] Host and network events are normalised to a common schema; you can state your parse rate.
- [ ] A real attack dataset flows through end to end and its activity is findable across both sources.

## Deliverable

A `telemetry-pipeline/` folder in your repo: the **pipeline as code** (ingest/parse/store configs), the **`pipeline.md`** architecture write-up with the cross-source query, and your committed module notes. Only handle data you're authorised to handle. **Do not** commit raw PCAPs, EVTX, captured logs, or any secrets in the configs (see `.gitignore`) — reference the dataset and its source.

## Self-check rubric

Grade your own `telemetry-pipeline/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Source coverage** | One source, or sources not searchable together | Host *and* network telemetry in one searchable store | A third source slots in without reworking the pipeline |
| **Normalisation** | Raw logs, fields inconsistent across sources | Common schema; parse rate known and acceptable | Parse failures handled and alerted; schema documented |
| **Attack visibility** | Dataset loaded but activity not findable | A real attack flows through and is searchable across sources | One cross-source query reconstructs the attack's host+network trail |
| **Reproducibility & hygiene** | Click-built; raw PCAP/EVTX/secrets committed | Pipeline is code; no raw captures or secrets in history; `.gitignore` present | Re-runs from a clean checkout; commits tell the build story |

→ Next: **[Module 08 — Detection-as-Code](modules/08-detection-as-code/README.md)** opens Phase 2, *Find the attacker*.
