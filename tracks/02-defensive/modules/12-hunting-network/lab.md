# Lab 12 — Hunt for C2 Beaconing

## Setup
Docker-first — [RITA](https://github.com/activecm/rita) (+ Zeek). Real data: Zeek logs from a real
malicious PCAP from [Malware-Traffic-Analysis.net](https://www.malware-traffic-analysis.net/) — pick
one whose write-up mentions C2/beaconing.

## Scenario
Hunt for command-and-control beaconing in real malicious network traffic.

## Do
1. [ ] Generate Zeek logs from a real malicious PCAP (reuse module 04), and import them into RITA.
2. [ ] Run RITA's beacon analysis: which destinations show regular, automated callbacks?
3. [ ] Investigate the top candidate — interval, jitter, data volume — and decide: C2 or benign?
4. [ ] Confirm against the site's write-up, and extract the C2 indicator.

## Success criteria — you're done when
- [ ] You identified a beaconing candidate in real traffic and judged it C2 or benign, with reasoning.
- [ ] Your finding matches the published write-up.
- [ ] You extracted the C2 indicator (domain/IP).

## Deliverables
`hunt-network.md`: the beacon candidate, your interval/jitter analysis, the verdict, and the C2
indicator. **This, with module 11, is Phase 2's hunt.**

## AI acceleration
Have a model help interpret RITA's scoring and a connection's timing — then verify against the data and
write-up. Regular ≠ malicious; a model can't tell your CDN from a C2 without the context.

## Connects forward
Network and endpoint hunts (11–12) complete Phase 2; the indicators feed threat intel (module 14), and
the C2 you find ties back to Track 01's C2 module.

## Marketable proof
> "I hunt for C2 beaconing in real network traffic with Zeek + RITA — interval/jitter analysis, a
> verdict, and indicator extraction."

## Automate & own it
**Required.** Script the pipeline — PCAP → Zeek → RITA → a ranked beacon report (AI drafts, you
validate against the known-bad PCAP); commit it.

## Stretch
- Hunt for DNS-based C2 / exfil in the same logs (long or high-entropy domains) and explain why it
  evades port-based detection.
