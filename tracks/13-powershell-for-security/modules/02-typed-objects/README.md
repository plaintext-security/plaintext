# Module 02 — Typed Objects & the Pipeline Done Right

*Type 9 · Tool-Build — build an advanced function that normalizes raw event records into typed `VigilEvent` objects: `[CmdletBinding()]`, `[OutputType()]`, parameter-validation attributes, and structured objects out — never a `Write-Host` summary you'd have to re-parse. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot emits a printed summary; your edge is the typed object the rest of the pipeline can actually trust.*

!!! abstract "In 60 seconds"
    Ask a copilot to "summarize the suspicious events" and it hands you a `Write-Host` block — text
    that looks right and is useless the moment you try to sort, filter, or export it. This module builds
    the fix into `Vigil`: `ConvertTo-VigilEvent`, an **advanced function** that takes raw, untrusted event
    records and returns typed `VigilEvent` **objects**. You'll wire up `[CmdletBinding()]` and
    `[OutputType()]` so the function behaves like a real cmdlet, guard every parameter with validation
    attributes (`[ValidateNotNullOrEmpty]`, `[ValidateSet]`, `[ValidatePattern]`, `[ValidateScript]`) so
    bad telemetry is rejected at the door, and decide between a `[pscustomobject]` and a PowerShell
    `class` for the output contract. The anchor is Microsoft's own "Strongly Encouraged Development
    Guidelines": objects, not formatted text, is the *documented* cmdlet contract — the copilot just
    doesn't default to it.

## Why this matters

Objects, not strings, is the single discipline this whole track hangs on — and it's the thing the copilot
gets subtly wrong every time. Ask a model to "return the suspicious events" and it will reach for a decade
of forum answers: a `foreach` loop that `Write-Host`es a formatted line per event, positional parameters,
and no validation on the input at all. It *reads* fine. It is also a dead end: you cannot pipe it into
`Where-Object`, you cannot `Sort-Object` it by time, you cannot `Export-Csv` it for a report, and you
cannot test it without string-matching against brittle output. The moment the next stage of `Vigil` needs
that data — the enrichment in Module 04, the detection in Module 08, the eval in Module 09 — a printed
string forces a re-parse, and re-parsing telemetry you already had structured is exactly the bug this
track exists to kill.

The second half is validation. Event data is **untrusted input** — it comes from logs an attacker may
have influenced, exports that may be malformed, fields that may be missing or the wrong type. A function
that trusts `$e.Id` to be an integer and `$e.Message` to be present will throw deep in a loop on the one
malformed record, or worse, silently produce a garbage object. PowerShell's parameter-validation
attributes let you declare the contract *at the boundary* — reject a null path, a bad event ID, a
provider name that doesn't match the expected shape — so the failure is loud, early, and at the edge where
you can see it, not buried three functions deep. This is the same typed-boundary discipline you'll apply to
untrusted **LLM output** in Module 07; event data is where you build the muscle.

## Objective

Build `ConvertTo-VigilEvent`, an advanced function in the `Vigil` module that ingests raw event records
and emits typed `VigilEvent` objects: `[CmdletBinding()]`, an `[OutputType()]` that names its contract,
parameter validation that rejects malformed input at the boundary, and a typed output shape (`[pscustomobject]`
or a `class`) that downstream stages can sort, filter, and export without re-parsing. Prove it with `Pester`
tests that assert it emits objects (not strings) and rejects bad input.

## The core idea

**An advanced function is a cmdlet you wrote in PowerShell — so make it behave like one.** The one line
that promotes a plain function to an advanced function is `[CmdletBinding()]`: it gives you the common
parameters (`-Verbose`, `-ErrorAction`, `-WhatIf` where relevant), proper pipeline binding, and the
`$PSCmdlet` context real cmdlets have. Pair it with `[OutputType([VigilEvent])]` and you've *declared the
contract* — the function announces what it returns, `Get-Help` shows it, editors complete against it, and a
reviewer (or the copilot) can see at a glance that this thing produces objects of a known shape. The copilot
writes plain functions that print; you write advanced functions that emit. That difference is the entire
module.

**Validate at the boundary, not in the body.** The copilot's instinct is to write a function that accepts
anything and hopes for the best, then crashes on the malformed record halfway through. PowerShell gives you
a better tool: validation attributes that run *before your code does*. `[ValidateNotNullOrEmpty()]` rejects
an empty path; `[ValidateSet('Information','Warning','Error')]` pins a level to known values;
`[ValidatePattern('^\d+$')]` enforces a shape; `[ValidateScript({ Test-Path $_ })]` runs arbitrary logic
and fails with your message. Declaring the contract this way means the caller gets a clear error at the
call site — `Cannot validate argument on parameter 'Level'` — instead of a `NullReferenceException` from
deep inside a loop. Untrusted telemetry is the perfect place to practice this: the one event with a missing
field is the one that teaches you why the boundary check belongs on the parameter, not fifty lines down.

