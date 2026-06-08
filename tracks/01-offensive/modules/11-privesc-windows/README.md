# Module 11 — Privilege Escalation: Windows

**Offensive Security** — *from a user shell to SYSTEM, usually via misconfiguration.*

## Why this matters
On Windows, the path from a normal user to SYSTEM runs through service misconfigurations,
excessive privileges, and unpatched kernels — and it's the step that turns a phishing
foothold into domain compromise. The same misconfigurations you abuse here are what Track 07
hardens and Track 06 chains into Active Directory attacks.

## Objective
Enumerate a Windows host for privilege-escalation vectors and exploit one to reach SYSTEM in
your lab.

## Learn (~4 hrs)

**The vectors**
- [LOLBAS Project](https://lolbas-project.github.io/) — the catalog of trusted Windows binaries abused to escalate and evade; the Windows counterpart to GTFOBins.
- [Windows Privilege Escalation for Beginners (video)](https://www.youtube.com/watch?v=uTcrbNBcoxQ) — a hands-on tour of the common vectors.

**Where it sits**
- [MITRE ATT&CK — Privilege Escalation (TA0004)](https://attack.mitre.org/tactics/TA0004/) — the tactic, mapped to Windows techniques.

## Key concepts
- Enumeration (what `winPEAS`/`PrivescCheck` automate)
- Service misconfigurations: unquoted paths, weak permissions
- Excessive token privileges (SeImpersonate and "potato" attacks)
- Unpatched kernel vulnerabilities
- Registry and scheduled-task abuse

## AI acceleration
A model reads `winPEAS` output and explains a vector quickly — but Windows privesc is full of
preconditions (service ACLs, token rights, patch level) the model can't see on your target.
Confirm each precondition yourself before exploiting.
