---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Test, Measure & Supply-Chain Gate

*Companion to [Module 09 — Test, Measure & Supply-Chain Gate](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Pester v5 — config + code coverage floor

```powershell
$c = New-PesterConfiguration
$c.Run.Path                        = './Vigil.Tests.ps1'
$c.Run.Exit                        = $true          # non-zero exit on failure (CI gate)
$c.CodeCoverage.Enabled            = $true
$c.CodeCoverage.Path               = './Vigil'      # what to measure
$c.CodeCoverage.CoveragePercentTarget = 80          # FAIL below this floor
$c.Output.Verbosity                = 'Detailed'
Invoke-Pester -Configuration $c
```

Coverage is a **presence check** (did the line run?), not an **effectiveness check** (does the detection
work?). Use it as a floor; use the held-out eval as the ceiling.

## `Should -Invoke` — mock an edge, test the unhappy path

```powershell
Describe 'Invoke-VigilEnrichment (mocked feed)' {
    BeforeAll { Import-Module "$PSScriptRoot/Vigil/Vigil.psd1" -Force }

    It 'queries the feed exactly once per unique indicator' {
        Mock -CommandName Import-Csv -ModuleName Vigil -MockWith {
            @([pscustomobject]@{ dst_ip = '185.220.101.7'; malware = 'Emotet'; c2_status = 'online' })
        }
        $null = '185.220.101.7', '185.220.101.7' |
            Invoke-VigilEnrichment -FeedPath './data/feed.csv'
        Should -Invoke -CommandName Import-Csv -ModuleName Vigil -Times 1 -Exactly
    }

    It 'returns a non-throwing result when the feed read fails (unhappy path)' {
        Mock -CommandName Import-Csv -ModuleName Vigil -MockWith { throw 'feed timeout' }
        { '1.2.3.4' | Invoke-VigilEnrichment -FeedPath './data/feed.csv' } | Should -Throw
    }
}
```

`-ModuleName` is required to mock a cmdlet **called from inside** a module. `Should -Invoke -Times N -Exactly`
asserts *how often* the edge was hit — the whole point of a mock over a real call.

## Precision / recall scorecard (held-out corpus)

```powershell
# $results: objects with .Actual ('malicious'/'benign') and .Predicted (from the detection)
$tp = ($results | Where-Object { $_.Actual -eq 'malicious' -and $_.Predicted -eq 'malicious' }).Count
$fp = ($results | Where-Object { $_.Actual -eq 'benign'    -and $_.Predicted -eq 'malicious' }).Count
$fn = ($results | Where-Object { $_.Actual -eq 'malicious' -and $_.Predicted -eq 'benign'    }).Count
$tn = ($results | Where-Object { $_.Actual -eq 'benign'    -and $_.Predicted -eq 'benign'    }).Count

$precision = if ($tp + $fp) { $tp / ($tp + $fp) } else { 0 }   # of flagged, how many real? (alert fatigue)
$recall    = if ($tp + $fn) { $tp / ($tp + $fn) } else { 0 }   # of real, how many caught? (misses)
$fpRate    = if ($fp + $tn) { $fp / ($fp + $tn) } else { 0 }   # analyst cost

[pscustomobject]@{ TP=$tp; FP=$fp; FN=$fn; TN=$tn
    Precision=[math]::Round($precision,3); Recall=[math]::Round($recall,3); FPRate=[math]::Round($fpRate,3) }
```

**Accuracy lies on skewed corpora** (95% benign → "flag nothing" scores 95%). Report precision + recall +
FP-rate, and say which you lean toward for *this* tool.

## The regression gate — commit a floor, fail on a drop

```powershell
$FloorRecall = 0.90        # committed thresholds = the durable guarantee
$CeilFPRate  = 0.10
if ($recall -lt $FloorRecall) {
    Write-Error "REGRESSION: recall $recall < floor $FloorRecall"      # non-zero exit fails CI
}
if ($fpRate -gt $CeilFPRate) {
    Write-Error "REGRESSION: FP-rate $fpRate > ceiling $CeilFPRate"
}
```

Held-out eval + committed floor = the next "cleanup" can't silently trade recall for a cleaner diff.
**No silent caps:** note that a small corpus bounds what the score proves.

## Held-out vs. tuning set

```text
data/
  tuning/     <- you MAY inspect labels here while building the detection
  heldout/    <- the eval scores ONLY these; never tuned against
```

Measure on the held-out set. Scoring on the tuning set is a memory test — it looks great and means nothing.

## Code signing — self-signed cert -> sign -> verify (Windows)

```powershell
# 1. Create a code-signing cert (self-signed in the lab; a trusted CA in prod).
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject 'CN=Vigil Lab Signing' -CertStoreLocation Cert:\CurrentUser\My

# 2. Sign every module file.
Get-ChildItem ./Vigil -Recurse -Include *.ps1,*.psm1,*.psd1 | ForEach-Object {
    Set-AuthenticodeSignature -FilePath $_.FullName -Certificate $cert
}

# 3. Verify BEFORE trusting/loading — gate on Valid.
$sig = Get-AuthenticodeSignature ./Vigil/Vigil.psm1
if ($sig.Status -ne 'Valid') { Write-Error "Signature not valid: $($sig.Status)" }
```

Statuses: `Valid` (trust it) · `NotSigned` · `HashMismatch`/`UnknownError` (tampered or untrusted signer).
The PowerShell Gallery does **not** mandate signing — this loop is the guarantee you add.

!!! warning "Set-/Get-AuthenticodeSignature are Windows-only"
    They are **not** available on Linux/pwsh (`Microsoft.PowerShell.Security` ships only the CMS/credential
    cmdlets there). The Linux lab demonstrates the *same primitive* — a detached CMS/PKCS#7 signature, which
    is what Authenticode is built on — with `openssl cms`. Same loop (sign → verify-before-trust →
    reject-on-tamper); full Authenticode chain trust is *assessed-not-demonstrated* on Linux.

```bash
# Same mechanism, runnable offline on Linux (see the lab's sign.ps1):
openssl req -x509 -newkey rsa:2048 -nodes -keyout cs.key -out cs.crt \
    -days 365 -subj '/CN=Vigil Lab Signing' -addext 'extendedKeyUsage=codeSigning'
openssl cms -sign   -binary -in ./Vigil/Vigil.psm1 -signer cs.crt -inkey cs.key -outform PEM -out sig.p7s
openssl cms -verify -binary -in sig.p7s -inform PEM -content ./Vigil/Vigil.psm1 -CAfile cs.crt  # non-zero on tamper
```

## `PSResourceGet` — pinned installs

```powershell
Set-PSResourceRepository PSGallery -Trusted
Install-PSResource -Name Pester         -Version 5.6.1  -TrustRepository   # EXACT version, not floating
Install-PSResource -Name PSScriptAnalyzer -Version 1.22.0 -TrustRepository
Get-InstalledPSResource -Name Pester | Select-Object Name, Version         # confirm the pin held
```

An unpinned install makes the gate that measures your module irreproducible — pin the exact version.

## The full gate (analyzer + Pester + eval + signature)

```powershell
Invoke-ScriptAnalyzer -Path ./Vigil -Recurse -EnableExit -Settings ./PSScriptAnalyzerSettings.psd1
Invoke-Pester -Configuration $c            # tests + coverage floor
./eval.ps1                                 # held-out scorecard + regression gate (non-zero on drop)
# verify every module file's signature is Valid before the gate passes
```

Style (analyzer) + presence (coverage) + **effectiveness** (eval) + **authenticity** (signature) — four
different questions, four checks. Coverage-green is not eval-green.
