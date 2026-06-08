# Lab 06 — Capture and Dissect a Live Exchange

## Setup
Docker-first — `netshoot` ships every tool you need (`tcpdump`, `curl`, `dig`):
```bash
docker run --rm -it nicolaka/netshoot bash
```

## Scenario
Observe one HTTP request end to end — the DNS lookup and the TCP handshake — captured by
you and read by you.

> Capture only on systems/networks you own, or inside this throwaway container.

## Do
Work out the commands from the Learn resources and `man tcpdump` — that derivation *is* the
lab.

1. [ ] Start a packet capture on all interfaces, writing to a file, in the background.
   (Which flags write to a file rather than print? How do you background a command?)
2. [ ] In another shell, generate exactly one DNS lookup and one HTTP request.
3. [ ] Stop the capture cleanly.
4. [ ] From the saved file, isolate just the DNS traffic and find the query and its answer.
5. [ ] Isolate the TCP handshake — the SYN, SYN-ACK, and ACK. (Hint: `tcpdump` can filter on
   TCP flags.)
6. [ ] Open the capture in Wireshark and "Follow TCP Stream" to read the whole exchange.

## Success criteria — you're done when
- [ ] You can point to the DNS query and the A record it returned.
- [ ] You can identify the SYN, SYN-ACK, and ACK that open the connection.
- [ ] You can state the client and server ports and the order of the first ~6 packets.

## Deliverables
A short `networking.md`: the resolved IP, the annotated handshake packets, and how many
packets were exchanged before any data flowed. Reference `cap.pcap` — do **not** commit it
(see `.gitignore`).

## AI acceleration
Paste any `tcpdump` line you don't understand to a model for a plain-English read of the
flags — then confirm it against your capture and `man tcpdump`.

## Connects forward
Reading the wire underpins Offensive recon/scanning, Defensive network monitoring
(Zeek/Suricata), and Forensic network reconstruction.

## Marketable proof
> "I can take a packet capture cold and walk the DNS lookup and the TCP handshake — and
> script the triage."

## Stretch
- Capture an HTTPS request (`curl https://example.com`): you'll see the TLS ClientHello but
  not the payload. Explain why — and what a defender can still learn from the metadata.
