# Module 06 — Two Surfaces, One Core

*Type 7 · Build-&-Operate — stand a validated `sift` core behind two surfaces (a `typer` CLI an analyst runs and a `FastAPI` service a pipeline calls) so the same typed logic ships once and is consumed two ways, without duplicating a line. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot writes the code in seconds; your edge is the project it writes into and the spec it writes against.*

!!! abstract "In 60 seconds"
    A good security tool has to be usable **two ways at once**: an analyst runs it at a terminal, and a
    pipeline (a SOAR playbook, another service) calls it over HTTP. The copilot's default when you ask
    for both is to write the logic **twice** — once behind `typer`, once behind `FastAPI` — and now you
    have two triage engines that drift apart. The right shape is **one core, two surfaces**: the pydantic
    models and the enrich/triage functions you built in M2–M5 *are* the core, and `typer` and `FastAPI`
    are thin adapters that call into it. The same `Alert`/`Indicator` models validate a CLI argument and
    an HTTP request body. This is the payoff of the whole *parse, don't trust* spine: FastAPI validates
    every request against your models for free, because they already exist. This module closes Phase 2.

## Why this matters

Every mature SOC eventually needs its tooling **as a service**. The enrichment tool an analyst runs by
hand during an investigation is the *same* logic a detection pipeline needs to call automatically — a
SOAR playbook that enriches every indicator on ingest, another microservice that wants a triage verdict
before it pages someone. If the CLI and the service are two separate codebases, they *will* diverge: a
scoring tweak lands in one and not the other, and now the analyst and the automation disagree about
whether an alert is critical. That divergence is an incident waiting to happen — the automation
suppresses what the human would have escalated.

So the operational requirement is: **one implementation, reachable two ways.** This is a Build-&-Operate
problem, not a vulnerability — the thing that bites you is architecture and toil, not a CVE. And it's
exactly where the copilot's instinct fails, because "add a CLI" and "add an API" are two separate prompts
and the model happily answers each by re-implementing the triage logic inline. Your job is to hold the
line that the logic lives in **one** place and both surfaces are dumb adapters over it.

## Objective

Expose `sift`'s existing validated core through **two thin adapters** — a `typer` CLI and a `FastAPI`
service — that share the *same* pydantic models and core functions with **zero duplicated business
logic**; make FastAPI validate request bodies against the `Alert`/`Indicator` models you already own; and
prove both surfaces produce identical results from the same input.

## The core idea

**The core already exists — surfaces are adapters, not owners.** By the end of M5, `sift` has a typed
core: pydantic `Alert`/`Indicator` models (M2), a streaming triage layer (M3), an async enricher (M4),
and safe tool wrappers (M5), all reachable as plain Python functions like `enrich(alert) -> Alert` and
`triage(alert) -> Verdict`. A surface's *only* jobs are to (1) get input from somewhere — argv, or an
HTTP body — into your models, (2) call a core function, and (3) render the result back out — to a
terminal, or as JSON. The moment a surface contains an `if severity > ...` scoring decision, you've
leaked business logic out of the core, and the two surfaces have started to drift. The discipline: a
`typer` command or a `FastAPI` endpoint should be a handful of lines that import and delegate.

**`typer` and `FastAPI` are the *same shape* — both are "typed function → interface."** `typer` turns a
type-annotated function into a CLI: parameter types become argument parsers and `--help` text. `FastAPI`
turns a type-annotated function into an HTTP endpoint: a pydantic parameter becomes a request-body schema
with automatic validation and OpenAPI docs. Once you see that both frameworks *derive the interface from
your types*, the "one core, two surfaces" pattern stops being extra work — you write the typed core once,
and each adapter is a decorator plus a delegate call.

**FastAPI's pydantic-native validation is the whole spine paying off.** This is why we spent M2 building
models that reject adversarial input. When you type a FastAPI endpoint's body as `alert: Alert`, FastAPI
validates every incoming request against that model *before your code runs* — malformed JSON, wrong
types, and missing fields become a clean `422` with a precise error, not a crash deep in your enricher.
The untrusted-input boundary you built for the CLI is now defending your HTTP surface too, for free,
because it's the *same model*. Parse-don't-trust was never about one edge; it was about owning the type
that every edge validates against.

```python
# core.py — the shared core. Already exists from M2–M5. No CLI, no HTTP. Just types + logic.
from .models import Alert, Verdict        # pydantic models from M2

def triage(alert: Alert) -> Verdict:      # the one implementation of the logic
    ...
```

