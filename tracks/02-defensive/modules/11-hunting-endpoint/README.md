# Module 11 — Threat Hunting: Endpoint

**Defensive Operations** — *don't wait for an alert — go looking for what your detections missed.*

## Why this matters
Detections catch the known; hunting finds the unknown. Threat hunting is hypothesis-driven: you assume
a breach, form a testable idea ("an attacker would persist via a Run key"), and go look across your
endpoint data. It's how teams find the dwell-time attacker that slipped past every rule — and
Velociraptor makes enterprise-scale endpoint hunting free.

## Objective
Run a hypothesis-driven hunt across real endpoint data with Velociraptor/osquery, and either find the
activity or rule it out.

## Learn (~4 hrs)

**The method & the tool**
- [Hunt for Hackers with Velociraptor (video)](https://www.youtube.com/watch?v=S8POUZv7pT8) — endpoint hunting with the OSS platform.
- [Velociraptor documentation](https://docs.velociraptor.app/) — VQL, artifacts, and hunts; read "Getting Started."

**Method**
- [The ThreatHunting Project](https://www.threathunting.net/) — hunting methodology and concrete hunt ideas.

## Key concepts
- Hypothesis-driven hunting (assume breach)
- Endpoint hunt data: processes, persistence, auth, file
- VQL / osquery for hunting at scale
- The Pyramid of Pain (hunt for behaviours, not just IOCs)
- Turning a successful hunt into a detection

## AI acceleration
A model is great for generating hunt hypotheses and drafting VQL/osquery — but hunting is judgment
under ambiguity, and the model will happily "confirm" a pattern that's just normal-for-you. Treat its
leads as hypotheses to test against the data, never conclusions.
