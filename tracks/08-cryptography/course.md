# Cryptography, PKI & Secrets — Course Overview

> **The trust layer of everything.** Go beyond the Foundations primer into applied cryptography, PKI,
> secrets management, and email authentication — choose the right primitive, run TLS and a cert chain
> end to end, hunt leaked credentials, and audit the real-world failures.

| | |
|---|---|
| **Level** | Intermediate — comfortable with the Foundations crypto basics |
| **Format** | Self-paced · hands-on in every module · one-command Docker |
| **Shape** | 10 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations, module 09 (Cryptography Basics). |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The applied layer on top of the Foundations primer. You don't memorise algorithms — you *use* them
correctly and learn to spot when they're misused: encrypt with AEAD, run a key exchange, hash
passwords with argon2, stand up a private CA and chain a certificate, scan a TLS service and explain
every cipher decision, hunt secrets in git history, and assess SPF/DKIM/DMARC. Then you audit a real
posture and fix what's broken.

## What you'll be able to do

- Choose and use the right primitive — and recognise the misuse each one invites.
- Run and reason about TLS and a certificate chain end to end, from handshake to revocation.
- Stand up a private CA, issue and chain certificates, and scan a TLS service.
- Manage secrets properly with Vault/SOPS and hunt for leaked ones in code and history.
- Audit email authentication and real-world applied-crypto failures, then re-test the fix.

## How it's taught

Every module follows the same honest loop: **use the primitive or tool correctly → see the misuse it
invites (ECB, nonce reuse, fast password hashes) → audit a real configuration → fix each finding and
re-test to prove it.** Crypto is where confident-but-wrong AI advice is dangerous — models suggest
broken modes and deprecated ciphers — so you use AI to explain and to draft audit tooling, then verify
every recommendation against current standards and the actual config.

There's no grading and no certificate. **Your repo is the credential** — the audit report, with
before/after evidence behind every claim, is the only proof. Trust the test output, not the model's
assurance.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Primitives in your hands** | Primitives in Practice · Symmetric & AEAD · Asymmetric & Key Exchange · Hashing, MACs & Passwords | A small, tested crypto toolkit that exercises each primitive correctly, with a note on the misuse each invites |
| **2 · TLS & PKI** | TLS Deep Dive · PKI & Certificate Management | A private CA with `step-ca`, a chained certificate and TLS service, and a `testssl.sh` scan you can explain step by step |
| **3 · Secrets & applied audit** | Secrets Management · Secret Detection & Leakage · Email Authentication · Auditing Applied-Crypto Failures | A full crypto-posture audit — TLS, certs, secrets, SPF/DKIM/DMARC — with every finding fixed and re-tested |

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) driven by real tools —
`openssl`, `testssl.sh`, `step-ca`, Vault, `gitleaks` — over real configurations, not toy examples.
You don't watch; you do.

## What you'll walk away with

A **crypto-audit portfolio piece**: audit a small system's full crypto posture — TLS configuration,
certificate hygiene, secrets handling, and SPF/DKIM/DMARC — hunt for leaked credentials, fix each
finding, and re-test, delivering a before/after audit report where every claim has a test behind it.

## Who it's for

Engineers and security practitioners who've met the Foundations crypto basics and want the applied
depth — to choose primitives with judgment, run a CA, and audit a real system. If you can use crypto
but can't yet tell a safe TLS config from a broken one, start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Primitives in Practice →](modules/01-primitives-practice/README.md)
