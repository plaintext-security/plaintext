# Module 11 — Privilege Escalation: Windows

*Type 2 · Misconception Reveal — enumerate a Windows host and escalate to SYSTEM via a real service-misconfig/potato technique, revealing that the precondition minefield, not an exploit, is the hard part. (Secondary: Blast-Radius Trace — local SYSTEM is a springboard to Domain Admin.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-06*

**Offensive Security** — *from a user shell to SYSTEM, usually via misconfiguration.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Same goal as Linux — low-privilege user → SYSTEM — and the same root cause, misconfiguration, but
    Windows has its own idioms: service misconfigurations (unquoted paths, weak ACLs), excessive token
    privileges (the `SeImpersonate` right the "potato" attacks abuse), unpatched kernels, scheduled
    tasks. The method is identical: enumerate first (`winPEAS`/`PrivescCheck`), exploit second. The
    bridge worth drawing — **Windows privesc runs straight into Active Directory.** Local SYSTEM is
    rarely the goal; it's the springboard to the domain, as PrintNightmare (CVE-2021-34527) showed.

## Why this matters
On Windows, the path from a normal user to SYSTEM runs through service misconfigurations,
excessive privileges, and unpatched kernels — and it's the step that turns a phishing
foothold into domain compromise. Sometimes it's a single unpatched flaw: **PrintNightmare
([CVE-2021-34527](https://nvd.nist.gov/vuln/detail/CVE-2021-34527))**, a Print Spooler bug
present on essentially every Windows host, let any authenticated user load a malicious driver
and run code as SYSTEM — and, because the Spooler runs everywhere including Domain Controllers,
it scaled straight to domain compromise. The same misconfigurations you abuse here are what
Track 07 hardens and Track 06 chains into Active Directory attacks.

## Objective
Enumerate a Windows host for privilege-escalation vectors and exploit one to reach SYSTEM in
your lab.

## The core idea
Same goal as the Linux module — low-privilege user → SYSTEM — and the same root cause, misconfiguration,
but Windows has its own idioms worth knowing, because this is the step that turns a phishing foothold
into domain compromise. The vectors cluster differently: **service misconfigurations** (an unquoted
service path, or a service whose binary or ACL you can overwrite, running as SYSTEM), **excessive token
privileges** (the `SeImpersonate` right the "potato" attacks abuse to become SYSTEM), unpatched kernels,
and scheduled-task or registry abuse. The method is identical to Linux — enumerate the misconfigurations
first (`winPEAS`/`PrivescCheck`), exploit second — only the catalog of where admins slip is different.

!!! note "The mental model"
    **Windows privesc runs straight into Active Directory.** The same token, service, and privilege
    misconfigurations you abuse on one host are what the AD track chains across a domain, and what the
    endpoint-hardening track locks down. Local SYSTEM is rarely the goal on Windows — it's the
    springboard to the domain. PrintNightmare (CVE-2021-34527) is the case study: a local-to-SYSTEM
    bug that, because the vulnerable service runs on Domain Controllers too, became a domain-takeover
    primitive — the clearest illustration of why a single host's privesc is never just about that host.

!!! warning "The gotcha"
    Windows privesc is a minefield of **preconditions** — a specific service ACL, a token right, a
    patch level — that decide whether a vector actually works. A vector that reads perfectly on a blog
    fails silently on a box that doesn't meet its preconditions; confirm each one before you fire.

!!! tip "AI caveat"
    A model will explain a vector cleanly and then confidently propose one whose preconditions your box
    doesn't meet, wasting your time or alerting the defender. Confirm each precondition yourself before
    exploiting — the model can't see your target's ACLs, token rights, or patch level.

## Learn (~4 hrs)

**The vectors**
- [LOLBAS Project](https://lolbas-project.github.io/) — the catalog of trusted Windows binaries abused to escalate and evade; the Windows counterpart to GTFOBins.
- [Windows Privilege Escalation for Beginners (video)](https://www.youtube.com/watch?v=uTcrbNBcoxQ) — a hands-on tour of the common vectors.
- [NVD — PrintNightmare (CVE-2021-34527)](https://nvd.nist.gov/vuln/detail/CVE-2021-34527) — the authoritative record of the Print Spooler RCE; read it for the affected versions and how a spooler bug became a local-to-SYSTEM and domain-takeover primitive.

**Where it sits**
- [MITRE ATT&CK — Privilege Escalation (TA0004)](https://attack.mitre.org/tactics/TA0004/) — the tactic, mapped to Windows techniques.

## Key concepts
- Enumeration (what `winPEAS`/`PrivescCheck` automate)
- Service misconfigurations: unquoted paths, weak permissions
- Excessive token privileges (SeImpersonate and "potato" attacks)
- Unpatched kernel and service vulnerabilities (e.g. PrintNightmare / CVE-2021-34527 in Print Spooler)
- Registry and scheduled-task abuse

## AI acceleration
A model reads `winPEAS` output and explains a vector quickly — but Windows privesc is full of
preconditions (service ACLs, token rights, patch level) the model can't see on your target.
Confirm each precondition yourself before exploiting.

!!! question "Check yourself"
    - Name three Windows-specific privesc vector families and what each abuses.
    - What is `SeImpersonate` and why do the "potato" attacks care about it?
    - Why did PrintNightmare scale from a single host to domain takeover, and what does that say about local SYSTEM?
