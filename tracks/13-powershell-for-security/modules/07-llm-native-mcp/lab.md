# Lab 07 — Expose `Vigil` over MCP, and Validate the AI Edge

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/07-llm-native-mcp/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, the cumulative `Vigil`
module (now with an MCP server + tool-handler), a small bundled event sample and threat-feed snapshot, and a
set of good and hostile tool-argument payloads the gate feeds directly to the handler.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/07-llm-native-mcp
make up      # build the pwsh + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with the Vigil module + MCP handler
make demo    # runs the gate: PSScriptAnalyzer + Pester over the server, feeding good AND hostile payloads
make down    # stop when done
```

The demo is **fully offline and deterministic**: it exercises the tool-handler and validation layer
directly, feeding it good and hostile tool-argument payloads as JSON-RPC requests — **no live LLM and no
network required**. The prose shows how to wire the same handler to a real MCP client; the gate proves the
part that matters (the validation) works.

## Scenario

You've been asked to make `Vigil` callable by an LLM so an analyst can ask, in natural language, "pull the
suspicious PowerShell events and enrich the indicators." The obvious build — wrap `Get-VigilEvent` and the
enrichment lookup as MCP tools — is five minutes of work. The *rest* of this lab is the part that keeps it
from being a liability: because the arguments the model sends are untrusted input, you'll expose **only
read-only verbs**, validate every argument before it reaches a cmdlet, and prove a hostile argument is
rejected by validation rather than run.

> Only test systems you own or have explicit written permission to test. Everything here runs locally in the
> lab container against bundled sample data; the "attacker" is a set of hostile tool-argument payloads you
> feed to your own handler.

## Do

1. [ ] **Reproduce the baseline surface.** Import `Vigil`, list the read-only hunt verbs you intend to expose
   (`Get-VigilEvent` and an enrichment lookup), and run each by hand against the bundled sample. This is the
   set of tools — and *only* this set — that your MCP server will advertise.
2. [ ] **Write the tool contract first.** For each verb, write the MCP tool definition: `name`, a
   `description`, and an `inputSchema` (JSON Schema) that is as *tight* as you can make it — enumerated values
   where you can, no free-form `command`/`script` field anywhere. Note to yourself: this schema is a hint to
   the model, not a guard — the enforcement comes next.
3. [ ] **Build the read-only tool registry.** Implement the server as an explicit allow-list: a registry
   mapping each tool `name` to a handler, containing **only** read-only verbs. Prove there is no path to a
   `Set-`/`Remove-`/`Invoke-` verb — a `tools/call` for an unknown or non-registered name returns an MCP
   error, not a fallback that runs something.
4. [ ] **Insert the validation layer between "parsed" and "used".** For every tool, validate each
   model-supplied argument *before* it touches a cmdlet: `[ValidateSet]`/allow-list for enumerated fields, a
   typed parse (`[int]`, `[datetime]`) for typed ones, and — for any `path`-like argument — resolve it and
   confine it to an allowed root, rejecting `..`, absolute escapes, and symlinks out. A failed validation
   returns a safe MCP error result the model can see; it never coerces or runs a slightly-wrong command.
5. [ ] **Drive it as JSON-RPC, offline.** Feed the handler `initialize`, `tools/list`, and `tools/call`
   requests as JSON (stdio-style) and confirm a well-formed `tools/call` returns typed `Vigil` objects. No
   live model — you are standing in for the MCP client.
6. [ ] **Attack your own surface.** Feed hostile tool arguments: a `path` with `../../etc/passwd`, a
   `severity` of `'; Remove-Item'`, an out-of-set enum, a wrong-typed field, and a `tools/call` for a
   destructive verb name. Each must be **rejected by validation** (a clean MCP error) — captured as failing
   *safely*, not as an exception that leaks a stack trace or, worse, a partial run.
7. [ ] **Write the `Pester` proof.** Add tests asserting: a good payload returns objects; each hostile payload
   is rejected by validation (not by accident); and no state-changing verb is exposed by the registry. Get the
   module `PSScriptAnalyzer`-clean and the tests green.
8. [ ] **Automate & own it.** Commit the MCP server — the tool registry, the validation layer, and the
   `Pester` tests — as the deliverable. In the commit/PR, note what the copilot generated for the MCP
   plumbing, and the one thing it defaulted to that you had to fix (the missing re-validation, the trusted
   `path`, the destructive verb it registered "for completeness", or the schema-as-guard assumption).

## Success criteria — you're done when
- [ ] The MCP server advertises **only** read-only `Vigil` verbs; a `tools/call` for any state-changing or unknown verb returns a clean MCP error, and a `Pester` test proves no destructive verb is exposed.
- [ ] A well-formed `tools/call` returns typed `Vigil` objects (not strings), driven entirely offline as JSON-RPC.
- [ ] Every hostile tool-argument payload (bad path, injection-looking enum, wrong type, out-of-set value) is **rejected by validation**, and a `Pester` test proves each rejection.
- [ ] No model-supplied value is ever passed into `Invoke-Expression` or any executable string; `PSScriptAnalyzer` is clean.
- [ ] The whole gate (`make demo`) passes with no live LLM and no network.

## Deliverables
The MCP server for `Vigil`: the tool registry (read-only verbs only), the argument-validation layer, the
JSON-RPC/stdio handler, and `Vigil.Tests.ps1` proving (a) a good payload succeeds, (b) each hostile/malformed
argument is rejected by validation, and (c) no state-changing verb is exposed. Commit all of it alongside the
existing `Vigil` module. Do **not** commit any API keys, real event exports, or MCP client secrets — the
server is offline by design; wiring it to a real client is a config step outside the repo.

## AI acceleration
Have the copilot generate the MCP JSON-RPC scaffolding and the tool handlers from your contract, then review
the diff as an adversary. The high-value catch is the copilot's *default*: it trusts the arguments dictionary
the moment it's parsed from JSON — it takes the model's `path` and reads it, advertises a tight schema but
skips re-validation in the handler, and may register a `Set-`/`Remove-` verb because it "completes" the CRUD
surface. Inserting the validation layer between parse and use — and writing the test that proves a hostile
argument dies there — is the whole point. You're reviewing the AI's trust assumptions, which is exactly where
this class of risk lives.

## Connects forward
This is the AI edge of the same *objects, not strings* discipline the track has run since Module 02: the
typed validation that guarded event fields (M2) and untrusted telemetry (M3) now guards untrusted **LLM
output** (M7), and Module 09's eval harness will *measure* the whole thing on a held-out corpus. It also sets
up Module 08, where you'll attack `Vigil`-adjacent PowerShell and build the detection — the same trust-boundary
thinking, pointed at the language itself. For *securing the AI system* around this surface — prompt-injection
defense, sandboxing, monitoring end to end — cross to **Track 12 (AI-Augmented Ops)**, which owns that depth;
this module owns building the tool well in PowerShell.

## Marketable proof
> "I expose PowerShell security tooling to an LLM over MCP as a read-only tool surface, and I treat every
> model-supplied tool argument as untrusted input — validated against allow-lists and typed parses before it
> reaches a cmdlet — with `Pester` tests that prove a malicious argument is rejected by validation, not by
> luck."

## Stretch (optional)
- Wire the offline handler to a real MCP client (Claude Desktop config, or the Claude API's `mcp_servers` +
  `mcp_toolset` with beta `mcp-client-2025-11-20` and a current model id such as `claude-opus-4-8`) and
  confirm the model can call `Get-VigilEvent` — then re-run your hostile payloads *through the model* by
  crafting an indirect prompt injection in a bundled event `Message`, and watch your validation layer hold.
- Add structured MCP error codes (JSON-RPC error objects) so a validation rejection is machine-distinguishable
  from a genuine tool failure, and a client can react appropriately.
