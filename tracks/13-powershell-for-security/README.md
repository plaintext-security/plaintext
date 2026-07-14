# Track 13 — PowerShell for Security

**You already write PowerShell; the copilot writes the one-liner.** This track is about the skill that's
left: **engineering Windows security tooling that emits typed objects not strings, validates untrusted
telemetry, runs concurrently without leaking runspaces, keeps secrets out of source, drops privilege, is
tested and gated — and directing and catching the AI where its decade-old PowerShell defaults reliably
fail.** You build **one tool**, `Vigil`, and grow it across nine modules into a portfolio centerpiece.

> **This is an intermediate-plus track.** It assumes you're comfortable with PowerShell (the pipeline,
> functions, `[PSCustomObject]`) *and* work with an AI copilot. If you don't yet write PowerShell, start
> at [Foundations · Module 10 — Scripting & Automation](../00-foundations/modules/10-scripting/README.md)
> and come back.

## What you'll be able to do
- Convert a loose `.ps1` into a proper **module** — manifest, public/private functions, a
  `PSScriptAnalyzer` + `Pester` CI gate — using the strangler-fig pattern, and drive it with a
  **spec-driven workflow** instead of pasting unread output.
- Write **advanced functions** that emit typed objects (`[OutputType]`, parameter validation) — *objects,
  not strings* — and carry that discipline to the telemetry edge and the AI edge.
- Parse Windows telemetry **at scale** with `Get-WinEvent` server-side filtering over real `.evtx`, and
  emit structured JSON logs instead of `Write-Host`.
- Enrich concurrently with `ForEach-Object -Parallel` / runspace pools — throttled, backed-off, and free
  of runspace races — and drive external tools **without** `Invoke-Expression` injection.
- Keep secrets out of source with `SecretManagement`, drop privilege with a **JEA** endpoint, and expose
  the tool to an LLM over **MCP** with its output validated like untrusted input.
- Reproduce a real PowerShell attack (encoded / AMSI abuse), then build the detection and hardening that
  catches it — and prove it holds with a `Pester` + eval regression gate and a supply-chain gate.

## The spine — one evolving tool

The whole track builds **`Vigil`**, a Windows telemetry triage-and-hunt module: ingest event logs →
**normalize** to typed objects → **enrich** (threat-intel) → **detect/score** → **serve** (module · JEA
endpoint · MCP). Every module adds a real capability *and* targets a bug-class the copilot reliably ships
in PowerShell.

## Modules

| # | Module | Type | What you add to `Vigil` | Modern stack |
|---|--------|------|-------------------------|--------------|
| 01 | [Modern Toolchain & Module Skeleton](modules/01-modern-toolchain/README.md) | Migration + ADR | Migrate a loose `hunt.ps1` into a module with a `PSScriptAnalyzer` + `Pester` CI gate; adopt a spec-driven workflow; write the toolchain ADR | module manifest, `PSScriptAnalyzer`, `Pester`, `openspec` |
| 02 | [Typed Objects & the Pipeline](modules/02-typed-objects/README.md) | Tool-Build | Advanced functions that reject bad input at the boundary and emit typed `VigilEvent` objects, not strings | `[CmdletBinding()]`, `[OutputType]`, validation attributes |
| 03 | [Parsing Telemetry at Scale](modules/03-telemetry-at-scale/README.md) | Tool-Build | `Get-WinEvent` server-side filtering over real `.evtx` + structured JSON logs | `Get-WinEvent`, `-FilterHashtable`/XPath, `ConvertTo-Json` |
| 04 | [Enrichment with Runspaces & Throttling](modules/04-runspaces-throttling/README.md) | Build-&-Operate | Concurrent enrichment with bounded parallelism, backoff, and no runspace races | `ForEach-Object -Parallel`, runspace pools |
| 05 | [Driving Tools Safely](modules/05-driving-tools-safely/README.md) | Tool-Build + Review | Safe external-process wrappers (no `Invoke-Expression`) + robust output parsing | argument arrays, `Start-Process`, AST checks |
| 06 | [Secrets, Remoting & Least Privilege](modules/06-secrets-remoting-jea/README.md) | Build-&-Operate | Secret-managed config, PS Remoting, and a JEA endpoint exposing only read-only hunt verbs | `SecretManagement`, PS Remoting, JEA |
| 07 | [LLM-Native PowerShell & MCP](modules/07-llm-native-mcp/README.md) | Tool-Build | An MCP server exposing `Vigil`; LLM output validated like untrusted telemetry | MCP, typed validation |
| 08 | [PowerShell as the Weapon — Detonate, Detect, Harden](modules/08-detonate-detect-harden/README.md) | Detonate & Detect | Reproduce an encoded/AMSI abuse against a lab target, then the detection + hardening that catches it | script-block logging, CLM, AMSI |
| 09 | [Test, Measure & Supply Chain](modules/09-test-measure-supplychain/README.md) | Eval Harness + Review | Pester coverage + a detection eval scorecard with a CI regression gate; a supply-chain/signing gate | `Pester` v5, `PSResourceGet`, signing |

## Phases & projects

The nine modules run in three phases; each phase advances `Vigil` into a genuinely more capable tool.

- **Phase 1 · Correctness & telemetry** (01–03) — the tool becomes a real, gated PowerShell *module* that
  emits typed objects and parses Windows telemetry at scale.
