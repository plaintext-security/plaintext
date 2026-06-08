# Lab 10 — Escalate to Root on Linux

## Setup
Docker-first — a deliberately misconfigured Linux target, or a privesc training VM. For a
real-CVE angle, use a [Vulhub](https://github.com/vulhub/vulhub) local-privesc environment.
Enumerate with `linpeas`.

## Scenario
From a low-privilege shell on a host in your lab, enumerate and escalate to root.

> Your own lab only.

## Do
1. [ ] As a low-privilege user, enumerate the host for escalation vectors. (What does
   `linpeas` check? Run it, then understand *why* each finding matters.)
2. [ ] Identify one concrete vector — a SUID binary, a sudo rule, a writable cron/service.
3. [ ] Use [GTFOBins](https://gtfobins.github.io/) to turn that misconfiguration into a root
   shell.
4. [ ] Note exactly what the misconfiguration was and how a defender would remove it.

## Success criteria — you're done when
- [ ] You enumerated the host and identified a real escalation vector.
- [ ] You gained root and can explain the exact misconfiguration you abused.
- [ ] You can state the fix that closes it.

## Deliverables
`linux-privesc.md`: the vector, the GTFOBins technique, proof of root, and the remediation.

## AI acceleration
Have a model triage your `linpeas` output to shortlist vectors — then confirm the winning one
against GTFOBins yourself before exploiting. The model shortlists; you verify.

## Connects forward
Root on one host feeds lateral movement (module 12); the defensive inverse is Track 07 (host
hardening).

## Marketable proof
> "I enumerate and escalate privilege on Linux — SUID, sudo, and cron misconfigurations via
> GTFOBins — and can explain the fix for each."

## Stretch
- Exploit a real local-privesc CVE such as **PwnKit (CVE-2021-4034)** in a lab container, and
  explain why it was so widespread.
