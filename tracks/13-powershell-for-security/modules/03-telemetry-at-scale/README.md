# Module 03 — Parsing Windows Telemetry at Scale

*Type 9 · Tool-Build — grow `Get-VigilEvent` into a real telemetry reader that filters `.evtx` **at the source** (not with a trailing `Where-Object`) and add `Write-VigilLog` for structured JSON output. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot will pull a million events into memory and filter them in PowerShell; the tell is where the filter runs.*

!!! abstract "In 60 seconds"
    Ask a copilot to "find the encoded PowerShell in this event log" and you'll get
    `Get-WinEvent -Path x.evtx | Where-Object { $_.Id -eq 4104 -and $_.Message -match '-enc' }`.
    It works on a demo file and falls over on a real one, because it **reads every event into
    PowerShell and then throws most away**. The Windows Event Log API can filter *at the source* —
    `Get-WinEvent -FilterHashtable @{ Path=…; Id=4104 }` or an XPath query — so only matching records
    ever cross the boundary. That is the difference between a query that returns in a second and one
    that pages a gigabyte of XML through your pipeline. In this module you grow `Get-VigilEvent` to
    read event telemetry at scale with source-side filtering, normalize Security/Sysmon/PowerShell
    events into typed objects, and add `Write-VigilLog` so the tool emits **structured JSON** instead
    of `Write-Host` text. The anchor is real attacker telemetry: the `EVTX-ATTACK-SAMPLES` corpus.

## Why this matters

A SOC analyst's day is spent reading Windows event logs, and the logs are enormous — a single busy
host emits millions of Security 4688 process-creation and Sysmon events a day. The one skill that
separates a tool that scales from a toy is **where the filter runs**. `Get-WinEvent | Where-Object`
pulls *every* event out of the log, deserializes each into a rich `EventLogRecord`, and only then
discards the 99% you didn't want — the copilot's default, and a decade of forum answers, do exactly
this. `Get-WinEvent -FilterHashtable` (and XPath) push the predicate *into the Event Log API*, which
was built to filter server-side against an indexed store, so the events you discard are never
materialized at all. On a real `.evtx` the gap is seconds versus minutes, or "returns" versus
"exhausts memory."

The second failure is quieter and just as costly. The copilot narrates its findings with
`Write-Host` — text painted on the console that **cannot be captured, piped, filtered, or shipped to a
SIEM**. A hunt tool whose output is a wall of colored text is a tool whose results die on the screen.
The fix is structured logging: emit one **JSON object per event**, machine-readable, so the same
output feeds `jq`, a dashboard, or the next stage of your pipeline. Both failures are the same root
cause the whole track hammers — the copilot reaches for the interactive, throwaway idiom, and your job
is to hold it to the engineered one.

## Objective

Grow `Get-VigilEvent` into a telemetry reader that filters Windows events **at the source** — teach and
use `Get-WinEvent -FilterHashtable`/XPath as the real Windows technique, and on the cross-platform lab
container consume an **exported** `.evtx` artifact with the same source-side discipline (filter as
records stream in, never a trailing `Where-Object`). Normalize Security, Sysmon, and PowerShell events
into one typed shape, and add `Write-VigilLog` so `Vigil` emits structured JSON logs instead of
`Write-Host`. Prove the tool with Pester tests over a real-attacker-style sample.

## The core idea

**The filter belongs at the source, and `-FilterHashtable` is where it lives.** `Get-WinEvent` speaks
to the Windows Event Log service, which maintains an indexed store and can evaluate a predicate
*before* it hands you a record. `Get-WinEvent -FilterHashtable @{ Path='x.evtx'; Id=4104;
StartTime=$since }` (or the equivalent XPath via `-FilterXPath "*[System[EventID=4104]]"`) is compiled
into a query the *service* runs; only matching events are deserialized and cross into PowerShell. The
anti-pattern — `Get-WinEvent -Path x.evtx | Where-Object { $_.Id -eq 4104 }` — inverts that: it asks
the service for *everything*, builds a full `EventLogRecord` object for each, and filters in your
runspace. Same result on a five-event demo file; wildly different on a production log. The hash-table
keys (`LogName`, `Path`, `Id`, `ProviderName`, `StartTime`/`EndTime`, `Level`, and `Data` for
EventData fields) cover the common hunt; XPath handles the rest. Learning to reach for the hash table
*first* is the muscle this module builds.

