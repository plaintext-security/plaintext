# Track 09 · Python for Security — redesign plan

*Design spine for re-architecting the Python track under the type-driven ("Verdict") model. Pairs with
[`AUTHORING.md`](../AUTHORING.md) and [`planning/MODULE-TYPE-LIBRARY.md`](MODULE-TYPE-LIBRARY.md). This
is an **approved plan, pre-build** — the modules and labs are authored from it; nothing here is shipped
yet.*

## TL;DR

Re-architect Track 09 from a near-beginner "learn Python" track into an **intermediate-plus
security-tooling-engineering** track that assumes the learner already writes Python *and* pairs with an
AI copilot. The whole track builds **one evolving artifact** — an alert enrichment-and-triage tool —
across **9 type-tagged modules**, each adding a real capability *and* targeting a bug-class the copilot
reliably ships. The re-architecture instantiates **all four systemic constructs** the redesign chases
(Eval Harness #13, Migration #12, ADR #11, Adversarial Review #14) plus **Red-team-the-AI #15** — turning
Python from "last and light" into a track that pulls the redesign's priorities forward.

## Why re-architect (the charter change)

The type pass judged Track 09 *"the most coherent build-track in the curriculum… the gaps are about
naming the eval/review constructs, not missing them,"* and the roadmap slated it **#12 (last), size S,
light retrofit**. That verdict is correct — *against the track's old charter:* "teach Python to a
near-beginner."

We are **changing the charter**: assume the learner already writes Python and works with a copilot.
Under that premise:

- **Roughly half the track is remedial.** Setup & idioms, files/regex, structured-data, CLI-basics — a
  fluent dev with a copilot writes all of that in seconds and never reads a module about it.
- **The useful modules sit at "first working draft" altitude.** Sync-only `httpx`, hand-rolled `.get()`
  defensiveness, `print()` instead of structured logs, `json.load()` into memory as if datasets are
  tiny, testing deferred to the very last module. Not wrong — *low-altitude.*
- **It never assumes the AI is actually there.** For a track whose thesis is "AI authors → you review →
  you own it," it teaches you to type the boilerplate the copilot already writes.

So this isn't contradicting the type pass — it **revises the premise the type pass accepted.** That is a
deliberate, higher-order decision, recorded here.

## Decisions (locked)

| Decision | Choice |
|---|---|
| **Altitude** | **Intermediate-plus** — assume comfortable Python (functions, classes, stdlib) *and* an AI copilot. Not a Python-basics track. |
| **Structure** | **Single evolving tool** — one artifact grown module by module into a portfolio centerpiece. |
| **Scope** | **Full re-architecture** (~9 dense modules), not a light retrofit. |
| **Spine tool** | **Alert enrichment-and-triage** — ingest a feed → validate → enrich (TI APIs) → score/triage → serve. |
| **Cut** | **Raw sockets / scapy** (covered in Foundations & Offensive); fold the network skill out of this track. |
| **AI boundary** | **Keep MCP; dedupe with Track 12.** ai-ops owns *operating and securing AI systems*; Python owns *building the tool well in Python* (and red-teaming the one it built). |
| **Roadmap** | **Re-baseline Python** from "#12 / light retrofit" to a **full conversion** (update `REDESIGN-ROADMAP.md` + `type-pass/09` on the redesign branch). |

## Editorial thesis (the track's new identity)

> You already write Python; the copilot writes the boilerplate. What's left is the real skill:
> **engineering security tooling that survives adversarial input, runs concurrently at scale, is typed,
> observable, and tested — and directing and catching the copilot where it reliably fails.**

Two things make it land, and both are things a copilot *doesn't* default to:

1. **A modern stack the copilot under-uses.** Copilots still reach for `pip`/`venv`, `requests`,
   `argparse`, `setup.py`, `.get()` soup, sync loops. The track standardizes the learner on **`uv` ·
   `ruff` · `pydantic v2` · `httpx` async · `pyright`/`ty` · `structlog` · `polars`/`duckdb` ·
   `hypothesis` · `pytest` · `pip-audit` · `FastAPI` · MCP · `instructor` · `pydantic-evals` · `huey`** — and gates them in CI.
2. **Each module targets a copilot failure-class.** Unvalidated input, races in concurrency, subtly-wrong
   types, `shell=True` injection, resource leaks, dependency risk, prompt injection. The whole track *is*
   reviewing the copilot at a higher level — the most on-brand way to honor "you review → you own it."

**Pydantic as the backbone (the through-line).** The spine is the Pydantic-native stack end to end:
`pydantic` validates untrusted **API input** (M2) → `pydantic-settings` handles config/secrets →
`instructor` validates untrusted **LLM output** (M7) → `pydantic-evals` **measures** the whole thing
(M9). One discipline — *parse, don't trust* — applied at the input edge, the AI edge, and the
measurement layer. That coherent, opinionated stack is a distinctive identity no other security
curriculum teaches as a spine.

## The module arc (type-tagged, anchored)

One artifact — the enrichment-and-triage tool — grown across nine modules, three phases. Types are from
`MODULE-TYPE-LIBRARY.md`; anchors are real and must be sourced/validated from `planning/SOURCES.md`
before authoring (marked **⟨anchor⟩** where still to be finalized).

### Phase 1 · Foundation & correctness

| # | Module | Type(s) | Anchor | Owned artifact |
|---|--------|---------|--------|----------------|
| 1 | Modern toolchain & project skeleton | **12 Migration** + **11 ADR** | ⟨a real PyPI dependency-confusion / typosquat incident, e.g. 2022 `torchtriton`⟩ | a legacy script migrated to a `uv`/`ruff`/`pyright` project + CI gate + a short toolchain ADR |
| 2 | Parse, don't validate (pydantic v2) | **9 Tool-Build** | ⟨a real unvalidated-input / unsafe-deserialization CVE⟩ | typed domain models that reject adversarial/malformed input at the boundary; `pydantic-settings` for secrets |
| 3 | Parsing & data at scale + structured logs | **9 Tool-Build** | ⟨a real large public alert/log dataset⟩ | a streaming parser + `polars`/`duckdb` triage queries + `structlog` JSON output |

### Phase 2 · Concurrency, integration, scale

| # | Module | Type(s) | Anchor | Owned artifact |
|---|--------|---------|--------|----------------|
| 4 | Async & structured concurrency (+ durable background work) | **7 Build-&-Operate** | rate-limited TI APIs / a thundering-herd outage | an async enricher with bounded concurrency, backoff, rate-limit handling — and the race the copilot introduced, caught; **plus a `huey` task-queue beat** for *durable, out-of-process* enrichment — async vs. a queue (in-process/ephemeral vs. durable/retryable) and when each wins. Forward-pointer: long-running stateful workflows graduate to durable execution (**Temporal**) in the Automation track |
| 5 | Driving real tools safely | **9 Tool-Build** + **14 Adversarial Review** beat | ⟨a real `shell=True` command-injection CVE class⟩ | safe `subprocess` wrappers (no `shell=True`) + robust parsers for nmap/VT/`pymisp` output |
| 6 | Two surfaces, one core | **7 Build-&-Operate** | the SOC need for tooling-as-a-service | a `typer` CLI **and** a `FastAPI` service sharing the same pydantic models |

### Phase 3 · Trust, AI-native, measure

| # | Module | Type(s) | Anchor | Owned artifact |
|---|--------|---------|--------|----------------|
| 7 | LLM-native Python & MCP | **9 Tool-Build** | the MCP tool ecosystem | an MCP server exposing the tool, with structured outputs + function-calling — **`instructor`** for typed LLM output, validated like an API response (the AI-edge twin of Module 2's input validation) |
| 8 | Red-team your own MCP server | **15 Red-team-the-AI** (+ #13) | ⟨Air Canada 2024 / the Chevy "$1 car" bot / agentic MCP tool-poisoning research⟩ | a working prompt-injection exploit against your own `enrich` tool + the eval that catches the regression |
| 9 | Eval harness, property tests & supply chain | **13 Eval Harness** + **14 Adversarial Review** | "you can't trust what you can't measure" + ⟨a real dependency incident⟩ | a held-out corpus + scorecard + CI regression gate built with **`pydantic-evals`** (the shared eval framework with Track 12 — Python evals *the tool*, ai-ops evals *the AI system*); `hypothesis` property tests fuzzing the validator; a `pip-audit`/lockfile-hash supply-chain gate |

### Capstone

The evolved tool — **typed, validated, async, served (CLI + API + MCP), property-tested, eval-gated,
supply-chain-audited, and red-teamed against itself.** The kind of repo that ends an interview, not one
that starts a tutorial. (Honor-system: the committed tool is the proof.)

## Systemic-construct payoff

This arc is not a detour from the redesign — it *advances* it. It instantiates **7 of the 16 types** and
**all four named systemic gaps**, at senior altitude, in the track best suited to teach them concretely:

- **Tool-Build #9** (the spine) · **Build-&-Operate #7**
- **Migration #12** (pip/venv/setup.py → uv project) · **ADR #11** (the toolchain/dependency decision)
- **Adversarial Review #14** (catch the copilot's `shell=True`, its wrong types) · **Eval Harness #13**
  ("pytest is your eval, not vibes" — the construct the whole AI-era curriculum is short on)
- **Red-team-the-AI #15** (attack the MCP server you built) — the roadmap's named Python fix
  ("09 → exercise Red-team-AI"), realized.

## Boundaries & dependencies

- **On-ramp:** Foundations Module 10 (Scripting & Automation) is the prerequisite floor; this track
  starts *above* it. Learners who don't yet write Python are routed back there.
- **Track 12 (AI-Augmented Ops) dedupe — the load-bearing boundary.** Python owns *building one
  trustworthy tool in Python* (the MCP server, the eval harness, the property tests). ai-ops owns
  *operating and securing AI systems* (RAG quality, SoC-copilot at volume, the broad red-team-the-AI
  capstone). The shared verbs (MCP, eval, prompt-injection) appear in both — Python teaches the *craft*;
  ai-ops teaches the *operation*. Cross-reference, don't duplicate.
- **Track 10 (Automation) dedupe.** Automation wires tools into IaC/CI/SOAR *pipelines*; Python builds
  *the tool the pipeline runs*. Keep enrichment-*pipeline* orchestration in Automation. A `huey` task queue is
  fair game in Python (the tool's own durable background work — Module 4); but **workflow orchestration /
  durable execution belongs to Automation.**
  - *Adjacent idea — flagged for Track 10's next pass:* **Temporal** as durable, human-in-the-loop
    **SOAR-as-code** — the long-running `enrich → approve → contain → ticket` response workflow that survives
    restarts, a code-first modern upgrade to the current Shuffle/n8n visual SOAR. Not in the Python track;
    parked here until the Automation track's pass picks it up.

## Open items / next steps (build)

1. **Source & validate anchors** from `planning/SOURCES.md` for the five ⟨anchor⟩ slots (dependency
   confusion, unvalidated-input CVE, large alert dataset, shell-injection CVE class, AI incidents).
   Resolve every `VALIDATE` before a module ships.
2. **Pick the real public alert/log dataset** that anchors the spine (it must be redistributable and
   large enough to make `polars`/`duckdb` and streaming earn their place).
3. **Author each module to its type's template** (`MODULE-TYPE-LIBRARY.md`), build-first per
   `AUTHORING.md` (these are build/measure types — no forced predict-then-reveal).
4. **Build & validate each lab** in `plaintext-labs/python-for-security/` — `make up`/`make demo` green
   on a Linux runner before the module counts as done; add `.ci-demo` only then.
5. **Re-baseline the roadmap:** update `REDESIGN-ROADMAP.md` (Python: #12/light → full conversion) and
   `type-pass/09-python-for-security.md` on the redesign branch to record the charter change and the new
   arc.
6. **Update the published track front-door** (`tracks/09-python-for-security/course.md` already reflects
   this design) and the `README.md` syllabus + `mkdocs.yml` nav at promotion.

## Caveats (the opinionated bets)

- **Ecosystem concentration.** Leaning the spine on the Pydantic ecosystem is a deliberate call.
  `AUTHORING.md` says "reach beyond one vendor where it proves the point is provider-agnostic" — so teach
  the *pattern* (typed boundaries, eval-as-code) as provider-agnostic, and present the Pydantic tools as
  the concrete (OSS, near-ubiquitous) instance, not the only way.
- **API churn.** `instructor`, `pydantic-ai`, and `pydantic-evals` are newer and still moving. Pin
  versions, teach the durable pattern, and note the API is evolving — the same treatment we give the MCP spec.

## Honesty note

This is a **design**, not a finished track. No module here is authored and no lab is validated yet; the
existing Track 09 modules remain live until this plan is built and promoted. A plan without validated
labs is half a track — the build (steps above) is the real work.
