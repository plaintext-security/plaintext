# Module 01 — Modern PowerShell Toolchain & Module Skeleton

*Type 12 · Migration — take a real loose PowerShell script and migrate it, without breaking it, into a proper module with a manifest, a `PSScriptAnalyzer` + `Pester` CI gate, and a spec-driven workflow. (Secondary: Type 11 · ADR — record the toolchain and spec-workflow decision honestly.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot writes the one-liner in seconds; your edge is the module it writes into and the spec it writes against.*

!!! abstract "In 60 seconds"
    You already write PowerShell and your copilot writes it faster. So this track doesn't teach syntax —
    it teaches the **module and the process** that make copilot output *trustworthy*: a proper module
    (manifest, public/private functions) with `PSScriptAnalyzer` and `Pester` gated in CI, and a
    **spec-driven workflow** where you write the spec, the AI implements it, and you review the
    implementation *against the spec*. You'll migrate a loose script into that skeleton with the
    strangler-fig pattern — wrap first, never big-bang — and the migration will be the seed of `Vigil`,
    the Windows telemetry triage-and-hunt module you grow across the whole track. The anchor is a real
    supply-chain lesson: the PowerShell Gallery does not mandate code signing, and researchers have shown
    its lax naming policy lets an attacker publish a module that *looks* first-party.

## Why this matters

The copilot's PowerShell defaults are a decade old. Ask any model to "set up a PowerShell tool" and you'll
get a single `.ps1` full of `Write-Host`, no manifest, no tests, and an execution-policy workaround pasted
from a forum — the idioms of Windows PowerShell 5.1. It runs, but it's a script, not a *module*: nothing
lints it, nothing tests it, and nothing stops the next person (or the copilot) from quietly changing what
it does. Meanwhile the failure that should scare you isn't style — it's **what gets loaded**. The
PowerShell Gallery, where `Install-Module` pulls from, does **not** require code signing, and security
researchers have demonstrated that its module-naming policy is loose enough to publish a package that
impersonates a trusted publisher. A script you `Install-Module`'d and never reviewed is code you're
running blind — and a gated, signed, reviewed *module* is the discipline that closes that gap.

This module is first because everything else in the track is built *in this skeleton*. If your tool can't
be linted, tested, and gated in CI, none of the later guarantees (typed telemetry, safe concurrency, a
detection eval gate) are trustworthy — they're claims. And because the whole track's thesis is "AI authors
→ you review → you own it," you need a *method* for directing the AI, not just a place to paste it. That
method is spec-driven development, and it starts here.

## Objective

Migrate a working loose PowerShell script into a proper module — a manifest, public/private function
layout, `PSScriptAnalyzer` clean, `Pester` tests green, all gated in CI — without breaking the script at
any step; adopt a spec-driven workflow (openspec) and write the first `Vigil` spec; and record the
decision in a short ADR you can defend.

## The core idea

**A module is a security control, not a nicety.** A loose `.ps1` has no boundary: no declared exports, no
version, no signature, nothing that lints or tests it. A **module** — a manifest (`.psd1`) that declares
its version, exported functions, and (optionally) a signature, plus a `PSScriptAnalyzer` pass and `Pester`
tests gated in CI — is what turns "a script someone emailed me" into "a versioned, reviewed, testable unit
you can trust and others can install." That boundary is exactly what the PowerShell Gallery's lack of
mandatory signing leaves to *you*. None of this is exotic — it's the current default the copilot hasn't
caught up to. Your job is to *know* it's the bar and hold the generated code to it in CI.

**Migrate, don't rewrite.** The instinct — yours and the copilot's — is to delete the old script and
regenerate it clean. Don't. Real tooling is migrated *incrementally* with the **strangler-fig** pattern:
stand the module structure up *around* the working code, move one function at a time, and prove nothing
broke at each step. Here that means wrapping the loose `hunt.ps1` unchanged inside the new module first,
getting the `PSScriptAnalyzer` + `Pester` gate green around it, and only then refactoring behind the
passing gate. The muscle you build — never cut over all at once, always keep a rollback — is the same one
Track 06 (brownfield AD tiering) and Track 10 (click-ops → IaC) use on domains where a big-bang cutover
means an outage.

**Spec-driven development is how you review the copilot instead of trusting it.** The move: write a
**spec** for the increment you want (what it does, the typed contract, the acceptance checks) → let the
copilot implement it → **review the implementation against the spec**, which is a far sharper lens than
reading PowerShell cold. The spec is also the artifact that makes ownership real: when you can point to
"this is what I specified, here's the diff that implements it, here's the `Pester` test that proves it,"
you own the code in a way that pasting never gives you. You'll adopt a concrete tool for it and carry the
spec beat into every module that follows.

??? note "Windows PowerShell 5.1 vs PowerShell 7 — and why this track is `pwsh`"
    "PowerShell" today means two things: **Windows PowerShell 5.1** (the built-in, Windows-only, .NET
    Framework edition Microsoft no longer adds features to) and **PowerShell 7** (`pwsh`, cross-platform,
    open-source, current). The copilot's training data skews heavily to 5.1 idioms. This track targets
    `pwsh` 7 — it runs the same on the Linux lab containers and on a Windows host, and it's where new
    capabilities (`ForEach-Object -Parallel`, ternary, `SecretManagement`) actually live. A handful of
    hunt surfaces (live AMSI, Defender, JEA *enforcement*) are Windows-only; the labs flag those honestly
    and give you a real exported artifact to work on instead.

## Learn (~2–3 hrs)

**The module toolchain (do these first — they replace the copilot's script defaults)**

- [Microsoft Learn — "How to write a PowerShell script module"](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/how-to-write-a-powershell-script-module) (~30 min)
  — the manifest (`.psd1`), the root module (`.psm1`), `FunctionsToExport`, and how a module differs from a
  loose script. This is the skeleton the whole track is built in.
- [`PSScriptAnalyzer` overview](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/overview) (~20 min)
  — the linter that flags the copilot's 5.1-isms (`Invoke-Expression`, positional params, `Write-Host`);
  skim the rule categories and how to run it in CI.
- [`Pester` v5 — "Quick Start"](https://pester.dev/docs/quick-start) (~30 min) — the test framework;
  `Describe`/`It`/`Should`, and (later) `Should -Invoke` mocks. Read enough to write one real test today.

**Spec-driven development (the workflow you'll use all track)**

- [OpenSpec — README and quickstart](https://github.com/Fission-AI/OpenSpec) (~30 min) — the concrete
  spec-driven workflow this track leads with: write a change spec, drive the AI from it, review against it.
- [GitHub `spec-kit`](https://github.com/github/spec-kit) (~20 min) — the mainstream alternative; read its
  "specify → plan → tasks" loop so you understand the pattern is tool-agnostic.

**The anchor (why a reviewed, signed module matters)**

- [Aqua Nautilus — "PowerHell: Active Flaws in PowerShell Gallery Expose Users to Attacks" (Aug 2023)](https://www.aquasec.com/blog/powerhell-active-flaws-in-powershell-gallery-expose-users-to-attacks/) (~10 min)
  — the primary write-up on the Gallery's lax naming policy and lack of mandatory signing; read what an
  attacker can actually publish, and why *you* reviewing and gating the module is the control.

## Key concepts
- **A module (manifest + exports + tests) is a boundary** — a loose `.ps1` has none; the copilot defaults to the script.
- **The Gallery doesn't mandate signing** — reviewing and gating what you `Install-Module` is on you.
- **`PSScriptAnalyzer` + `Pester` gated in CI** is the bar — they fail the build, not your goodwill.
- **Strangler-fig migration:** wrap the working script, gate it, refactor behind the green gate — never big-bang.
- **Spec-driven development:** spec → AI implements → review *against the spec* → verify. The spec is how you own AI code.

## AI acceleration

This module *is* the AI-acceleration method for the whole track, so use it on itself: have the copilot
generate the module manifest, the `.psm1`, the `PSScriptAnalyzer` settings, and the CI workflow — then
hold every line to the gate. The tell you're looking for: the model will emit a single `.ps1` with
`Write-Host`, positional parameters, and maybe an `Invoke-Expression`, and will skip the manifest and
tests entirely. Write the spec for the module skeleton first, let the model implement it, and review the
diff *against your spec* — did it produce a real manifest with explicit `FunctionsToExport`? did it wire
`PSScriptAnalyzer` and `Pester` into CI? did it preserve the loose script's behavior byte-for-byte? The
bug you catch here isn't in the hunt logic; it's in the *setup the copilot defaulted to*.

!!! question "Check yourself"
    - What does a module manifest (`.psd1`) give you that a loose `.ps1` cannot, and why does that matter
      for something you `Install-Module`?
    - What would break if you deleted `hunt.ps1` and had the copilot regenerate it from scratch, versus
      wrapping it and migrating behind a passing `PSScriptAnalyzer` + `Pester` gate?
    - In your own words: what does reviewing an implementation *against a spec* catch that reading the
      PowerShell cold does not?