- **Phase 2 · Scale, safety, least privilege** (04–06) — it enriches concurrently and safely, drives
  external tools without injection, keeps secrets out of source, and serves a constrained hunt endpoint.
- **Phase 3 · AI-native, adversarial, measured** (07–09) — it becomes callable by an LLM (MCP), gets
  attacked and hardened against real PowerShell abuse, and is finally *measured*: eval-gated,
  supply-chain-audited, signed.

## The through-line — *objects, not strings*

One discipline, three edges: typed advanced functions emit trustworthy objects from **telemetry** (M2–M3),
the same typing validates untrusted **LLM output** (M7), and a `Pester` + eval harness **measures** the
whole system on a held-out corpus (M9). The PowerShell pipeline is at its best when it carries objects you
can trust — not text you have to re-parse — and that discipline is this track's identity.

## Prerequisites
Foundations — Module 10 (Scripting & Automation) is the floor. This track starts *above* it. It is
**standalone**: it leans on Tracks 06 (Active Directory) and 07 (Endpoint Hardening) only as *connective
tissue* — every artifact a lab needs is provided here (a real public `.evtx` corpus, a generate-it-here
step).

## Capstone
The evolved `Vigil`: **a typed, tested, gated PowerShell module** that ingests real Windows telemetry,
enriches it concurrently and safely, serves a least-privilege hunt endpoint, is callable over MCP,
detects a real PowerShell attack, and is eval-gated, supply-chain-audited, and signed. The kind of repo
that ends an interview, not one that starts a tutorial. **Deliverable:** the module, its `Pester` tests
and eval harness, and a write-up of what AI wrote vs. what you changed and why. (Honor system: the
committed module is the proof.)

The starter scaffold and acceptance checks live in
[`plaintext-labs/powershell-for-security/capstone/`](https://github.com/plaintext-security/plaintext-labs/tree/main/powershell-for-security/capstone).

### Capstone rubric

**Proficient is the bar to ship.** It must be a genuinely useful tool you own — typed, tested, reviewed
line by line, and fed **real data** (a public `.evtx` corpus like EVTX-ATTACK-SAMPLES, a free threat feed
like abuse.ch, or real Sysmon output).

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Usefulness** | A script that re-implements a one-liner | A module you'd reach for to triage real Windows telemetry | Fills a real gap; handles a hunt workflow end to end |
| **Typed boundaries** | Emits strings; trusts input | Advanced functions with `[OutputType]` + validation; objects out; `PSScriptAnalyzer` clean | Invalid input unrepresentable; LLM output validated like telemetry |
| **Concurrency** | Sequential loop, or a runspace race | `ForEach-Object -Parallel` with a throttle + backoff | Handles rate limits, retries, and partial failure without shared-state races |
| **Tests & eval** | None, or happy-path only | `Pester` v5 + a detection eval scorecard with a CI regression gate | Coverage gate + a held-out corpus; the gate blocks a planted regression |
| **Safety** | `Invoke-Expression`; plaintext creds | No `iex`/string-built commands; secrets via `SecretManagement`; JEA least-privilege endpoint | Red-teamed against a real PowerShell technique; residual-risk note |
| **Ownership of AI code** | Pasted AI output unread | Write-up names what AI generated vs. what you changed and why | Demonstrates a caught bug/risk in generated code you fixed and explained |

## AI & automation
This is a track where **"AI authors → you review → you own it"** becomes a daily habit — and gets sharp
teeth, because PowerShell is where copilots are *most* stuck in the past. The workflow is **spec-driven
development**: you write the spec for each `Vigil` increment, the copilot implements it, and you review
the implementation *against the spec*. Each module targets a *copilot failure-class*: strings instead of
objects, unvalidated telemetry, runspace races, `Invoke-Expression` injection, plaintext secrets,
over-privileged remoting, trusting unvalidated LLM output, unpinned/unsigned dependencies. The competency
isn't typing the one-liner the copilot already writes; it's specifying it precisely, directing it, and
catching it where its Windows-PowerShell-5.1 defaults reliably fail.

Spec-driven development is taught as a **provider-agnostic pattern** (spec → implement → verify against
the spec → eval). The concrete instance is [openspec](https://github.com/Fission-AI/OpenSpec); GitHub's
[spec-kit](https://github.com/github/spec-kit) is a mainstream alternative — use either, the discipline is
the point.

## Standards & further reading
- [PowerShell documentation — advanced functions & cmdlet guidelines](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/strongly-encouraged-development-guidelines) — the typed-object backbone
- [`PSScriptAnalyzer`](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/overview) and [`Pester` v5](https://pester.dev/) — the lint + test gate
- [`Microsoft.PowerShell.SecretManagement`](https://learn.microsoft.com/en-us/powershell/utility-modules/secretmanagement/overview) and [Just Enough Administration (JEA)](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/jea/overview) — secrets & least privilege
- [The Model Context Protocol specification](https://modelcontextprotocol.io) — for the MCP module
- [MITRE ATT&CK T1059.001 — Command and Scripting Interpreter: PowerShell](https://attack.mitre.org/techniques/T1059/001/) — the attacker's view
- [`EVTX-ATTACK-SAMPLES`](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES) — the real event-log corpus the labs hunt over
