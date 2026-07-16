# Module 07 — LLM-Native Python & MCP

*Type 9 · Tool-Build — expose `sift` to an LLM as an MCP server, and validate the LLM's own output with the same discipline you validate an API response. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the same "parse, don't trust" you apply to a feed applies to the model — its arguments in, and its answers out.*

!!! abstract "In 60 seconds"
    Two moves make `sift` LLM-native, and both are the *input edge* discipline from Module 02 applied to
    the AI. First, expose `sift`'s enrich/triage functions as an **MCP server** so an LLM or agent can
    call them — where every argument the model passes is untrusted input, validated exactly like Module 02
    validates a feed. Second, when `sift` itself calls an LLM (to summarize or classify an alert), the
    model's **output** is also untrusted — use **`instructor`** to force it into a `pydantic` model,
    validated like an API response instead of parsed out of free text. Module 02 was the input edge; this
    is the AI edge; Module 09 is the measurement layer. Same discipline, three places.

## Why this matters

"LLM-native" is where a lot of security tooling is heading, and where a lot of it is quietly unsafe. Two
trust boundaries get missed. When you expose a tool to a model via MCP, people forget that the model is
an *untrusted caller* — it can be prompt-injected into calling your `enrich` tool with a hostile argument,
so the tool must validate its inputs as if they came from the internet (because, transitively, they did).
And when your code consumes an LLM's output, people `json.loads()` the model's free text and hope — which
breaks the moment the model wraps it in prose or hallucinates a field.

Both failures are the same root mistake this whole track fights: *trusting input you didn't validate.*
The fix is the fix you already know — parse into a typed model at the boundary — applied to the AI on both
sides. Get this right and `sift` becomes a tool an agent can safely use and a tool that safely uses an
agent.

## The core idea

**An MCP server is an API whose caller is an LLM — so validate every argument.** Exposing `sift`'s
enrich/triage as MCP tools (with `FastMCP`, `@mcp.tool()`) is a few lines: the type hints and docstring
become the schema the model sees. The tools operate over the **real indicators `sift` already derives from
validated `AlertEvent`s** — a `src_ip`/`dest_ip` or a `signature` — not some invented indicator blob. But
the model can be manipulated into calling `enrich` with `"1.1.1.1; drop table"` or a path-traversal string,
so the tool re-validates its arguments with Module 02's canonical EVE `pydantic` models (an
`IPvAnyAddress`, an `AlertEvent`) before doing anything — the LLM's argument is untrusted input exactly
like a raw `eve.json` line. Prefer **read-only** tools; if a tool changes state, gate it behind explicit
human confirmation rather than letting the model trigger it.

**`instructor` makes the LLM's output a typed object, not a hope.** When `sift` asks a model to classify
an alert, you don't want a paragraph you regex — you want a validated `Verdict(severity=..., is_tp=...)`.
`instructor` patches the client so the model's response is coerced into (and re-asked until it satisfies)
a `pydantic` model. That's the *exact* twin of Module 02: there you validated an untrusted API response
into an `Alert`; here you validate an untrusted *model* response into a `Verdict`. The LLM is just another
unreliable upstream you refuse to trust raw.

**Pin the moving parts.** MCP and `instructor` are newer and still evolving. Pin their versions (Module
01's lockfile), teach yourself the *durable pattern* (typed tool arguments; typed model output), and
treat the specific API as replaceable — the discipline outlives the library.

??? note "Where this ends and Track 12 begins"
    This module is about **building the tool well in Python** — the typed MCP server, the validated LLM
    output. **Operating and securing AI systems at large** — RAG quality, a SOC copilot at volume, the
    broad red-team — is [Track 12 (AI-Augmented Ops)](../../../12-ai-augmented-ops/README.md). The shared
    verbs (MCP, prompt injection) appear in both: here you learn the craft; there you learn the operation.
    Module 08 next bridges them by attacking the very server you build here.

## Learn (~2–3 hrs)

**MCP**

- [Model Context Protocol — specification & concepts](https://modelcontextprotocol.io) (~30 min) — read
  "Core concepts" (tools, resources) and the trust model; you're building a server, so focus on the tool interface.
- [FastMCP / the Python MCP SDK — quickstart](https://github.com/modelcontextprotocol/python-sdk)
  (~25 min) — the `@mcp.tool()` decorator, type-hint-as-schema, and stdio transport.
 

**Typed LLM output**

- [`instructor` documentation — getting started](https://python.useinstructor.com/) (~30 min) — patching
  a client to return a `pydantic` model, and how it re-asks on validation failure.
- [Anthropic API — tool use / structured output](https://docs.claude.com/en/docs/build-with-claude/tool-use)
  (~20 min) — the underlying mechanism `instructor` builds on; use a current model id like
  `claude-sonnet-5` (capable) or `claude-haiku-4-5-20251001` (cheap/fast). <!-- VALIDATE: confirm docs URL -->

## Key concepts
- **An MCP server's caller (the LLM) is untrusted** — validate every tool argument with `pydantic`.
- **Type hints + docstring = the tool schema** the model sees; write them for the model.
- **Read-only by default**; gate state-changing tools behind human confirmation.
- **`instructor` validates LLM *output* into a `pydantic` model** — the AI-edge twin of Module 02.
- **Pin MCP/`instructor`** (they move fast); own the durable pattern, not the specific API.

## AI acceleration
This is the module where the track's tool becomes usable *by* AI — so the review stakes rise. Have the
copilot scaffold the MCP server and the `instructor`-typed classifier, then check the two boundaries: does
the tool validate its arguments (or trust whatever the model passes)? Does the classifier return a
validated model (or `json.loads()` free text and pray)? Both are the same bug you've been catching all
track, now at the AI edge.

!!! question "Check yourself"
    - Why is an argument an LLM passes to your MCP tool "untrusted input," and what stops it being dangerous?
    - How is validating an `instructor` response into a `Verdict` the same discipline as validating a feed
      into an `Alert`?
    - Which of `sift`'s tools should be read-only, and which (if any) deserve a human-confirmation gate?
