# Lab 06 — Catch an Attack in a SIEM

## Setup
Docker-first — Wazuh (single-node) via its official compose:
```bash
git clone https://github.com/wazuh/wazuh-docker
cd wazuh-docker/single-node && docker compose up -d
```
(Or reuse the Elastic stack from module 01.)
Real data: ingest a real attack dataset — EVTX-ATTACK-SAMPLES (module 02), or the Zeek/Suricata output
from modules 04–05.

## Scenario
Get real attack telemetry into a SIEM, then build the correlation and dashboard that surface it.

## Do
1. [ ] Stand up the SIEM and confirm the dashboard loads.
2. [ ] Ingest a real attack dataset (EVTX samples, or your modules 04–05 output).
3. [ ] Build or tune a rule that alerts on the malicious behaviour — and confirm it fires on the
   attack and *not* on benign data.
4. [ ] Build a dashboard panel an analyst could triage from.

## Success criteria — you're done when
- [ ] Real telemetry is searchable in the SIEM.
- [ ] Your rule alerts on the attack with acceptable false positives.
- [ ] Your dashboard surfaces the activity at a glance.

## Deliverables
`siem.md`: the data ingested, your rule (and its false-positive behaviour), and a
screenshot/description of the dashboard.

## AI acceleration
Have a model draft the correlation rule/query — then validate it on data where you know the ground
truth (fires on the attack, quiet on the benign). Never ship an untested rule.

## Connects forward
The SIEM is where detection-as-code (module 08), hunting (11–12), and triage (13) all happen.

## Marketable proof
> "I stand up an open-source SIEM, ingest real attack telemetry, and build tested correlation rules
> and dashboards that surface it."

## Automate & own it
**Required.** Capture your SIEM rule(s)/dashboard as exported config-as-code that can be re-imported
(AI drafts, you test); commit it.

## Stretch
- Wire Suricata (module 05) and Zeek (module 04) into the SIEM so network and host alerts correlate
  in one place.
