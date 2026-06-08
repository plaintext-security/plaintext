# Module 12 — Threat Hunting: Network

**Defensive Operations** — *C2 hides in plain sight; beaconing is how you find it.*

## Why this matters
Attackers blend C2 into normal web traffic, but the *rhythm* gives them away — regular, repeated
callbacks (beaconing) that no human browsing produces. Network threat hunting looks for these
statistical tells across connection logs. RITA, working on Zeek logs, automates beacon and
long-connection analysis, and you can hunt real C2 in real malware traffic for free.

## Objective
Hunt for C2 beaconing and other anomalies in Zeek logs from real malicious traffic, using RITA and
your own analysis.

## Learn (~4 hrs)

**The method & tool**
- [Detecting Malware Beacons with Zeek and RITA (video)](https://www.youtube.com/watch?v=eETUi-AZYgc) — beacon hunting end to end.
- [RITA (Real Intelligence Threat Analytics)](https://github.com/activecm/rita) — OSS network-hunt tool: beacons, long connections, rare destinations.

**Concepts**
- [MITRE ATT&CK — Command and Control (TA0011)](https://attack.mitre.org/tactics/TA0011/) — what you're hunting and how it manifests on the wire.

## Key concepts
- Beaconing: regularity as a signal (interval + jitter)
- Long connections and rare destinations
- Hunting in connection logs (Zeek `conn.log`) at scale
- Statistical vs signature approaches
- DNS-based C2 and exfil

## AI acceleration
A model explains a suspicious connection pattern and drafts analysis of Zeek logs — but beaconing
detection is statistical, and the model can't see your baseline; it'll call a CDN's regular polling
"C2." Verify candidates against the data and the known-bad write-up.
