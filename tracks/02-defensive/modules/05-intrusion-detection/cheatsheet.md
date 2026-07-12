# Cheat sheet — Intrusion Detection (Suricata)

*Companion to [Module 05 — Intrusion Detection](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Run Suricata

```bash
suricata -r capture.pcap -l ./logs/          # offline: run rules over a PCAP, output to ./logs
suricata -i eth0                             # live capture on an interface
suricata -T -c /etc/suricata/suricata.yaml   # test config + rules, then exit (do this first)
suricata --list-runmodes                     # available run modes
suricata-update                              # fetch/update the ET Open ruleset
```

Alerts land in `logs/eve.json` (parse with `jq`) and `logs/fast.log` (one line each).

```bash
jq -c 'select(.event_type=="alert") | {sig:.alert.signature, sid:.alert.signature_id, src:.src_ip, dst:.dest_ip}' logs/eve.json
```

## Rule anatomy

```
action  header                                    (options)
alert   tcp  $HOME_NET any -> $EXTERNAL_NET 443    (msg:"..."; sid:1000001; rev:1;)
└────┘  └─┘  └──────┬──────┘    └──────┬────────┘
action  proto     source              destination + direction
```

- **action**: `alert` (IDS) · `drop`/`reject` (IPS, inline) · `pass`
- **proto**: `tcp` `udp` `icmp` `ip`, or app-layer `http` `dns` `tls` `ssh`
- **direction**: `->` (one way) or `<>` (either); `any` matches any port/host
- Every rule **needs a unique `sid`** and a `rev` (revision).

## Rule options — the payload/content matchers

```suricata
alert http $HOME_NET any -> $EXTERNAL_NET any ( \
    msg:"Suspicious User-Agent"; flow:established,to_server; \
    http.user_agent; content:"EvilBot"; nocase; \
    classtype:trojan-activity; sid:1000002; rev:1;)
```

Common options:

```
content:"str";  nocase;  depth:N;  offset:N;  distance:N;  within:N;   # byte matching
pcre:"/regex/i";                                                        # regex (slower)
flow:established,to_server;   flowbits:set,name;                        # state
http.uri;  http.host;  http.header;  dns.query;  tls.sni;              # sticky buffers
threshold:type limit, track by_src, count 5, seconds 60;               # rate-limit noise
reference:cve,2021-44228;   metadata:...;   classtype:...;             # context
```

## Emerging Threats rulesets

```bash
suricata-update list-sources                 # available rule feeds
suricata-update enable-source et/open        # the free community set (ET Open)
suricata-update                              # download + merge into /var/lib/suricata/rules
```

ET rule SIDs live in the **2000000–2999999** range; keep your own in **1000000+** to avoid collisions.

## Gotchas worth remembering

- **IDS alerts; IPS blocks — same engine, different risk.** Put a rule inline with `drop` and a false positive becomes an outage. Tune in IDS mode first, promote to IPS only when it's proven quiet.
- **Signatures are exact-match: high-confidence but easy to evade.** A new domain, new TLS fingerprint, or a padded payload slips a byte-precise rule. Read the rule to know what it *actually* keys on before trusting it.
- **A noisy ruleset is worse than no IDS.** Constant false positives train analysts to ignore alerts, so the one real hit gets ignored too. `threshold`/`suppress` and tuning are the daily job, not an afterthought.
- **Sticky buffers change scope.** `content` after `http.uri;` matches only the URI; the same `content` with no buffer matches the raw packet. Getting this wrong is why a rule "should fire" but doesn't.
- **Run `-T` before deploying.** One malformed rule can stop the whole engine loading. Test the config offline against a known-bad PCAP so you've *seen* it fire — you can't trust a rule you've never watched trigger.
- **Prefer community rules; stand on others' work.** ET Open encodes thousands of maintained signatures. Write your own only for the gap the feed doesn't cover.
