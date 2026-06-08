# Module 10 — Privilege Escalation: Linux

**Offensive Security** — *a shell is rarely root; this is how you get there.*

## Why this matters
Initial access usually lands you as a low-privilege user. Privilege escalation — turning that
foothold into root — is what makes an intrusion serious, and it almost always comes from
misconfiguration: a writable SUID binary, a permissive sudo rule, a hijackable cron job.
Finding these systematically (and, as a defender, removing them) is core to both attack and
hardening.

## Objective
Enumerate a Linux host for privilege-escalation vectors and exploit one to gain root in your
lab.

## Learn (~4 hrs)

**The vectors**
- [GTFOBins](https://gtfobins.github.io/) — the canonical catalog of Unix binaries that can be abused to escalate; you'll use this constantly.
- [Linux Privilege Escalation using `sudo -l` — GTFOBins (video)](https://www.youtube.com/watch?v=HnlYElVhXpo) — a worked example of turning one misconfigured sudo rule into root.

**Where it sits**
- [MITRE ATT&CK — Privilege Escalation (TA0004)](https://attack.mitre.org/tactics/TA0004/) — the tactic and its techniques.

## Key concepts
- Enumeration first (what `linpeas`/`pspy` automate — and what they look for)
- SUID/SGID binaries and GTFOBins
- sudo misconfigurations
- Writable cron jobs, PATH, and services
- Kernel exploits — and why they're the last resort

## AI acceleration
A model reads `linpeas` output and suggests the likely vector fast — a real accelerator. But
it also confidently points at a dead end or a kernel exploit that crashes the box. Verify the
vector by hand (check GTFOBins) before you pull the trigger.
