# Module 01 — Reconnaissance & OSINT

**Offensive Security** — *the engagement starts here; the wider the attack surface you find, the more there is to test.*

## Why this matters
You can't attack what you can't see. Recon — passive OSINT and active mapping — is where
every real engagement and bug-bounty hunt begins, and the operators who find the most
surface find the most bugs. Done carelessly it's also where you wander out of scope and into
legal trouble, so disciplined, authorized recon is a skill in itself.

## Objective
Map a target's external attack surface from public information — domains, hosts,
technologies, and exposed services — without touching anything out of scope.

## Learn (~3 hrs)

**Methodology**
- [The Bug Hunter's Methodology v4 — Recon Edition (Jason Haddix, ~50 min)](https://www.youtube.com/watch?v=p4JgIu1mceI) — the canonical talk on how real hunters map an attack surface; watch once, then keep as a reference.
- [MITRE ATT&CK — Reconnaissance (TA0043)](https://attack.mitre.org/tactics/TA0043/) — the taxonomy of recon techniques you'll map findings to.

**Sources & tooling**
- [OSINT Framework](https://osintframework.com/) — a navigable map of open-source intelligence sources.
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — read the **Information Gathering** chapter for web-specific recon.

## Key concepts
- Passive vs active reconnaissance (and why the line matters legally)
- Subdomain enumeration (DNS, certificate transparency)
- Technology fingerprinting
- OSINT: people, emails, leaked credentials, metadata
- Defining and staying inside scope

## AI acceleration
A model will synthesise scattered recon output into a tidy attack-surface map fast — and
just as fast hallucinate a subdomain that doesn't resolve. Treat its output as leads to
verify, never as confirmed assets, and never let it talk you out of scope.