??? warning "`Get-WinEvent` is Windows-only — and this lab is honest about it"
    `Get-WinEvent` calls the Windows Event Log API, which exists **only on Windows**. It is not present
    in the Linux `pwsh` container this track runs in. That is not a workaround to hide — it's the
    reality of the tool, so the lab handles it in the open. The cross-platform path: a `.evtx` file is
    parsed to JSON by the [`evtx` Rust CLI](https://github.com/omerbenamram/evtx)'s `evtx_dump` (or you
    use a bundled pre-export), and `Get-VigilEvent` consumes that artifact — applying the **same
    source-side filter discipline** as it streams the records. On a real Windows host you would point
    `Get-VigilEvent` at the live log via `Get-WinEvent -FilterHashtable`; in the container that live
    step is **assessed-not-demonstrated** (an optional Windows step in the lab). The lesson —
    filter-at-the-source, typed output, structured logs — is identical on either path; only the *reader*
    at the very edge differs.

**Normalize once, at the edge, into a typed object.** Security 4688, Sysmon EventID 1, and PowerShell
4104 all describe "a thing ran," but they carry it in different fields — `NewProcessName` +
`CommandLine`, `Image` + `CommandLine`, `ScriptBlockText`. A hunt tool that forces every caller to know
which provider used which field is a tool nobody can build on. So `Get-VigilEvent` does the translation
*once*, emitting a flat `[pscustomobject]` (`TimeCreated`, `EventId`, `Provider`, `Computer`,
`CommandLine`, `Suspicious`) that downstream code — a detection, a report, an MCP tool later in the
track — consumes without re-parsing. This is the track's through-line applied to telemetry: *the
pipeline carries objects you can trust, not text you have to re-parse.*

**Structured logs are output you can act on; `Write-Host` is output you can only look at.**
`Write-Host` writes directly to the host's console and returns nothing — it can't be redirected,
captured into a variable, piped to `Where-Object`, or shipped to a log aggregator. That's fine for a
one-off script and fatal for a tool. `Write-VigilLog` instead builds a record (timestamp, level,
message, plus any structured fields) and emits it as **one compact JSON line** via `ConvertTo-Json
-Compress`. Now the tool's own telemetry is as machine-readable as the events it hunts: greppable,
`jq`-able, SIEM-ingestible, and level-filterable so verbose logs cost nothing in production. The
copilot won't default to this; you will.

## Learn (~2–3 hrs)

