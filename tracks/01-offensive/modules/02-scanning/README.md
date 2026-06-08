# Module 02 — Scanning & Enumeration

**Offensive Security** — *turn a list of hosts into a map of services, versions, and ways in.*

## Why this matters
Once you know what exists, you need to know what it's running. Scanning and enumeration turn
IPs into a detailed picture — open ports, service versions, and the misconfigurations that
become footholds. Nmap is the field's standard, and reading its output fluently is a daily
skill for attackers and defenders alike.

## Objective
Discover live hosts, identify open ports and service versions, and enumerate a service
deeply enough to find an attack path.

## Learn (~3 hrs)

**The standard tool**
- [Nmap Reference Guide (the official book)](https://nmap.org/book/toc.html) — read the **"Port Scanning Techniques"** and **"Service and Version Detection"** chapters; the authoritative source, by Nmap's author.
- [Nmap for Beginners: A Complete Guide (video)](https://www.youtube.com/watch?v=z14HC3bJQpQ) — a visual walkthrough to pair with the book chapters.

**Where it sits**
- [MITRE ATT&CK — Active Scanning (T1595)](https://attack.mitre.org/techniques/T1595/) — scanning from the attacker-technique view (and how defenders detect it).

## Key concepts
- Host discovery
- TCP scan types (SYN vs connect) and when each applies
- Service and version detection
- The Nmap Scripting Engine (NSE) for enumeration
- Reading and recording scan output

## AI acceleration
A model will explain an unfamiliar Nmap flag or NSE script and summarise a big scan
instantly. But it can't tell you whether a result is real or whether your scan was too
aggressive for the engagement — that judgment stays yours. Verify against the actual output.
