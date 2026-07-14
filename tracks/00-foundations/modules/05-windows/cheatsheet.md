---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Windows for Security (PowerShell)

*Companion to [Module 05 — Windows for Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Reading event logs — the defender's core skill

```powershell
Get-WinEvent -ListLog *                              # every log and its record count
Get-WinEvent -LogName Security -MaxEvents 20         # newest 20 from the Security log
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625}   # failed logons only
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624; StartTime=(Get-Date).AddHours(-1)}
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=1}  # Sysmon proc-create
```

- **`-FilterHashtable` filters at the source** — far faster than piping everything into
  `Where-Object`. Filter on `LogName`, `Id`, `StartTime`, `EndTime`, `ProviderName`.
- The old-school equivalent is `wevtutil qe Security /c:20 /f:text /rd:true`.

## Event IDs worth memorizing

| ID | Log | Meaning |
|----|-----|---------|
| **4624** | Security | Successful logon (check **Logon Type**: 3=network, 10=RDP) |
| **4625** | Security | **Failed** logon — brute force shows as a burst |
| **4634 / 4647** | Security | Logoff |
| **4672** | Security | Admin/privileged logon |
| **4688** | Security | **New process created** (command line, if auditing is on) |
| **4720** | Security | A user account was **created** |
| **7045** | System | A **service** was installed (classic persistence) |
| **1** | Sysmon | Process creation (richer than 4688 — hashes, parent) |
| **3** | Sysmon | Network connection |

## Processes, services, network

```powershell
Get-Process                              # running processes (alias: ps)
Get-Process -Name powershell | Select Id, Path, StartTime
Get-CimInstance Win32_Process | Select Name, ProcessId, CommandLine   # with full command lines
Get-Service | Where-Object Status -eq 'Running'
Get-NetTCPConnection -State Listen | Select LocalPort, OwningProcess   # what's listening
Get-CimInstance Win32_StartupCommand     # autostart entries
```

Old-shell equivalents still worth knowing: `tasklist`, `netstat -anob`, `sc query`.

## The registry

```powershell
Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run'   # autoruns (persistence)
Get-ChildItem 'HKLM:\System\CurrentControlSet\Services'                  # installed services
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run"           # reg.exe form
```

The `...\CurrentVersion\Run` keys (both `HKLM` and `HKCU`) are the first place to look for
"what launches at boot/login" — and a favorite malware persistence spot.

## Files, hashes, users

```powershell
Get-FileHash payload.exe -Algorithm SHA256           # hash a file (feeds VirusTotal/threat intel)
Get-ChildItem C:\ -Recurse -Filter *.log -EA SilentlyContinue
Get-LocalUser; Get-LocalGroupMember Administrators    # local accounts and who's admin
Get-ChildItem Cert:\LocalMachine\Root                 # trusted root certs
```

## Decoding a malicious PowerShell one-liner

```powershell
# -EncodedCommand payloads are Base64 of UTF-16LE. Reverse one you've captured:
[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('<blob>'))
```

`[Text.Encoding]::Unicode` **is** UTF-16LE — the same interleaved-null encoding from the Data &
Encoding module. Watch for `-enc`, `-nop`, `-w hidden`, `-ep bypass` in the parent command line.

## Gotchas worth remembering

- PowerShell flags abbreviate: `-EncodedCommand` = `-enc`, `-ExecutionPolicy Bypass` = `-ep bypass`,
  `-WindowStyle Hidden` = `-w hidden`, `-NoProfile` = `-nop`. Attackers use the short forms to slip
  past naïve string matching — match on the abbreviations too.
- **Execution Policy is not a security boundary** — `-ep bypass` (or piping a script to `powershell -`)
  sidesteps it trivially. It stops accidents, not attackers.
- Command-line logging (4688 / Sysmon 1) is often **off by default**. If you can't see command
  lines, that's a gap to fix before you need the data, not after.
