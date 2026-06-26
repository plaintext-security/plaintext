# Offensive Security — Course Overview

> **Learn to think like an attacker.** Work an engagement end to end — recon, exploitation,
> post-exploitation, and the report that makes it useful — so you understand *why* systems fall and
> can explain and fix them, not just collect shells.

| | |
|---|---|
| **Level** | Intermediate–Advanced — Foundations assumed |
| **Format** | Self-paced · hands-on labs in every module · one-command Docker |
| **Shape** | 17 modules · 4 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

A full attacker's workflow, run as a job — not a pile of exploits. You map an attack surface from
public information and active scanning, validate and responsibly exploit the major vulnerability
classes, work the OWASP Top 10, escalate and move laterally with real post-exploitation tradecraft,
and write the report a defender can act on. The shell is never the point; the explanation is.

## What you'll be able to do

- Map an attack surface from public information and active scanning.
- Identify, validate, and responsibly exploit the major vulnerability classes.
- Attack web applications across the OWASP Top 10.
- Escalate privileges, move laterally, and run post-exploitation tradecraft.
- Write a clear, reproducible report a defender can act on.

## How it's taught

Every module anchors on a real artifact — a real CVE on a Vulhub target, a deliberately vulnerable
app, an authorised scope — and ends in something you *build*: a scripted scan, a replayable PoC, a
documented attack chain. You don't collect techniques; you run an engagement and leave evidence a
defender could replay.

AI drafts and you own it: models accelerate recon synthesis, payload and wordlist generation, and
turning findings into readable prose — but every vulnerability is validated by hand (no hallucinated
findings), every action stays in scope, and generated exploit code is read before it runs. **AI
drafts → you review every line → you own it.** There's no grading and no certificate — **your repo is
the credential.**

> **Authorization is mandatory.** Only test systems you own or have explicit written permission to
> test. Labs use intentionally vulnerable targets — never point these techniques at anything else.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Recon & mapping** | Reconnaissance & OSINT · Scanning & Enumeration · Vulnerability Identification | A full attack-surface map of an authorised target → scan → prioritised vuln list, scripted and reproducible |
| **2 · Finding the way in** | Exploitation Fundamentals · Memory Corruption Primer · Web Injection · Web Auth & Access Control · Web SSRF, XXE & Deserialization | Access to a real-CVE Vulhub target and one exploited web class, captured as a replayable PoC + writeup |
| **3 · After access** | Password & Credential Attacks · Privilege Escalation (Linux) · Privilege Escalation (Windows) · Pivoting & Lateral Movement · C2 & Post-Exploitation · Living-off-the-Land & Evasion · PowerShell Offensive Tradecraft | A single documented attack chain — crack, escalate to root/SYSTEM, pivot — with the artifacts each step leaves |
| **4 · Closing the loop** | Cloud & Container Attack Primer · Reporting & Remediation | The track capstone — a professional, defender-ready engagement report |

Each module opens on a real attacker move and a real-CVE target, so the technique is never abstract.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) built on real targets —
Vulhub per-CVE images, deliberately vulnerable apps, real CVEs by ID — not toy examples. You don't
watch; you do.

## What you'll walk away with

A **professional engagement report**: run a full engagement against an intentionally vulnerable
target — recon through exploitation, privilege escalation, and lateral movement — and deliver
findings, evidence, business impact, and prioritised remediation. The report is the artifact, not the
shell — your portfolio proof you can do the job and write it up.

## Who it's for

Anyone who's done Foundations and wants to attack systems the way a working pentester does — and,
crucially, explain the failure well enough to fix it. If you can scan a box but couldn't yet write
the report a defender would act on, this is the track.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Reconnaissance & OSINT →](modules/01-recon/README.md)
