# Lab 01 — Migrate a Loose Script into a Gated `Vigil` Module

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/01-modern-toolchain/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, plus the loose
`hunt.ps1` you'll migrate and a small bundled event sample.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/01-modern-toolchain
make up      # build the pwsh + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with the loose script
make demo    # runs the module's gate: PSScriptAnalyzer + Pester over the migrated module
make down    # stop when done
```

The lab **builds one custom minimal target** — a loose script — because the lesson is the *migration
mechanism* and you edit the source yourself; a black-box module can't teach that. It is reproducible at
zero cost and runs entirely in the Linux container.

## Scenario

You've inherited `hunt.ps1`: a ~50-line script a teammate wrote that reads a JSON export of Windows events
and prints a summary of suspicious ones. It works, it's used, and it has no manifest, no tests, no
`PSScriptAnalyzer` pass, and a `Write-Host`-and-`Invoke-Expression` habit. You're going to migrate it into
the module the rest of this track builds in — **without breaking it at any step** — and turn it into the
seed of `Vigil`, the telemetry triage-and-hunt module you grow across all nine modules.

> Only test systems you own or have explicit written permission to test. Everything here runs locally in
> the lab container against bundled sample data.

## Do

1. [ ] **Reproduce the loose baseline.** Run `hunt.ps1` against the bundled sample and capture its output.
   This is your ground truth — the migration is correct only if this output never changes.
2. [ ] **Write the spec first.** Using the spec-driven workflow (openspec, or spec-kit), write a short
   change spec for the migration: "wrap the existing script unchanged in a `Vigil` module with a manifest
   and explicit `FunctionsToExport`; add `PSScriptAnalyzer` and a `Pester` smoke test; gate both in CI;
   behavior identical." The spec is the contract you'll review the copilot's work against.
3. [ ] **Stand up the module *around* the script (strangler-fig).** Scaffold `Vigil.psd1` + `Vigil.psm1`,
   drop `hunt.ps1`'s logic in behind one exported function (`Get-VigilEvent`) unchanged, and get
   `Import-Module ./Vigil` + a call to reproduce step 1's output byte-for-byte. Do **not** refactor yet —
   wrap first.
4. [ ] **Add the gates.** Configure a `PSScriptAnalyzerSettings.psd1`, get the module analyzer-clean (or
   suppress one finding *with a justification comment*), and write one real `Pester` test that asserts the
   wrapped function reproduces the baseline. Let the copilot generate the config, then check it against
   your spec — is `FunctionsToExport` explicit (not `'*'`)? is the analyzer actually failing on findings?
5. [ ] **Wire CI.** Add a workflow that fails on any `PSScriptAnalyzer` finding or `Pester` failure. Prove
   it fails by introducing an `Invoke-Expression` (an analyzer rule will catch it), then remove it.
6. [ ] **Migrate one slice behind the green gate.** Now refactor *one* piece (e.g. replace a `Write-Host`
   with a returned object, or split the read from the filter) — and prove step 1's output still matches and
   the gate stays green. Keep a rollback (the prior commit) at every step.
7. [ ] **Write the ADR.** Record the decision: why a module + `PSScriptAnalyzer` + `Pester` over a loose
   `.ps1`, why you target `pwsh` 7 not Windows PowerShell 5.1, and which spec-driven tool you chose and its
   honest downside.
8. [ ] **Automate & own it.** Commit the migrated module — `Vigil` v0 — with the CI gate, the spec, and the
   ADR. In the commit/PR, note what the copilot generated, what you corrected, and the one thing it
   defaulted to that you had to fix (the loose script, the missing manifest, the `Invoke-Expression`, or a
   dropped behavior).

## Success criteria — you're done when
- [ ] `Import-Module ./Vigil; Get-VigilEvent …` reproduces the loose script's output **byte-for-byte** — the migration broke nothing.
- [ ] `PSScriptAnalyzer` is clean (or every suppression carries a written justification), and at least one real `Pester` test passes.
- [ ] CI fails on a planted `Invoke-Expression`/analyzer finding and passes when it's fixed (you demonstrated both).
- [ ] A spec for the migration exists, and you can point to the implementation that satisfies it.
- [ ] An ADR records the module + toolchain + spec-workflow decision with an honest "Consequences" section.

## Deliverables
The migrated `Vigil` v0 module: `Vigil.psd1` + `Vigil.psm1` wrapping the loose script,
`PSScriptAnalyzerSettings.psd1`, at least one `Pester` test, the CI workflow, the migration spec, and
`ADR-001-toolchain.md`. Commit all of it. Do **not** commit any real event exports beyond the small
bundled sample, or any `.env`/secrets — later modules add secrets handling.

## AI acceleration
Have the copilot generate the entire skeleton — the manifest, the `.psm1`, the analyzer settings, the CI
YAML — from your spec, then review the diff against the spec rather than reading it cold. The high-value
catch is the copilot's *defaults*: it will tend to emit a single `.ps1`, set `FunctionsToExport = '*'`,
reach for `Write-Host`, and skip tests. Fixing those is the whole point — you're reviewing the AI's setup,
which is where this class of risk actually lives.

## Connects forward
This module skeleton is the home for every later module: Module 02 adds typed advanced functions inside
it, Module 03 makes it read real `.evtx` at scale, Module 09 hardens the very supply-chain/signing gate you
started here. The strangler-fig migration muscle returns in Track 06 (brownfield AD tiering) and Track 10
(click-ops → IaC), where a big-bang cutover means a real outage.

## Marketable proof
> "I migrate loose PowerShell into a proper, versioned module with a `PSScriptAnalyzer` + `Pester` gate in
> CI, using a spec-driven workflow to direct and review AI-generated code — without breaking the running
> script."

## Stretch (optional)
- Sign your module with a self-signed certificate and set the CI gate to verify the signature — a preview
  of Module 09's supply-chain work, and the direct answer to the Gallery's missing mandatory signing.
- Add `Invoke-ScriptAnalyzer` as a pre-commit hook so the gate runs before code ever reaches CI.
