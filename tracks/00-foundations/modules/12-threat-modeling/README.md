# Module 12 — Threat Modeling

**Foundations** — *judgment before tools: what are we protecting, from whom, and where can it go wrong?*

## Why this matters
Tools come later; judgment comes first. The durable ideas — CIA, authentication vs
authorization, defense in depth — and the habit of threat modeling are what turn a pile of
techniques into security thinking. Every later track is an answer to a threat; this module
teaches you to ask the question first, so you attack and defend on purpose rather than by
reflex.

## Objective
Frame a system in terms of assets, trust boundaries, and threats, and produce a STRIDE
threat model with mitigations.

## Learn (~3 hrs)

**The mindset**
- [The Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/) — the four questions and the values, in two pages; foundational.
- [Adam Shostack — Threat Modeling resources & the 4-Question Framework](https://shostack.org/resources/threat-modeling) — from the person who wrote the book; practical and free.

**STRIDE, hands-on**
- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) — a working method you can apply today.
- [Elevation of Privilege (free card game)](https://shostack.org/games/elevation-of-privilege) — learn STRIDE by playing it against a design; genuinely the fastest way it clicks.

**Reference**
- [Microsoft — STRIDE threat categories](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) — a clean catalog to map against.

## Key concepts
- The CIA triad and AAA (authentication, authorization, accounting)
- Trust boundaries and data-flow thinking
- STRIDE as a threat-enumeration lens
- Attack surface and attacker goals
- Defense in depth and least privilege

## AI acceleration
A model is a strong brainstorming partner — feed it a data-flow description and it
enumerates plausible STRIDE threats fast. The skill is *pruning*: discard the irrelevant,
add the context-specific threats it can't know, and own the final model.
