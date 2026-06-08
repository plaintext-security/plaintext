# Lab 05 — Alert on Real Malicious Traffic

## Setup
Docker-first — Suricata with the Emerging Threats ruleset:
```bash
docker run --rm -it -v "$PWD":/data -w /data jasonish/suricata -r capture.pcap
```
Real data: a real malicious PCAP from
[Malware-Traffic-Analysis.net](https://www.malware-traffic-analysis.net/) — the same self-contained
source as module 04.

## Scenario
Run an IDS over a real malicious capture, read the alerts, and confirm them against the known-bad
write-up.

## Do
1. [ ] Update the Emerging Threats ruleset, then run Suricata over the malicious PCAP.
2. [ ] Read `eve.json` / `fast.log`: what alerts fired, and what technique or malware do they name?
3. [ ] Correlate the alerts with the site's write-up — did Suricata catch the real activity?
4. [ ] Write one simple custom rule (e.g. alert on a specific domain or user-agent from the capture)
   and confirm it fires.

## Success criteria — you're done when
- [ ] Suricata produced alerts on the real malicious traffic.
- [ ] You can explain at least two alerts and tie them to the write-up.
- [ ] Your custom rule fires on the intended traffic.

## Deliverables
`ids.md`: the notable alerts, how they match the write-up, and your custom rule.

## AI acceleration
Have a model explain an unfamiliar alert signature or draft your custom rule — then verify it fires
correctly against the PCAP. A rule you can't test is a guess.

## Connects forward
Suricata alerts flow into the SIEM (module 06) and the detection-as-code workflow (module 08);
network indicators tie to module 12 (hunting).

## Marketable proof
> "I run Suricata with community rulesets over real malicious traffic, interpret the alerts, and
> write and test custom rules."

## Automate & own it
**Required.** Script a pass over Suricata's `eve.json` that summarises alerts by signature and
severity (AI drafts, you verify against the raw output); commit it.

## Stretch
- Run Suricata in IPS mode and explain what changes — and the risk of blocking on a false positive.
