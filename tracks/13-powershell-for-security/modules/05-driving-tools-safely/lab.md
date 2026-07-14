# Lab 05 — Build `Invoke-VigilTool`: an Injection-Safe External-Process Wrapper

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/05-driving-tools-safely/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell:7.4-ubuntu-22.04`) with `PSScriptAnalyzer 1.22.0` and `Pester 5.6.1`
pinned, a **mock external tool** (`data/vigil-scan.sh`) that echoes the exact argument array it received
so you can *see* whether your data leaked into a command line, and sample inputs including a **hostile
filename** and a **hostile indicator**.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/05-driving-tools-safely
make up      # build the pwsh 7 + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with Vigil and the mock tool
make demo    # gate: AST scan (no Invoke-Expression) + PSScriptAnalyzer + Pester (injection proofs)
make down    # stop when done
```

The lab **builds a custom minimal target** — a mock external tool that prints its argv — because the
lesson is *how the argument reaches the process*, and a black-box binary would hide exactly the thing you
need to see: whether `; rm -rf` arrived as one inert argument or got re-parsed into a command. It is
reproducible at zero cost and runs entirely in the Linux container.

## Scenario

`Vigil` now needs to drive external tools: hash a suspicious file, scan it, resolve a domain. You're
building `Invoke-VigilTool`, the wrapper every future call goes through. The catch is that the arguments
come from **attacker-controlled telemetry** — filenames and indicators lifted from the events you're
triaging — so the wrapper must pass them as *data* to the external process, never as a command line it
built from strings. The copilot's first draft will almost certainly use `Invoke-Expression` or string
interpolation; your job is to build it the safe way, prove a malicious argument can't execute, and wire a
review gate that makes the unsafe idiom un-mergeable.

> **Authorization.** This lab is offensive-capable: you are deliberately feeding command-injection
> payloads (`; rm -rf`, `$(...)`) to a process wrapper to prove they *don't* execute. Only run injection
> payloads against systems you own or have explicit written permission to test. Everything here runs
> locally in the lab container against a bundled mock tool and sample data — never point these payloads
> at a real system or a shared host.

## Do

1. [ ] **Reproduce the unsafe baseline — and watch it fire.** Write the *wrong* version first, in a
   throwaway file: run the mock tool with `Invoke-Expression "$tool $path"` where `$path` is the hostile
   filename from `data/`. Observe that the injected command runs (the payload writes a marker file /
   prints a tell). This is your ground truth for what "unsafe" looks like — you're proving the risk is
   real before you close it. *(Hint: the hostile input is a filename engineered with a shell
   metacharacter; see `data/`.)*
2. [ ] **Build `Invoke-VigilTool` with an argument array.** Add a `Public/Invoke-VigilTool.ps1` advanced
   function: `[CmdletBinding()]`, `[OutputType([pscustomobject])]`, a validated `-FilePath` (the tool)
   and a `-ArgumentList [string[]]`. Invoke via the native call operator with splatting —
   `& $FilePath @ArgumentList` — capturing stderr to a temp file (`2>...`) and reading `$LASTEXITCODE`.
   Pass the hostile argument through it and confirm the payload is received as *one inert token*, not
   executed. *(Hint: never build `"$FilePath $ArgumentList"` — that string is the injection. And prefer
   `& @args` over `Start-Process -ArgumentList` here: on .NET, `Start-Process` re-joins the list into a
   single string it re-splits on whitespace, which mangles an argument that legitimately contains a
   space; the call operator preserves the argv array faithfully. Verify this yourself — feed a filename
   with a space through both.)*
3. [ ] **Parse the output into a typed object.** Don't return the raw stdout. Capture stdout, stderr, and
   the process exit code, and emit a `[pscustomobject]` with named fields (e.g. `Tool`, `ExitCode`,
   `Success`, `StdOut`, `StdErr`). A failed tool and an empty result must be distinguishable — that's
   what `ExitCode`/`Success` is for. *(Hint: `Start-Process -PassThru -Wait` gives you `.ExitCode`.)*
4. [ ] **Add the AST review gate.** Write (or have the copilot write, then review) a check that parses
   every `.ps1` under `Vigil/` with `[System.Management.Automation.Language.Parser]::ParseFile(...)` and
   uses `Ast.FindAll(...)` to find any `CommandAst` whose command name is `Invoke-Expression` or `iex`.
   It must **exit non-zero** if it finds one. Confirm it walks the tree, not the raw text — a comment
   mentioning `iex` must NOT trip it. *(Hint: match on `CommandAst.GetCommandName()`.)*
