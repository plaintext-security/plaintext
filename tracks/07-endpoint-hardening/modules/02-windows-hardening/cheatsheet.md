# Cheat sheet — Windows Hardening to CIS

*Companion to [Module 02 — Windows Hardening to CIS](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Scan & score with CIS-CAT Lite

```powershell
# CIS-CAT Lite ships as a bundled Java app — run the assessor from its folder
.\Assessor-CLI.bat -b .\benchmarks\CIS_Microsoft_Windows_11_Benchmark.xml `
  -rd C:\cis-reports -nts -rp baseline   # -rd report dir, -nts no timestamp, -rp prefix
.\Assessor-CLI.bat -l                     # list available benchmarks / profiles
# Emit JSON (parseable) alongside the HTML — the diff is done on the JSON
.\Assessor-CLI.bat -b <bench.xml> -json -html -rd C:\cis-reports
```

- Always run a **baseline scan before any change** — it's your rollback reference and audit "before" evidence.
- The per-control pass/fail breakdown matters more than the aggregate %. A known-exception 78% beats a mystery 92%.

## Diff before/after (the actual deliverable)

```powershell
$before = Get-Content .\baseline.json | ConvertFrom-Json
$after  = Get-Content .\hardened.json | ConvertFrom-Json
# Compare per-rule result (pass/fail) — flag rules that MOVED
Compare-Object $before.rules $after.rules -Property rule_id,result
```

- A rule fail→pass = a closed gap. A rule that **stayed fail after you applied its GPO** = the GPO didn't take — a config-management bug to diagnose, not ignore.

## Apply policy with LGPO (GPO-as-code)

```powershell
# Import a CIS/Microsoft GPO backup into the local machine
LGPO.exe /g .\GPOBackup\{GUID}         # /g = apply a whole GPO backup folder
LGPO.exe /m .\registry.pol             # /m = apply a machine registry.pol
LGPO.exe /s .\GptTmpl.inf              # /s = apply a security template (secedit format)
# EXPORT current local policy to text so it's diffable + version-controlled
LGPO.exe /b .\export -n "baseline"     # /b = back up local policy to a folder
LGPO.exe /parse /m .\registry.pol > policy.txt   # binary .pol -> readable text
gpupdate /force                        # force policy to take effect now
```

- Keep the exported `.PolicyRules` / `registry.pol` **in git**. A GPO clicked through `gpedit.msc` and only there is config nobody can reproduce.

## secedit — security policy & audit

```powershell
secedit /export /cfg C:\secpol.cfg                 # dump current security policy
secedit /configure /db secedit.sdb /cfg policy.inf # apply an .inf security template
secedit /analyze /db secedit.sdb /cfg baseline.inf # compare host vs template
auditpol /get /category:*                          # current advanced audit policy
```

## Registry — set a control directly

```powershell
# Many CIS controls are a single registry value — verify the key/type against the benchmark rationale
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" `
  -Name "LimitBlankPasswordUse" -Value 1 -Type DWord
Get-ItemProperty -Path "HKLM:\...\Lsa" -Name "LimitBlankPasswordUse"   # confirm it took
reg query "HKLM\SYSTEM\CurrentControlSet\Control\Lsa" /v LimitBlankPasswordUse
```

## Verify state

```powershell
gpresult /r                    # resultant set of policy for this host
gpresult /h C:\rsop.html       # full HTML report of applied GPOs
systeminfo                     # OS build — pick the matching CIS benchmark version
```

## Gotchas worth remembering

- **Compliance ≠ security.** CIS Level 1 is a widely-accepted *floor* written for the average enterprise, not proof you're secure. Your threat model (module 01) tells you where you aren't average — Level 1 is the ceiling of nothing.
- **Level 1 vs Level 2.** L1 hardens with minimal operational disruption; L2 trades functionality (USB blocking, strict allow-listing) for more security. Apply L1 *fully* before cherry-picking L2 — a selective pick creates false coverage.
- **The diff is the deliverable, not the score.** Scan → apply → rescan → diff. A rule that stayed at fail after its GPO was applied is a config-management failure to chase down, not a rounding error.
- **Test in a throwaway VM first.** A hardening control can break login, RDP, or an app. Snapshot the VM, apply, verify you can still get in, *then* promote to real hosts.
- **AI-translated commands lie confidently.** A model turns terse CIS prose into `Set-ItemProperty`/`secedit` fast but can target the wrong key. Verify each against the benchmark's rationale section before it touches anything real.
- **Match the benchmark to the build.** Windows 11 23H2 ≠ 22H2 ≠ Server 2022 — a scan against the wrong benchmark version scores garbage. Check `systeminfo` first.
