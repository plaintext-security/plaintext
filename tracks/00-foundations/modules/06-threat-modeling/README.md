# Module 06 — Security Fundamentals & Threat Modeling

## Objective
Frame any system in terms of assets, threats, and trust boundaries before you attack or
defend it.

## Background
Tools come later; judgment comes first. Security rests on a few durable ideas — the CIA
triad (confidentiality, integrity, availability), authentication versus authorization, and
defense in depth — and on a habit: **threat modeling**, the discipline of asking "what are
we protecting, from whom, and where can it go wrong?" before writing a line of config.
STRIDE is a simple lens for that: Spoofing, Tampering, Repudiation, Information disclosure,
Denial of service, Elevation of privilege.

## Key concepts
- The CIA triad and the AAA model (authentication, authorization, accounting)
- Trust boundaries and data-flow thinking
- STRIDE as a threat-enumeration lens
- Attacker goals and the idea of an attack surface
- Defense in depth and least privilege

## AI acceleration
A model is a strong brainstorming partner for threat modeling — feed it a data-flow
description and it will enumerate plausible STRIDE threats fast. The skill is *pruning*:
discard the irrelevant, add the context-specific threats it can't know, and own the final
model.

## Further reading
- Microsoft STRIDE / Threat Modeling: https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
- OWASP Threat Modeling: https://owasp.org/www-community/Threat_Modeling
- NIST SP 800-160 Vol. 1 (Systems Security Engineering): https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final
