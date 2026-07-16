---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Two Surfaces, One Core (typer + FastAPI)

*Companion to [Module 06 — Two Surfaces, One Core](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The shared core (write this once)

```python
# core.py — pydantic models + logic. NO typer, NO fastapi imports. Both surfaces import from here.
from typing import Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress

class AlertDetails(BaseModel):
    model_config = ConfigDict(extra="ignore")        # real EVE has many fields; pin what matters, ignore the rest
    signature: str
    signature_id: int
    severity: int = Field(ge=1, le=3)                # Suricata severity is 1..3 — off-range → 422

class AlertEvent(BaseModel):     # the untrusted-input boundary; validates one EVE line for CLI AND API
    model_config = ConfigDict(extra="ignore")
    event_type: Literal["alert"]                     # discriminator; a non-alert line has no member → rejected
    timestamp: datetime
    src_ip: IPvAnyAddress | None = None
    dest_ip: IPvAnyAddress | None = None
    alert: AlertDetails

class TriageResult(BaseModel):   # typed output; renders the same everywhere
    signature: str
    score: int
    escalate: bool

def triage(event: AlertEvent) -> TriageResult:       # the ONE implementation of the logic
    score = event.alert.severity * 10                 # scoring lives here and ONLY here
    return TriageResult(signature=event.alert.signature, score=score, escalate=score >= 20)
```

## typer — the CLI adapter

```python
# cli.py — thin: parse one EVE line into the model, delegate, render.
import typer
from .core import AlertEvent, triage

app = typer.Typer()

@app.command()                                        # one function → one subcommand
def run(eve_file: typer.FileText) -> None:
    event = AlertEvent.model_validate_json(eve_file.readline())  # same model validates one eve.json record
    typer.echo(triage(event).model_dump_json(indent=2))         # same core function

if __name__ == "__main__":
    app()
```

```python
# Typed params become the CLI interface. Argument = positional (required); Option = --flag.
@app.command()
def triage_cmd(
    path: str = typer.Argument(..., help="eve.json file"),     # positional, required
    verbose: bool = typer.Option(False, "--verbose", "-v"),    # --verbose / -v flag
    event_type: str = typer.Option("alert", help="EVE event_type to triage"),  # --event-type filter (Stretch)
) -> None:
    if not verbose:
        raise typer.Exit(code=0)     # clean success exit
    raise typer.Exit(code=2)         # non-zero → CI/scripts see the failure
```

- Types drive parsing and `--help` for free: `int` parses+validates, `bool` becomes a flag.
- `typer.Argument(...)` = positional; `typer.Option(...)` = named flag. `...` (Ellipsis) means required.
- Exit codes: `raise typer.Exit(code=N)` — `0` success, non-zero failure. This is what CI checks.

Run it: `python -m sift.cli run alert.json` (or expose a `sift` entry point in `pyproject.toml`).

## FastAPI — the HTTP adapter

```python
# api.py — thin: FastAPI validates the EVE body into the model, delegate, return.
from fastapi import FastAPI
from .core import AlertEvent, TriageResult, triage

api = FastAPI()

@api.get("/health")                       # GET, no body
def health() -> dict:
    return {"status": "ok"}

@api.post("/triage")                      # POST, body typed as a pydantic model
def triage_endpoint(event: AlertEvent) -> TriageResult:  # FastAPI parses+validates the EVE body → 422 on a bad line
    return triage(event)                                  # same core function; identical result to the CLI
```

- A pydantic parameter (`event: AlertEvent`) becomes the request-body schema — automatic JSON parse, validation, and OpenAPI docs.
- A pydantic return type (`-> TriageResult`) validates and documents the response.
- Malformed/missing fields → automatic **422 Unprocessable Entity** with a precise error, *before your code runs*.

Run it with uvicorn:

```bash
uvicorn sift.api:api --reload            # dev server; docs at http://127.0.0.1:8000/docs
uvicorn sift.api:api --host 0.0.0.0 --port 8000   # bind for a container
```

```python
# async endpoint when you await the M4 enricher; the CLI wraps the same coroutine in asyncio.run(...)
@api.post("/enrich")
async def enrich_endpoint(event: AlertEvent) -> AlertEvent:
    return await enrich(event)           # enrichment logic still lives once, in the core
```

## Proving the two surfaces agree

```bash
python -m sift.cli run alert.eve.json > cli.json                      # CLI result (one EVE alert line)
curl -s -X POST localhost:8000/triage -H 'Content-Type: application/json' \
     -d @alert.eve.json > api.json                                    # API result
diff cli.json api.json && echo "surfaces agree"                       # must be byte-for-byte identical

curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8000/triage \
     -H 'Content-Type: application/json' -d '{"event_type":"stats"}'  # non-alert / missing fields → 422
```

## Gotchas worth remembering

- **Never duplicate the logic per surface.** The copilot's default is to re-implement `triage` inside both the `@app.command()` and the `@api.post()`. Any `if severity > ...` scoring branch inside an adapter is the bug — delegate to the core. Grep: the scoring code appears **exactly once**.
- **FastAPI's pydantic validation is the payoff of *parse, don't trust*.** You type `event: AlertEvent` and every request is validated against the EVE model you already built in M2 — a truncated line or out-of-range `alert.severity` is a clean `422`, not a crash deep in the enricher. It's the *same* model that guards the CLI; you get the HTTP boundary for free.
- **Exit codes matter for CI.** A `typer` command that always exits `0` is invisible to a pipeline. `raise typer.Exit(code=N)` with non-zero on failure is what a CI step or SOAR playbook branches on.
- **Keep adapters thin** — parse input into a model, call one core function, render the result out. The moment a surface holds a business decision, the two surfaces have started to drift.
- **`core.py` imports neither `typer` nor `fastapi`.** If it does, the logic isn't really isolated — the surfaces should depend on the core, never the reverse.

> Only send requests to systems you own or have explicit written permission to test.
