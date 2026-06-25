# Type pass — Track 09: Python for Security

Spine: **#9 Tool-Build** (build reusable security tools) + **#7 Build-&-Operate**, capped by **#14 Adversarial Review** (review AI code) and threaded with **#13 Eval Harness** (pytest as eval). This is the most coherent build-track in the curriculum — almost every module ships a runnable artifact, and the "AI authors → you review → you own it" stance is the explicit editorial identity. The type fits are strong; the gaps are about *naming* the eval/review constructs earlier rather than missing them.

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Setup & Security Idioms | 8 Judgment-as-Code / Gate | 2 Misconception Reveal | ✓ | `bandit`/`ruff` as the first gate; "AI writes `shell=True`, the linter catches it" is a clean predict-then-reveal. Lightest-weight module — fine as a foundation. |
| 02 Files, Regex & Log Parsing | 9 Tool-Build | 13 Eval Harness | ✓ | Build a log parser; the "verify on positive *and* negative cases" discipline is latent eval-harness — name it. |
| 03 Structured Data & Reporting | 9 Tool-Build | 7 Build-&-Operate | ✓ | JSON→CSV→`rich` pipeline; dedup-by-fingerprint is a real reusable pattern. Solid. |
| 04 HTTP & APIs for Enrichment | 7 Build-&-Operate | 9 Tool-Build | ✓ | Enrichment client with retry/backoff/rate-limit handling — operate-grade, not just a demo. The error-path focus is the right altitude. |
| 05 Building CLI Tools | 9 Tool-Build | — | ✓ | The archetypal Tool-Build: flags, `--help`, exit codes, subcommands, composability. Exactly on-type. |
| 06 Network Programming | 9 Tool-Build | 1 Concept Autopsy | ✓ | Port scanner + scapy; "understand the wire" leans concept but lands in a built tool. Authorization note present. |
| 07 Automating the Web | 9 Tool-Build | 7 Build-&-Operate | ✓ | Scraper with scope/session handling; the scope-limit safety check is the lesson. Authorization note present. |
| 08 Driving Security Tools | 7 Build-&-Operate | 9 Tool-Build | ✓ | Wrapping MISP/VT — operate an integration. Human-in-the-loop gate is the judgment beat. |
| 09 Building an MCP Server | 9 Tool-Build | 15 Red-team-the-AI | ⚠ | Builds the MCP tool well, but prompt-injection / untrusted-tool-arg risk is raised in prose and never *exercised*. A predict-then-reveal injection attempt (type 15) would close it. |
| 10 Packaging, Testing & Owning AI Code | 14 Adversarial Review | 13 Eval Harness | ✓ | The flagship: given deliberately-flawed AI code, catch the bugs, write `pytest` that pins each, fix. Best-realized type-14 module in the curriculum. |

## Coverage gaps

- **#13 Eval Harness is everywhere-latent, named-nowhere.** Modules 02 (parser vs corpus), 04 (client vs 429/503/404 sequence), and 10 (tests-as-spec) all *do* eval-harness work but frame it as "testing." The track would be stronger if one module explicitly taught **pytest-as-eval against a corpus** — a held-out set of log lines / IOC responses + a scorecard + a regression gate — so the construct is owned, not stumbled into. Module 10 is the natural home (or a dedicated module; see additions).
- **#15 Red-team-the-AI is raised but never run.** Module 09 *describes* prompt injection and untrusted tool args as the MCP trust boundary, then stops. For a 2026 Python track whose capstone is an MCP server, the learner should actually *attack* their own tool (inject via a poisoned data field, watch the LLM call `block_ip`) and add an eval that catches the regression. Currently advisory-only.
- **#11 Decision / ADR — minor.** Module 05 presents `argparse` vs `typer` and 04 presents `httpx` vs `requests` as settled defaults rather than defended choices. Not a real gap (the track is rightly opinionated for beginners), but one small "defend your dependency choice" ADR beat would introduce the construct the automation/ztna tracks lean on.
- **#16 Drift — n/a, correctly absent.** A tooling track doesn't operate-over-time; no gap.

## Suggested additions

1. **Eval Harness for security tools (#13)** — *highest value.* A dedicated module (or a hard split of module 10) that builds a **test corpus + scorecard + regression gate** for a non-deterministic tool: feed the log parser a labelled corpus of real + malformed lines, measure precision/recall, fail CI on regression. This is the construct the whole AI-era curriculum is short on, and a Python track is the ideal place to teach it concretely as "pytest is your eval, not vibes." Ships a reusable harness.

2. **Red-team your own MCP server (#15 + #13)** — pair with module 09. The learner prompt-injects their `enrich_ip` server via a poisoned threat-intel response field, demonstrates the LLM being steered into an unintended tool call, then writes an eval/guardrail that blocks it. Turns the prose's "treat every tool arg as untrusted" into a worked exploit-plus-regression-test — exactly the type-15 shape the capstone implies but never validates.

3. *(optional)* **Async & concurrency for security tooling (#7)** — module 04 mentions `httpx` async ("enrich 1000 IOCs in parallel") but the track never builds it. A small Build-&-Operate module on `asyncio`/`httpx.AsyncClient` with bounded concurrency and rate-limit-aware semaphores would round out the "operate at scale" claim. Lower priority — only if the track wants the scale story made real.
