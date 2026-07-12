# Module 01 — Modern Toolchain & Spec-Driven Skeleton

*Type 12 · Migration — take a real legacy security script and migrate it, without breaking it, into a modern `uv`/`ruff`/`pyright` project with a CI gate and a spec-driven workflow. (Secondary: Type 11 · ADR — record the toolchain and spec-workflow decision honestly.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot writes the code in seconds; your edge is the project it writes into and the spec it writes against.*

!!! abstract "In 60 seconds"
    You already write Python and your copilot writes it faster. So this track doesn't teach syntax — it
    teaches the **project and the process** that make copilot output *trustworthy*: a modern toolchain
    (`uv` for envs/deps, `ruff` for lint/format, `pyright` for types) gated in CI, and a **spec-driven
    workflow** where you write the spec, the AI implements it, and you review the implementation *against
    the spec*. You'll migrate a real legacy script into that skeleton with the strangler-fig pattern —
    wrap first, never big-bang — and the migration will be the seed of `sift`, the alert-triage tool you
    grow across the whole track. The anchor is a real supply-chain lesson: in December 2022 a single
    malicious dependency on PyPI shipped inside PyTorch's own nightly.

## Why this matters

The copilot's defaults are a decade old. Ask any model to "set up a Python project" and you'll get
`pip`, `venv`, `requirements.txt`, `setup.py`, and `argparse` — the stack of 2015. It works, but it's
slow to resolve, easy to get non-reproducible, and silent about types. Meanwhile the actual failure that
should scare you isn't style: it's **what gets installed**. In December 2022, attackers uploaded a
malicious package named `torchtriton` to PyPI that *shadowed* a real internal PyTorch dependency; because
`pip` preferred the public index, anyone who installed PyTorch-nightly that week pulled the attacker's
code, which exfiltrated environment variables, `/etc/passwd`, and SSH keys. A **dependency-confusion**
attack — and a lockfile with pinned hashes is what stops it.

This module is first because everything else in the track is built *in this skeleton*. If your project
can't lint, type-check, and pin its dependencies reproducibly in CI, none of the later guarantees
(validated input, tested concurrency, an eval gate) are trustworthy — they're claims. And because the
whole track's thesis is "AI authors → you review → you own it," you need a *method* for directing the AI,
not just a place to paste it. That method is spec-driven development, and it starts here.

## Objective

Migrate a working legacy security script into a modern, reproducible `uv` project — `ruff` and `pyright`
green, dependencies pinned and hash-locked, all gated in CI — without breaking the script at any step;
adopt a spec-driven workflow (openspec) and write the first `sift` spec; and record the decision in a
short ADR you can defend.

## The core idea

**The toolchain is a security control, not a preference.** Reproducibility and a pinned, hash-verified
lockfile are what turn "it worked on my machine" into "it installs the same, verified bytes everywhere" —
the direct defense against the `torchtriton` class of attack. `uv` gives you fast, reproducible
environments and a lockfile in one tool; `ruff` folds linting and formatting into a single fast pass;
`pyright` (or `ty`) makes wrong types a build failure instead of a 2 a.m. surprise. None of this is
exotic — it's the current default the copilot hasn't caught up to. Your job is to *know* it's the bar and
hold the generated code to it in CI.

**Migrate, don't rewrite.** The instinct — yours and the copilot's — is to delete the old script and
regenerate it clean. Don't. Real systems are migrated *incrementally* with the **strangler-fig** pattern:
stand the new structure up *around* the working code, move one slice at a time, and prove nothing broke
at each step. Here that means wrapping the legacy `alert_parse.py` unchanged inside the new project first,
getting CI green around it, and only then refactoring behind the passing gate. The muscle you build —
never cut over all at once, always keep a rollback — is the same one Track 06 and Track 10 use on domains
where a big-bang cutover means an outage.

**Spec-driven development is how you review the copilot instead of trusting it.** The move: write a
**spec** for the increment you want (what it does, the typed contract, the acceptance checks) → let the
copilot implement it → **review the implementation against the spec**, which is a far sharper lens than
reading code cold. The spec is also the artifact that makes ownership real: when you can point to "this
is what I specified, here's the diff that implements it, here's the check that proves it," you own the
code in a way that pasting never gives you. You'll adopt a concrete tool for it and carry the spec beat
into every module that follows.

??? note "Why a lockfile with *hashes*, not just pinned versions"
    Pinning `torch==2.0.1` fixes the version but not the *bytes*: a compromised or re-uploaded package at
    that version still installs. A hash-locked file (`uv.lock`, or `pip`'s `--require-hashes`) records the
    cryptographic digest of each artifact, so install fails if the bytes don't match what you locked —
    which is exactly the tamper `torchtriton` relied on nobody checking. Supply-chain gating gets its own
    full treatment in Module 09; here you just establish the lockfile as non-negotiable.

## Learn (~2–3 hrs)

**The modern toolchain (do these first — they replace the copilot's defaults)**

- [Astral's `uv` documentation — "Getting started" + "Projects"](https://docs.astral.sh/uv/) (~40 min)
  — read the project workflow (`uv init`, `uv add`, `uv lock`, `uv run`) and why the lockfile matters.
  This is the env/dependency backbone for the whole track.
- [`ruff` documentation — "Linter" and "Formatter"](https://docs.astral.sh/ruff/) (~20 min) — one tool
  replacing `flake8` + `black` + `isort`; skim the rule categories and the `pyproject.toml` config.
- [pyright / basedpyright getting started](https://microsoft.github.io/pyright/#/getting-started)
  (~20 min) — how gradual typing catches the copilot's subtly-wrong types before runtime.

**Spec-driven development (the workflow you'll use all track)**

- [OpenSpec — README and quickstart](https://github.com/Fission-AI/OpenSpec) (~30 min) — the concrete
  spec-driven workflow this track leads with: write a change spec, drive the AI from it, review against
  it. <!-- VALIDATE: confirm current OpenSpec repo URL and quickstart path -->
- [GitHub `spec-kit`](https://github.com/github/spec-kit) (~20 min) — the mainstream, Python-native
  alternative; read its "specify → plan → tasks" loop so you understand the pattern is tool-agnostic.

**The anchor (why the lockfile is a security control)**

- [PyTorch security advisory — "Compromised PyTorch-nightly dependency chain (Dec 2022)"](https://pytorch.org/blog/compromised-nightly-dependency/)
  (~10 min) — the primary source for the `torchtriton` dependency-confusion attack; read what the
  malicious package actually did. <!-- VALIDATE: confirm exact advisory URL/slug on pytorch.org -->

## Key concepts
- **`uv` / `ruff` / `pyright`** are the current default toolchain — the copilot still reaches for the old one.
- **A hash-locked lockfile is a supply-chain control** — it defeats the `torchtriton` dependency-confusion class.
- **Strangler-fig migration:** wrap the working script, gate it in CI, refactor behind the green build — never big-bang.
- **Spec-driven development:** spec → AI implements → review *against the spec* → verify. The spec is how you own AI code.
- **CI is where the bar is enforced** — lint, types, and lockfile checks fail the build, not your goodwill.

## AI acceleration

This module *is* the AI-acceleration method for the whole track, so use it on itself: have the copilot
generate the `pyproject.toml`, the CI workflow, and the initial refactor — then hold every line to the
gate. The tell you're looking for: the model will reach for `pip`/`venv`/`requirements.txt` and
`setup.py`, and will happily skip the lockfile and types entirely. Write the spec for the project
skeleton first, let the model implement it, and review the diff *against your spec* — did it pin and hash
dependencies? did it add the type gate? did it preserve the legacy script's behavior? The bug you catch
here isn't in the script; it's in the *setup the copilot defaulted to*.

!!! question "Check yourself"
    - Why does pinning `torch==2.0.1` **not** fully protect you, and what does a hash-locked file add?
    - What would break if you deleted `alert_parse.py` and had the copilot regenerate it from scratch,
      versus wrapping it and migrating behind a passing CI gate?
    - In your own words: what does reviewing an implementation *against a spec* catch that reading the
      code cold does not?
