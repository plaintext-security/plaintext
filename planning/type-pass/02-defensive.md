# Type pass — Track 02 Defensive Operations

Library reference: `planning/MODULE-TYPE-LIBRARY.md` (6 families, 16 types).
Defensive leans on **5 Detonate&Detect**, **6 Reconstruct**, **8 Gate**, **16 Drift**, and — the
flagged watch-item — **13 Eval Harness**. The track's spine is *get the data → find the attacker →
respond*, which is mostly a telemetry/build + detection-judgment progression.

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Telemetry & Log Centralisation | 7 Build-&-Operate | 2 Misconception Reveal | ✓ | "A pipeline that runs ≠ works" is a clean predict-then-verify; build-the-data-plane is the real verb. |
| 02 Windows & Endpoint Telemetry | 7 Build-&-Operate | 1 Concept Autopsy | ✓ | Deploy Sysmon + read process ancestry; "the config *is* the detection strategy" carries the judgment. |
| 03 Linux Telemetry | 7 Build-&-Operate | 2 Misconception Reveal | ✓ | auditd/osquery as "Linux Sysmon"; container blind-spot is the reveal. Parallel to 02. |
| 04 Network Security Monitoring | 7 Build-&-Operate | 6 Reconstruct | ✓ | Run Zeek over real PCAP, read protocol logs as evidence — reconstruct-from-the-wire is latent here. |
| 05 Intrusion Detection | 5 Detonate & Detect | 8 Gate | ✓ | Suricata + ET ruleset over real traffic, write a rule; tuning = detect-vs-enforce judgment. |
| 06 SIEM Fundamentals | 7 Build-&-Operate | 5 Detonate & Detect | ✓ | Stand up Wazuh, correlate, alert; "test every rule against data where you know the answer" is good. |
| 07 Log Parsing & Normalisation | 9 Tool-Build | 7 Build-&-Operate | ✓ | A reusable parser to a common schema (ECS); parse-rate verification is the AI-fails-silently lesson. |
| 08 Detection-as-Code | 8 Judgment-as-Code/Gate | 13 Eval Harness | ⚠ | Sigma in git + CI + known-bad/known-good is textbook Gate; the **regression-gate-on-a-corpus** half is asserted in prose but the lab should make the CI gate the deliverable. |
| 09 Detection Testing & Tuning | 5 Detonate & Detect | 13 Eval Harness | ⚠ | Purple-team loop is the right shape and the lab even emits FIRED/MISSED/FP + a coverage summary — but it stops at "script the loop," not a held-out corpus + a gate that **fails on regression**. Closest thing to #13 in the track; promote it. |
| 10 ATT&CK Mapping & Coverage | 13 Eval Harness | 8 Gate | ⚠ | "Coverage ≠ effectiveness" is exactly the eval thesis (measure, don't vibe), but deliverable is a Navigator layer, not a scored regression gate. Measurement type, under-built as eval. |
| 11 Threat Hunting — Endpoint | 6 Reconstruct | 7 Build-&-Operate | ✓ | Hypothesis-driven hunt over Velociraptor/osquery; "ruled out is a result," hunt→detection loop is solid. |
| 12 Threat Hunting — Network | 6 Reconstruct | 13 Eval Harness | ✓ | RITA beacon hunting; statistical-vs-baseline judgment is strong. Could carry a small precision eval (CDN FP). |
| 13 PowerShell Logging & Hunting | 5 Detonate & Detect | 2 Misconception Reveal | ✓ | Turn logging on (4104 deobfuscated), hunt the cradles; FP discrimination (internal vs external) is the lesson. |
| 14 Alert Triage & IR | 6 Reconstruct | 11 Decision/ADR | ✓ | NIST lifecycle in TheHive to a documented verdict; the verdict-memo discipline fits Reconstruct well. |
| 15 Threat Intelligence | 7 Build-&-Operate | 2 Misconception Reveal | ✓ | MISP + real feeds; "assessment not collection," aging/confidence is the misconception-reveal core. |
| 16 Response Automation (SOAR) | 7 Build-&-Operate | 8 Gate | ✓ | Playbook trigger→enrich→decide→act with a human gate; "automate a wrong decision at machine speed" is the Family-II disaster framing. |
| 17 KEV-Driven Defense | 5 Detonate & Detect | 16 Drift/Steady-State | ✓ | Exploit a live KEV entry then detect it; the diff-the-feed / "complete last month is behind now" angle is genuine Drift — the only real #16 in the track. |

## Coverage gaps

- **#13 Eval Harness — present in spirit, never built as the deliverable (the headline gap).** Modules
  08, 09, and 10 all *describe* the eval thesis (test corpus, known-bad/known-good, coverage ≠
  effectiveness) but none ships the artifact: a **held-out labelled corpus + a scorecard + a CI gate
  that fails on regression**. Module 09's lab gets closest (it already produces FIRED/MISSED/FP +
  coverage), yet "Automate & own it" stops at scripting one loop. A detection track without a
  regression gate is exactly the mismatch the prompt warned about — fix by making the corpus+gate the
  committed deliverable in 09 (and referencing it from 08/10), or add a dedicated module (below).
- **#16 Drift/Steady-State — only 17 touches it.** Detection coverage decays continuously (a Windows
  update renames a field, a log source silently drops, a rule rots) — stated in 09's prose but never
  operated *over time*. There's no module about telemetry-source health / detection-decay monitoring as
  a steady-state practice. KEV (17) is feed-drift only.
- **#14 Adversarial Review — absent.** The track's AI posture ("AI authors a rule with broken logic →
  you review") is the perfect anchor for type 14, but no module makes catching subtly-wrong
  AI-generated detections/parsers/triage the whole lab. It's advisory in every "AI acceleration" box,
  never the deliverable.
- **#11 Decision/ADR — thin.** SIEM choice (Wazuh vs Elastic), metadata-vs-full-PCAP retention (04),
  and SOAR human-gate placement (16) are real defend-the-pick decisions framed only in passing; no ADR
  deliverable anywhere.
- Well-covered: Build-&-Operate (the telemetry phase), Detonate&Detect, and Reconstruct (hunting + IR)
  are all strong and correctly shaped.

## Suggested additions

1. **Detection Eval Harness (type 13)** — the highest-value add. A held-out, labelled corpus of
   attack + benign telemetry; run the whole Sigma ruleset against it; emit a precision/recall scorecard
   per rule; a **CI gate that fails the PR on a coverage or FP regression**. This is the missing spine
   that 08/09/10 keep gesturing at. Could also be delivered by *upgrading module 09* rather than adding
   a 18th module — preferred if the track is already long.

2. **Detection & Telemetry Drift / Steady-State (type 16)** — the system is healthy at t=0 and blind at
   t=30. Monitor log-source heartbeat / volume anomalies (a source silently stopped), detect rule decay
   against the eval corpus over time, and reconcile. Deliverable: a drift detector + a reconciliation
   runbook. Pairs naturally with #1's corpus.

3. **Reviewing AI-Generated Detections (type 14)** — given a batch of AI-drafted Sigma rules / VRL
   parsers / triage verdicts that are *subtly* wrong (matches the wrong field, drops 5% of lines,
   over-trusts a stale IOC), catch the failures and codify a trust policy. Turns the track's pervasive
   "AI authors → you review → you own it" thread into one concrete, scored lab. Could anchor the SOAR
   capstone instead of being standalone.
