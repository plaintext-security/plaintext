# Module 06 — SIEM Fundamentals

**Defensive Operations** — *where all your telemetry meets: search, correlate, alert.*

## Why this matters
Telemetry scattered across hosts and sensors is useless until it's centralised, correlated, and
alertable. A SIEM is the analyst's workbench — it ingests everything (modules 01–05), lets you search
and pivot across sources, correlates events into alerts, and drives the SOC workflow. Wazuh gives you
a complete open-source SIEM/XDR to learn on for free.

## Objective
Stand up an open-source SIEM, ingest real security telemetry, and build a correlation rule and a
dashboard that surface an attack.

## Learn (~4 hrs)

**The platform**
- [Wazuh Practical Training for Beginners (video)](https://www.youtube.com/watch?v=UGYmG_hy3qQ) — install and use an open-source SIEM from scratch.
- [Wazuh documentation](https://documentation.wazuh.com/) — read "Getting Started" and the ruleset/decoders overview.

**What to surface**
- [MITRE ATT&CK](https://attack.mitre.org/) — the behaviours your correlation rules should turn into alerts.

## Key concepts
- Ingest → parse → index → search → alert
- Correlation: turning many events into one alert
- Dashboards and the analyst workflow
- SIEM rules/decoders (Wazuh) vs raw queries (Elastic)
- Alert fatigue and why tuning matters

## AI acceleration
A model writes SIEM queries and correlation logic fast — and a generated rule with subtly wrong logic
ships confident false alerts or, worse, silently misses the real one. Test every rule against data
where you know the answer.
