# Lab 02 — Normalize Raw Telemetry into Typed `VigilEvent` Objects

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/02-typed-objects/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, the `Vigil` module
carried forward from Module 01 (now adding `ConvertTo-VigilEvent`), and a small bundled JSON of **raw,
messy** event records — some malformed on purpose — to normalize.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/02-typed-objects
make up      # build the pwsh + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with the Vigil module and the raw records
make demo    # runs the module gate: PSScriptAnalyzer + Pester over Vigil (incl. ConvertTo-VigilEvent)
make down    # stop when done
```

The lab **builds one custom minimal target** — the `Vigil` module plus a raw-records file — because the
lesson is the *typed-object contract* and you write the function yourself; a black-box tool can't teach
that. It is reproducible at zero cost and runs entirely in the Linux container.

## Scenario

`Vigil` v0 (from Module 01) can read a clean JSON export and flag suspicious events. But real telemetry
isn't clean: fields go missing, IDs arrive as strings, levels come in values you didn't expect, and a
record may be malformed enough to poison a naive loop. You're going to add `ConvertTo-VigilEvent` — the
function that turns raw, untrusted records into typed `VigilEvent` objects the rest of `Vigil` can trust —
and you're going to make it behave like a real cmdlet: validated parameters in, typed objects out, nothing
printed.

> Only test systems you own or have explicit written permission to test. Everything here runs locally in
> the lab container against bundled sample data.

## Do

1. [ ] **Look at the raw records first.** Read `data/raw-events.json` and find the messy ones — a missing
   field, an `Id` that arrived as a string, an unexpected `Level`. This is the untrusted input your
   function has to survive; note what a naive `foreach` would do to each.
2. [ ] **Ask the copilot for the function — then catch its defaults.** Prompt it for "a function that
   normalizes these event records." Expect a plain `function`, positional params, and a `Write-Host` (or
   `Format-Table`) summary. Do **not** keep it as-is — you'll fix each default in the steps below. Keep the
   draft so you can note in your commit what you changed.
3. [ ] **Make it an advanced function.** Add `[CmdletBinding()]` and an `[OutputType([VigilEvent])]` so the
   function behaves like a cmdlet and *declares* what it returns. Hint: `Get-Help ConvertTo-VigilEvent`
   should now show the output type.
4. [ ] **Define the `VigilEvent` contract.** Decide `[pscustomobject]` vs a `class` and justify it — since
   this object crosses into Modules 03/04/09, define a `VigilEvent` **class** with typed fields
   (`TimeCreated`, `Id`, `Provider`, `Level`, `Suspicious`, `Message`) so the type identity is checkable.
5. [ ] **Validate at the boundary.** Put the input contract on the parameters, not in the loop:
   `[ValidateNotNullOrEmpty()]` on the required input; a `[ValidateSet()]` or `[ValidatePattern()]` on any
   constrained field; a `[ValidateScript()]` where you need custom logic. Prove a bad argument fails at the
   *call site* with a clear message, not deep in the body.
6. [ ] **Emit objects, one per record — never a string.** Return `VigilEvent` objects with the raw fields
   coerced to their real types (`[datetime]`, `[int]`). Prove it: `ConvertTo-VigilEvent ... | Sort-Object
   TimeCreated | Where-Object Suspicious | Export-Csv` should all just work — because it's objects, not text.
7. [ ] **Handle the malformed record honestly.** Decide what a record missing a required field should do —
   skip with a `Write-Warning`, or reject — and make it deliberate, not an accidental crash. Whatever you
   choose, the good records still come through as objects.
8. [ ] **Prove it with `Pester`.** Write tests that assert (a) the output is objects, not strings —
   `Should -BeOfType`; (b) one object per valid record; (c) the typed fields are the right type; and (d) a
   bad argument is *rejected* — `Should -Throw`. Get `make demo` (PSScriptAnalyzer + Pester) green.
9. [ ] **Automate & own it.** Commit `ConvertTo-VigilEvent` into `Vigil` with its tests. In the commit/PR,
   note the three copilot defaults you fixed (plain function → `[CmdletBinding()]`; no validation → boundary
   attributes; printed summary → emitted objects).

## Success criteria — you're done when
- [ ] `ConvertTo-VigilEvent` is an advanced function — `[CmdletBinding()]` + `[OutputType([VigilEvent])]` — and `Get-Help` shows its output type.
- [ ] Its output is **objects**: `(ConvertTo-VigilEvent ...)[0] | Should -BeOfType ([VigilEvent])` passes, and you can `Sort-Object`/`Where-Object`/`Export-Csv` the result with no re-parsing.
- [ ] A malformed argument is rejected **at the boundary** with a clear validation error (you can demonstrate the `Should -Throw`).
- [ ] The typed fields carry real types (`TimeCreated` is `[datetime]`, `Id` is `[int]`), not strings.
- [ ] `PSScriptAnalyzer` is clean (no `PSAvoidUsingWriteHost`, no positional-parameter warnings), and the `Pester` tests pass — `make demo` is green.

## Deliverables
`ConvertTo-VigilEvent` added to the `Vigil` module (with the `VigilEvent` type it emits), the `Pester`
tests proving it emits objects and rejects bad input, and the module still analyzer-clean and gated. Commit
all of it. Do **not** commit any real event exports beyond the small bundled sample, or any `.env`/secrets.

## AI acceleration
Draft the function with the copilot, then review it against the contract — the value is in catching the
three defaults it ships: a plain `function` (no `[CmdletBinding()]`), positional/unvalidated parameters, and
a printed summary instead of emitted objects. Specify the output type *in the prompt* ("return
`[VigilEvent]` objects, one per record") — a named contract is much harder for the model to satisfy with a
string. Then let `PSScriptAnalyzer` be the backstop: `PSAvoidUsingWriteHost` and the positional-parameter
warnings flag exactly what the copilot defaulted to.

## Connects forward
The `VigilEvent` type you define here is the object every later stage binds to: Module 03 makes `Get-VigilEvent`
read real `.evtx` at scale and hand you these objects; Module 04 enriches them concurrently; Module 07
validates untrusted **LLM output** with the *same* typed-boundary discipline; Module 09's eval scores the
pipeline that carries them. Objects-not-strings is the through-line — this is where you build it.

## Marketable proof
> "I write PowerShell as advanced functions with declared output types and boundary parameter validation
> that emit typed objects, not `Write-Host` strings — so my telemetry pipeline sorts, filters, and exports
> without re-parsing, and rejects malformed input at the edge."

## Stretch (optional)
- Add a class **method** to `VigilEvent` (e.g. `ToAttckHint()` mapping a suspicious event to a likely
  ATT&CK technique) and a test for it — a preview of the enrichment in Module 04.
- Add `[Parameter(ValueFromPipeline)]` so `ConvertTo-VigilEvent` accepts records straight off the pipeline
  (`$raw | ConvertTo-VigilEvent`), with a `process {}` block, and test the pipeline path.
