---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Parsing Windows Telemetry at Scale

*Companion to [Module 03 — Parsing Windows Telemetry at Scale](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## `Get-WinEvent -FilterHashtable` — filter at the source (Windows)

```powershell
# The RIGHT way: the predicate runs in the Event Log service; only matches cross into PowerShell.
Get-WinEvent -FilterHashtable @{
    LogName   = 'Microsoft-Windows-PowerShell/Operational'   # or  Path = 'host.evtx'
    Id        = 4104                                          # Id = 4104,4103 for a set
    Level     = 3                                             # 1=Crit 2=Err 3=Warn 4=Info 5=Verbose
    StartTime = (Get-Date).AddHours(-1)                       # server-side time window
}

# From a saved log file (no live channel needed):
Get-WinEvent -FilterHashtable @{ Path = 'host.evtx'; Id = 4688 }

# Match an EventData field (e.g. a specific Sysmon Image) with the 'Data' key:
Get-WinEvent -FilterHashtable @{ LogName = 'Microsoft-Windows-Sysmon/Operational'; Id = 1; Data = 'powershell.exe' }
```

Accepted keys: `LogName`, `Path`, `ProviderName`, `Id`, `Level`, `StartTime`, `EndTime`, `Keywords`,
`UserID`, `Data`. Multiple keys are AND-ed; array values within a key are OR-ed.

## The anti-pattern — `| Where-Object` post-filter (don't)

```powershell
# SLOW: reads EVERY event, builds a full record for each, then discards 99%.
Get-WinEvent -Path host.evtx | Where-Object { $_.Id -eq 4104 -and $_.Message -match '-enc' }

# Prove the gap on a real .evtx:
Measure-Command { Get-WinEvent -FilterHashtable @{ Path='host.evtx'; Id=4104 } }     # fast
Measure-Command { Get-WinEvent -Path host.evtx | Where-Object { $_.Id -eq 4104 } }   # slow
```

Same result on a demo file; seconds-vs-minutes on a production log. Reach for the hash table first.

## XPath (`-FilterXPath`) — when the hash table can't express it

```powershell
# Event ID:
Get-WinEvent -Path host.evtx -FilterXPath "*[System[EventID=4104]]"

# ID + level + a time window (last 1h, in ms):
Get-WinEvent -LogName Security -FilterXPath "*[System[EventID=4688 and TimeCreated[timediff(@SystemTime)<=3600000]]]"

# Match an EventData field by name (Sysmon Image contains powershell):
Get-WinEvent -LogName 'Microsoft-Windows-Sysmon/Operational' `
    -FilterXPath "*[EventData[Data[@Name='Image'] and (Data='C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe')]]"
```

`-FilterXPath` (per-query) and `-FilterXml` (a full `<QueryList>`) also run server-side. Use XPath for
EventData-field predicates and `OR` across providers the hash table can't do.

## Cross-platform: `.evtx` -> JSON (Linux / the lab container)

```bash
# Get-WinEvent is Windows-only. On Linux, parse .evtx with the 'evtx' Rust CLI:
cargo install evtx                         # installs evtx_dump
evtx_dump -o jsonl sample.evtx > events.jsonl   # one JSON event per line (JSONL)
evtx_dump -o json  sample.evtx > events.json    # single JSON array
```

Each JSONL line is one record: `{ "Event": { "System": {...}, "EventData": {...} } }`.

```powershell
# Read the exported artifact with the SAME source-side discipline: filter as you stream.
Get-Content ./events.jsonl | ForEach-Object {
    $e = ($_ | ConvertFrom-Json).Event
    if ([int]$e.System.EventID -ne 4104) { return }        # skip BEFORE building an object
    [pscustomobject]@{
        TimeCreated = [datetime]$e.System.TimeCreated.'#attributes'.SystemTime
        EventId     = [int]$e.System.EventID
        Provider    = [string]$e.System.Provider.'#attributes'.Name
        CommandLine = [string]($e.EventData.CommandLine, $e.EventData.ScriptBlockText -ne $null)[0]
    }
}
```

`Get-VigilEvent -Path ./data/events.jsonl -EventId 4104 -Provider '*PowerShell*'` is this, packaged.

## The events you hunt (fields to normalize)

```text
Security   4688  process creation   -> NewProcessName + CommandLine   (CommandLine off by default)
Security   4624  logon              -> TargetUserName + LogonType + IpAddress
Sysmon        1  process creation   -> Image + CommandLine + ParentImage + User
Sysmon        3  network connection -> Image + DestinationIp + DestinationPort
PowerShell 4104  script block       -> ScriptBlockText  (the encoded/IEX payload lives here)
```

Normalize once at the edge into one flat object so downstream code never re-parses per-provider fields.

## Structured JSON logs — `ConvertTo-Json`, not `Write-Host`

```powershell
# One compact, shippable JSON line per record: capturable, greppable, SIEM-ingestible.
[pscustomobject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString('o')
    level     = 'Warning'
    message   = 'suspicious 4104'
    EventId   = 4104
    Host      = 'WKS07'
} | ConvertTo-Json -Compress -Depth 5

# vs. the anti-pattern (returns nothing; can't be piped, captured, or shipped):
Write-Host "suspicious 4104 on WKS07"     # <- PSAvoidUsingWriteHost; dies on the console
```

```powershell
Write-VigilLog -Message 'hunt started' -Level Info -Data @{ Source = 'events.jsonl' }
Write-VigilLog -Message 'noisy' -Level Debug -MinimumLevel Info     # suppressed (below threshold)
$log | ConvertFrom-Json | Where-Object level -eq 'Warning'          # your logs are now queryable
```

## The real corpus (get more telemetry)

```text
EVTX-ATTACK-SAMPLES   real .evtx per ATT&CK tactic (Execution, Defense Evasion, Credential Access...)
  github.com/sbousseaden/EVTX-ATTACK-SAMPLES     -> evtx_dump -o jsonl to feed Get-VigilEvent
SwiftOnSecurity sysmon-config   annotated baseline: which events to log and why
  github.com/SwiftOnSecurity/sysmon-config       -> shapes what good Sysmon telemetry contains
```

## Honesty checklist (what runs where)

```text
[Windows only ]  Get-WinEvent -FilterHashtable / -FilterXPath / -FilterXml  (Event Log API)
[Cross-platform]  evtx_dump -o jsonl  +  Get-VigilEvent reading the artifact  (the lab's gate path)
[Assessed, not demonstrated in the container]  the live Get-WinEvent step -> run it on a Windows VM
```
