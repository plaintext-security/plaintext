---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Detonate, Detect, Harden (Encoded/Obfuscated PowerShell)

*Companion to [Module 08 — PowerShell as the Weapon](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Decode a base64 `-EncodedCommand` (UTF-16LE — inspection only)

```powershell
# -EncodedCommand is base64 of UTF-16LE bytes, NOT UTF-8. Decode for INSPECTION - never run it.
$b64     = 'SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA'          # the blob after -enc
$bytes   = [System.Convert]::FromBase64String($b64)
$decoded = [System.Text.Encoding]::Unicode.GetString($bytes)  # Unicode == UTF-16LE in .NET
$decoded                                                       # read what it DOES; do not execute

# Re-encode a benign command the same way (what the detonator does):
$cmd = "Write-Output 'beacon'"
[System.Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($cmd))
```

Decoding as UTF-8 gives garbage (interleaved null bytes) and your detection silently misses every encoded
command — a classic quiet-miss.

## Script-block logging — Event ID 4104 (the telemetry you detect)

```text
Provider : Microsoft-Windows-PowerShell (Operational log)
Event ID : 4104   "Creating Scriptblock text (1 of N)"
Key field: Message  -> the DEOBFUSCATED scriptblock text (this is why logging beats obfuscation)
Related  : 4103 (module/pipeline logging), 4688 (process creation: the command line, incl. -enc)
```

```powershell
# Read 4104 from a live host (Windows) with SERVER-SIDE filtering (not | Where-Object):
Get-WinEvent -FilterHashtable @{
    LogName = 'Microsoft-Windows-PowerShell/Operational'; Id = 4104
} -MaxEvents 200
```

Turn script-block logging ON (Windows — prerequisite for having 4104 at all):

```powershell
# Group Policy: Administrative Templates > Windows Components > Windows PowerShell >
#   "Turn on PowerShell Script Block Logging" = Enabled
# Or registry:
$k = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging'
New-Item $k -Force | Out-Null
Set-ItemProperty $k -Name EnableScriptBlockLogging -Value 1
```

## The detection expressed over telemetry — behaviour, not strings

```powershell
# DETECT BEHAVIOUR: a download primitive WIRED TO an execution primitive survives obfuscation.
# Scan telemetry as DATA. Build the 'iex' indicator at runtime so PSAvoidUsingInvokeExpression stays green
# (and so you never create a literal call site). NEVER Invoke-Expression the sample.
$iex = ('i','e','x') -join ''                    # 'iex' as data, not a call
$dl  = '(?i)(Net\.WebClient|DownloadString|DownloadData|Invoke-WebRequest|Invoke-RestMethod)'
$exe = "(?i)(\b$iex\b|Invoke-Expression|\|\s*&|\.Invoke\(|&\s*\()"

$hay = "$rawMessage`n$decodedEncodedCommand"     # include the DECODED payload
$isCradle = ($hay -match $dl) -and ($hay -match $exe)     # both -> the cradle behaviour

# Obfuscation (T1027) tells regardless of intent:
$isObfuscated =
    ($hay -match "(?i)\{\d+\}\{\d+\}.*'\s*-f\s*'") -or        # '{1}{0}'-f'X','IE'  format-operator
    ($hay -match "(?i)(\[char\]\s*\d+\s*[+,]\s*){2,}") -or    # [char]105+[char]101+...
    ($hay -match "(?i)\[(system\.)?convert\]::FromBase64String")

# Suspicious launch flags (from the 4688 command line):
$flags = '(?i)(-nop\b|-w(indowstyle)?\s+hidden|-exec(utionpolicy)?\s+bypass|-noni)'
```

```powershell
New-VigilDetection -Path ./data/telemetry-malicious.json          # fires, maps to T1059.001 / T1027
New-VigilDetection -Path ./data/telemetry-benign.json             # MUST be quiet (held-out check)
New-VigilDetection -Path ./telemetry.json -MinScore 3             # raise precision (fewer, higher-confidence)
```

## ATT&CK mapping

```text
T1059.001  PowerShell            https://attack.mitre.org/techniques/T1059/001/
                                 -> encoded commands, download cradles, launch flags
T1027      Obfuscated Files/Info https://attack.mitre.org/techniques/T1027/
                                 -> format-operator, char-code, FromBase64String
```

## Hardening — AMSI & Constrained Language Mode (WINDOWS-ONLY: assessed, not demonstrated in the Linux lab)

!!! warning "Windows-only enforcement"
    The commands below **enforce** only on Windows. The Linux `pwsh` container can *generate and detect*
    telemetry, but it does **not** enforce AMSI or Constrained Language Mode. Treat these as
    *assessed-not-demonstrated* unless you run them on a Windows host/VM.

```powershell
# Constrained Language Mode (CLM) — breaks most .NET cradles (New-Object, Add-Type, reflection).
$ExecutionContext.SessionState.LanguageMode          # inspect: FullLanguage vs ConstrainedLanguage
# System-wide via WDAC/AppLocker policy is the durable enforcement; the env var is per-session and bypassable:
[Environment]::SetEnvironmentVariable('__PSLockdownPolicy','4','Machine')   # legacy, WDAC supersedes it
# In a script/JEA endpoint you can request it, but only a policy makes it non-bypassable:
#   a JEA session (Module 06) runs constrained by design.
```

```powershell
# AMSI — hands the DEOBFUSCATED script buffer to the installed AV before it runs.
# It is on by default with Defender/an AMSI-registered AV; verify the AV is present and running:
Get-MpComputerStatus | Select-Object AMServiceEnabled, RealTimeProtectionEnabled   # Defender (Windows)
# Test it fires with the standard AMSI test string (safe, non-malicious signature) on a Defender host.
```

Why each matters to this attack:

```text
Script-block logging  -> WITHOUT it, no 4104, no decoded text to detect. Prerequisite. (Telemetry.)
Constrained Language  -> blocks New-Object / .NET the cradle needs.        (Stops the payload.) Windows-only.
AMSI                  -> AV scans the buffer AFTER de-obfuscation, BEFORE run. (Stops the payload.) Windows-only.
```

## The golden rule of building a detector

```text
SCAN the malicious string as DATA (regex / AST) — NEVER Invoke-Expression it.
A detector that executes what it detects is a detonator.
Build 'iex'/'Invoke-Expression' indicators from arrays/regex so PSAvoidUsingInvokeExpression stays green.
```

## The gate (what `make demo` enforces)

```text
1. Detonate benign -> capture 4104/4688 telemetry (marker written, beacon printed, no network/harm)
2. PSScriptAnalyzer clean over ./Vigil + the detonator (no Invoke-Expression call site)
3. Pester: detection FIRES on the malicious sample, is QUIET on the held-out benign sample
   -> non-zero exit if either fails
```
