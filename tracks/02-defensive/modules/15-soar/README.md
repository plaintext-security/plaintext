# Module 15 — Response Automation (SOAR)

**Defensive Operations** — *automate the boring 80% of response — with a human on the trigger.*

## Why this matters
A SOC drowns in repetitive response: enrich the alert, check the intel, open a ticket, maybe contain.
SOAR automates that toil so analysts spend their judgment where it matters — and it's the natural home
for AI-augmented triage. This is the capstone of defensive operations: tie your telemetry, detections,
intel, and IR process into an automated, human-in-the-loop workflow. *Automation is assumed now; the
skill is designing it well and keeping the human in command.*

## Objective
Build a SOAR playbook that takes a real alert, enriches it, decides (with optional AI triage), and
tickets/contains it — with a human approval gate.

## Learn (~4 hrs)

**The platform**
- [Automate Everything with Shuffle! (video)](https://www.youtube.com/watch?v=_riaZjLnoXo) — building SOAR workflows in the OSS platform.
- [Shuffle documentation](https://shuffler.io/docs) — apps, workflows, and triggers.

**What to automate**
- [MITRE ATT&CK](https://attack.mitre.org/) — automate response mapped to the techniques you detect; and the Pyramid of Pain for what's worth containing.

## Key concepts
- SOAR: orchestration vs automation vs response
- Playbooks: trigger → enrich → decide → act
- Human-in-the-loop (and when to require approval)
- Where AI fits: triage/summarisation as a step (local model for volume, frontier for hard calls)
- The danger of automating a wrong decision at machine speed

## AI acceleration
This is the module where AI/automation stops being advisory and becomes the deliverable — and where
the standing rule bites hardest: **AI authors → you review → you own it**. An AI triage step that
auto-closes alerts will eventually auto-close a real one; an auto-contain action on a false positive
takes down production. Put the human gate where a wrong machine decision would hurt, and own that
design.
