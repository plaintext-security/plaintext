---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Building MCP Servers

*Companion to [Module 05 — Building MCP Servers](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

MCP (Model Context Protocol) lets an LLM call *your* tools over a standard protocol. The security rule
that governs everything: **every argument the model passes is untrusted input** — validate it exactly as
you would a web request parameter.

## Minimal server with FastMCP (Python)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("soc-tools")

@mcp.tool()
def lookup_ip(ip: str) -> dict:
    """Return geo/ASN for an IPv4 address. `ip` must be a dotted-quad."""
    validate_ipv4(ip)                 # reject anything that isn't an IP — do NOT trust the model
    return enrich(ip)

if __name__ == "__main__":
    mcp.run()                         # stdio transport by default
```

- The **docstring and type hints ARE the tool schema** the model sees — write them for the model, and
  keep the description tight so it calls the tool correctly.
- Prefer **read-only tools**. If a tool mutates state (blocks an IP, closes a ticket), gate it behind an
  explicit human confirmation, never let the model trigger it unattended.

## Validate every argument (the whole game)

```python
def lookup_ip(ip: str) -> dict:
    import ipaddress
    try:
        ipaddress.ip_address(ip)       # raises on anything not an IP
    except ValueError:
        raise ValueError("ip must be a valid IPv4/IPv6 address")
    # never interpolate `ip` into a shell/SQL string — parameterize or subprocess-list-args
```

## Run and inspect it

```bash
# the MCP Inspector drives your server like a client would — test tools by hand
npx @modelcontextprotocol/inspector python server.py

# register with a client (e.g. Claude Code) via its MCP config, pointing at the command
```

## Test the hostile path

```python
def test_rejects_shell_metachars():
    with pytest.raises(ValueError):
        lookup_ip("1.1.1.1; rm -rf /")   # prove injection args are refused
```

## Gotchas worth remembering

- **Every LLM-supplied argument is attacker-controlled.** A model can be prompt-injected into calling
  your tool with `"; drop table"` or a path-traversal string. Validate/parameterize as if it came from
  the internet — because effectively it did.
- **Read-only by default; mutations need a human gate.** The blast radius of a compromised prompt is
  exactly the set of state-changing tools you exposed. Keep that set tiny and confirmed.
- **The docstring is a prompt.** A vague description makes the model misuse the tool; a precise one
  (args, units, constraints) is what makes it reliable. Treat it as part of the interface.
- **Least privilege for the server's own creds.** The tool runs with *its* permissions, not the model's
  — scope its API keys/roles to exactly what its tools need.
- **Ship it like a tool, not a script:** flags, README, tests. The deliverable is something others can
  run and trust, which means the hostile-argument test is non-negotiable.
