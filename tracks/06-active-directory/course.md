# Active Directory & Windows Security — Course Overview

> **The enterprise runs on Active Directory, and so do most intrusions.** Learn the Windows and AD
> security model by attacking it — enumerate, roast Kerberos, steal and replay credentials, walk a
> path to Domain Admin — then close every step as code and prove it's closed.

| | |
|---|---|
| **Level** | Intermediate–Advanced — Foundations behind you; Offensive helps |
| **Format** | Self-paced · hands-on in every module · a lab Windows domain (GOAD or a local eval VM) |
| **Shape** | 11 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations; Track 01 — Offensive helps. Your own lab domain to attack. |
| **Cost** | Free — OSS-first; Windows VMs where the domain needs it. |

## What this course is

A red-then-blue path through the system most enterprises actually run on. You build your own lab
domain and attack it: map it with BloodHound, execute the core Kerberos and credential attacks, abuse
ACLs and delegation, chain it all into a single replayable path to Domain Admin — then turn around and
close that path with config-as-code and detections, measuring the before/after posture.

## What you'll be able to do

- Enumerate an AD environment and read its attack paths with BloodHound.
- Execute and explain the core Kerberos attacks — Kerberoasting and AS-REP roasting.
- Steal and replay credentials — pass-the-hash, pass-the-ticket — and abuse ACLs and delegation.
- Chain findings into a walked path from a low-privilege user to Domain Admin.
- Detect each attack and harden the domain as reproducible code.

## How it's taught

Every module follows the same honest loop: **attack a step in your own lab domain → understand why it
works → close it as code → prove it's closed with a detection or a posture delta.** AI summarises
BloodHound paths and drafts detection and hardening logic, but the domain is unforgiving of
hallucination — every path is validated in the lab, and generated hardening is reviewed before it ever
touches Group Policy.

There's no grading and no certificate. **Your repo is the credential** — the attack path, the
before/after score, and the detections you commit are the only proof. Build and attack environments
you own, only.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Map & break in** | AD & Windows Security Model · Enumeration · Kerberos Attacks · Credential Theft & Replay · ACL & Delegation Abuse | The core credential attacks executed and documented from a single low-privilege user, each tied to ATT&CK |
| **2 · Own the domain** | Lateral Movement · Persistence in AD · Path to Domain Admin | A single, replayable path from foothold to Domain Admin, with the BloodHound path that explains why |
| **3 · Detect & defend** | Detecting AD Attacks · Hardening AD as Code · Defending Identity | Detections for every step, AD hardened as code, and the before/after PingCastle posture delta |

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module is hands-on against a lab domain you build and own — GOAD (Game of Active Directory) or a
local Windows eval VM. The authorization rule is absolute: only attack environments you own. You don't
watch; you do.

## What you'll walk away with

An **AD portfolio piece**: find an attack path from a low-privilege user to Domain Admin in your lab
domain, walk it, then close it — harden as code and write a detection for each step you used —
delivering the attack path, the before/after posture score, and the detections a blue *and* red reader
can follow.

## Who it's for

Aspiring red teamers, AD-focused defenders, and identity engineers who've cleared Foundations. If you
want to understand why Domain Admin falls so often — and how to close the paths that get there — start
here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — AD & Windows Security Model →](modules/01-ad-windows-model/README.md)
