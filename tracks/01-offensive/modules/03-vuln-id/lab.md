# Lab 03 — From Service Version to Known Vulnerability

## Setup
A browser for NVD / KEV / Exploit-DB, plus `searchsploit`:
```bash
docker run --rm -it kalilinux/kali-rolling bash -c "apt update && apt install -y exploitdb && searchsploit --help; bash"
```

## Scenario
Walk a real, well-known vulnerability through the whole ecosystem — or use a service/version
from your module 02 scan. Anchor example: **Log4Shell, CVE-2021-44228**.

## Do
1. [ ] Look the CVE up in **NVD**: record its description, CVSS score, and affected versions.
2. [ ] Find the **CWE** it maps to — the underlying weakness *class*.
3. [ ] Check whether it's in the **CISA KEV** catalog (exploited in the wild), and note what
   that implies for urgency.
4. [ ] Determine whether a public **proof-of-concept** exists (Exploit-DB / `searchsploit`).
5. [ ] Write a one-line **risk verdict**: how exploitable, how urgent, and why — citing KEV,
   not just CVSS.

## Success criteria — you're done when
- [ ] For your CVE you can state its CWE, CVSS, KEV status, and PoC availability.
- [ ] Your prioritisation is grounded in real-world exploitation signals, not CVSS alone.
- [ ] You can explain why a high-CVSS bug *not* in KEV might rank below a medium one that is.

## Deliverables
`vuln-assessment.md`: the CVE → CWE → CVSS → KEV → PoC chain, and your one-line risk verdict.

## AI acceleration
Have a model summarise the CVE, then verify every claim (version range, score, KEV status)
against NVD and the KEV catalog directly. Treat the model as a fast first draft, never the
source of truth.

## Connects forward
A confirmed, exploitable vulnerability is the input to module 04 (exploitation fundamentals).

## Marketable proof
> "I turn an enumerated service into a real risk assessment — CVE, CWE, CVSS, KEV, and PoC
> availability — and prioritise by what's actually exploited, not raw scores."

## Stretch
- Pull the same CVE data from the NVD API in Python and flag any of your findings that appear
  in KEV (a preview of Track 09).