**Source-side filtering (do these first — they replace the copilot's `Where-Object` default)**

- [Microsoft Learn — `Get-WinEvent` reference](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-winevent) (~25 min)
  — read the `-FilterHashtable`, `-FilterXPath`, and `-Path` sections and the accepted hash-table keys
  (`LogName`, `Id`, `ProviderName`, `StartTime`, `Level`, `Data`). This is the primary source for the
  whole module; skim the rest.
- [Microsoft Learn — "Creating Get-WinEvent queries with FilterHashtable"](https://learn.microsoft.com/en-us/powershell/scripting/samples/creating-get-winevent-queries-with-filterhashtable) (~20 min)
  — how the same query expresses as a hash table vs. XPath vs. `-FilterXml`, and why the service-side
  query beats the pipeline filter. Read for the mental model, not to memorize XPath.

**The telemetry you're parsing (know the events before you hunt them)**

- [Microsoft — "Audit Process Creation" / Event 4688 with command line](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4688) (~15 min)
  — the Security-log process-creation event and its `CommandLine` field (off by default; the audit
  policy that turns it on). This is the log the copilot's `-enc` hunt is really searching.
- [Sysmon — official docs (Event ID 1: Process Creation; Event ID 3: Network Connection)](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon) (~20 min)
  — read the Event ID 1 and 3 sections: what Sysmon adds over the Security log (parent process, hashes,
  network tuples) and why hunters lean on it.
- [SwiftOnSecurity `sysmon-config` — the annotated template](https://github.com/SwiftOnSecurity/sysmon-config) (~15 min)
  — skim `sysmonconfig-export.xml`: a community baseline showing *which* events are worth logging and why
  the comments double as a hunting cheat sheet. This shapes what your sample telemetry looks like.

**The corpus (real attacker telemetry to hunt against)**

- [`EVTX-ATTACK-SAMPLES` — real `.evtx` per ATT&CK technique](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES) (~20 min to browse)
  — Sysmon/Security/PowerShell `.evtx` files organized by tactic (Execution, Defense Evasion, Credential
  Access, …). Open a couple of `Execution/` samples and note the `EventID`/provider mix — this is the
  shape your exported JSON mirrors. The lab ships a small pre-export so it runs offline; this is where you
  get *more*.

**Structured output**

- [Microsoft Learn — `ConvertTo-Json`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertto-json) (~10 min)
  — read `-Compress` and `-Depth`; these are what turn a `[pscustomobject]` into one shippable log line.

## Key concepts
- **Filter at the source, not in the pipeline** — `Get-WinEvent -FilterHashtable`/XPath pushes the predicate into the Event Log API; `| Where-Object` pulls everything then discards it.
- **`-FilterHashtable` keys** — `LogName`/`Path`, `Id`, `ProviderName`, `StartTime`/`EndTime`, `Level`, `Data`; XPath (`-FilterXPath`) for what the hash table can't express.
- **`Get-WinEvent` is Windows-only** — on Linux, parse `.evtx` to JSON (`evtx_dump`) and read the artifact with the same source-side discipline; the live step is assessed-not-demonstrated.
- **Normalize once into a typed object** — 4688 / Sysmon 1 / 4104 carry "a thing ran" in different fields; emit one flat `[pscustomobject]` so downstream code never re-parses.
- **Structured JSON logs, not `Write-Host`** — one `ConvertTo-Json -Compress` line per record: capturable, greppable, SIEM-ingestible, level-filtered.

## AI acceleration

Have the copilot draft `Get-VigilEvent`'s reader from a spec that says "filter by Event ID and provider
at the source, return typed objects" — then watch for the two defaults. First: it will almost always
emit `Get-WinEvent -Path … | Where-Object { $_.Id -eq … }` (or, given a JSON artifact,
`Get-Content | ConvertFrom-Json | Where-Object`) — the post-filter. Push it to filter *as records are
read*, and on Windows to `-FilterHashtable`. Second: it will narrate with `Write-Host` and hand you
formatted strings; make it emit objects and route status through `Write-VigilLog`'s structured JSON.
Both are the copilot reaching for the interactive idiom when the job wants the engineered one — catching
that is the module. Let the model write the XPath and the hash table; **you** verify the query actually
runs server-side (on Windows, `Measure-Command` the two forms and compare) and that no `Where-Object`
sneaks back in as a "quick fix."

!!! question "Check yourself"
    - Why does `Get-WinEvent -FilterHashtable @{ Path=$p; Id=4104 }` scale where
      `Get-WinEvent -Path $p | Where-Object { $_.Id -eq 4104 }` does not — what is materialized in each?
    - `Get-WinEvent` isn't on the Linux container. What does `Get-VigilEvent` read instead, and what part
      of the module is therefore *assessed-not-demonstrated* rather than run?
    - What can you do with a line of `Write-VigilLog` JSON output that you cannot do with a `Write-Host`
      line — name three consumers?
