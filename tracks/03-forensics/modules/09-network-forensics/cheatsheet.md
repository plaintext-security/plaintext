# Cheat sheet — Network Forensics

*Companion to [Module 09 — Network Forensics](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Zeek — PCAP → structured logs (breadth first)

```bash
zeek -r capture.pcap                       # process a PCAP; writes conn.log, dns.log, http.log, …
zeek -r capture.pcap LogAscii::use_json=T  # JSON logs instead of TSV
zeek-cut -h < conn.log                     # print the column header names
```

- Zeek collapses a 50 GB capture into greppable rows: **one per connection, DNS query, HTTP
  transaction, file**. This is the first pass that narrows where you point tshark.

## The Zeek logs you actually read

```
conn.log   every connection: id.orig_h/id.resp_h, proto, duration, orig_bytes, resp_bytes
dns.log    every query: query, qtype_name, answers, rcode_name (NXDOMAIN = can't-find-C2)
http.log   every transaction: host, uri, method, status_code, resp_mime_types
files.log  every transferred file: md5, sha1, mime_type, source (check hash on VirusTotal)
ssl.log    TLS metadata: server_name (SNI), subject, issuer — visible even without decryption
```

## zeek-cut — slice columns from the logs

```bash
zeek-cut id.orig_h id.resp_h duration orig_bytes < conn.log | sort -k3 -nr | head   # longest flows
zeek-cut query rcode_name < dns.log | grep NXDOMAIN | sort | uniq -c | sort -nr     # NXDOMAIN storm
zeek-cut host uri method < http.log | grep -i '\.exe'                               # exe downloads
zeek-cut md5 mime_type source < files.log                                          # file hashes
```

## tshark — packet-level depth (pivot on the flagged flow)

```bash
tshark -r capture.pcap -Y "ip.addr==198.51.100.42"          # display filter on the suspect IP
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name   # every DNS query name
tshark -r capture.pcap -Y "http.request" -T fields \
    -e http.host -e http.request.uri                        # HTTP request lines
tshark -r capture.pcap --export-objects http,out/           # carve transferred HTTP objects
tshark -r capture.pcap -z conv,tcp -q                       # TCP conversation statistics
tshark -r capture.pcap -Y "tls.handshake.extensions_server_name" \
    -T fields -e tls.handshake.extensions_server_name       # SNI from TLS ClientHello
```

## Wireshark / tshark display filters (the ones you re-type)

```
ip.addr == 10.0.0.5           host either direction  (ip.src / ip.dst to pin)
tcp.port == 443               port either direction
http.request.method == "POST"
dns.qry.name contains "xyz"   DGA-looking subdomains
tcp.flags.syn==1 && tcp.flags.ack==0   SYN-only (scans)
frame.time >= "2026-07-10 14:00:00"    time window
```

- Right-click a packet → **Follow → TCP/HTTP Stream** to reassemble a full session interactively.

## Gotchas worth remembering

- **Zeek for breadth, tshark for depth.** Scrolling a 50 GB PCAP in Wireshark is a prayer, not a
  strategy. Grep the Zeek logs to find the handful of suspect flows, *then* pivot to packet-level.
- **Encryption doesn't end the investigation.** You usually can't decrypt TLS — but SNI, cert
  subject/issuer, connection timing, and beacon interval are all still readable. A fresh IP contacted
  at a regular cadence is detectable by *pattern* alone.
- **`files.log` gives you the hash without the file.** Check the md5/sha1 on VirusTotal to identify a
  dropper you never held. For unencrypted HTTP, `--export-objects` pulls the actual bytes.
- **A capture is attacker-unmodifiable ground truth** (from the victim's side) — they can wipe the
  host but can't un-send the packets. If you didn't capture it, though, it's gone: capture first.
- **Trace every AI/"looks suspicious" hunch to a specific log row** and document the field values,
  then confirm the packets in Wireshark before it's a finding.
