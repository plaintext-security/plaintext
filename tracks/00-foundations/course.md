# Foundations — Course Overview

> **The bedrock of everything else.** Set up a safe lab, work Linux *and* Windows, read the
> network and the web, handle data and crypto, automate with Python, and work in the open with git —
> each skill learned by autopsying the real breach that makes it matter.

| | |
|---|---|
| **Level** | Beginner — no prior security experience assumed |
| **Format** | Self-paced · hands-on labs in every module · one-command Docker |
| **Shape** | 12 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | A computer that runs Docker. That's it. |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The floor the whole curriculum stands on. You don't memorise definitions — you stand up a real lab
and *use* the fundamentals: read a packet capture, triage a compromised host, decode a malware blob,
crack a badly-hashed password, threat-model the system you built. Build this floor solid and every
specialisation above it gets easier.

## What you'll be able to do

- Stand up an isolated, reproducible lab and work fluently with containers.
- Operate **both Linux and Windows** from the command line for security tasks.
- Read network traffic, HTTP, and the encodings security data actually shows up in.
- Explain the cryptographic primitives that secure modern systems — and where they fail.
- Automate with Python and work in the open with git, with secrets kept out of history.

## How it's taught

Every module follows the same honest loop: **anchor on a real public breach → build the actual skill
on a real-shaped artifact → explain what failed → turn the manual work into a small reviewable
script.** AI is assumed from day one — as an accelerator you direct and review, never a substitute for
understanding. The standing posture: **AI drafts → you review every line → you own it.**

There's no grading and no certificate. **Your repo is the credential** — the committed artifact is the
only proof, to you and to anyone who reads it.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Lab & first principles** | Security First Principles · Building a Safe Lab · Docker & Containers | An isolated lab captured as a rebuild-from-zero script |
| **2 · Hosts & networks** | Linux · Windows · Networking · Web & HTTP | A scripted triage toolkit for a Linux *and* a Windows host, plus a walked packet capture |
| **3 · Data, crypto, automation & git** | Data & Encoding · Cryptography · Scripting · Version Control · Threat Modeling | A Python "foundations toolkit" repo — decode, crypto-check, log-parse, all committed with clean hygiene |

Each module opens on a real incident — Equifax, Adobe, Target, SUNBURST, Mirai, Firesheep, the Toyota
key leak — so the fundamental is never abstract.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) built on real artifacts —
real logs, real captures, a real password-dump scheme — not toy examples. You don't watch; you do.

## What you'll walk away with

A **`foundations/` portfolio piece**: capture and walk an HTTP exchange end to end (DNS → handshake →
TLS), decode a real layered blob *by committed script*, check crypto the right way (a salted hash, not
ECB), parse a real log, and threat-model the little system you built — your first piece of public proof.

## Who it's for

Complete beginners, and anyone solidifying fundamentals before a specialisation track. If you can't yet
explain why base64 isn't encryption or why deleting a secret in the next commit doesn't remove it, start
here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Security First Principles →](modules/01-security-principles/README.md)
