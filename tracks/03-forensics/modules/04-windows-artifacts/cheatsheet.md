---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Windows Artifacts

*Companion to [Module 04 — Windows Artifacts](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## chainsaw — hunt EVTX without Windows

```bash
chainsaw hunt logs/ -s sigma/ --mapping mappings/sigma-event-logs-all.yml   # apply Sigma rules
chainsaw hunt logs/ -s sigma/ -r rules/ --csv --output out/                  # + chainsaw rules, CSV out
chainsaw search logs/ -t 'Event.System.EventID: =4624'                       # field query, no rules
chainsaw search logs/ -e 4688 --json                                         # by event ID, JSON out
chainsaw dump Security.evtx --json                                           # raw EVTX → JSON
```

- `hunt` = rule-driven triage (Sigma). `search` = you already know the field/value. Point it at a
  directory of `.evtx` — no Windows, no import.

## Security event IDs worth memorizing

```
4624  logon success          (LogonType 3 = network, 10 = RDP)
4625  logon FAILURE           (bursts = brute force / spray)
4688  process creation        (GOLD for execution — parent + command line)
4672  special privileges assigned at logon (admin-equivalent)
4768  Kerberos TGT requested   4769  Kerberos service ticket (0x12 = account disabled/locked)
4720–4726  account created / enabled / password reset / deleted
7045  service installed (System log — persistence)
1102  SECURITY LOG CLEARED     (104 = System log cleared)
```

## RegRipper — parse hives with plugins

```bash
rip.pl -r NTUSER.DAT -f ntuser          # run the ntuser profile (many plugins at once)
rip.pl -r SYSTEM   -p shimcache         # a single plugin
rip.pl -r SOFTWARE -p run               # autorun / Run keys
rip.pl -l                                # list available plugins
```

## python-registry — script hive parsing offline

```python
from Registry import Registry
reg = Registry.Registry("NTUSER.DAT")
key = reg.open("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
for v in key.values():
    print(v.name(), "->", v.value())
print(key.timestamp())                  # LAST WRITE time of the key (not creation!)
```

## Forensically important hives & keys

```
SYSTEM    \CurrentControlSet\Services            (service persistence)
          \CurrentControlSet\Control\...\AppCompatCache   (Shimcache — execution metadata)
SOFTWARE  \Microsoft\Windows\CurrentVersion\Run          (autorun persistence)
          \Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache  (scheduled tasks)
NTUSER.DAT \Software\Microsoft\Windows\CurrentVersion\Run
           \...\Explorer\RecentDocs, \...\RunMRU, \...\TypedPaths   (user activity / MRU)
```

## Execution-artifact trio (check all three)

```
Prefetch  C:\Windows\Prefetch\NAME.EXE-XXXXXXXX.pf   → ran, when, run count
Shimcache SYSTEM hive, AppCompatCache                → metadata even if prefetch is disabled
Amcache   C:\Windows\appcompat\Programs\Amcache.hve  → SHA1 of the binary (the SPECIFIC file)
```

## Gotchas worth remembering

- **Registry timestamps are last-*write* only** — not creation, not access. Reading "the key was
  created last night" off a last-write time is a classic error that fabricates a timeline.
- **Artifacts cross-corroborate — never rest a case on one source.** An attacker who clears one
  usually leaves the trail in another; a Security-log clear *records itself* as Event ID 1102.
- **Check all three execution artifacts.** Prefetch can be disabled or wiped, but Shimcache and
  Amcache often survive — and Amcache's SHA1 proves the *specific* binary, not just "something ran."
- **4688 is only as good as your audit policy.** Process-creation logging (and command-line capture)
  must be enabled; absence of 4688 events may mean "not logged," not "nothing ran."
- **Parse hives offline** with `python-registry`/RegRipper — read the raw hive from the image, never
  boot the evidence to browse the registry live.
