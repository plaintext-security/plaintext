# Module 07 — LLM-Native PowerShell & an MCP Surface

*Type 9 · Tool-Build — build a real, reusable tool: an **MCP server** that exposes `Vigil`'s read-only hunt verbs to an LLM, and treats everything the model sends back — tool arguments **and** the results you hand it — as untrusted input, validated with the same typed-object discipline you use on event data. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot will happily wire your hunt module to an LLM in five minutes; your edge is the trust boundary it forgets to draw.*

!!! abstract "In 60 seconds"
    You're going to make `Vigil` callable by an LLM. The Model Context Protocol (MCP) is the open
    standard for that: a server advertises a set of **tools** (name + JSON-Schema for the arguments),
    and a model — through an MCP client — picks a tool and fills in the arguments. The whole module turns
    on one idea: **the tool arguments the model sends are untrusted input, exactly like a raw event log
    is.** A model can be prompt-injected, can hallucinate a path, can emit a filter you never anticipated —
    and if your handler passes that straight into `Get-Content`, a filesystem call, or (worse) something
    executable, you've built the LLM equivalent of SQL injection. You'll expose **only read-only verbs**,
    validate every argument against an allow-list / `[ValidateSet]` / typed parse before it touches
    anything, and prove with `Pester` that a hostile argument is *rejected by validation*, not by luck. The
    anchor is the [Model Context Protocol specification](https://modelcontextprotocol.io) itself.

## Why this matters

Connecting a hunt tool to an LLM is the obvious next move — "let me just ask the model to pull the
suspicious events" — and the copilot will scaffold it instantly. That's the problem. The scaffold treats
the model as a trusted caller: it takes the model's `path` argument and reads that file, takes the model's
`filter` and runs it, sometimes takes a model-supplied command string and *executes* it. Every one of those
is a place where the model's output crosses into your system unchecked. And the model's output is not
trustworthy input — it is the least trustworthy input in the whole pipeline, because an attacker who lands
a prompt injection anywhere upstream (a malicious event `Message`, a poisoned document in the model's
context) can *steer* what arguments the model sends to your tool. This is the tool-calling analog of the
confused-deputy problem: your MCP server has `Vigil`'s privileges, and the model is telling it what to do.

The whole track's discipline — *emit and validate typed objects at every edge* — was built for exactly this
edge. In Module 02 you validated event **fields** with parameter-validation attributes; in Module 03 you
validated untrusted **telemetry**; here you validate untrusted **LLM output** with the same muscle. The tool
surface you expose is a security boundary, and the argument validator is the guard on it. Get this right and
`Vigil` becomes an AI-callable hunt tool you can actually trust; get it wrong and you've handed a
prompt-injectable model a shell into your telemetry.

## Objective

Build an MCP server that exposes `Vigil`'s **read-only** hunt verbs (e.g. `Get-VigilEvent` and an enrichment
lookup) as MCP tools, with a tool-handler that validates every model-supplied argument against an
allow-list / `[ValidateSet]` / typed parse *before* it reaches any cmdlet — and never exposes a
state-changing verb over the surface. Prove with `Pester` that a well-formed argument succeeds and a
malformed or hostile argument is rejected by validation, offline, with no live model in the loop.

## The core idea

**An MCP tool definition is a contract, and the argument schema is the front door — but the schema is a
hint, not a guard.** MCP is refreshingly small: a server speaks JSON-RPC 2.0 (over stdio for a local server,
or Streamable HTTP for a remote one), answers `tools/list` with an array of tool definitions — each a
`name`, a `description`, and an `inputSchema` (JSON Schema) — and answers `tools/call` by running the named
tool with the model's arguments. The `inputSchema` tells the *model* what shape to send; it does **not**
enforce anything on your side. A model that ignores the schema, or is steered to, will send you whatever it
wants, and your handler receives it. So the schema is documentation for the model; the *validation in your
handler* is the security control. Treat them as two separate jobs — advertise a tight schema **and**
re-validate every argument as if the schema didn't exist.

**Validate LLM output the same way you validate any untrusted input: parse, don't trust; allow-list, don't
block-list; type it before you use it.** This is not new machinery — it's the parameter-validation discipline
from Module 02 applied to a new source of dirt. A `path` argument is not a string you pass to `Get-Content`;
it's a candidate you resolve, confine to an allowed root, and reject if it escapes (`..`, absolute paths, a
symlink out). A `severity` argument is not free text; it's a `[ValidateSet('Low','Medium','High')]` — anything
else is rejected. A `filter` is not a scriptblock you `Invoke-Expression` on (you never do that anyway); it's
a set of typed, named fields the model fills in, each validated. The move is always: **take the loosest thing
the model can send, and narrow it to the tightest thing your cmdlet needs, rejecting everything in between.**
An argument that fails validation must fail *loudly and safely* — an MCP error result the model can see, not
a silent coercion that runs a slightly-wrong command.

