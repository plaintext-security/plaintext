# Python for Security — Course Overview

> **You already write Python. The copilot writes the boilerplate.** What's left is the real skill:
> engineering security tooling you'd actually deploy — typed, concurrent, validated, served, tested,
> and AI-reviewed. You'll build *one* tool the whole way through and own every line.

| | |
|---|---|
| **Level** | Intermediate — assumes working Python *and* that you pair with an AI copilot |
| **Format** | Self-paced · hands-on · one evolving tool, grown module by module |
| **Shape** | 9 modules · 3 phases · 1 portfolio-grade capstone tool |
| **Prerequisites** | Comfortable Python (functions, classes, stdlib) · Foundations Module 10 |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

Not "learn Python." You know Python. This course is about building a **real alert enrichment-and-triage
tool** — from a modern project skeleton to a typed, async, served, eval-gated, self-attacked artifact —
at the altitude a security engineer actually works. The copilot drafts; your job is the judgment it
can't have: rejecting adversarial input, getting concurrency right, measuring instead of trusting, and
catching the bug the model confidently shipped.

## What you'll be able to do

- Stand up a modern Python project (`uv` · `ruff` · `pyright`) with types and lint **gated in CI**.
- Model every external input with **pydantic** so malformed or adversarial data dies at the boundary.
- Enrich at scale with **async concurrency**, bounded parallelism, backoff, and rate-limit handling.
- Ship the same core as a **CLI and a FastAPI service**, and expose it to an LLM over **MCP**.
- Prove it: **property-based tests**, an **eval harness with a regression gate**, and a supply-chain
  audit — then **red-team your own MCP server** and watch it break.

## How it's taught

Build-first, one evolving artifact. Each module adds a real capability **and** targets a bug-class the
copilot reliably gets wrong — unvalidated input, race conditions, shell injection, prompt injection,
dependency risk. You direct the model and review every line. The standing posture: **AI authors → you
review → you own it** — made into a daily habit, not a slogan.

No grading, no certificate. **Your repo is the credential** — the tool you commit is the proof.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Foundation & correctness** | Modern toolchain & project skeleton · Parse, don't validate (pydantic) · Parsing & data at scale | A typed, CI-gated project that validates and triages real alert data at scale |
| **2 · Concurrency, integration, scale** | Async & structured concurrency · Driving real tools safely · Two surfaces, one core | An async enricher served as both a CLI and a FastAPI service |
| **3 · Trust, AI-native, measure** | LLM-native Python & MCP · Red-team your own MCP server · Eval harness, property tests & supply-chain | A measured, hardened tool you've attacked yourself and proven holds |

## Hands-on

One tool, grown across nine labs on **real public alert/log datasets** and rate-limited mock
threat-intel APIs. Every lab is a build step on the same artifact — and every AI-drafted line goes
through your review before it lands.

## What you'll walk away with

A **portfolio-grade enrichment-and-triage tool**: typed, validated, async, served (CLI + API + MCP),
property-tested, eval-gated, supply-chain-audited, and red-teamed against itself. The kind of repo that
ends an interview, not one that starts a tutorial.

## Who it's for

People who already write Python and want to build security tooling they'd actually deploy. If you're
new to Python, start with **[Foundations → Module 10 (Scripting & Automation)](../00-foundations/modules/10-scripting/README.md)** and come back.

---

*This track is being rebuilt to the design above; the full module list may still show the previous version.*

**Ready?** [See the full syllabus →](README.md)
