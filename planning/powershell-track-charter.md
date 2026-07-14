# Track 13 · PowerShell for Security — charter

*Design spine for authoring the PowerShell track under the type-driven ("Verdict") model. Pairs with
[`AUTHORING.md`](../AUTHORING.md) and [`planning/MODULE-TYPE-LIBRARY.md`](MODULE-TYPE-LIBRARY.md). This is
an **approved plan, pre-build** — modules and labs are authored from it. It deliberately reuses the
[Track 09 · Python for Security charter](python-track-redesign.md) wholesale, retargeted at PowerShell 7.*

## TL;DR

Track 13 is the **Windows-native peer of Track 09.** Same charter: an **intermediate-plus** learner who
already scripts and pairs with an AI copilot, **one evolving artifact** grown across nine type-tagged
modules, each module adding a real capability *and* targeting a **copilot failure-class** the model
reliably ships in PowerShell. The spine artifact is **`Vigil`** — a PowerShell 7 module for Windows
telemetry triage and threat hunting: ingest event logs → normalize to typed objects → enrich → detect →
report, packaged as a proper module with a manifest, `PSScriptAnalyzer` + `Pester` CI gate, secrets kept
out of source, an MCP surface, and hardening-as-code. PowerShell is simultaneously the defender's daily
language and one of the most abused attacker surfaces (encoded commands, AMSI bypass, LOLBins) — the
track teaches you to *engineer* professional PowerShell tooling and to recognise the attack from the
inside.

## Why this track (the gap it closes)

Tracks 06 (Active Directory) and 07 (Endpoint Hardening) *use* PowerShell constantly, and Foundations
Module 10 teaches scripting fundamentals — but nothing in the curriculum teaches a learner to **engineer
professional-grade PowerShell security tooling**: modules with manifests, advanced functions with typed
output, `Pester` tests, `PSScriptAnalyzer` gates, `SecretManagement`, JEA, and a supply-chain gate. That
is exactly the skill a Windows-focused SOC analyst, IR responder, or detection engineer is hired for, and
it is the skill an AI copilot most reliably gets *subtly wrong* — because its PowerShell training data is
dominated by a decade of `Invoke-Expression`, string-built commands, unfiltered `Get-WinEvent`, and
`Write-Host`. This track is the PowerShell instance of the curriculum's standing thesis: **AI authors →
you review → you own it.**

## Decisions (locked)

| Decision | Choice |
|---|---|
| **Altitude** | **Intermediate-plus** — assume comfortable PowerShell (pipeline, functions, `[PSCustomObject]`) *and* an AI copilot. Foundations Module 10 is the floor; this starts above it. Not a "learn PowerShell" track. |
| **Structure** | **Single evolving tool** — one module, `Vigil`, grown module by module into a portfolio centerpiece. |
| **Scope** | **~9 dense, type-tagged modules**, three phases, each phase ending in a phase project; a capstone integrates them. |
| **Spine tool** | **`Vigil`** — Windows telemetry triage & hunt: ingest → normalize (typed) → enrich → detect → report → serve. Cmdlets are `Verb-VigilNoun` (approved verbs). |
| **Cut** | **Raw AD/EDR concept teaching** (owned by Tracks 06/07) — cross-reference, never re-teach. **Windows GUI/admin basics** — assumed. |
| **AI boundary** | **Keep MCP; dedupe with Track 12.** ai-ops owns *operating and securing AI systems*; PowerShell owns *building the tool well in PowerShell* (and red-teaming the surface it runs on). |
| **Lab platform** | **PowerShell 7 Linux containers by default** (`mcr.microsoft.com/powershell`), fed **real exported artifacts** (EVTX-ATTACK-SAMPLES `.evtx`, Sysmon configs). Windows-only surfaces (live AMSI/Defender/JEA enforcement) get an **optional Windows-VM step** and are labeled *assessed-not-demonstrated* in the container. |
| **Naming** | Directory `tracks/13-powershell-for-security/`; nav "13 — PowerShell for Security"; labs `plaintext-labs/powershell-for-security/`. |

## Editorial thesis (the track's identity)

> You already write PowerShell; the copilot writes the one-liner. What's left is the real skill:
> **engineering Windows security tooling that emits typed objects not strings, validates untrusted
> telemetry, runs concurrently without leaking runspaces, keeps secrets out of source, drops privilege,
> is tested and gated — and directing and catching the copilot where its decade-old PowerShell defaults
> reliably fail.**

