---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Modern PowerShell Toolchain & Module Skeleton

*Companion to [Module 01 — Modern Toolchain & Module Skeleton](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Module scaffold — manifest, root module, exports

```powershell
New-ModuleManifest ./Vigil/Vigil.psd1 `           # create the manifest (.psd1)
    -RootModule 'Vigil.psm1' `
    -ModuleVersion '0.1.0' `
    -FunctionsToExport @('Get-VigilEvent') `      # EXPLICIT exports — never '*'
    -PowerShellVersion '7.4'
Test-ModuleManifest ./Vigil/Vigil.psd1            # validate the manifest resolves
Import-Module ./Vigil/Vigil.psd1 -Force           # load your module (re-load with -Force)
Get-Command -Module Vigil                          # confirm only the intended functions export
Remove-Module Vigil                                # unload
```

A module is `Vigil/Vigil.psd1` (manifest) + `Vigil/Vigil.psm1` (root module that dot-sources
`Public/`/`Private/` functions). `FunctionsToExport` is the boundary — list functions explicitly so the
manifest is your public API, not everything you happened to define.

## PSScriptAnalyzer — the linter/gate

```powershell
Install-Module PSScriptAnalyzer -Scope CurrentUser         # once
Invoke-ScriptAnalyzer -Path ./Vigil -Recurse               # lint the module
Invoke-ScriptAnalyzer -Path ./Vigil -Recurse -Settings ./PSScriptAnalyzerSettings.psd1
Invoke-ScriptAnalyzer -Path . -Severity Error,Warning      # gate on these severities
Invoke-ScriptAnalyzer -Path . -EnableExit                  # exit non-zero on findings (CI gate)
```

`PSScriptAnalyzerSettings.psd1`:

```powershell
@{
    Severity = @('Error','Warning')
    ExcludeRules = @()                 # keep empty; suppress at the line with justification instead
}
```

Suppress one finding *at the source, with a reason* — not by disabling the rule globally:

```powershell
[Diagnostics.CodeAnalysis.SuppressMessageAttribute(
    'PSAvoidUsingWriteHost','', Justification='interactive banner only')]
param()
```

Rules the copilot trips most: `PSAvoidUsingInvokeExpression`, `PSAvoidUsingWriteHost`,
`PSUseDeclaredVarsMoreThanAssignments`, `PSUseShouldProcessForStateChangingFunctions`.

## Pester v5 — one real test

```powershell
Install-Module Pester -Scope CurrentUser -Force            # v5+
# Vigil.Tests.ps1
Describe 'Get-VigilEvent' {
    BeforeAll { Import-Module $PSScriptRoot/Vigil/Vigil.psd1 -Force }
    It 'reproduces the baseline summary byte-for-byte' {
        $out = Get-VigilEvent -Path $PSScriptRoot/data/sample.json | Out-String
        $out | Should -Be (Get-Content $PSScriptRoot/data/baseline.txt -Raw)
    }
}
```

```powershell
Invoke-Pester -Path ./Vigil.Tests.ps1                       # run tests
Invoke-Pester -CI                                           # CI mode: exit code + test-results.xml
$c = New-PesterConfiguration; $c.Run.Exit = $true; Invoke-Pester -Configuration $c
```

## The CI gate (GitHub Actions, pwsh)

```yaml
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - shell: pwsh
        run: |
          Set-PSResourceRepository PSGallery -Trusted        # PSResourceGet (PS 7.4+)
          Install-PSResource PSScriptAnalyzer, Pester -TrustRepository
          Invoke-ScriptAnalyzer -Path . -Recurse -EnableExit -Settings ./PSScriptAnalyzerSettings.psd1
          Invoke-Pester -CI
```

## Strangler-fig migration — the order

```text
1. Reproduce the loose script's output  → baseline.txt (ground truth)
2. Scaffold Vigil.psd1 + Vigil.psm1     → wrap hunt.ps1 UNCHANGED behind Get-VigilEvent
3. Prove Import-Module reproduces baseline byte-for-byte   (no refactor yet)
4. Add PSScriptAnalyzer + one Pester test → green
5. Wire CI → prove it FAILS on a planted Invoke-Expression, then fix
6. Refactor ONE slice behind the green gate → re-prove baseline + gate
7. Rollback is always the previous commit
```

## `pwsh` 7 vs Windows PowerShell 5.1

```powershell
$PSVersionTable.PSVersion            # 7.x = PowerShell 7 (pwsh); 5.1 = Windows PowerShell
pwsh -NoProfile -Command '…'         # run a scriptblock in a clean pwsh
```

Target `pwsh` 7: cross-platform, current, and where `ForEach-Object -Parallel`, ternary, and
`SecretManagement` live. Windows PowerShell 5.1 is the copilot's default — and this track's anti-pattern.

## The ADR skeleton (Module also delivers this)

```markdown
# ADR-001: PowerShell module toolchain
## Context      — a loose hunt.ps1; no manifest, no gate; PSGallery doesn't mandate signing
## Options      — loose .ps1 · script module + gate · compiled binary module
## Decision     — script module (Vigil) + PSScriptAnalyzer + Pester gated in CI, pwsh 7
## Consequences — 5.1-only hosts need pwsh installed; the honest downside you accept
```
