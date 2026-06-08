# Module 06 — Networking Fundamentals

**Foundations** — *you can't attack, defend, or investigate what you can't read on the wire.*

## Why this matters
Every security discipline rides on the network. An attacker maps it, a defender watches
it, a forensicator reconstructs it from what was captured. If you can't read a packet
capture and explain a TCP handshake or a DNS lookup, every later track is built on sand.
This module makes traffic legible — so `tcpdump` and Wireshark become tools you reason
with, not noise you stare at.

## Objective
Read network traffic at the packet level: explain how a connection is established and how
names resolve, then capture and dissect a real exchange yourself.

## Learn (~3–4 hrs)

**The model & the protocols**
- [Cloudflare — What is the OSI model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) — the layered model in plain language; read it first.
- [PracticalNetworking — Packet Traveling](https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/) — walks a packet hop by hop, TCP/IP and all; the clearest mental model out there.
- [How DNS Works (comic)](https://howdns.works/) — the resolution chain you'll watch in the lab, told as a friendly comic.

**Reading packets (video first, then hands-on)**
- [Chris Greer — TCP and the Three-Way Handshake (follow-along lab, ~15 min)](https://www.youtube.com/watch?v=wMc0H22nyA4) — he reads a real capture the way you will in the lab.
- [Julia Evans — "tcpdump is amazing"](https://jvns.ca/blog/2016/03/16/tcpdump-is-amazing/) — a short, practical on-ramp to the exact tool the lab uses.
- [Wireshark — Sample Captures](https://wiki.wireshark.org/SampleCaptures) — open a few and practice "Follow TCP Stream" before you make your own.

**Reference (skim, return as needed)**
- RFC 9293 (TCP) and RFC 791 (IP) — the source of truth; skim the headers, don't read cover to cover.

## Key concepts
- IP addressing and subnetting (IPv4/IPv6)
- The TCP three-way handshake (SYN / SYN-ACK / ACK)
- UDP and when it's used
- The DNS resolution chain
- Common ports and protocols (HTTP/S, SSH, DNS, SMTP)

## AI acceleration
AI can decode a capture faster than you can — paste a confusing `tcpdump` filter and it
will explain the flags and the handshake. Verify against the RFC and the man page; models
occasionally invent fields. Reading the packets yourself is still the skill.
