# Lab 08 — Write and Test a Sigma Detection

## Setup
Docker-first — `sigma-cli` (pySigma) to convert rules:
```bash
pip install sigma-cli   # or run it in a python container
```
Real data: [EVTX-ATTACK-SAMPLES](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES) (real attack
logs), and the [SigmaHQ rule repo](https://github.com/SigmaHQ/sigma) to compare against.

## Scenario
Write a portable detection for a real attacker technique and prove it fires on real attack telemetry
— not a toy example.

## Do
1. [ ] Pick a technique visible in an EVTX-ATTACK-SAMPLES capture (e.g. a suspicious process or
   registry persistence). Identify the field(s) that betray it.
2. [ ] Write a Sigma rule for it, with the ATT&CK technique in the tags.
3. [ ] Convert it to your SIEM's query language with `sigma-cli`, and run it against the real sample —
   confirm it fires.
4. [ ] Check it against benign data (or compare to the official SigmaHQ rule) — would it
   false-positive?

## Success criteria — you're done when
- [ ] Your Sigma rule fires on the real attack sample.
- [ ] It's tagged with the right ATT&CK technique.
- [ ] You've reasoned about its false-positive behaviour.

## Deliverables
`detection.yml` (the Sigma rule) + `detection.md`: the technique, the field logic, and your FP
reasoning. **Commit the rule to git** — that's the point.

## AI acceleration
Have a model draft the Sigma rule from your description — then run it against the real EVTX sample and
a benign set. The model writes; you test, tag, and own it.

## Connects forward
This rule gets *tested under fire* in module 09 and mapped for coverage in module 10; it's the core
skill of the whole track.

## Marketable proof
> "I write detection-as-code in Sigma — version-controlled, ATT&CK-tagged, converted to my SIEM, and
> tested against real attack telemetry."

## Automate & own it
**Required.** Put your rule in a repo with a tiny CI check (lint/convert it on commit); AI drafts the
workflow, you verify it runs; commit it. This is detection-as-code for real.

## Stretch
- Convert the same rule to a second backend and confirm it still matches — the "write once, detect
  anywhere" promise.