Two things make it land, both things a copilot *doesn't* default to:

1. **A modern PowerShell stack the copilot under-uses.** Copilots still reach for Windows PowerShell 5.1
   idioms: `Invoke-Expression`, string-built commands, `Get-WinEvent | Where-Object`, `Write-Host`,
   plaintext credentials, scripts-not-modules, no tests. The track standardizes the learner on **`pwsh` 7
   · advanced functions with `[CmdletBinding()]`/`[OutputType]`/parameter validation · module manifests ·
   `PSScriptAnalyzer` · `Pester` v5 · `Microsoft.PowerShell.SecretManagement` · `PSResourceGet` ·
   `ForEach-Object -Parallel`/runspace pools · JEA / constrained runspaces · AST-based analysis · MCP** —
   and gates them in CI.
2. **Each module targets a copilot failure-class.** Strings instead of objects, unvalidated telemetry,
   runspace leaks/races, `Invoke-Expression` injection, plaintext secrets, over-privileged remoting,
   trusting unvalidated LLM output, happy-path-only tests, unpinned/unsigned dependencies. The whole
   track *is* reviewing the copilot at a higher level.

**Objects, not strings (the through-line).** The spine discipline is *emit and validate typed objects at
every edge*: `[OutputType]`-annotated advanced functions produce structured objects from telemetry (M2),
the same typing validates untrusted **event data** (M3) and untrusted **LLM output** (M7), and the eval
harness **measures** the whole thing on a held-out corpus (M9). One discipline — *the pipeline carries
objects you can trust, not text you have to re-parse* — applied at the telemetry edge, the AI edge, and
the measurement layer. No other security curriculum teaches PowerShell as an engineering discipline this
way.

## The module arc (type-tagged, anchored)

One artifact — `Vigil` — grown across nine modules, three phases. Types are from
[`MODULE-TYPE-LIBRARY.md`](MODULE-TYPE-LIBRARY.md); anchors are real and must be sourced/validated before
authoring (marked **⟨VALIDATE⟩** where the exact deep link is still to be confirmed).

### Phase 1 · Correctness & telemetry (01–03)

- **01 · Modern PowerShell Toolchain & Module Skeleton** — **Type 12 Migration (+ 11 ADR).** Convert a
  loose `hunt.ps1` into a proper module (manifest, `src/`, public/private functions) with a
  `PSScriptAnalyzer` + `Pester` CI gate, using the strangler-fig pattern (wrap the working script, gate
  it, refactor behind green). Adopt a spec-driven workflow. **Adds:** `Vigil` v0 — the module skeleton
  wrapping `Get-VigilEvent`. **Failure-class:** scripts-not-modules, no lint/test gate. **Deliverable:**
  the migrated module + `ADR-001-toolchain.md`. **Anchor:** PowerShell scripting guidelines + a real
  PSGallery unsigned-code lesson (Aqua Nautilus, "PowerHell", Aug 2023).
- **02 · Typed Objects & the Pipeline Done Right** — **Type 9 Tool-Build.** Advanced functions with
  `[CmdletBinding()]`, parameter validation attributes, and `[OutputType]`; emit `[PSCustomObject]`/a
  `class`, never formatted strings. **Adds:** `ConvertTo-VigilEvent` — normalizes raw records into typed
  `VigilEvent` objects. **Failure-class:** strings instead of objects; no parameter validation. **Anchor:**
  Microsoft's "Strongly Encouraged Development Guidelines" for cmdlets.
- **03 · Parsing Windows Telemetry at Scale** — **Type 9 Tool-Build.** `Get-WinEvent -Path` with
  `-FilterHashtable`/XPath over real `.evtx` (server-side filtering, not `Where-Object` post-filtering);
  normalize Security/Sysmon events; structured JSON logs. **Adds:** `Get-VigilEvent` reads EVTX at scale +
  `Write-VigilLog`. **Failure-class:** slow `| Where-Object` post-filters; unstructured `Write-Host`
  output. **Anchor:** `EVTX-ATTACK-SAMPLES` corpus + a SwiftOnSecurity/community Sysmon config.

### Phase 2 · Scale, safety, least privilege (04–06)

