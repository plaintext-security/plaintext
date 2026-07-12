# Cheat sheet — LLM-Native Python & MCP

*Companion to [Module 07 — LLM-Native Python & MCP](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

Two trust boundaries, one discipline: an MCP tool's **arguments in** are untrusted (the LLM is an
untrusted caller), and an LLM's **output out** is untrusted (validate it like an API response). Both use
the same `pydantic` boundary from Module 02.

## Expose `sift` as an MCP server (FastMCP)

```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP("sift")

@mcp.tool()
def enrich(indicator: str) -> dict:
    """Enrich one indicator (IPv4/domain/sha256). `indicator` must match that shape."""
    ind = Indicator.model_validate({"value": indicator})   # validate INSIDE the tool — LLM args are untrusted
    return do_enrich(ind).model_dump()

if __name__ == "__main__":
    mcp.run()          # stdio transport by default
```

- The **type hints + docstring ARE the schema** the model sees — write them for the model.
- Prefer **read-only** tools. A state-changing tool goes behind an explicit human confirmation gate.

## Drive/inspect the server

```bash
npx @modelcontextprotocol/inspector python -m sift.mcp_server   # exercise tools like a client
# or register it in an MCP client's config (e.g. Claude Code) pointing at the run command
```

## Validate LLM *output* with instructor

```python
import instructor
from anthropic import Anthropic
from pydantic import BaseModel

class Verdict(BaseModel):          # the shape you demand back — not free text
    severity: str                  # constrain with enums/validators in real code
    is_true_positive: bool
    rationale: str

client = instructor.from_anthropic(Anthropic())

verdict = client.messages.create(
    model="claude-sonnet-5",       # capable default; claude-haiku-4-5-20251001 for cheap/high-volume
    max_tokens=512,
    response_model=Verdict,        # instructor coerces + re-asks until it validates
    messages=[{"role": "user", "content": alert_text}],
)
# `verdict` is a typed Verdict, already validated — no json.loads() of prose
```

## The through-line (same discipline, three edges)

```
Module 02  pydantic     ← untrusted API/feed INPUT  →  Alert
Module 07  instructor   ← untrusted LLM OUTPUT       →  Verdict
Module 09  pydantic-evals  ← MEASURE the whole thing
```

## Gotchas worth remembering

- **The LLM is an untrusted caller.** It can be prompt-injected into calling your tool with a hostile
  argument, so validate every tool arg with `pydantic` *inside* the tool — exactly as you would a web
  request. Never interpolate a tool arg into a shell/SQL string (Module 05).
- **Read-only by default.** The blast radius of a compromised prompt is the set of state-changing tools
  you exposed — keep it tiny, and gate any mutation behind a human.
- **The docstring is a prompt.** A vague tool description makes the model misuse it; a precise one (args,
  units, constraints) is what makes it reliable. It's part of the interface.
- **`instructor` output is still validated, not trusted.** It re-asks on failure, but you still choose
  the model and its constraints — an under-specified `response_model` lets garbage through.
- **Pin MCP and `instructor`.** Both move fast; lock versions (Module 01) and own the durable pattern
  (typed args in, typed output out), not the specific API.
- **Don't invent model ids.** Use current ones — `claude-sonnet-5`, `claude-haiku-4-5-20251001`.
