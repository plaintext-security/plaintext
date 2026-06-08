# Module 05 — Intrusion Detection

**Defensive Operations** — *signatures and anomalies on the wire — catching the known-bad as it happens.*

## Why this matters
NSM (module 04) gives you visibility; an IDS like Suricata gives you *alerts*. Suricata matches
traffic against rules — community rulesets like Emerging Threats encode thousands of real attacker
signatures — turning "here's all the traffic" into "here's the malicious bit." It's a SOC staple,
and you can test it against real malware traffic for free.

## Objective
Run Suricata with a community ruleset over real traffic, read the alerts it produces, and write a
simple rule of your own.

## Learn (~4 hrs)

**The IDS**
- [Introduction to Suricata IDS (video)](https://www.youtube.com/watch?v=91i7InHVOso) — what Suricata is and how rule-based detection works.
- [Suricata documentation](https://docs.suricata.io/) — read "Quickstart" and the Rules intro; the authoritative reference.

**Rules**
- [Emerging Threats Open ruleset](https://rules.emergingthreats.net/) — the free community signatures Suricata ships against; the real-world detection content.

## Key concepts
- Signature (rule) vs anomaly detection
- Rule anatomy: action, header, options, `sid`
- Community rulesets (Emerging Threats) and how they're maintained
- IDS (alert) vs IPS (block)
- False positives and rule tuning

## AI acceleration
A model drafts and explains Suricata rules well — but a rule that's too broad floods the SOC and one
that's too narrow misses the variant. Test every generated rule against real traffic (fires on the
bad, stays quiet on the good) before trusting it.
