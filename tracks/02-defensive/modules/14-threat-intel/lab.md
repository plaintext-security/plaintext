# Lab 14 — Work Real Threat Intel

## Setup
Docker-first — [MISP](https://www.misp-project.org/) (its docker image), or use the feeds directly.
Real data: a real free feed from [abuse.ch](https://abuse.ch/) (ThreatFox / URLhaus), plus the
indicators you extracted in modules 04/05/12.

## Scenario
Bring real threat intelligence to bear: ingest a feed, and use it to enrich an indicator and sharpen
a detection.

## Do
1. [ ] Ingest a real indicator feed (abuse.ch ThreatFox or URLhaus) into MISP (or pull it directly).
2. [ ] Take an indicator from your own hunt/detection (modules 04/05/12) and check it against the
   intel: known-bad? what's the context?
3. [ ] Enrich a detection with the feed — e.g. alert on connections to known-bad infrastructure.
4. [ ] Assess: which indicators are worth alerting on, and which are too noisy or stale?

## Success criteria — you're done when
- [ ] You ingested a real feed and can query it.
- [ ] You enriched one of your own indicators with real context.
- [ ] You can justify which indicators are worth acting on (Pyramid of Pain).

## Deliverables
`threat-intel.md`: the feed you used, the enrichment of your indicator, and your assessment of what's
actionable.

## AI acceleration
Have a model extract structured IOCs from a threat report — then verify each against the feed/source
and judge its confidence. Collection is easy; assessment is the skill.

## Connects forward
Enriched intel sharpens detections (module 08) and drives the automated enrichment step in module 15
(SOAR).

## Marketable proof
> "I ingest real threat-intel feeds (MISP, abuse.ch), enrich indicators and detections with context,
> and assess what's actually worth acting on."

## Automate & own it
**Required.** Script the enrichment — take an indicator, query the feed/MISP, return a verdict +
context (AI drafts, you verify against the source); commit it. This becomes a building block of your
SOAR playbook.

## Stretch
- Auto-expire indicators by age, and explain why stale intel causes false positives.
