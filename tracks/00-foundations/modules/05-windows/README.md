# Module 05 — Windows for Security

*Type 7 · Build-&-Operate — build the Windows literacy (filesystem, registry, services, event logs, PowerShell) to triage a host the way a defender does. (Secondary: Reconstruct — read a real event-log sample to surface Emotet-style persistence and obfuscated execution by Event ID.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Foundations** — *the enterprise runs on Windows, and so do most attacks; the registry and the event log are where the truth is written.*

<!-- module-meta -->
**Difficulty:** Beginner &nbsp;·&nbsp; **Estimated time:** ~4–5 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Module 04 — Linux for Security](../04-linux/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    The enterprise runs on Windows, and so do most attacks — and Windows is *loud*: where Linux
    scatters logs and config, Windows **centralises** into two ground-truth stores, the **registry**
    and the **event log**. Persistence and execution both leave specific, *named* traces there: a
    Run key or a service install (7045) for persistence, an `-EncodedCommand` PowerShell launch
    captured in a 4688 process-creation event. You'll triage a real event-log sample for Emotet-style
    moves by their Event ID — and learn that on Windows you filter by *number*, not by grepping text.

## Why this matters
Most organisations are Windows shops, and most commodity malware lands on a Windows desktop
first. If your comfort stops at the Linux shell, half the job — and half of every real
intrusion — is invisible to you. The good news: Windows is *loud*. When an attacker installs a
service to survive a reboot, or runs an obfuscated command to download a payload, the operating
system writes it down in a place with a known name and a known number. This module builds the
literacy to read that record: filesystem, **registry**, services, **event logs**, and enough
**PowerShell** to inspect and automate. The AD, endpoint, and forensics tracks all assume it.

## Objective
Triage a Windows host the way a defender does: navigate the filesystem and registry, inspect
processes and services, read event logs by their Event ID, and use basic PowerShell to find
attacker persistence and execution in a real event-log sample.

## The case (the stakes, kept short)

**Emotet** is one of the most prolific pieces of commodity malware ever shipped — a modular
loader that begins as a malicious email attachment and ends as a foothold sold on to ransomware
crews. CISA called it "among the most costly and destructive malware affecting" governments and
businesses. Its playbook on a freshly-infected Windows box is boringly typical, and that is
exactly why it's worth studying: it does what *most* Windows malware does.

Two of its moves leave textbook traces in the Windows logs:

1. **It runs an obfuscated PowerShell command** to pull down its payload — usually launched with
   `-EncodedCommand` and a wall of base64 so a human skimming the logs won't read it at a glance.
   That launch is recorded as a **process-creation event** with the full command line.
2. **It installs itself as a Windows service** so it restarts every boot. A new service install is
   recorded — once — as a single, specific event.

You don't need to reverse-engineer Emotet to catch it. You need to know *which two events* those
moves write, and what "normal" looks like so the abnormal stands out. That's the whole skill.

## The mental model

On Linux you learned that logs scatter across `/var/log` and config scatters across `/etc`. The
shift for Windows is that **it centralises where Linux scatters — and the two places it
centralises into are the registry and the event log, and those two are your ground truth.**

!!! note "The mental model"
    Windows *centralises where Linux scatters.* The **registry** is one giant config/runtime
    database (the attacker's favourite hiding spot and the defender's first stop); the **event log**
    is `/var/log`'s answer, except every event carries a numeric **Event ID** that names exactly what
    happened. On Windows you don't grep for a phrase — you filter for an ID.

!!! warning "The gotcha"
    The full process command line — where the `-EncodedCommand` actually shows up — is logged in
    Event 4688 only if you turn it on; **it's off by default.** "I checked the event log" means
    nothing if the one field that carries intent was never being recorded. Know what your auditing is
    actually capturing before you trust an absence of evidence.

- **The registry** is one giant hierarchical database of configuration and runtime state
  (`HKLM` for the machine, `HKCU` for the current user). Because so much "run this automatically"
  config lives there, it's both the attacker's favourite hiding spot and the defender's first
  stop. The classic example is a **Run key** — `...\CurrentVersion\Run` — a list of programs
  Windows launches at logon. Drop your malware's path into it and you have persistence in one
  line. (That's MITRE ATT&CK technique [T1547.001].)

- **The event log** is the Windows answer to `/var/log`, but every event has a **numeric Event
  ID** that names exactly what happened. You don't grep for a phrase; you filter for an ID. Learn
  a handful and you can triage:

  | Event ID | Meaning | Why it matters |
  |---|---|---|
  | **4624 / 4625** | Logon success / failure | who got in, from where, what *type* (10 = RDP, 3 = network) |
  | **4688** | A new process was created | the **full command line** — where you read the `-EncodedCommand` |
  | **4104** | PowerShell script-block logged | the *decoded* PowerShell, if script-block logging is on |
  | **4657** | A registry value was modified | the **Run-key write** — persistence, if registry auditing is on (T1547.001) |
  | **7045** | A new service was installed | Emotet's persistence — fires **once**, easy to spot |

!!! tip "AI caveat"
    PowerShell runs with real privilege and is the exact surface attackers abuse — signed,
    everywhere, often fileless. Whether you're reading attacker PowerShell or running an AI-drafted
    one-liner, read every line before it executes, especially anything touching the registry,
    services, or `Invoke-*`. "I ran the command without reading it" is how you damage a host or trip
    the very telemetry the blue team is watching.

## Learn (~3 hrs)

*Skill-first: the spine above is yours to own. Read these to get hands on the tooling, not to
re-learn the model.*

- [13Cubed — Introduction to Windows Forensics](https://www.youtube.com/watch?v=VYROU-ZwZX8) (~20 min) — a single intro episode (not the full playlist); a defender's tour of the exact artifacts you'll inspect: registry, event logs, execution evidence.
- [Microsoft Learn — PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction) (~1 hr, hands-on) — enough PowerShell to inspect a system and automate the boring parts. Do the *Get-* and *filtering* chapters; skip the rest for now.
- [Microsoft — Event 4688: A new process has been created](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688) (~15 min, skim) — the primary source for the event that carries the command line. Read the field list and note that **Process Command Line** is off by default — a real gap.
- [MITRE ATT&CK — T1543.003: Windows Service](https://attack.mitre.org/techniques/T1543/003/) and [T1059.001: PowerShell](https://attack.mitre.org/techniques/T1059/001/) (~15 min) — the two techniques you'll name in the lab, with real detection guidance. Read the *Detection* rows.
- [Fortinet FortiGuard Labs — A Deep Dive into the Emotet Malware](https://www.fortinet.com/blog/threat-research/deep-dive-into-emotet-malware) (~20 min) — a malware analyst's anatomy of the anchor: the custom packer, the service-install persistence, and the obfuscated execution and C2. It's the *why* behind the two events you triage here — the once-only service install (7045) and the encoded PowerShell (4688).

## Key concepts
- The registry and the event log are Windows's ground truth — persistence and execution both leave specific, named traces there.
- **Run keys** (`...\CurrentVersion\Run`) launch programs at logon — one line of persistence; T1547.001.
- **Event IDs name events**: filter by number, don't grep for text. Learn 4624/4625, 4688, 4104, 7045.
- A **service install (7045)** is Emotet-style persistence (T1543.003); it fires once and is easy to spot.
- **Encoded PowerShell** (`-EncodedCommand`, T1059.001) hides intent in base64 but lands in the 4688 command line in plain view.
- PowerShell runs with real privilege — read every line, attacker's or AI's, before it executes.

## AI acceleration
A model is a fast PowerShell tutor and a fast first-pass triage analyst: hand it a `Get-WinEvent`
export and ask "which of these is suspicious and why," and it will reliably flag the 7045 service
and the encoded command. But PowerShell runs as administrator and the model will confidently
hand you cmdlets that *change* the system, not just read it. Your job: review every generated
command before running it — especially anything touching the registry, services, or `Invoke-*` —
and confirm its triage verdict against the actual Event IDs rather than taking its word. You draft
with it; you own what runs.

!!! question "Check yourself"
    - On Windows you *filter by Event ID* instead of grepping text — which IDs would you pull for "a new service installed" and "a process with its full command line"?
    - Why can an empty 4688 command-line field be a *gap in your auditing* rather than evidence of innocence?
    - Emotet runs encoded PowerShell to make a human skimming the logs miss it — where does the launch still land in plain view?

[T1547.001]: https://attack.mitre.org/techniques/T1547/001/
