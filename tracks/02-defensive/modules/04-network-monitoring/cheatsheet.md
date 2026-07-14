---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Network Security Monitoring (Zeek)

*Companion to [Module 04 — Network Security Monitoring](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Run Zeek over a capture

```bash
zeek -r capture.pcap                    # process a PCAP → writes conn.log, dns.log, etc. to CWD
zeek -r capture.pcap local              # ...with the default 'local' policy scripts loaded
zeek -i eth0                            # live capture on an interface
zeek-cut -h < conn.log                  # show a log's column headers (field names)
```

Logs are tab-separated with a `#fields` header. `zeek-cut` pulls named columns:

```bash
cat conn.log | zeek-cut id.orig_h id.resp_h id.resp_p service duration orig_bytes resp_bytes
```

## The logs you live in

| Log | One line per… | Key fields |
|-----|---------------|-----------|
| `conn.log` | connection | `id.orig_h`, `id.resp_h`, `id.resp_p`, `proto`, `service`, `duration`, `orig_bytes`, `resp_bytes`, `conn_state` |
| `dns.log` | DNS query | `query`, `qtype_name`, `rcode_name`, `answers` |
| `http.log` | HTTP request | `host`, `uri`, `method`, `user_agent`, `status_code` |
| `ssl.log` | TLS handshake | `server_name` (SNI), `ja3`, `ja3s`, `version`, `validation_status` |
| `files.log` | file seen | `mime_type`, `md5`, `sha1`, `total_bytes` |

## Fast hunts with zeek-cut + shell

```bash
# Top talkers by bytes out (exfil shape: bytes-out dwarfing bytes-in)
cat conn.log | zeek-cut id.orig_h id.resp_h orig_bytes resp_bytes | sort -k3 -rn | head

# Longest-lived connections (persistent C2)
cat conn.log | zeek-cut id.orig_h id.resp_h duration | sort -k3 -rn | head

# Absurdly long DNS queries (tunnelling)
cat dns.log | zeek-cut query | awk '{ print length, $0 }' | sort -rn | head

# Rare SNIs / JA3 fingerprints
cat ssl.log | zeek-cut ja3 server_name | sort | uniq -c | sort -n | head
```

## conn_state — read the connection outcome

`S0` attempt, no reply · `S1` established, not closed · `SF` normal complete · `REJ` rejected · `RSTO`/`RSTR` reset by orig/resp · `OTH` no SYN seen. `S0` floods = scanning; long `S1` = live channel.

## Zeek scripting (event-driven)

```zeek
# local.zeek — react to events; fires per connection/log record
event dns_request(c: connection, msg: dns_msg, query: string, qtype: count, qclass: count)
    {
    if ( |query| > 50 )                 # |query| = string length
        print fmt("long DNS query from %s: %s", c$id$orig_h, query);
    }
```

## Gotchas worth remembering

- **Metadata beats content when content is encrypted.** You can't read a TLS payload, but timing, volume, SNI, JA3, and cert details usually surface the beacon anyway. Hunt the *shape*, not the bytes.
- **Zeek tells you what happened on the wire, not what's normal for *your* wire.** "Rare destination," "new JA3," "beaconing" all need a baseline you build. A model summarising conn.log can't supply that.
- **Bytes-out ≫ bytes-in is the exfil tell; regular interval is the beacon tell.** Neither is visible in a single connection — you have to aggregate across many rows.
- **`-r` writes logs to the current directory.** Run each PCAP in its own folder or you'll overwrite the last run's logs and mix evidence.
- **Metadata is cheap to keep long; full packets (Arkime) are expensive.** Decide the retention split *before* the incident — most shops keep metadata long, full packets briefly.
- **`service` is Zeek's guess by protocol analysis, not by port.** That's the point — it catches C2 running its own protocol over port 443, which a port-based view would call "https."