- **04 · Enrichment with Runspaces & Throttling** — **Type 7 Build-&-Operate.** Parallel enrichment via
  `ForEach-Object -Parallel` / a runspace pool with a throttle limit, backoff, and no shared-state races.
  **Adds:** `Invoke-VigilEnrichment` — enriches indicators against a threat feed concurrently.
  **Failure-class:** naive sequential loops; runspace state leaks / races. **Anchor:** an abuse.ch free
  feed (URLhaus / ThreatFox / Feodo Tracker).
- **05 · Driving Tools & External Processes Safely** — **Type 9 Tool-Build (+ 14 Review).** Call external
  binaries safely with argument arrays (never `Invoke-Expression` or string-built command lines); parse
  their output robustly. **Adds:** `Invoke-VigilTool` — a safe external-process wrapper. **Failure-class:**
  `Invoke-Expression` / string-built commands (injection). **Anchor:** ATT&CK **T1059.001** + a documented
  IEX download-cradle abuse (Atomic Red Team T1059.001). *Carries the authorization note.*
- **06 · Secrets, Remoting & Least Privilege** — **Type 7 Build-&-Operate.** `SecretManagement`-backed
  config (no plaintext credentials), PowerShell Remoting, and a **JEA / constrained** endpoint that
  exposes only `Vigil`'s read-only hunt verbs. **Adds:** `Vigil` config + `Invoke-VigilRemote` +
  a `Vigil.ReadOnly` JEA role. **Failure-class:** plaintext creds; over-privileged remoting.
  **Anchor:** Microsoft `SecretManagement` + JEA docs. *Live JEA/AMSI enforcement is Windows-only — mark
  assessed-not-demonstrated in the Linux container; optional VM step.*

### Phase 3 · AI-native, adversarial, measured (07–09)

- **07 · LLM-Native PowerShell & an MCP Surface** — **Type 9 Tool-Build.** Expose `Vigil`'s hunt verbs to
  an LLM over MCP; treat LLM output as untrusted input and validate it with the same typed-object
  discipline as event data. **Adds:** an MCP server wrapping `Vigil` + typed validation of tool
  arguments/results. **Failure-class:** trusting unvalidated LLM output. **Anchor:** the MCP specification.
- **08 · PowerShell as the Weapon — Detonate, Detect, Harden** — **Type 5 Detonate & Detect (secondary
  15 Red-team-the-AI).** Reproduce an encoded / AMSI-style PowerShell abuse against a shipped lab target,
  capture the telemetry, then build the detection and the hardening (script-block logging, Constrained
  Language Mode, AMSI) that catches it. **Adds:** `New-VigilDetection` for the technique + hardening
  notes. **Failure-class:** — (offense→detect). **Anchor:** ATT&CK **T1059.001** / **T1027** + a real
  malicious-PowerShell sample writeup (The DFIR Report, "Emotet Strikes Again", Nov 2022). *Carries the
  authorization note; intentionally-vulnerable target only.*
- **09 · Test, Measure & Supply-Chain Gate** — **Type 13 Eval Harness (+ 14 Review).** `Pester` coverage,
  a **detection eval scorecard** on a held-out labelled corpus with a CI regression gate, and a
  `PSResourceGet`/signing supply-chain gate. **Adds:** `Vigil`'s test + eval harness + the gate.
  **Failure-class:** happy-path-only tests; unpinned/unsigned dependencies. **Anchor:** `Pester` docs +
  PowerShell Gallery code-signing.

**Phase projects.** P1 → a typed telemetry-ingest pipeline that turns raw `.evtx` into normalized
`VigilEvent` objects with structured logs. P2 → concurrent, safe, least-privilege enrichment served over
a constrained remoting endpoint. P3 → the AI-callable, self-attacked, eval-gated, supply-chain-audited
`Vigil`. **Capstone** integrates all three into the shipped module.

## Definition of done (per AUTHORING.md)

Every module: tagged with its type and written to that type's template; anchored on a real cited artifact
(no `VALIDATE` markers left at ship); rules-scaled (build-first for Families II–VI; the offense module 08
may use a short detonate hook); **lab built and validated** (`make demo` green on a Linux runner before
`.ci-demo`); ends in the owned artifact; honest about what the Linux container does *not* enforce
(Windows-only surfaces labeled assessed-not-demonstrated); AI parts reviewed and noted. The track is done
only when **every** module clears this bar — labs included.