**Emit objects; let PowerShell do the formatting.** The rule is: your function *returns data*, and the
console (or `Format-Table`, or `Export-Csv`, or the next function) decides how it looks. A
`[pscustomobject]@{ TimeCreated = ...; Id = ...; Suspicious = ... }` is sortable, filterable, exportable,
and testable; a `Write-Host` line is a screenshot. When the output shape is stable and you want a *named
type* the pipeline can validate against — `[OutputType([VigilEvent])]`, `$obj -is [VigilEvent]`, typed
parameters downstream — reach for a PowerShell `class`. When you just need a structured bag of properties
and don't need the type identity, `[pscustomobject]` is lighter and idiomatic. Both are objects; the choice
is about whether you want a *contract with a name*. `VigilEvent` is a real contract that Module 03's parser,
Module 04's enrichment, and Module 09's eval all bind to — so this module makes it a class.

??? note "`[pscustomobject]` vs a PowerShell `class` — when each earns its keep"
    Reach for **`[pscustomobject]`** by default: it's a one-liner, it's what most cmdlets emit, and it
    round-trips cleanly through `ConvertTo-Json`/`Export-Csv`. Its properties are dynamic — nothing stops a
    typo'd key or a missing field. Reach for a **`class`** when the type *identity* is load-bearing: when
    you want `[OutputType([VigilEvent])]` to mean something checkable, when downstream parameters should be
    typed `[VigilEvent]`, when a constructor should enforce required fields, or when methods belong on the
    data. The cost is ceremony (a `class` block, a constructor) and that classes are defined at parse time,
    which complicates dot-sourcing across a module — so you export the type deliberately. For `Vigil`, the
    event object crosses many module boundaries, so the named contract is worth the ceremony.

## Learn (~2–3 hrs)

**The cmdlet contract (do this first — it's the module's anchor)**

- [Microsoft Learn — "Strongly Encouraged Development Guidelines"](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/strongly-encouraged-development-guidelines) (~30 min)
  — the authority for *why objects, not text*: read "Output Objects to the Pipeline," "Support Well Defined
  Pipeline Input," and the argument-validation guidance. This is Microsoft telling you the copilot's
  `Write-Host` habit is wrong.
- [Microsoft Learn — "about_Functions_Advanced"](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced) (~20 min)
  — what `[CmdletBinding()]` actually buys you and how a function becomes cmdlet-like. Skim, then keep it
  open while you build.

**Parameter validation & typed output**

- [Microsoft Learn — "about_Functions_Advanced_Parameters"](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_parameters) (~30 min)
  — the reference for every validation attribute you'll use (`ValidateNotNullOrEmpty`, `ValidateSet`,
  `ValidatePattern`, `ValidateScript`, `ValidateRange`) plus `[OutputType()]`. This is the parameter block
  you'll write today.
- [Microsoft Learn — "about_Classes"](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_classes) (~25 min)
  — PowerShell `class` syntax, constructors, and how classes differ from `[pscustomobject]`. Read enough to
  define `VigilEvent` and know when *not* to.

**The judgment (objects vs strings, in practice)**

- [PowerShell Explained (Kevin Marquette) — "Everything you wanted to know about PSCustomObject"](https://powershellexplained.com/2016-10-28-powershell-everything-you-wanted-to-know-about-pscustomobject/) (~20 min)
  <!-- VALIDATE: confirm URL/slug resolves; else cite by title + author -->
  — the definitive practitioner walkthrough of building objects the right way (ordered hashtables, adding
  members, why `[pscustomobject]` beats `New-Object PSObject`). This is the idiom the copilot skips.

## Key concepts
- **`[CmdletBinding()]` makes a function an advanced function** — common parameters, pipeline binding, `$PSCmdlet`; the copilot writes plain functions that print.
- **`[OutputType()]` declares the contract** — the function announces what it returns; `Get-Help` and reviewers can see it.
- **Validation attributes reject bad input at the boundary** — `[ValidateNotNullOrEmpty]`, `[ValidateSet]`, `[ValidatePattern]`, `[ValidateScript]` fail loud and early, not deep in a loop.
- **Emit objects; never format them** — a `[pscustomobject]` sorts/filters/exports; a `Write-Host` line is a screenshot.
- **`class` vs `[pscustomobject]`** — a `class` when the type *identity* is load-bearing (named contract, typed params); `[pscustomobject]` for a structured bag by default.

## AI acceleration

Have the copilot draft `ConvertTo-VigilEvent` from a one-line prompt, then review the draft against this
module's contract — the tells are predictable. It will very likely: write a plain `function` with **no**
`[CmdletBinding()]`; use **positional** parameters with no validation; and end the loop with a `Write-Host`
or a `Format-Table | Out-String` "summary" instead of returning objects. Your job is to reject each: add the
`[CmdletBinding()]`/`[OutputType()]`, move the input contract onto validation attributes, and replace the
printed summary with emitted `VigilEvent` objects. A sharp move is to *specify the output type first* — tell
the copilot "return `[VigilEvent]` objects, one per input record, with these typed fields" — because a named
contract in the prompt is far harder for the model to satisfy with a string than a vague "summarize."
Whatever it drafts, run it through `PSScriptAnalyzer`: `PSAvoidUsingWriteHost` and the positional-parameter
warnings will catch the defaults you missed.

!!! question "Check yourself"
    - What does `[CmdletBinding()]` give a function that a plain `function` keyword does not, and why does
      that matter for something downstream code will pipe into?
    - You're handed a raw event record with a missing `Id` field. Where should that failure surface — at the
      parameter boundary or deep in the loop — and which validation attribute puts it there?
    - When would you define `VigilEvent` as a `class` instead of emitting a `[pscustomobject]`, and what do
      you pay for the type identity?
