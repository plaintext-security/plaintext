# Module 02 — Parse, Don't Validate

*Type 9 · Tool-Build — add a typed input boundary to `sift`: pydantic v2 domain models that turn an untrusted alert feed into `Alert`/`Indicator` objects (and load secrets safely), so invalid states can't reach your logic. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot will happily trust whatever the feed hands it; your edge is the boundary that refuses malformed and adversarial input before it becomes a bug.*

!!! abstract "In 60 seconds"
    Your `sift` skeleton from Module 01 reads a JSON alert feed and pokes at it with `.get()` and
    `if`-checks — the shape the copilot reaches for by default. This module replaces that with a **typed
    boundary**: pydantic v2 models (`Alert`, `Indicator`) that *parse* raw input into validated domain
    objects, or raise `ValidationError` and reject it. The slogan is Alexis King's — **"parse, don't
    validate"**: once input is a typed object, its invariants hold everywhere downstream, so you stop
    re-checking the same fields and stop shipping bugs that live in the gaps between checks. You'll also
    load API keys with `pydantic-settings` instead of hard-coding them. The anchor is a whole CVE class:
    Python libraries that *deserialize untrusted input into live objects* — `yaml.load()`, `pickle` — and
    hand an attacker code execution.

## Why this matters

The most dangerous line in a security tool is the one that trusts its input. Alert feeds, threat-intel
API responses, log lines — all of it is attacker-influenced, and the moment you treat a raw dict as if
its fields are the type and shape you assumed, you've built the bug. The sharpest version of this is
**unsafe deserialization**: `yaml.load()` on untrusted YAML in older PyYAML would construct arbitrary
Python objects — including ones that execute code — turning "parse this config" into remote code
execution (the class tracked as CVE-2017-18342; `pickle.loads` on untrusted data is the same trap and
has no safe mode at all). The fix pattern is identical
whether the payload is a YAML bomb or a merely-malformed alert: **don't hand untrusted bytes to
something that builds live objects unchecked — parse them through a schema that only admits the shapes
you allow.**

This is the **input edge** of the track's through-line, *parse, don't trust*. The same discipline
returns on the AI edge in Module 07 (validating untrusted *LLM output* with `instructor`) and as the
measurement layer in Module 09 (`pydantic-evals`). Get the muscle here — a typed boundary that makes
invalid input unrepresentable — and the later edges are the same move aimed at a new source of
untrusted data.

## Objective

Replace `sift`'s `.get()`-and-`if` input handling with pydantic v2 domain models — `Alert` and a nested
`Indicator` — that parse the raw feed at the boundary, reject malformed and adversarial records with a
`ValidationError` you handle deliberately, and normalize the fields downstream code depends on; and move
every secret out of the code into `pydantic-settings`, loaded from the environment.

## The core idea

**"Parse, don't validate" means the type *is* the check.** Validation, the way the copilot writes it, is
a scatter of `if`-statements: `if "severity" not in alert: ...`, `if not isinstance(ts, str): ...`,
sprinkled wherever a field is touched. The problem isn't that any one check is wrong — it's that the
information they establish *evaporates*. Three functions deep, the type system still thinks `alert` is a
plain dict, so you (and the copilot) re-check the same fields, and the one place you forgot is the bug.
Parsing flips it: you run the untrusted input through a schema **once**, at the boundary, and what comes
out is a typed `Alert` whose invariants are now guaranteed by its *type*. Downstream code receives an
`Alert`, not a dict of maybes — the invalid states are gone because they were never constructed.

**pydantic v2 is how you write that boundary in Python.** A `BaseModel` subclass declares fields with
types (`severity: Severity`, `indicators: list[Indicator]`), and `Alert.model_validate(raw)` either
returns a fully-typed, coerced instance or raises `ValidationError` with a precise, field-level report of
what was wrong. Constrained types and a `field_validator` let you encode real domain rules — an IP that
must parse, a severity from a fixed enum, a timestamp that must be timezone-aware — so a record that
violates them can't become an `Alert` at all. That last part is the security property: you're not hoping
downstream code remembers to check; you've made the malformed record **unrepresentable** as a valid
domain object.

**The boundary is also where you decide what "reject" means — that's a design choice, not a default.**
A validating parser gives you the *option* to be strict, but you still choose the policy: does a
bad record halt the run, get quarantined to a dead-letter file, or get logged and skipped so one poisoned
alert doesn't blind you to the other 9,999? Making that call explicitly — and catching `ValidationError`
where you can act on it, rather than letting it crash three layers up — is the judgment the copilot
skips. Secrets get the same "boundary" treatment: `pydantic-settings`' `BaseSettings` parses your API
keys out of the environment into a typed settings object, so a missing key fails loudly at startup
instead of as a confusing `None` mid-request, and the key never lives in the source.

