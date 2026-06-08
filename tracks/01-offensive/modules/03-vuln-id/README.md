# Module 03 — Vulnerability Identification

**Offensive Security** — *from "this host runs X 1.2.3" to "here's the known way in, and how urgent it is."*

## Why this matters
A service version is only interesting if you know its weaknesses. This module connects
enumeration to the real vulnerability ecosystem — CVEs, CWEs, exploit databases, and
(crucially) which vulnerabilities are *actually being exploited in the wild*. Anyone can
paste a version into a search box; the skill is judging real exploitability and urgency, not
just collecting CVSS scores.

## Objective
Map a service/version to its known vulnerabilities, and assess real-world exploitability and
urgency using authoritative sources.

## Learn (~3 hrs)

**The vulnerability ecosystem**
- [NIST National Vulnerability Database (NVD)](https://nvd.nist.gov/) — search a product/version for its CVEs; the canonical record, with CVSS scoring.
- [MITRE CWE](https://cwe.mitre.org/) — the weakness *type* a CVE maps back to (e.g. CWE-89, SQL injection).

**What actually matters**
- [CISA Known Exploited Vulnerabilities (KEV) catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) — vulnerabilities confirmed exploited in the wild; your real-world prioritisation signal.
- [Exploit-DB](https://www.exploit-db.com/) — public proof-of-concept exploits mapped to CVEs (and the backend for `searchsploit`).

## Key concepts
- CVE, CWE, and CVSS — what each is and isn't
- Mapping a service/version to known CVEs
- KEV and EPSS: exploited-in-the-wild and exploitation-likelihood signals
- Finding and judging public proof-of-concept exploits
- Prioritising by real risk, not raw CVSS

## AI acceleration
Models summarise a CVE and its impact well — and will also confidently state a wrong version
range or invent a CVE ID. Always confirm against NVD/KEV directly; in vulnerability work a
hallucinated "fact" wastes hours or sends you down a dead end.