5. [ ] **Prove the gate catches the copilot's default.** Temporarily paste an `Invoke-Expression` line
   into a `Vigil/` function; run the AST gate; confirm it fails the build. Remove it; confirm green. You
   have now demonstrated the gate both ways.
6. [ ] **Write the injection `Pester` tests.** Add tests that (a) feed `Invoke-VigilTool` a hostile
   argument (`; rm -rf` / `$(touch pwned)`) and assert the payload's side effect **did not happen** (no
   marker file, the arg is echoed back verbatim as data), (b) assert the returned object carries a real
   `ExitCode`, and (c) assert the AST gate finds a planted `Invoke-Expression` and finds none in the
   clean module.
7. [ ] **Run the full gate.** `make demo` must be green: AST scan clean, `PSScriptAnalyzer` clean
   (`PSAvoidUsingInvokeExpression` especially), `Pester` green — including the injection proofs.
8. [ ] **Automate & own it.** Commit `Invoke-VigilTool`, the AST gate (`gate.ps1`'s scan step or a
   standalone `Test-VigilNoInvokeExpression`), and the injection tests. In the commit/PR, note what the
   copilot generated for the wrapper, whether it reached for `Invoke-Expression`/string interpolation,
   and the exact change you made to pass data as an array instead.

## Success criteria — you're done when
- [ ] `Invoke-VigilTool` runs the mock tool via an **argument array** (the native call operator `& @args`), never a string-built command line — verified by reading the source.
- [ ] Feeding a hostile argument (`; rm -rf`, `$(...)`) through `Invoke-VigilTool` treats it as **data** — the injected command does **not** execute (no side effect; the mock tool echoes it back verbatim), and a `Pester` test proves it.
- [ ] The wrapper returns a **typed object** with `ExitCode`/`Success`, distinguishing a failed tool from an empty result.
- [ ] The **AST gate** fails the build on a planted `Invoke-Expression`/`iex` and passes on the clean module — and is not fooled by the word in a comment (you demonstrated both).
- [ ] `PSScriptAnalyzer` is clean (`PSAvoidUsingInvokeExpression` included) and `Pester` is green; `make demo` passes offline.

## Deliverables
`Invoke-VigilTool` (injection-safe wrapper) added to the cumulative `Vigil` module, the AST review check,
and the `Pester` tests that prove a malicious argument is treated as data — committed alongside the prior
`Vigil` cmdlets. Do **not** commit any marker files, temp stdout/stderr captures, or real samples produced
by the wrapper — those are lab artifacts, not source.

## AI acceleration
Have the copilot draft `Invoke-VigilTool` from a one-line spec ("run an external tool with a
caller-supplied argument, return a typed result"), then review the draft for its default: does it build a
command string (`Invoke-Expression`, `& "$exe $arg"`, `cmd /c "..."`) or pass an argument array? Reject
the string form and specify the array. Then have it draft the AST gate and review whether it truly parses
the tree (`FindAll` over `CommandAst`) or just greps text a comment would fool. The whole module is a
Type 14 review in build clothing: the AI writes both the wrapper and the gate, and *you* own the proof
that the gate holds — the injection test is that proof.

## Connects forward
The argument-array discipline is `Vigil`'s permanent posture for anything it shells out to. Module 06
(secrets, remoting, least privilege) passes credentials into remote sessions the same way — as structured
objects, never strings. Module 08 (PowerShell as the weapon) *detonates* the exact `IEX ... DownloadString`
cradle T1059.001 documents and builds the detection for it — the attack you're learning to never write
here. The AST-scan muscle returns in Module 09's supply-chain/eval gate.

## Marketable proof
> "I build injection-safe PowerShell wrappers around external tools — arguments passed as arrays, never
> string-built command lines — and gate the codebase against `Invoke-Expression` with an AST scan and
> `Pester` tests that prove a malicious argument is treated as data, not executed."

## Stretch (optional)
- Extend the AST gate to also flag `[scriptblock]::Create(...)` and `Add-Type` on non-literal input — the
  other two paths to "execute a string" the copilot reaches for when it can't use `iex`.
- Add a timeout to `Invoke-VigilTool` (kill the process after N seconds) and a `Pester` test that a
  hung tool returns a non-zero `ExitCode` rather than blocking the pipeline forever.
