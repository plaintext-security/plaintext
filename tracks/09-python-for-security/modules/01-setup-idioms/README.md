# Module 01 — Setup & Security Idioms

*Type 8 · Judgment-as-Code / Gate — stand up an isolated Python 3.12 environment and wire `ruff` + `bandit` as your first quality gate, then watch it catch the security anti-patterns AI-generated Python repeats (e.g. `shell=True`). (Secondary: Misconception Reveal — predict what the linter will flag, then see what it actually catches.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Python for Security** — *build a toolchain you'd trust with production data, starting from the first line.*

<!-- module-meta -->
**Difficulty:** Beginner &nbsp;·&nbsp; **Estimated time:** ~3–4 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    The first hour of a Python security project decides how much debt it carries: global installs,
    hardcoded keys, a linter never switched on. A `venv` is your dependency boundary; `ruff` catches
    style and bug-level mistakes; `bandit` catches the security-specific ones — `shell=True`,
    `eval()`, secrets in source. Wire all three as a quality gate up front, point it at AI-generated
    Python, and watch it flag the anti-patterns models repeat by default.

## Why this matters
The first week of a new Python project usually carries the most technical debt. Dependencies get
installed globally, credentials get hardcoded to "test quickly," and the linter never gets turned
on. In security tooling that debt is not embarrassing — it is a liability: a script that runs with
ambient cloud credentials or that shells out through `eval()` can be the pivot that escalates
an incident. Setting the environment right the first time costs one hour; cleaning up compromised
credentials costs weeks.

## Objective
Stand up a clean, isolated Python 3.12 environment; write a small script that passes `ruff` lint
and `bandit` static analysis; identify and fix the common security anti-patterns that AI-generated
Python code repeats.

## The core idea
A Python virtual environment is not optional for security tooling — it is the boundary between
your carefully pinned dependencies and whatever the system (or the next analyst) installed last
month. `venv` gives you an isolated interpreter; `pip freeze > requirements.txt` (or `pip-tools`
`requirements.in`) pins what you ran; and `ruff` enforces the code quality bar before anything
runs in production. Think of it as the security hygiene equivalent of least-privilege: the tool
only has access to what you deliberately gave it.

!!! note "The mental model"
    A `venv` is least-privilege for dependencies, and the linter pair is your pre-flight gate: `ruff`
    for style and common bugs, `bandit` for security anti-patterns. A clean `bandit` run doesn't mean
    safe — it means the obvious landmines are gone. It's the floor, not the ceiling.

The security anti-patterns that matter most are not exotic. **Hardcoded credentials** (`API_KEY =
"abc123"` at module level) are the single most common finding in security-team code repositories —
they end up in git, and they stay there forever in the history even after you delete the line. The
fix is `os.environ.get("API_KEY")` and a `.env` file you gitignore. **`subprocess(shell=True)`**
turns a string into a shell invocation and opens the door to injection the moment any part of
that string is user-controlled; prefer a list argument and `shell=False`. **`eval()` and
`exec()`** are almost never necessary in a security tool and are instant red flags in code review.

!!! warning "The gotcha"
    Hardcoded credentials don't go away when you delete the line — they live in git history forever.
    The fix is `os.environ.get("API_KEY")` plus a `.env` you gitignore *from day one*. Undoing this
    later means rotating the leaked secret, not just editing a file.

`bandit` is the static analyzer that catches these patterns automatically. It is not a substitute
for code review, but it is the first gate — the equivalent of running `checkov` before you
`terraform apply`. `ruff` handles style and common bugs (shadowed builtins, unused imports,
mutable defaults) faster than `flake8` + `isort` combined. Running both before every commit is
the discipline.

??? note "Go deeper: secrets management in practice"
    Production tools use environment variables or a secrets manager (Vault, AWS Secrets Manager,
    Azure Key Vault) — never the source file. For local lab work, a `.env` file loaded by
    `python-dotenv` is acceptable, provided the file is in `.gitignore` from day one. Get into this
    habit on the first script; retrofitting it after a leak is far more expensive.

!!! tip "AI caveat"
    AI-generated Python passes syntax checks while routinely shipping `shell=True`, raw `os.system()`,
    and API keys in string literals. The model drafts; `ruff` formats; `bandit` gates; you read and
    own every line it flags.

## Learn (~2 hrs)

**Environment setup (~45 min)**
- [Python Virtual Environments Primer — Real Python](https://realpython.com/python-virtual-environments-a-primer/) — the definitive walkthrough of why venv exists and how to use it correctly; covers `activate`, `deactivate`, and `requirements.txt`.
- [pip-tools documentation](https://pip-tools.readthedocs.io/en/latest/) — for when `requirements.txt` alone is not enough; shows how to pin a full dependency tree reproducibly.

**Code quality (~45 min)**
- [Ruff — fast Python linter and formatter](https://docs.astral.sh/ruff/) — read the "Getting started" and "Configuration" sections; understand what rule codes mean so you can triage findings.
- [Bandit — security linter for Python (PyCQA)](https://bandit.readthedocs.io/en/latest/) — skim the "Getting started" and "Tests" sections to understand the finding levels and how to suppress a false positive.

**Security idioms (~30 min)**
- [Python docs — `subprocess` "Security Considerations"](https://docs.python.org/3/library/subprocess.html#security-considerations) — the authoritative note on why `shell=True` with any untrusted input is a shell-injection bug, and how passing an argument *list* (no shell) avoids it. The single most common dangerous idiom in security tooling; read it, then audit your own scripts for it.

## Key concepts
- Why virtual environments are a security boundary, not just a convenience
- `ruff` for style/bug-catching; `bandit` for security-specific anti-patterns
- The three most dangerous Python idioms: hardcoded secrets, `shell=True`, `eval()`
- Secrets via environment variables and `.env` (gitignored) for local work
- `pip freeze` / `pip-tools` for reproducible, auditable dependency pinning

## AI acceleration
AI generates Python code that passes syntax checks but routinely includes `shell=True`, raw
`os.system()`, and API keys in strings. Ask a model to write a script, then immediately feed
the output to `bandit -r .` — you will find something on the first try. The workflow: model
drafts, `ruff` formats, `bandit` gates, you read and own it.

!!! question "Check yourself"
    - Why is a virtual environment a security boundary, not just a convenience?
    - What does a clean `bandit` run actually prove — and what does it not?
    - You deleted a hardcoded API key from your script. Why isn't the secret safe yet?
