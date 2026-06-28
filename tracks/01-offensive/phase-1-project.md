# Phase 1 Project — Attack-Surface Map & Prioritised Target List

*Offensive · Phase 1 (modules 01–03) · ~4–6 hrs · Prereqs: finish modules 01, 02, 03 first.*

> You ran recon, scanning, and vuln-ID as three separate exercises. The project is the **integration**: one reproducible pipeline that takes an authorised target from public footprint → scanned services → a prioritised, justified vulnerability list a tester would actually work from.

## Why this is a project, not another module

Each Phase-1 module left one stage of the kill-chain front end. Alone they're three disconnected notes; chained, they're the recon engine every engagement opens with:

- **01 · Recon & OSINT** → `recon-report.md` + your `recon.py` (scope statement, asset inventory with sources, top three priority targets with CVE justification).
- **02 · Scanning & Enumeration** → `scan-notes.md` + your `scan.py` (open ports, service/version per port, one NSE result explained; optional `scan-notes.json`).
- **03 · Vulnerability Identification** → `vuln-assessment.md` (the CVE→CWE→CVSS→KEV→PoC chain and a one-line risk verdict per finding).

## Build it

1. **Chain the three stages into one pipeline.** Wrap `recon.py` → `scan.py` → the vuln-ID step behind **one entrypoint** — `map <target>` — where each stage *feeds the next*: recon's priority targets become scanning's hosts, scanning's service/versions become vuln-ID's CVE lookups. The hand-off plumbing between the three is the new work the modules didn't assign.
2. **Make it reproducible.** No manual copy-paste between stages — re-running `map <target>` from a clean checkout reproduces the same asset inventory, the same port table, and the same ranked finding list.
3. **One prioritised verdict.** Produce a combined `attack-surface.md`: the scope statement up top, the asset inventory, the per-host service table, and a single **ranked** vulnerability list — each finding leading with a one-line *what it is, why it's reachable, why it's ranked here* (CVE/CWE + KEV status + access).

## Success criteria

- [ ] **One** entrypoint takes a target from recon → scan → prioritised vuln list with no manual hand-off between stages.
- [ ] Re-running it from a clean checkout reproduces the same inventory, port table, and ranked findings.
- [ ] Every finding carries a CVE/CWE, its KEV status, and a one-line risk verdict — and the list is ordered by real exploitability, not scanner score.

## Deliverable

An `attack-surface-map/` folder in your repo: the **chained pipeline**, the combined **`attack-surface.md`**, and your committed module notes (`recon-report.md`, `scan-notes.md`, `vuln-assessment.md`). Only map authorised targets — keep the scope statement in the report. **Do not** commit raw scan XML, captured banners, or any target credentials (see `.gitignore`).

## Self-check rubric

Grade your own `attack-surface-map/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Pipeline integration** | Three scripts run by hand, copy-pasting between them | One entrypoint chains recon → scan → vuln-ID, each stage feeding the next | Re-runs clean and idempotent; a new target needs only one argument |
| **Coverage** | Ports listed, no service/version or asset sourcing | Assets sourced, services versioned, findings mapped to CVE/CWE | Enumeration depth that surfaces a non-obvious service the scanner missed |
| **Prioritisation** | Findings dumped in scanner order | Ranked by exploitability with KEV status and a one-line verdict each | A tester could pick the first finding and start exploiting immediately |
| **Hygiene** | Scan XML / banners / creds committed | No raw scan artifacts or secrets in history; scope stated; `.gitignore` present | Commits tell the recon→scan→triage build story |

→ Next: **[Module 04 — Exploitation Fundamentals](modules/04-exploitation/README.md)** opens Phase 2, *Finding the way in*.
