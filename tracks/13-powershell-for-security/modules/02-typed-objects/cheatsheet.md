---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Typed Objects & the Pipeline Done Right

*Companion to [Module 02 — Typed Objects & the Pipeline Done Right](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Advanced function — the cmdlet contract

```powershell
function ConvertTo-VigilEvent {
    [CmdletBinding()]                         # promotes to an advanced function: -Verbose, $PSCmdlet, binding
    [OutputType([VigilEvent])]                # DECLARE what you return (Get-Help shows it, reviewers see it)
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string]$Path
    )
    # ... emit objects, never Write-Host ...
}
```

`[CmdletBinding()]` + `[OutputType()]` is the difference between a plain function that prints and a cmdlet-
like function that emits. The copilot writes the former; you write the latter.

## Parameter validation — reject bad input at the boundary

```powershell
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]                              # not null, not empty
    [string]$Path,

    [ValidateScript({ Test-Path -Path $_ -PathType Leaf })] # arbitrary logic; fails at the call site
    [string]$ConfigPath,

    [ValidateSet('Information', 'Warning', 'Error')]        # pin to known values
    [string]$Level,

    [ValidatePattern('^\d{1,5}$')]                          # enforce a shape (e.g. an event Id)
    [string]$EventId,

    [ValidateRange(1, 65535)]                               # numeric bounds
    [int]$Port
)
```

Validation runs BEFORE your code. A bad argument fails with `Cannot validate argument on parameter 'Level'`
at the caller, not with a `NullReferenceException` deep in a loop.

## Emit objects, not strings

```powershell
# GOOD - a structured object the pipeline can use
[pscustomobject]@{
    TimeCreated = [datetime]$e.TimeCreated                  # coerce to real types
    Id          = [int]$e.Id
    Provider    = [string]$e.ProviderName
    Suspicious  = $hit
}

# BAD - a screenshot you have to re-parse (PSScriptAnalyzer flags PSAvoidUsingWriteHost)
Write-Host ("{0} Id={1} {2}" -f $e.TimeCreated, $e.Id, $e.Message)
```

Because it's an object, this all just works:

```powershell
ConvertTo-VigilEvent -Path ./data/raw-events.json |
    Where-Object Suspicious |
    Sort-Object TimeCreated |
    Export-Csv ./out.csv -NoTypeInformation
```

## `[pscustomobject]` vs a PowerShell `class`

```powershell
# [pscustomobject] - default: lightweight, dynamic properties, idiomatic
$obj = [pscustomobject]@{ Id = 4104; Suspicious = $true }

# class - when the TYPE IDENTITY matters (named contract, typed params, constructor-enforced fields)
class VigilEvent {
    [datetime]$TimeCreated
    [int]     $Id
    [string]  $Provider
    [string]  $Level
    [bool]    $Suspicious
    [string]  $Message

    VigilEvent([datetime]$time, [int]$id, [string]$provider, [string]$level, [bool]$suspicious, [string]$message) {
        $this.TimeCreated = $time
        $this.Id          = $id
        $this.Provider    = $provider
        $this.Level       = $level
        $this.Suspicious  = $suspicious
        $this.Message     = $message
    }
}

$evt = [VigilEvent]::new([datetime]'2026-02-11T08:07:44Z', 4104, 'Microsoft-Windows-PowerShell', 'Warning', $true, 'IEX ...')
$evt -is [VigilEvent]        # True - the contract is checkable
[OutputType([VigilEvent])]   # now means something a reviewer can verify
```

Use `[pscustomobject]` by default. Use a `class` when the type name is load-bearing (crosses module
boundaries, typed downstream parameters, constructor-enforced required fields).

## Pester — prove it emits objects and rejects bad input

```powershell
Describe 'ConvertTo-VigilEvent' {
    BeforeAll {
        Import-Module "$PSScriptRoot/Vigil/Vigil.psd1" -Force
        $script:events = ConvertTo-VigilEvent -Path "$PSScriptRoot/data/raw-events.json"
    }
    It 'emits objects, not strings'      { $script:events[0]        | Should -BeOfType ([VigilEvent]) }
    It 'coerces fields to real types'    { $script:events[0].Id     | Should -BeOfType ([int]) }
    It 'rejects a null path (boundary)'  { { ConvertTo-VigilEvent -Path '' } | Should -Throw }
    It 'rejects a missing file'          { { ConvertTo-VigilEvent -Path './nope.json' } | Should -Throw }
}
```

## The copilot's tells (what to catch in review)

```text
plain `function` with no [CmdletBinding()]   -> add [CmdletBinding()] + [OutputType()]
positional / unvalidated parameters          -> add [Validate*] attributes at the boundary
Write-Host / Format-Table | Out-String       -> emit objects; let the console format
$e.Id used as-is (string)                     -> coerce: [int]$e.Id, [datetime]$e.TimeCreated
```

Specify the output type in the prompt ("return `[VigilEvent]` objects, one per record") — a named contract
is much harder for the model to satisfy with a string.