**Read-only is a property of the *surface*, not a hope about the model.** The single most important design
decision is which verbs you expose. `Vigil`'s hunt verbs are `Get-`, `Read-`, an enrichment lookup — all
read-only by construction. You do **not** expose `Remove-`, `Set-`, `Invoke-`, or anything that changes state,
and you enforce that at the surface: the tool registry is an explicit allow-list of read-only handlers, so
even if the model *asks* for a destructive action, there is no tool to call. This is defense in depth — the
allow-list means a prompt-injected model's worst case is reading data it's allowed to read, not deleting your
logs. (Track 12 goes deep on *securing* the AI system around this — sandboxing, monitoring, prompt-injection
defense end to end. This module owns the PowerShell side: building the tool surface well and validating the
argument edge. When you want the securing-AI depth, that's Track 12's job; here, stay on the tool
engineering.)

??? note "MCP transports — stdio vs. Streamable HTTP, and why the lab uses stdio"
    An MCP server can speak over **stdio** (the client launches the server as a subprocess and talks
    JSON-RPC over stdin/stdout — ideal for a local tool) or **Streamable HTTP** (the server is a network
    endpoint — for remote/shared tools). The protocol is identical; only the transport differs. The lab
    implements a minimal stdio JSON-RPC handler in PowerShell so `make demo` can drive it entirely offline —
    no network, no live model. The prose shows how you'd point a real MCP client (Claude Desktop, or the
    Anthropic API's MCP connector) at the same handler; the *validation layer you build is transport-agnostic*
    and is the part that matters.

## Learn (~2–3 hrs)

**The protocol (do this first — it's the contract you're implementing)**

- [Model Context Protocol — "Architecture overview"](https://modelcontextprotocol.io/docs/learn/architecture) (~20 min)
  — the host/client/server model, and why tools are *server*-advertised, not baked into the model. Read this
  before you touch code; it frames the whole trust boundary.
- [MCP specification — "Server Features → Tools"](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) (~25 min)
  — the exact shape of `tools/list` and `tools/call`, the `inputSchema`, and — read this part carefully — the
  spec's own **security note that tool inputs are untrusted and servers must validate them**. This is the
  primary source for the module's whole thesis.
- [MCP — "Build an MCP server" quickstart](https://modelcontextprotocol.io/quickstart/server) (~25 min)
  — skim the stdio JSON-RPC flow (`initialize`, `tools/list`, `tools/call`) in any reference SDK so the
  PowerShell handler you write feels familiar; you're re-implementing this minimal loop.

**Wiring an LLM to it (so you know what you're defending)**

- [Anthropic — "MCP connector"](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) (~15 min)
  — how the Claude API reaches an MCP server from a `messages.create` call (`mcp_servers` + an `mcp_toolset`,
  beta `mcp-client-2025-11-20`). Read it to understand the real caller — a model, through a client, choosing
  your tool and filling its arguments — so the "arguments are untrusted" framing is concrete. Use a current
  model id such as `claude-opus-4-8` if you try it.

**The discipline (why validation, not schemas, is the control)**

- [OWASP — "LLM01:2025 Prompt Injection"](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) (~15 min)
  — the canonical statement of *why* model output is untrusted: an attacker upstream can steer what the model
  asks your tool to do. Read the "indirect prompt injection" part — that's the exact path from a poisoned
  event `Message` to a hostile tool argument.
- [PowerShell docs — "about_Functions_Advanced_Parameters" (validation attributes)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_parameters) (~15 min)
  — re-read the `ValidateSet`/`ValidatePattern`/`ValidateScript` section with new eyes: these are your
  MCP-argument guards. The same attributes that validated event fields in Module 02 validate model output here.

## Key concepts
- **MCP tool = `name` + `description` + `inputSchema`; the schema is a hint to the model, not a guard on your side** — validation lives in your handler.
- **LLM output (arguments *and* results) is untrusted input** — a prompt-injected/hallucinating model can send anything; parse, don't trust.
- **Allow-list, don't block-list** — `[ValidateSet]`, typed parse, path confinement; take the loosest input and narrow it to the tightest your cmdlet needs.
- **Read-only is a property of the surface** — expose only `Get-`/`Read-`/lookup verbs; there is no destructive tool to call, even if the model asks.
- **No model output into anything executable** — never `Invoke-Expression` a model-supplied string; a failed-validation argument returns a safe MCP error, not a coerced command.

## AI acceleration

This is the module where the AI is on the *other* side of the boundary, so use the copilot to build the
server and then review it as an adversary. Have it generate the tool-handler, the tool registry, and the MCP
JSON-RPC scaffolding from a spec — then hunt for the exact defaults it ships: does it take the model's `path`
and read it without confining to an allowed root? does it advertise a schema but *skip re-validation* in the
handler, trusting the schema to enforce shape? did it register a `Set-` or `Remove-` verb "for
completeness"? did it pass a model-supplied field into a string it then executes? The tell is that the
generated handler treats the arguments dictionary as trusted the moment it's parsed from JSON. Your job is to
insert the validation layer between "parsed" and "used" — and to write the `Pester` test that proves a
hostile argument dies there. **AI authors the plumbing; you own the trust boundary.**

!!! question "Check yourself"
    - Why is the `inputSchema` in a tool definition *not* sufficient as a security control, and where does the
      actual enforcement have to live?
    - Give a concrete path from an *indirect* prompt injection (a poisoned event `Message`) to a hostile
      argument arriving at your `Get-VigilEvent` tool. What single design decision makes the worst case
      "reads data it's allowed to read" instead of "deletes the logs"?
    - In your own words: what does validating LLM tool arguments have in common with validating a raw `.evtx`
      record, and why is that the same skill?
