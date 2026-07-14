# Lab 03 — Read `.evtx` at Scale, Filter at the Source, Log as JSON

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/03-telemetry-at-scale/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, a small
**pre-exported** Windows-event artifact (`data/events.jsonl`, shaped like `evtx_dump -o jsonl`
output), and a reference `Vigil` module you grow.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/03-telemetry-at-scale
make up      # build the pwsh + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with the Vigil module and the event artifact
make demo    # runs the gate: PSScriptAnalyzer + Pester over the reference module
make down    # stop when done
```

!!! warning "`Get-WinEvent` is Windows-only — read this before you start"
    `Get-WinEvent` calls the Windows Event Log API and **does not exist** on the Linux `pwsh`
    container. This lab teaches `Get-WinEvent -FilterHashtable`/XPath as the real Windows technique
    (concept + cheat sheet) and has you *apply the same source-side filter discipline* on the
    container by reading an **exported** `.evtx` artifact (JSON). Steps marked **[Windows step —
    assessed, not demonstrated]** are the ones you'd run against a live log on a real Windows host;
    do them on a Windows VM if you have one, otherwise reason through them from the cheat sheet. The
    container path is fully runnable and is what `make demo` gates.

## Scenario

You're a detection engineer at Meridian. An analyst forwarded a `.evtx` from a workstation
(`WIN-WKS07`) that tripped an antivirus alert, and your `Vigil` module — which so far reads a tiny JSON
export — needs to read *real event telemetry at scale*: Security process-creation (4688), Sysmon
process/network events (1, 3), and PowerShell script-block logs (4104), filtered down to what matters
**before** it ever lands in your pipeline. The copilot's first draft will pull every event into
PowerShell and filter with `Where-Object`, and it'll narrate with `Write-Host`. Your job is to build
the version that filters at the source and logs as JSON — and to know exactly which part of that only
runs on Windows.

> Only test systems you own or have explicit written permission to test. Everything here runs locally
> in the lab container against a bundled, exported event sample derived from public attack-technique
> telemetry.

## Do

1. [ ] **See the copilot's default fail on scale (reason it through).** Write the naive form —
   `Get-WinEvent -Path host.evtx | Where-Object { $_.Id -eq 4104 -and $_.Message -match '-enc' }` — and
   articulate, in one sentence, what it materializes that the source-side form does not. This is the
   anti-pattern the rest of the lab replaces.
2. [ ] **Write the source-side query.** Express the same hunt as `Get-WinEvent -FilterHashtable`
   (`@{ Path=…; Id=4104 }`) *and* as XPath (`-FilterXPath "*[System[EventID=4104]]"`). State which
   `-FilterHashtable` keys map to "PowerShell 4104 events from the last hour on this host."
   **[Windows step — assessed, not demonstrated]** on the container; if you have a Windows VM,
   `Measure-Command` both forms against a real `.evtx` and record the difference.
3. [ ] **Export the `.evtx` to a readable artifact (cross-platform path).** On the container, take a
   `.evtx` (grab one from [`EVTX-ATTACK-SAMPLES`](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES),
   e.g. an `Execution/` Sysmon or PowerShell sample) and convert it with `evtx_dump -o jsonl` — or use
   the bundled `data/events.jsonl`. Confirm each line is one event with `Event.System` and
   `Event.EventData`.
4. [ ] **Grow `Get-VigilEvent` to read at scale with source-side filters.** Have it *stream* the export
   (line by line, so a large artifact never lands in memory whole), apply `-EventId` and `-Provider`
   **as it reads** (the container analogue of `-FilterHashtable` — skip records before building an
   object for them), and emit one flat `[pscustomobject]` per event. Prove the filter is source-side:
   `Get-VigilEvent -Path … -EventId 4104` must never construct an object for a 4688.
5. [ ] **Normalize the providers into one shape.** Map Security 4688 (`CommandLine`), Sysmon 1
   (`CommandLine`), Sysmon 3 (`DestinationIp:Port`), and PowerShell 4104 (`ScriptBlockText`) into a
   single `CommandLine`/command-text field so a downstream detection never has to know which provider
   it came from. Flag `Suspicious` on attacker-ish tokens (`-enc`, `IEX`, `FromBase64String`,
   `rundll32`, the C2 IP…).
6. [ ] **Replace narration with structured logs.** Add `Write-VigilLog`: build a record (timestamp,
   level, message, plus structured `Data` fields like `EventId`/`Host`) and emit **one
   `ConvertTo-Json -Compress` line**. Route `Get-VigilEvent`'s status through it. Prove the output is
   real JSON (`… | ConvertFrom-Json` round-trips) and that a below-threshold level is suppressed.
7. [ ] **Test it.** Write Pester assertions: object count, `Suspicious` count on the sample, that
   `-EventId`/`-Provider` actually reduce the set (source-side), and that `Write-VigilLog` emits one
   line of valid JSON with the expected fields. Get `PSScriptAnalyzer` clean and the gate green.
8. [ ] **Automate & own it.** Commit the grown `Get-VigilEvent` + `Write-VigilLog` with their tests. In
   the commit/PR, note the two copilot defaults you overrode — the `Where-Object` post-filter and the
   `Write-Host` narration — and one line on the honest limit (the live `Get-WinEvent` path is
   Windows-only and was assessed, not run, in the container).

## Success criteria — you're done when
- [ ] `Get-VigilEvent -Path ./data/events.jsonl -EventId 4104` returns **only** 4104 events, and you can show the filter runs as records are read (no trailing `Where-Object`).
- [ ] Security 4688, Sysmon 1/3, and PowerShell 4104 all come back as the **same** typed object shape; `Suspicious` flags exactly the attacker-ish events and no benign ones.
- [ ] `Write-VigilLog -Message … -Level Warning -Data @{ … }` emits **one line of valid JSON** that `ConvertFrom-Json` parses; a `Debug` line under `-MinimumLevel Info` is suppressed.
- [ ] `PSScriptAnalyzer` is clean and `Pester` is green (`make demo` exits 0) — with **no `Write-Host`** and no `Where-Object` post-filter in `Get-VigilEvent`.
- [ ] You can state, in one sentence, which step is Windows-only and why the container reads an exported artifact instead.

## Deliverables
The grown `Vigil` module: `Get-VigilEvent` reading the exported `.evtx` artifact with source-side
`-EventId`/`-Provider` filtering and typed, normalized output, plus `Write-VigilLog` for structured
JSON logs, and the `Pester` tests that prove both. Commit the module and tests. Do **not** commit any
large or copyrighted `.evtx` binaries, real event exports beyond the small bundled sample, or any
`.env`/secrets.

## AI acceleration
Draft `Get-VigilEvent`'s reader and `Write-VigilLog` with the copilot from a one-line spec, then review
for the two defaults: it will reach for `| Where-Object` (post-filter) and `Write-Host` (unstructured
narration) almost every time. The high-value catches are structural, not cosmetic — a `Where-Object`
after the read *is* the scale bug, and `Write-Host` *is* the reason the output can't be shipped. Make
the model justify where its filter runs and route every status message through structured logging;
that review is the lab.

## Connects forward
`Get-VigilEvent`'s typed, normalized output is the input the rest of the track builds on: Module 04
enriches these indicators concurrently with runspaces, Module 08 detonates an encoded-PowerShell
technique and writes the detection that fires on exactly the 4104/4688 telemetry you parse here, and
Module 09 scores that detection on a held-out corpus. The filter-at-the-source discipline returns
wherever a query meets a large store — Track 02 (detection-as-code over bundled logs) and Track 05
(cloud log analytics).

## Marketable proof
> "I parse Windows event telemetry (`.evtx`, Security/Sysmon/PowerShell) at scale with **source-side
> filtering** — `Get-WinEvent -FilterHashtable`/XPath, not a `Where-Object` post-filter — normalize it
> into typed objects, and emit **structured JSON logs** a SIEM can ingest, all in a tested PowerShell
> module."

## Stretch (optional)
- Add a `-StartTime`/`-EndTime` window to `Get-VigilEvent` and (on Windows) map it to the
  `StartTime`/`EndTime` `-FilterHashtable` keys — prove the time filter, too, runs server-side.
- Point `evtx_dump` at three different `EVTX-ATTACK-SAMPLES` techniques, load them, and confirm your
  normalization holds across providers you didn't hand-pick — the honest test of "normalize once."
