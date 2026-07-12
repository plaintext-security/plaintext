# Cheat sheet — Building CLI Tools

*Companion to [Module 05 — Building CLI Tools](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## typer — the function signature is the parser

```python
import typer

app = typer.Typer(help="ioc-check — enrich indicators of compromise.")

@app.command()
def enrich(
    ioc: str,                                         # positional ARGUMENT (required)
    timeout: float = 10.0,                            # --timeout OPTION (has a default)
    verbose: bool = False,                            # --verbose / --no-verbose flag
):
    """Enrich a single IOC and print the verdict."""  # docstring becomes --help text
    ...

if __name__ == "__main__":
    app()
```

## Arguments vs options, and richer types

```python
from pathlib import Path
from typing import Optional
from enum import Enum

class Fmt(str, Enum):                                 # choices — typer validates membership
    json = "json"
    table = "table"

@app.command()
def report(
    infile: Path = typer.Argument(..., exists=True),  # ... = required; exists= validates it
    out: Optional[Path] = typer.Option(None, "--out", "-o"),   # short + long flag names
    fmt: Fmt = Fmt.table,                             # enum -> validated --fmt {json,table}
    api_key: str = typer.Option(..., envvar="VT_API_KEY"),     # read from env if not passed
):
    ...
```

## Exit codes — the interface for shells and CI

```python
@app.command()
def enrich(ioc: str):
    if not is_valid_ioc(ioc):
        typer.echo(f"error: '{ioc}' is not a valid IP or hash", err=True)  # to stderr
        raise typer.Exit(code=1)                      # NON-zero = failure
    result = do_enrich(ioc)
    if result is None:
        raise typer.Exit(code=1)                      # a failed run must not exit 0
    typer.echo(result)                                # success -> implicit exit 0
```

## typer output & confirmation

```python
typer.echo("plain line")                              # stdout
typer.echo("oops", err=True)                          # stderr — errors go here
typer.secho("done", fg=typer.colors.GREEN)            # coloured output
name = typer.prompt("Target host")                    # interactive input
if typer.confirm("Scan now?"):                        # y/N prompt
    ...
# Read piped stdin so subcommands compose:  cat iocs.txt | ioc-check enrich -
```

## argparse — the stdlib fallback

```python
import argparse, sys

p = argparse.ArgumentParser(description="ioc-check")
sub = p.add_subparsers(dest="command", required=True)

e = sub.add_parser("enrich")
e.add_argument("ioc")                                 # positional
e.add_argument("--timeout", type=float, default=10.0) # type= coerces + validates
e.add_argument("--fmt", choices=["json", "table"], default="table")
e.add_argument("--verbose", action="store_true")      # boolean flag

args = p.parse_args()                                 # exits 2 on a usage error itself
if args.command == "enrich":
    ok = run_enrich(args.ioc, args.timeout)
    sys.exit(0 if ok else 1)                          # you own the exit code
```

## Standard exit-code convention

```text
0   success
1   generic runtime failure (enrichment failed, API error)
2   usage error (bad/missing arguments — argparse emits this automatically)
```

## Gotchas worth remembering

- **A failed run must exit non-zero.** Exiting `0` on failure is a lie to the caller — in shell
  pipelines and CI the exit code *is* the interface, and a `0` will not fail the gate that ran it.
  Use `raise typer.Exit(code=1)` or `sys.exit(1)` explicitly.
- **Say what failed and which value.** `"API returned 429 for 8.8.8.8 — rate limited"` beats an
  empty error and exit `1`. The extra line of error handling is an hour saved under pressure.
- **Send errors to stderr, results to stdout.** `err=True` keeps diagnostics out of the piped data
  stream so `ioc-check enrich x | jq` doesn't choke on your log lines.
- **Validate input before the expensive call.** Check the IOC format before hitting the API — the
  AI-drafted first pass usually skips this and fires a request at garbage.
- **In typer, the type hint drives everything.** The annotation supplies the validation, the
  coercion, and the `--help` text — no separate schema. In argparse you spell it out with `type=`
  and `choices=`.
- **Keep subcommands composable.** Read files or stdin, write files or stdout — so they pipe
  together like Unix tools instead of each needing its own bespoke plumbing.
