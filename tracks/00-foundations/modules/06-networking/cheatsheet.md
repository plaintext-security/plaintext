# Cheat sheet — Networking & Packet Capture

*Companion to [Module 06 — Networking Fundamentals](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## tcpdump — capture

```bash
sudo tcpdump -D                          # list capture interfaces
sudo tcpdump -i eth0                      # capture on an interface
sudo tcpdump -i eth0 -w capture.pcap      # write raw packets to a file (open later in Wireshark)
sudo tcpdump -r capture.pcap              # read a saved capture back
sudo tcpdump -i eth0 -c 100               # stop after 100 packets
```

Useful output flags: `-n` (don't resolve names/ports — faster, honest), `-nn` (nor ports),
`-v`/`-vv` (more header detail), `-A` (payload as ASCII), `-X` (hex + ASCII), `-e` (link-layer/MAC),
`-tttt` (human-readable timestamps).

## tcpdump — BPF filters (the part everyone re-looks-up)

```bash
host 10.0.0.5                 # to or from this host
src host 10.0.0.5             # source only   (dst host for destination)
net 10.0.0.0/24               # a subnet
port 443                      # either direction   (src port / dst port to pin it)
portrange 8000-8100
tcp / udp / icmp              # by protocol
```

Combine with `and` / `or` / `not` and parentheses (quote them in the shell):

```bash
sudo tcpdump -i eth0 'tcp port 443 and host 10.0.0.5'
sudo tcpdump -i eth0 'udp port 53'                       # DNS — where C2 and exfil hide
sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0'  # SYN-only (scans)
sudo tcpdump -i eth0 'not arp and not port 22'           # cut the noise (and your own SSH)
```

- Filtering happens **in the kernel** before packets reach userspace — a tight filter is the
  difference between a readable capture and a firehose. Write the filter first.

## Connections and sockets — ss (netstat's modern replacement)

```bash
ss -tulpn         # TCP+UDP listeners, with process names and ports (the daily driver)
ss -tp            # established TCP connections + owning process
ss -s             # summary counts by state
ss dst 10.0.0.5   # filter by peer
```

Mnemonic: **t**cp **u**dp **l**istening **p**rocess **n**umeric.

## DNS lookups

```bash
dig example.com                 # full answer section
dig +short example.com          # just the address
dig example.com MX              # a specific record type (A, AAAA, MX, TXT, NS, CNAME)
dig @1.1.1.1 example.com        # ask a specific resolver
dig -x 1.1.1.1                  # reverse lookup (PTR)
```

## Quick connectivity checks

```bash
ping -c 4 host
traceroute host                 # the path, hop by hop
curl -sI https://host           # is HTTP up? (headers only)
nc -vz host 443                 # is one TCP port open?
nc -vz host 20-25               # ...a small range
```

## nmap — first-look scans

```bash
nmap -sn 10.0.0.0/24            # host discovery only (who's alive) — no port scan
nmap -sV -p- 10.0.0.5           # all 65535 ports + service/version detection
nmap --top-ports 100 10.0.0.5   # fast: the 100 most common ports
nmap -sV -sC 10.0.0.5           # versions + default safe scripts
```

> Only scan hosts you own or have **written** authorization to test. `nmap` against systems you
> don't own can be illegal and is trivially logged.

## Gotchas worth remembering

- A packet capture is **ground truth** — it records what was actually sent, not what a log claims.
  But if you didn't capture it, it's gone; start the capture *before* you reproduce the thing.
- DNS is UDP/53, rarely blocked, and implicitly trusted — which is exactly why SUNBURST-style
  beaconing and exfiltration ride it. Odd, long, high-entropy subdomains are the tell.
- Names/ports resolution (`tcpdump` without `-n`) can itself generate DNS traffic that pollutes
  your capture. Use `-n` when analyzing DNS.
