# Lab 11 — Escalate to SYSTEM on Windows

## Setup
A Windows VM you own (the eval VM from Foundations module 02; snapshot first). Enumerate with
[winPEAS](https://github.com/peass-ng/PEASS-ng).

## Scenario
From a low-privilege account on a Windows host in your lab, enumerate and escalate toward
SYSTEM.

> Your own VM only.

## Do
1. [ ] As a standard user, enumerate the host for escalation vectors with `winPEAS` — then
   understand *why* each flagged item matters.
2. [ ] Identify one concrete vector — an unquoted service path, a service with weak
   permissions, or an excessive token privilege.
3. [ ] Exploit it to gain a higher-privileged (ideally SYSTEM) context.
4. [ ] Note the exact misconfiguration and the fix.

## Success criteria — you're done when
- [ ] You enumerated the host and identified a real escalation vector.
- [ ] You escalated privilege and can explain the misconfiguration you abused.
- [ ] You can state the fix (and how Track 07 would harden it).

## Deliverables
`windows-privesc.md`: the vector, the steps, proof of the higher-privilege context, and the
remediation.

## AI acceleration
Have a model interpret `winPEAS` output and shortlist vectors — then verify the preconditions
(service ACLs, token rights) on the actual target before exploiting. The model points; you
confirm.

## Connects forward
SYSTEM on a host is the springboard for Track 06 (Active Directory) attacks and lateral
movement (module 12).

## Marketable proof
> "I enumerate and escalate privilege on Windows — service and token misconfigurations via
> winPEAS/LOLBAS — to SYSTEM, and can explain each fix."

## Automate & own it
**Required.** Script the `winPEAS`-output triage to shortlist vectors and their preconditions; AI
drafts it, you verify the preconditions on the target; commit it.

## Stretch
- Research a real Windows privesc CVE such as **PrintNightmare (CVE-2021-34527)** and explain
  how it reached SYSTEM.
