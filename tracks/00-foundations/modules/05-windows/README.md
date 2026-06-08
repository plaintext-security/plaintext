# Module 05 — Windows for Security

**Foundations** — *the enterprise runs on Windows, and so do most attacks; you can't stay Linux-only.*

## Why this matters
Most organisations are Windows shops, Active Directory is the crown jewel attackers chase,
and the AD, Endpoint, and Forensics tracks all assume you can navigate Windows. If your
comfort stops at the Linux shell, half the job is invisible to you. This module builds the
Windows literacy — filesystem, registry, processes, event logs, PowerShell — those tracks
depend on.

## Objective
Navigate Windows for security work: the filesystem and registry, processes and services,
event logs, and basic PowerShell.

## Learn (~3 hrs)

**Fundamentals, hands-on**
- [TryHackMe — Windows Fundamentals (free rooms)](https://tryhackme.com/) — click-through coverage of the filesystem, users, the registry, and built-in tooling.
- [13Cubed — Introduction to Windows Forensics (~20 min)](https://www.youtube.com/watch?v=VYROU-ZwZX8) — a defender's tour of the Windows artifacts (registry, event logs, execution) you'll be inspecting.

**The native automation language**
- [Microsoft Learn — PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction) — enough PowerShell to inspect a system and automate the boring parts.

## Key concepts
- The Windows filesystem and important paths
- The registry: hives, keys, and why it matters for persistence and forensics
- Processes, services, and the Task Scheduler
- Windows event logs and Event IDs
- PowerShell basics for inspection and automation

## AI acceleration
A model is a fast PowerShell tutor and one-liner generator — but PowerShell runs with real
privilege. Read every generated command before running it, especially anything that touches
the registry, services, or `Invoke-` anything.
