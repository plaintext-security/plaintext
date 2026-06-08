# Track 01 — Offensive Security

**Learn to think like an attacker.** Work an engagement end to end — recon, exploitation,
post-exploitation, and the reporting that makes it useful to a defender. The goal isn't to
collect exploits; it's to understand *why* systems fall so you can explain and fix them.

## What you'll be able to do
- Map an attack surface from public information and active scanning.
- Identify, validate, and responsibly exploit the major vulnerability classes.
- Attack web applications across the OWASP Top 10.
- Escalate privileges, move laterally, and run post-exploitation tradecraft.
- Write a clear, reproducible report a defender can act on.

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Reconnaissance & OSINT | Passive/active intel; building a target picture | `amass`, `theHarvester`, `recon-ng` |
| 02 | Scanning & Enumeration | Host discovery, service/version detection | `nmap`, `gobuster`, `enum4linux-ng` |
| 03 | Vulnerability Identification | Mapping findings to CVE/CWE and verifying | `nuclei`, `searchsploit` |
| 04 | Exploitation Fundamentals | How exploits work; framework + manual | `metasploit`, `msfvenom` |
| 05 | Memory Corruption Primer | Stack overflows and why exploits work | `gdb`, `pwntools` |
| 06 | Web — Injection | SQLi and command injection in practice | `sqlmap`, `burpsuite CE` |
| 07 | Web — Auth & Access Control | Broken auth, sessions, IDOR, privilege flaws | `burpsuite CE`, `ffuf` |
| 08 | Web — SSRF, XXE & Deserialization | Server-side classes and file-upload abuse | `OWASP ZAP` |
| 09 | Password & Credential Attacks | Hashing, cracking, spraying, reuse | `hashcat`, `john`, `hydra` |
| 10 | Privilege Escalation — Linux | Local enumeration and escalation | `linpeas`, `pspy` |
| 11 | Privilege Escalation — Windows | Token, service, and registry paths | `winpeas`, `PrivescCheck` |
| 12 | Pivoting & Lateral Movement | Tunneling and moving between hosts | `chisel`, `ligolo-ng`, `proxychains` |
| 13 | C2 & Post-Exploitation | Command-and-control and tradecraft | `sliver`, `pwncat` |
| 14 | Living-off-the-Land & Evasion | Native tooling and basic AV/EDR evasion | `LOLBAS`, `GTFOBins` |
| 15 | Cloud & Container Attack Primer | Where on-prem skills meet cloud (handoff to T05) | `pacu`, `peirates` |
| 16 | Reporting & Remediation | Prioritised, reproducible, defender-ready reports | `ghostwriter` |

## Phases & projects

The sixteen modules run in four phases; each ends in a **project** that chains its modules into
a portfolio-worthy artifact.

- **Phase 1 · Recon & mapping** (01–03) — **Project:** a full attack-surface map of an authorised
  target → scan → prioritised vulnerability list, scripted and reproducible.
- **Phase 2 · Finding the way in** (04–08) — **Project:** gain access to a real-CVE Vulhub target and
  exploit one web class on a deliberately vulnerable app, captured as a replayable PoC + writeup.
- **Phase 3 · After access** (09–15) — **Project:** from a foothold, crack credentials, escalate to
  root/SYSTEM, and pivot — documented as a single attack chain with the artifacts each step leaves.
- **Phase 4 · Closing the loop** (16) — **Project:** the track capstone — the professional
  engagement report.

## Prerequisites
Complete Track 00 — Foundations first.

> **Authorization is mandatory.** Only test systems you own or have explicit written
> permission to test. Labs use intentionally vulnerable targets (DVWA, locally spun VMs,
> free CTF rooms). Never point these techniques at anything else.

## Capstone
Run a full engagement against an intentionally vulnerable target — recon through
exploitation, privilege escalation, and lateral movement — and deliver a professional
report: findings, evidence, business impact, and prioritised remediation. **Deliverable:**
the report is the artifact, not the shell.

## AI & automation
AI drafts; you verify and own it. Models accelerate recon synthesis, payload and wordlist
generation, and turning findings into a readable report — but every vulnerability is
validated by hand (no hallucinated findings), every action stays in scope, and generated
exploit code is read before it's run.

## Standards & further reading
- OWASP Top 10 and the OWASP Web Security Testing Guide
- MITRE ATT&CK (Enterprise) for technique mapping
- MITRE CWE / NIST NVD for vulnerability classes
- PTES (Penetration Testing Execution Standard)