```python
# cli.py — typer adapter. Thin: parse argv into the model, delegate, render.
import typer, json
from .core import triage
from .models import Alert

app = typer.Typer()

@app.command()
def run(alert_file: typer.FileText) -> None:
    alert = Alert.model_validate_json(alert_file.read())   # same model validates CLI input
    verdict = triage(alert)                                 # same core function
    typer.echo(verdict.model_dump_json(indent=2))
```

```python
# api.py — FastAPI adapter. Thin: FastAPI validates the body into the model, delegate, return.
from fastapi import FastAPI
from .core import triage
from .models import Alert, Verdict

api = FastAPI()

@api.post("/triage")
def triage_endpoint(alert: Alert) -> Verdict:  # FastAPI validates the request body against Alert -> 422 on bad input
    return triage(alert)                        # same core function; identical result to the CLI
```

Two files, one `import triage`. The scoring logic appears **zero** times in either adapter.

??? note "Doesn't the async enricher (M4) force `async def` on the surfaces?"
    Only where you actually await. FastAPI supports both `def` and `async def` endpoints natively, so an
    endpoint that calls your M4 async enricher is simply `async def ... await enrich(...)`. `typer`
    commands are sync, so the CLI wraps the same coroutine in `asyncio.run(...)`. Crucially, the
    enrichment logic itself still lives once in the core — each surface only chooses how it *invokes* it.

## Learn (~2–3 hrs)

**Typer — the CLI surface**

- [Typer documentation — "Tutorial - User Guide" (first steps + Commands + Arguments/Options)](https://typer.tiangolo.com/tutorial/)
  (~40 min) — how a type-annotated function becomes a CLI; read how parameter *types* drive parsing and
  `--help`. This is the "types → interface" idea you'll reuse on the API side.

**FastAPI — the HTTP surface**

- [FastAPI documentation — "Tutorial - User Guide" (First Steps + Request Body)](https://fastapi.tiangolo.com/tutorial/body/)
  (~45 min) — the key section: a pydantic model as a request-body parameter gives you automatic
  validation, JSON parsing, and OpenAPI docs. This is the direct payoff of your M2 models.
- [FastAPI — "Response Model"](https://fastapi.tiangolo.com/tutorial/response-model/) (~15 min) — typing
  the *return* as a pydantic model so the response is validated and documented too; closes the loop with
  the request side.

**The shared-core pattern (why not to duplicate)**

- [FastAPI — "Bigger Applications - Multiple Files"](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
  (~20 min) — how to structure a project so routers/adapters import a shared core module; read it as the
  blueprint for keeping logic out of the surfaces.
- [Cosmic Python (Percival & Gregory) — "A Brief Interlude: On Coupling and Abstractions"](https://www.cosmicpython.com/book/chapter_03_abstractions.html)
  (~25 min) — the *why* behind thin adapters over a stable core; the entrypoints-as-thin-shells argument,
  vendor-neutral and directly applicable here.

## Key concepts
- **One core, two surfaces** — the pydantic models + core functions are the tool; CLI and API are adapters.
- **A surface is thin** — get input into a model, call a core function, render the result out. No business logic.
- **`typer` and `FastAPI` share a shape** — both derive their interface from your type annotations.
- **FastAPI validates request bodies against your pydantic models** — malformed input becomes a `422`, not a crash.
- **Zero duplicated logic** is the acceptance bar — the scoring/triage code appears exactly once in the repo.

## AI acceleration

Ask a copilot to "add a CLI and a REST API to this tool" and watch the failure-class appear: it will
scaffold `typer` and `FastAPI` *independently*, and re-implement the triage/scoring logic inside each
one — often with subtle differences, because it generated them in two separate passes. The review move is
to **trace the business logic**: it must appear exactly once, in the core, and both adapters must
`import` it. If you see an `if`-branch that scores an alert inside a `@app.command()` or an
`@api.post()`, reject it — that's the duplication the module targets. Write the spec as "two thin
adapters over the existing core, zero duplicated logic, both surfaces validate against the same models,"
and review the diff against exactly that.

!!! question "Check yourself"
    - Where does the triage/scoring logic live, and how many times does it appear in the whole repo?
    - When a `POST /triage` request arrives with a missing required field, *what* validates it and *what*
      does the client get back — and why did you get that for free?
    - If a teammate adds a new severity rule, which files change so the CLI and the API stay in agreement?
