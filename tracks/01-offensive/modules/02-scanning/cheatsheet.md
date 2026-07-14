---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Scanning & Enumeration with nmap

*Companion to [Module 02 — Scanning & Enumeration](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only scan hosts you own or have explicit **written** permission to test. A scan is trivially logged and, unauthorized, can be illegal.

## Host discovery (what's alive)

```bash
nmap -sn 10.0.0.0/24              # ping sweep only — no port scan
nmap -sn -PR 10.0.0.0/24         # ARP scan (fast + reliable on a local subnet)
nmap -Pn 10.0.0.5                # skip discovery, treat host as up (when ICMP is blocked)
nmap -sL 10.0.0.0/24             # list targets, no packets sent (sanity-check your range)
```

## Port scanning (what's listening)

```bash
nmap 10.0.0.5                    # default: top 1000 TCP ports, SYN scan if root
nmap -p- 10.0.0.5                # all 65535 TCP ports
nmap -p 22,80,443 10.0.0.5       # specific ports
nmap --top-ports 100 10.0.0.5    # the 100 most common ports (fast first look)
nmap -sS 10.0.0.5                # SYN / half-open scan (default as root — stealthier, faster)
nmap -sT 10.0.0.5               # full TCP connect (no root; noisier — logs a full connection)
nmap -sU --top-ports 20 10.0.0.5 # UDP scan (slow — scope it tightly)
```

## Service & version detection (what software)

```bash
nmap -sV 10.0.0.5                # probe open ports for service + version
nmap -sV --version-intensity 9 10.0.0.5   # try harder (slower)
nmap -O 10.0.0.5                 # OS fingerprint (needs root)
nmap -A 10.0.0.5                 # aggressive: -sV -O --script=default --traceroute
```

## NSE — the Nmap Scripting Engine (enumeration)

```bash
nmap -sC 10.0.0.5                # run the "default" safe script category
nmap --script=vuln 10.0.0.5      # known-vuln checks (category)
nmap --script=http-enum -p80 10.0.0.5     # enumerate web paths
nmap --script=smb-enum-shares,smb-os-discovery -p445 10.0.0.5
nmap --script-help=http-enum      # read what a script does before firing it
ls /usr/share/nmap/scripts/       # browse installed scripts
```

## Timing, output, and being kind

```bash
nmap -T4 10.0.0.5                # faster timing (-T0 paranoid … -T5 insane)
nmap --max-rate 100 10.0.0.5     # cap packets/sec (protect fragile targets)
nmap -oA scan 10.0.0.5           # save all 3 formats: .nmap / .gnmap / .xml
nmap -oN scan.txt 10.0.0.5       # human-readable only
nmap -v 10.0.0.5                 # verbose progress (-vv for more)
```

## Gotchas worth remembering

- **A port number is a hypothesis, not an answer.** "443 open" means *something* is listening — only `-sV` and NSE turn that into "nginx 1.18 serving an admin panel." Never report a service from the port number alone.
- **Scanning is the loudest thing you'll do.** One source IP touching a fan of ports in a tight window is exactly the T1595 telemetry a SOC hunts. `-T4`/`-T5` and `-p-` trade stealth for speed — that's an engagement decision, not a default.
- **`-Pn` is a double-edged sword.** It stops nmap giving up on hosts that block ping, but it also makes nmap scan *every* target as if up — huge, slow scans if your range is mostly dead. Discover first, then `-Pn` the survivors.
- **UDP is slow and lies.** Open|filtered is the usual result because there's no handshake. Scope UDP to the ports you actually care about (53, 161, 500) rather than sweeping.
- **Save every scan (`-oA`).** You'll re-reference it, diff it against a later scan, and feed the `.xml` to other tools. Re-running a scan to recover output you didn't save is wasted noise on the target.