??? note "Why `model_validate` at the edge beats `isinstance` everywhere"
    You could keep passing dicts around and guard each use with `isinstance`/`.get()` — but that's O(uses)
    checks, each a place to forget one, and the type checker can't help because a dict is a dict. Parsing
    is O(1) boundaries: one `model_validate` call converts untrusted input into a type, and from then on
    `pyright` enforces the shape for free. pydantic also *coerces* sanely (a numeric string to `int`,
    an ISO string to `datetime`) and reports **all** failures at once via `ValidationError.errors()`,
    which is far better triage than the first `KeyError` your `.get()`-soup happens to throw. Reserve
    `model_config = ConfigDict(strict=True)` or `extra="forbid"` for feeds where an unexpected field is
    itself a red flag.

## Learn (~2–3 hrs)

**pydantic v2 — the typed boundary (do these first)**

- [pydantic docs — "Models" and "Validators"](https://docs.pydantic.dev/latest/concepts/models/)
  (~40 min) — read how `BaseModel`, field types, and `model_validate` work, then the
  [`field_validator`/`model_validator`](https://docs.pydantic.dev/latest/concepts/validators/) page.
  This is the exact API you'll build `Alert` and `Indicator` with.
- [pydantic docs — "Fields" and constrained types](https://docs.pydantic.dev/latest/concepts/fields/)
  (~15 min) — `Field(...)` constraints, `Annotated` types, and stdlib types like `IPvAnyAddress` that
  turn a domain rule into a type instead of an `if`.
- [pydantic docs — "Handling errors" / `ValidationError`](https://docs.pydantic.dev/latest/errors/validation_errors/)
  (~15 min) — what a rejection actually contains, so your reject-policy can act on `.errors()` instead
  of a bare stack trace.

**Secrets at the boundary**

- [`pydantic-settings` docs — "Settings management"](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
  (~20 min) — `BaseSettings`, env-var loading, `SecretStr`, and `.env` support; why a typed settings
  object beats `os.environ.get("API_KEY")` scattered through the code.

**The idea and the anchor**

- [Alexis King — "Parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
  (~25 min) — the essay the whole module is named after. It's Haskell-flavored, but read it for the
  thesis: push the untrusted-to-trusted conversion to the boundary and let the type carry the proof.
- [NVD — CVE-2017-18342 (PyYAML `yaml.load()` arbitrary code execution)](https://nvd.nist.gov/vuln/detail/CVE-2017-18342)
  (~10 min) — the anchor CVE: how deserializing untrusted YAML into live objects becomes RCE, and why
  `yaml.safe_load` / a schema is the fix.

## Key concepts
- **Parse, don't validate:** convert untrusted input to a typed object *once* at the boundary; the type then carries the invariant everywhere downstream.
- **pydantic v2 basics:** `BaseModel` + field types; `model_validate(raw)` returns a typed instance or raises `ValidationError`.
- **Domain rules as types:** constrained fields, `IPvAnyAddress`, enums, and `field_validator` make malformed records *unrepresentable* — not just flagged.
- **Reject-policy is a decision:** halt / quarantine / skip-and-log is your call; catch `ValidationError` where you can act on `.errors()`.
- **Secrets via `pydantic-settings`:** `BaseSettings` parses keys from the environment into a typed object; `SecretStr` keeps them out of logs and source.
- **Unsafe deserialization is the extreme case:** `yaml.load`/`pickle` build live objects from untrusted bytes — the same "trusted input" bug, escalated to RCE.

## AI acceleration

Point the copilot at the raw feed and it will confidently generate `.get("severity", "low")` soup that
trusts every field — this module *is* the lens for catching that. The move: write the spec for the typed
boundary (the fields, their constraints, the reject-policy), let the copilot draft the `Alert`/`Indicator`
models, then review the draft *against the spec* with two questions it usually gets wrong. **One:** did it
actually constrain the fields, or just annotate them (`ip: str` is not `ip: IPvAnyAddress`)? A type that
admits any string parses nothing. **Two:** does malformed input get *rejected*, or silently defaulted?
Have the copilot generate the adversarial fixtures too — a bad IP, a wrong-type severity, a missing
required field, an unexpected extra key — and confirm each raises `ValidationError` rather than
constructing a quietly-wrong `Alert`. The bug you catch here isn't in the happy path; it's in what the
model lets through.

!!! question "Check yourself"
    - Explain "parse, don't validate" in your own words: what does converting input to a typed `Alert` at
      the boundary buy you that scattering `if`-checks does not?
    - Why is `ip: str` with a manual regex weaker than `ip: IPvAnyAddress`, and where would the difference
      actually bite downstream?
    - Your feed has one malformed alert in ten thousand. What's your reject-policy, where do you catch the
      `ValidationError`, and why is "let it crash" the wrong default for a triage tool?
    - How is `yaml.load()` on untrusted input the *same* bug as trusting a raw alert dict — just escalated?
