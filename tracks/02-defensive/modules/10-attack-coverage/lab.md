# Lab 10 — Map Your Coverage

## Setup
The [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) (in the browser), and your
detections from modules 08–09.

## Scenario
Turn your detections into an honest coverage map and a prioritised gap list.

## Do
1. [ ] List your detections (from 08–09) and the ATT&CK technique each genuinely catches.
2. [ ] Build a Navigator layer scoring your coverage across the matrix.
3. [ ] Identify your biggest gaps — and cross-reference your data sources (Phase 1): is the gap missing
   telemetry, or a missing rule?
4. [ ] Prioritise the next three detections to build, with reasoning (threat relevance, not just empty
   cells).

## Success criteria — you're done when
- [ ] You have a Navigator layer reflecting your *real* coverage.
- [ ] Each mapping is honest (the detection truly catches that technique).
- [ ] You have a prioritised, justified list of gaps to close.

## Deliverables
`coverage.json` (the Navigator layer) + `coverage.md`: your gaps and the prioritised next detections.

## AI acceleration
Have a model help map detections to techniques and draft the layer — then verify each mapping against
what the rule actually matches. Honest coverage beats impressive coverage.

## Connects forward
The gap list drives what you build next; coverage thinking carries into Track 05 (cloud detection) and
the SOC capstone.

## Marketable proof
> "I map detections and data sources to MITRE ATT&CK, visualise coverage and gaps in the Navigator, and
> prioritise detection work by real threat relevance."

## Automate & own it
**Required.** Generate the Navigator layer programmatically from your detections' ATT&CK tags (AI drafts
the script, you verify the mappings); commit it so coverage updates itself as you add rules.

## Stretch
- Score coverage with DeTT&CT and compare its data-source view to your rule view.
