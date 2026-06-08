# Module 14 — Threat Intelligence

**Defensive Operations** — *context turns an indicator into a decision; CTI is how you get it.*

## Why this matters
An IP in a log means nothing until you know it's a known C2 node. Threat intelligence — managing
indicators, enriching them with context, and sharing them — is what lets a SOC prioritise and a
detection stay current. MISP is the open standard for storing and sharing CTI, and real, free
indicator feeds (abuse.ch, CISA) let you work with genuine threat data.

## Objective
Ingest real indicator feeds into a threat-intel platform, enrich an indicator and a detection with
context, and understand what intelligence is worth acting on.

## Learn (~4 hrs)

**The platform & feeds**
- [How to Use Threat Intelligence Feeds With MISP (video)](https://www.youtube.com/watch?v=tu86szd5jYU) — ingesting and using real feeds.
- [MISP Project](https://www.misp-project.org/) and its [documentation](https://www.misp-project.org/documentation/) — events, attributes, feeds, and sharing.

**Real feeds**
- [abuse.ch](https://abuse.ch/) (URLhaus, ThreatFox, MalwareBazaar) — free, real, high-quality indicator feeds you can ingest.

## Key concepts
- Indicators (IOCs) vs intelligence (context + assessment)
- The Pyramid of Pain (which indicators actually cost the attacker)
- STIX/TAXII and sharing standards
- Enrichment: turning an IOC into a decision
- Feed quality, aging, and false positives

## AI acceleration
A model summarises a threat report into structured indicators quickly — useful for ingest. But it'll
hallucinate an attribution or over-trust a stale indicator; intelligence is about *assessment*, not
just collection. Verify indicators against the source and judge confidence yourself.
