# Track 01 — Offensive Security

Learn to think like an attacker. Work an engagement end to end — reconnaissance,
exploitation, post-exploitation, and the professional reporting that makes the work
useful to a defender. The goal is not to collect exploits; it is to understand *why*
systems fall so you can explain and fix them.

## What you'll be able to do

- Map an attack surface from public information and active scanning.
- Identify, validate, and responsibly exploit common vulnerability classes.
- Attack web applications using the OWASP Top 10 as a guide.
- Escalate privileges, move laterally, and understand post-exploitation tradecraft.
- Write a clear, reproducible report that a defender can act on.

## The arc

| Phase | Modules | Focus |
|-------|---------|-------|
| Recon & mapping | 01–02 | Find and enumerate the attack surface |
| Finding the way in | 03–05 | Identify and exploit vulnerabilities (network + web) |
| After access | 06–08 | Credentials, privilege escalation, lateral movement |
| Closing the loop | 09 | Reporting and remediation guidance |

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Reconnaissance & OSINT | Passive and active intel gathering; building a target picture | `amass`, `theHarvester`, `recon-ng` |
| 02 | Scanning & Enumeration | Host discovery, service/version detection, and enumeration | `nmap`, `gobuster`, `enum4linux-ng` |
| 03 | Vulnerability Identification | Mapping findings to known weaknesses (CVE/CWE) and verifying them | `nuclei`, `searchsploit` |
| 04 | Exploitation Fundamentals | How exploits work; using and understanding a framework safely | `metasploit`, `msfvenom` |
| 05 | Web Application Attacks | Injection, broken auth, access control — the OWASP Top 10 in practice | `burpsuite CE`, `sqlmap`, `OWASP ZAP`, `ffuf` |
| 06 | Password & Credential Attacks | Hashing, cracking, spraying, and credential reuse | `hashcat`, `john`, `hydra` |
| 07 | Privilege Escalation | Local enumeration and escalation on Linux and Windows | `linpeas`, `winpeas`, `pwncat` |
| 08 | Post-Exploitation & Lateral Movement | Pivoting, tunneling, and AD attack paths | `BloodHound`, `chisel`, `ligolo-ng` |
| 09 | Reporting & Remediation | Turning findings into a clear, prioritised, reproducible report | `ghostwriter` |

## Prerequisites

Complete Track 00 — Foundations first.

> **Authorization is mandatory.** Only test systems you own or have explicit written
> permission to test. All labs use intentionally vulnerable targets (DVWA, locally spun
> VMs, free CTF rooms such as TryHackMe/HackTheBox free tiers). Never point these
> techniques at anything else.

## Standards & further reading

- OWASP Top 10 and the OWASP Testing Guide
- MITRE ATT&CK (Enterprise) for technique mapping
- MITRE CWE / NIST NVD for vulnerability classes
- PTES (Penetration Testing Execution Standard) for engagement structure
