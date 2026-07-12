# Cheat sheet — Windows & Endpoint Telemetry

*Companion to [Module 02 — Windows & Endpoint Telemetry](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Sysmon — install and manage

```powershell
sysmon64.exe -accepteula -i sysmonconfig.xml   # install with a config
sysmon64.exe -c sysmonconfig.xml               # update the running config (no reinstall)
sysmon64.exe -c                                # dump the current config to console
sysmon64.exe -u                                # uninstall the service+driver
```

Grab the community baseline instead of starting blank:

```powershell
# SwiftOnSecurity/sysmon-config — the tuned "what's worth collecting" starting point
Invoke-WebRequest -Uri https://raw.githubusercontent.com/SwiftOnSecurity/sysmon-config/master/sysmonconfig-export.xml -OutFile sysmonconfig.xml
```

Events land in **Applications and Services Logs → Microsoft → Windows → Sysmon/Operational**.

## The Event IDs you actually read

| ID | Event | Why it matters |
|----|-------|----------------|
| 1  | Process creation | The workhorse — carries `CommandLine`, `Image`, **`ParentImage`** (ancestry) |
| 3  | Network connection | Which process talked to which IP/port |
| 5  | Process terminated | Lifecycle / short-lived proc detection |
| 7  | Image loaded | DLL side-loading, unsigned modules |
| 8  | CreateRemoteThread | Classic process injection |
| 10 | ProcessAccess | Credential dumping (LSASS handle opens) |
| 11 | File create | Dropped payloads, persistence files |
| 12/13/14 | Registry (create/set/rename) | Run keys, service installs |
| 22 | DNS query | Endpoint-side name resolution |

The gold in Event ID 1 is **`ParentImage → Image`** — the lineage, not the single process.

## Sysmon config — structure

```xml
<Sysmon schemaversion="4.90">
  <EventFiltering>
    <!-- onmatch="include" = log ONLY matches; "exclude" = log everything EXCEPT -->
    <RuleGroup groupRelation="or">
      <ProcessCreate onmatch="include">
        <ParentImage condition="end with">\WINWORD.EXE</ParentImage>
        <Image condition="end with">\powershell.exe</Image>
      </ProcessCreate>
    </RuleGroup>
  </EventFiltering>
</Sysmon>
```

Common `condition` values: `is`, `is any`, `contains`, `begin with`, `end with`, `image`, `excludes`.

## Sigma — the portable detection format

```yaml
title: Office App Spawning PowerShell
logsource:
  product: windows
  category: process_creation      # maps to Sysmon EID 1 / Security 4688
detection:
  selection:
    ParentImage|endswith: '\WINWORD.EXE'
    Image|endswith: '\powershell.exe'
  condition: selection
falsepositives:
  - Rare legitimate Office add-ins
level: high
```

Modifiers you reach for: `|contains`, `|startswith`, `|endswith`, `|re` (regex), `|base64`, `|all`.

## Gotchas worth remembering

- **Ancestry, not the process.** `powershell.exe` runs all day; `winword.exe → powershell.exe -enc` is a macro dropper. Always pivot on `ParentImage`, not just `Image`.
- **The config *is* the detection strategy.** Every `exclude` is a place an attacker can choose to live. Weigh exclusions as carefully as inclusions — a "tidy" config can hand out a blind spot.
- **You can't log retroactively.** Sysmon only records after it's installed. Telemetry is a before-the-incident decision.
- **Reading the telemetry is only half the job.** A detection that "would fire" is not a detection. Author it (Sigma) and prove it fires on the malicious chain *and* stays quiet on benign activity.
- **`onmatch` inverts meaning.** `include` logs only what matches; `exclude` logs everything else. Mixing them up silently produces the opposite of what you intended — verify against real events.
- **Command line is the payload.** Attackers hide in arguments (`-enc`, `-nop`, `IEX`, download cradles), so `CommandLine` capture is non-negotiable — the baseline config already turns it on.
