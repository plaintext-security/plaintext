---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Threat Hunting: Network

*Companion to [Module 12 — Threat Hunting: Network](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The one fact this whole hunt rests on

**Machines are rhythmic; humans aren't.** An implant blends its *content* into normal web traffic but still calls home on a schedule — a regular interval (even with jitter) that no human browsing produces. Hunt the *rhythm*, not the payload.

## Generate Zeek logs, then hunt them

```bash
zeek -r capture.pcap                    # produce conn.log / dns.log from a PCAP
rita import ./logs mydataset            # import Zeek logs into a RITA dataset
rita list                               # list imported datasets
```

## RITA — the beacon/long-conn/rare-dest maths

```bash
rita show-beacons   mydataset           # ranked by beacon score (regular callback = high)
rita show-long-connections mydataset    # persistent channels (long total duration)
rita show-strobes   mydataset           # very high-frequency, low-jitter connectors
rita show-exploded-dns mydataset        # DNS breadth per domain (tunnelling tell)
```

Read the beacon score as *confidence it's mechanical*, then apply judgment about whether mechanical = malicious. `--limit N` and `-H` (human-readable) help; pipe to `grep` to focus a src/dst pair.

## Zeek conn.log — the three classic shapes, by hand

```bash
# 1) BEACONING — count connections per src→dst pair (regular repeats bubble up)
cat conn.log | zeek-cut id.orig_h id.resp_h | sort | uniq -c | sort -rn | head

# 2) LONG CONNECTIONS — persistent C2 channels
cat conn.log | zeek-cut id.orig_h id.resp_h duration | sort -k3 -rn | head

# 3) RARE DESTINATIONS — external IPs almost nobody talks to
cat conn.log | zeek-cut id.resp_h | sort | uniq -c | sort -n | head

# Exfil shape: bytes-out dwarfing bytes-in
cat conn.log | zeek-cut id.orig_h id.resp_h orig_bytes resp_bytes | sort -k3 -rn | head
```

## DNS-based C2 & exfil (its own attention — often allowed straight out)

```bash
# Long / high-entropy queries — tunnelling
cat dns.log | zeek-cut query | awk '{print length, $0}' | sort -rn | head
# One domain, huge number of distinct subdomains — the exfil channel
cat dns.log | zeek-cut query | rev | cut -d. -f1,2 | rev | sort | uniq -c | sort -rn | head
```

## Reading a beacon candidate

- **Interval regularity** — connections spaced at a near-constant delta (jitter is a % band, not chaos).
- **Small, similar payload sizes** — the check-in is a fixed message, not variable browsing.
- **Long total span** — beacons for hours/days, not a one-off burst.

## Gotchas worth remembering

- **Statistical, not signature — and statistics without a baseline lie.** RITA surfaces *mechanical* traffic; distinguishing mechanical-benign from mechanical-malicious needs *your* environment's context.
- **The textbook false positive is a CDN, NTP source, or telemetry agent that also polls on a fixed interval.** RITA ranks it high and a model will gladly call it "C2." Rule out the benign periodic talkers first.
- **Beaconing shows even through full TLS.** You can't read encrypted content, but timing and volume are in the clear — which is exactly why rhythm is the hunt.
- **Jitter doesn't hide a beacon; it just widens the interval band.** A % jitter still clusters around a mean. Don't dismiss a candidate because the delta isn't perfectly constant.
- **DNS deserves separate scrutiny** — it's so often allowed straight out that it becomes the favourite tunnelling/exfil channel. Long queries and high subdomain cardinality per domain are the tells.
- **Verify every candidate against the data and the known-bad write-up.** The tool ranks; you decide. A high beacon score is a lead, not a verdict.
