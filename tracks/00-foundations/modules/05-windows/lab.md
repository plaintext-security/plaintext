# Lab 05 — Inspect a Windows System

## Setup
A Windows machine you own — a free
[Windows evaluation VM](https://developer.microsoft.com/windows/downloads/virtual-machines/)
in your lab (module 02) is ideal. Snapshot it first.

## Scenario
Profile a Windows host the way a defender or investigator would, using built-in tools and
PowerShell.

> Use only a VM or machine you own.

## Do
1. [ ] Enumerate local users and groups, and identify which have administrative rights.
   (PowerShell has cmdlets for this — find them.)
2. [ ] List running processes and services, and spot anything set to start automatically.
3. [ ] Open Event Viewer (or query logs with PowerShell) and find the events for logons.
   (What Event ID is a successful logon?)
4. [ ] Inspect one registry "Run" key — a classic persistence location — and explain what it
   controls.

## Success criteria — you're done when
- [ ] You can list local admins and auto-start services from the command line.
- [ ] You found the logon events in the Security log and know the key Event IDs.
- [ ] You can explain how a "Run" registry key gives an attacker persistence.

## Deliverables
`windows-recon.md`: the admin accounts, the auto-start items, the logon Event IDs you found,
and the persistence implication of the Run key.

## AI acceleration
Ask a model for the PowerShell to enumerate admins or query logon events — then verify each
cmdlet does only what you expect before running it as administrator.

## Connects forward
This is the Windows literacy Track 06 (Active Directory), Track 07 (endpoint hardening), and
Track 03 (forensics) assume.

## Marketable proof
> "I can profile a Windows host — users, services, event logs, registry, PowerShell — not
> just Linux."

## Stretch
- Use PowerShell to export the last 24 hours of logon events to CSV — a preview of the
  telemetry work in Track 02.
