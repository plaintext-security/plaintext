---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Modern Python Toolchain & Spec-Driven Skeleton

*Companion to [Module 01 — Modern Toolchain & Spec-Driven Skeleton](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## uv — projects, deps, and the lockfile

```bash
uv init sift                 # scaffold a new project (pyproject.toml, src/, .python-version)
uv init --lib mylib          # scaffold a library layout instead of an app
uv python install 3.12       # install a managed Python; uv pins it via .python-version
uv add pydantic              # add a dependency AND update uv.lock
uv add --dev ruff pyright    # add dev-only deps (dependency-group "dev")
uv remove requests           # drop a dependency and relock
uv lock                      # resolve + write uv.lock (pinned versions AND hashes)
uv sync                      # install exactly what uv.lock says into .venv
uv sync --frozen             # install from the lock WITHOUT re-resolving (CI: fail if stale)
uv sync --locked             # verify uv.lock is up to date, then sync (CI gate)
uv run python alert_parse.py # run a command in the project env (auto-syncs first)
uv run -- sift --help        # run your entry point; -- ends uv's own flag parsing
uv tree                      # show the resolved dependency tree
uv export --format requirements-txt > requirements.txt  # interop shim if something needs pip
```

`uv.lock` is the security artifact: it records the exact **version and hash** of every transitive
dependency. Commit it. `uv sync --frozen` / `--locked` in CI is what makes installs reproducible.

## ruff — lint + format in one tool

```bash
ruff check                   # lint the project (replaces flake8/isort/pyupgrade/…)
ruff check --fix             # apply autofixes
ruff check --fix --unsafe-fixes   # include fixes that may change behavior — review these
ruff check --select E,F,I    # run only chosen rule groups (E/F=pyflakes, I=import sort)
ruff check --statistics      # count violations by rule — good for triaging a legacy file
ruff format                  # format code (a black-compatible formatter)
ruff format --check          # report but don't write — the CI mode
ruff check --diff            # preview lint fixes without writing
```

## pyright — static type gate

```bash
pyright                      # type-check the whole project
pyright src/sift             # check a path
pyright --stats              # show inferred vs. declared coverage
pyright --outputjson         # machine-readable output for tooling
pyright --warnings           # treat warnings as failures (stricter gate)
```

Run it through the project env so it sees your deps: `uv run pyright`.

## Minimal pyproject.toml

```toml
[project]
name = "sift"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["pydantic>=2"]

[project.scripts]
sift = "sift.cli:main"        # console entry point -> uv run sift

[dependency-groups]
dev = ["ruff", "pyright"]     # installed by uv sync, excluded from the built package

[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]   # errors, pyflakes, imports, pyupgrade, bugbear

[tool.pyright]
include = ["src"]
typeCheckingMode = "standard"          # "basic" | "standard" | "strict"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

## CI gate — fail the build, not on goodwill

```yaml
# .github/workflows/ci.yml
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5      # installs uv, caches the resolver
      - run: uv sync --locked            # reproducible install; fails if uv.lock is stale
      - run: uv run ruff check           # lint
      - run: uv run ruff format --check  # format drift
      - run: uv run pyright              # types
      - run: uv run python alert_parse.py sample.json  # behavior unchanged
```

## Spec-driven workflow (openspec)

```bash
npx openspec init            # add openspec/ to the repo (specs live in version control)
npx openspec list            # list active change specs
# 1. Write the change spec: what it does, the typed contract, acceptance checks.
# 2. Hand the spec to the copilot; let it implement.
# 3. Review the DIFF against the spec — sharper than reading code cold.
npx openspec validate <id>   # check a change spec is well-formed
npx openspec archive <id>    # move a completed change into the applied history
```

**Alternative — GitHub spec-kit** (Python-native; the pattern is tool-agnostic):

```bash
uvx specify init            # scaffold spec-kit in the repo
# loop: /specify (what & why) -> /plan (how) -> /tasks (break down) -> implement
```

Pick one and stay consistent; the *method* — spec first, AI implements, you review against the
spec — is what carries through the track, not the specific tool.

## Gotchas worth remembering

- **Pinned version ≠ pinned bytes.** `torch==2.0.1` still installs whatever is at that version now; a
  hash-locked `uv.lock` records the artifact digest and refuses a swapped byte. Hashes are the actual
  defense against the `torchtriton` dependency-confusion class.
- **Commit `uv.lock`.** It is not a build artifact — it *is* the reproducibility guarantee. An
  uncommitted lock means CI resolves fresh and "works on my machine" comes right back.
- **Use `--frozen`/`--locked` in CI, not a plain `uv sync`.** A bare sync will silently re-resolve and
  mask a stale lock; the flags make a drifted lockfile a build failure.
- **Migrate strangler-fig, don't big-bang.** Wrap the working script unchanged, get the gate green
  *around* it, then refactor one slice behind the passing build — with the prior commit as rollback.
  Deleting and regenerating loses the behavior you can't see.
- **Review AI output against the spec, not for vibes.** The high-value catch is the copilot's
  *defaults*: it reaches for `pip`/`venv`/`requirements.txt`, skips lockfile hashes, and leaves types
  off. The spec is the lens that makes those omissions obvious.
- **`uv run` auto-syncs.** It reconciles `.venv` to the lock before running, so you rarely call
  `uv sync` by hand locally — but CI should sync explicitly so the failure is legible.
