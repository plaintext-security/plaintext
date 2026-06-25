# Audit — Track 08 Cryptography, PKI & Secrets

**Verdict:** Strong, consistent, fully de-Meridianed (uses "Corp"; zero "Meridian"). 10/12 modules done; **modules 11 & 12 lab envs are scaffolded but explicitly NOT executed/validated** (their own VALIDATION.md says so) — per CLAUDE.md Definition of Done those two labs are not yet done. Track README is stale: it documents only 01–10 and never mentions 11/12.

## Findings (one line per module)

- **01-primitives-practice** — clean (Type 2; full anatomy; 4-para original bridge; Learn grouped/time-boxed/why-lines; Adobe-2013 anchor; lab full template + Automate; real env + Makefile + demo).
- **02-symmetric-aead** — [POLISH] Learn has two empty header stubs ("IV reuse attack implementation", "Python cryptography library") — the first has no bullet; otherwise clean (WEP anchor, full lab/env).
- **03-asymmetric-key-exchange** — [POLISH] Learn "Forward secrecy" header has no bullet beneath it (orphan heading); otherwise clean (ROCA/PS3 anchors; env exists; module-meta says ~5–7 hrs vs Learn ~4 hrs, minor).
- **04-hashing-macs-passwords** — clean (Type 2; LinkedIn-2012 anchor; full lab + argon2 env + demo).
- **05-tls-deep-dive** — clean (Type 4; Heartbleed/POODLE/BEAST/DROWN anchors; nginx+testssl env + demo).
- **06-pki-certificates** — [POLISH] Learn "Revocation" header has no bullet (orphan heading); otherwise clean (DigiNotar/Debian anchors; step-ca env + demo).
- **07-secrets-management** — clean (Type 7; Uber-2016 anchor; Vault+SOPS env + demo).
- **08-secret-detection** — clean (Type 2; Toyota-2022 anchor; gitleaks/trufflehog env; README "Corp" custom-rule, lab uses MRDNSK- prefix — cosmetic only).
- **09-email-authentication** — clean (Type 2; Google/Facebook BEC anchor; bind9 env + apply-to-live-zone build half; full lab).
- **10-auditing-crypto-failures** — clean (Type 4; OWASP A02 anchor; 3-nginx-matrix env + demo).
- **11-pqc-migration** — [BLOCKER] lab env **not executed/validated** (VALIDATION.md: "scaffolded without a Docker run… has not been executed"; lab.md carries "Lab env to be built & validated" banner) → not done per Definition of Done; README/lab content itself excellent (Type 12; FIPS 203 anchor; auth note present; Automate present).
- **12-choosing-crypto** — [BLOCKER] `make` flow **not executed on a clean runner** (VALIDATION.md); writing-centric so low risk, but unvalidated = not done; [CONSISTENCY] both 11 & 12 absent from track README table/phases/capstone scope though present in mkdocs nav and fully authored.

## Track-level findings

- [CONSISTENCY] **Track README out of date**: module table, "Phases & projects" (says "ten modules… three phases"), and capstone scope cover only 01–10; modules 11 (PQC) and 12 (ADR) are never listed despite existing, being navigable, and being complete prose. Update table, phase mapping, and "What you'll be able to do".
- [POLISH] **No BASELINE/DELUXE tier markers** anywhere in the track (P5) — convention not applied here; flag only if the tier scheme is meant to be present.
- [POLISH] Recurring **orphan Learn sub-headings** with no bullet (02 ×2, 03, 06) — empty section headers left after restructuring.
- Spot-checked links (Schneier, ROCA NVD, FIPS 203, OpenSSL 3.5 ML-KEM man page, Nygard ADR, WEP PDF) all 200. De-Meridian: confirmed clean across tracks + labs.

## Counts

- BLOCKER: 2 (modules 11, 12 — unvalidated lab envs)
- CONSISTENCY: 2 (track README omits 11/12; 12 nav-vs-README)
- POLISH: 4 (no tier markers; orphan Learn headings ×~4 modules; minor time-estimate drift)

## Top 3 fixes

1. **Build & validate the 11-pqc-migration and 12-choosing-crypto lab envs** (`make up && make demo && make down` green on a clean Linux runner), remove the "to be built & validated" banners, then add `.ci-demo` where appropriate — the only true blockers.
2. **Refresh `tracks/08-cryptography/README.md`** to include modules 11 & 12 in the module table, phase map (it's 12 modules now, not 10), and capstone framing.
3. **Remove orphan Learn sub-headings** (or add the intended bullet) in modules 02, 03, 06.
