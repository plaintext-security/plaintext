# Python for Security track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audited 2026-06-12 against the actual
**labs** (the real `lab.md` under `plaintext-labs/python-for-security/<module>/`), not just the
concept objectives. But note the framing inverts here (per the prompt): a Python-for-security
track is **build-oriented by nature** — every lab already ends in the learner writing a tool. So
the find-vs-build skew of the cloud/ZTNA audits barely applies. The honest question becomes:
**does each lab produce a genuinely owned, *verified* tool — or a guided transcription with weak
verification?***

## TL;DR

**This IS the build track — the frame mostly doesn't apply, and the track is in good shape.** All
ten module labs have the learner *write a real tool from scratch* (a log parser, an enrichment
client, a CLI, a port scanner, a scraper, a MISP workflow, an MCP server) and commit it, plus a
required *Automate & own it* extension that deepens it into a second owned artifact. The bridge
isn't "they only find, never build" — building is the whole point. The **one consistent soft spot
is verification rigor:** a cluster of mid-track labs (04, 06, 07) prove the tool works *only*
by **eyeballing it against the `make demo` reference output** ("do your top-5 IPs match?") rather
than by an executable test the learner writes and runs. The track clearly *knows* how to do better
— 02, 05, 09, and 10 already bake learner-written tests into the core Do-steps — so the fix is to
**propagate that existing pattern**, not invent it. Recommendation: surgical "add a real test /
assertion step" to ~4 labs (all promotable from existing stretch/structure — no new env), and a
*decision* on one genuinely-absent topic (concurrency/performance for scanners). No teardown.

## What "build & verify a real tool" means here

Not just "the learner types a script and it runs," but: the learner **writes** the tool *and*
**proves it works with something executable they own** — an `assert`, a `pytest` case, a
`CliRunner` invocation checking an exit code, a test that feeds the known-bad input and confirms
the bad path is closed. "Compare your output to `make demo`" is a *sanity check*, not verification:
it proves the learner's output matches a reference on the happy path, but it isn't a regression
test, it doesn't survive leaving the lab, and it doesn't go in the portfolio. The bar that 02/05/
09/10 already hit — *the learner commits a test that fails on the broken behavior and passes on
the fixed one* — is the bar; the audit is about where it's missing.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Builds + *verifies* a real tool? | Verdict |
|---|--------|-----------------|----------------------------------|---------|
| 01 | Setup & Security Idioms | audit `insecure.py`, **write `secure.py`** that passes ruff+bandit, write `setup.sh` | **yes** — verification is `ruff`/`bandit` exit-0 + CI workflow | **Balanced (proactive)** |
| 02 | Files, Regex & Log Parsing | **write `parse_log.py`** (regex→Counter→brute-force window) + **write `test_parser.py`** (pos/neg asserts) | **yes** — learner writes + runs the test | **Balanced (proactive)** |
| 03 | Structured Data & Reporting | **write `report.py`** (dedup→filter→CSV→rich), handle null/dupe edge cases | mostly — edge cases are *exercised* but verified by hand-count, no committed test | **Balanced**; could add an assert on the dedup count |
| 04 | HTTP & APIs for Enrichment | **write `enrich.py`** (httpx client, per-status handling, retry) + concurrent variant | **build yes / verify weak** — "run `make demo`… do the same IOCs come back?" is the only proof of the retry/verdict logic | **Add a real verification step** |
| 05 | Building CLI Tools | **write `ioc-check.py`** (typer, subcommands, validation) + **`test_cli.py`** via `CliRunner` (3 cases incl. exit-1) | **yes** — learner-written CLI tests | **Balanced (proactive)** |
| 06 | Network Programming | **write `scanner.py` + `sniffer.py`** (sockets, banner grab, scapy pcap) | **build yes / verify weak** — success = "counts… make sense" + diff vs `make demo`; no asserted check on OPEN/CLOSED or SYN/RST counts | **Add a real verification step** |
| 07 | Automating the Web | **write `scraper.py`** (httpx+bs4 crawl, regex path-find, hidden endpoint, off-host guard) | **build yes / verify weak** — "did you find every endpoint `make demo` did?"; the off-host/404 guards are asserted only in prose, not tested | **Add a real verification step** |
| 08 | Driving Security Tools | **write `workflow.py`** (pymisp event→attrs→enrich→tag) **+ `test_workflow.py`** mocking MISP/VT | **yes** — and the test is validated by turning the mock containers *off* (proves no network) | **Balanced (proactive)** |
| 09 | Building an MCP Server | **write `server.py`** (fastmcp tool, IP validation, error dicts) + extend with `enrich_hash` + edge-case test calls in `test_call.py` | **yes** — validation + 404 + invalid-input cases all checked via the test client | **Balanced (proactive)** |
| 10 | Packaging, Testing & Owning AI Code | **write failing `pytest` for each bug → fix → green**, package via `pyproject.toml` | **yes — the exemplar**: TDD over AI-generated code, ruff+bandit clean, installable | **Balanced (proactive)** |
| — | Capstone | build a genuinely useful tool + `pytest` (incl. failure modes) + AI-review write-up; rubric-graded | **yes** — tests incl. failure modes are an explicit rubric dimension | **Balanced (proactive)** |

**Tally:** ~7 balanced/proactive with real verification (01, 02, 05, 08, 09, 10, capstone) · **3
build-but-verify-weak that should gain a real verification step (04, 06, 07)** · 1 minor (03, one
asserted check away from full) · **0 "by design" pure** (there is no pure-concept primer here — even
01 ships a built artifact) · **0 find-only** (as expected; the inverted frame holds — nothing here
is audit-only). This is the most uniformly build-heavy track in the curriculum.

## The narrow skew: reference-diff is standing in for a test (04, 06, 07)

These three are *not* weak builds — each has the learner write a substantial, non-trivial tool. The
gap is narrow and identical across them: **the only "proof it works" is diffing against `make demo`'s
reference output**, which is a happy-path sanity check, not a committed, executable verification the
learner owns. The track already solved this elsewhere; promote that solution:

- **04 — assert the retry and the verdicts.** Today step 6 is "run `make demo`… did you handle the
  `429` the same way?" The whole *point* of the lab (retry on `429`, correct per-status verdicts) is
  verified by eyeball. Add a small `test_enrich.py` (the lab even bundles the two 429-IOCs and the
  malicious/clean IOCs deterministically) that asserts: the two rate-limited IOCs succeed on retry,
  a known-malicious IOC returns `verdict == malicious`, a 404 IOC returns `unknown`. Mirrors 02's
  pos/neg `test_parser.py`. **Promotable** — rests on the already-built mock-api env; no new
  scaffolding.
- **06 — assert OPEN/CLOSED and the handshake counts.** Today success is "the SYN/SYN-ACK/RST counts
  *make sense*." Add an assertion step: `scanner.py` returns OPEN for 22/80/443/8080 and CLOSED for
  9999 against the `target` container, and the `rdpcap()` pass asserts ≥1 SYN-ACK (open) and ≥1 RST
  (closed port 9999). The target's port set is fixed and known, so this is a deterministic check, not
  a sanity diff. **Promotable** — the echo-server target already exists.
- **07 — test the guards that the prose only asserts.** Today the off-host guard and 404-resilience
  are success-criteria checkboxes ("try embedding an external URL… confirm the scraper ignores it")
  done by hand. Promote to a committed `test_scraper.py`: `/internal/status` is in the link map, an
  injected off-host URL is *not* followed, a 404 page doesn't crash the crawl. **Promotable** — the
  Flask target app already ships the hidden endpoint.

Each fix touches the lab `lab.md` (Do-steps + success criteria, in `plaintext-labs`) and, lightly,
the module `README.md` (note the testing habit in *Key concepts*, in `plaintext`). None requires new
Docker scaffolding — every target/mock the test needs is already in the validated `make up` env, so
these are cheap and don't risk the "unvalidated lab = stub" trap. (03 is a half-step: add one
asserted dedup-count check and it joins the verified column — opportunistic, low priority.)

## Structural hole: concurrency / performance for security tools (a decision, not a default)

The track teaches parsing, HTTP, CLIs, sockets, scraping, tool-driving, MCP, and packaging/testing —
a complete "write your own tooling" arc. The one build-shaped subject that appears **only as
scattered *Automate & own it* addenda, never as a module**, is **making tools fast and concurrent at
scale**: 04 bolts on a `ThreadPoolExecutor` variant and 06 bolts on a `--rate-limit` flag, but
neither teaches the *model* — `asyncio`/`httpx.AsyncClient` for I/O-bound enrichment over thousands
of IOCs, bounded concurrency, rate-limit-aware backoff, and how to *measure* the speedup. For a
practitioner this is the difference between a script that enriches 20 IOCs and one that enriches a
feed of 50k without melting the API or the box — a real, daily, **almost-entirely-build** gap, and
the natural home for the async material the track currently sprinkles as stretch.

That said — **honestly, this is the weakest of the three audits' holes.** KMS (cloud) and workload
identity (ZTNA) were *missing NIST pillars*; concurrency here is more "a worthwhile module 11" than a
glaring absence, and the track is already long at 10 modules + capstone. It's a defensible *decision*
to add a **Module 11 — Concurrency & Performance for Security Tools** (async enrichment over a large
IOC feed against the existing mock-api, bounded `asyncio.Semaphore`, benchmark vs. the serial
version, prove correctness is preserved) — but "no new module; fold a stronger async treatment into
04's *Automate & own it*" is an equally valid call. Unlike the cloud/ZTNA holes, **don't treat this
as a must-fill.**

## Rebalance plan (sequenced, smallest-disruption first)

1. **04 — add a committed `test_enrich.py`** *(S, highest value/lowest disruption).* Assert retry
   success on the two 429-IOCs and correct verdicts for malicious/clean/404. **Promotable from the
   existing env** (deterministic mock-api already shipped) — no new validation scaffolding.
2. **07 — add a committed `test_scraper.py`** *(S).* Assert hidden-endpoint discovery, off-host
   guard, and 404 resilience — the guards currently checked by hand. **Promotable** (Flask target
   already ships the hidden endpoint and is validated).
3. **06 — add asserted port/handshake checks** *(S).* OPEN/CLOSED per the fixed target port set; ≥1
   SYN-ACK and ≥1 RST from the pcap. **Promotable** (echo-server target already exists). *Caveat:* if
   re-validating, confirm `scapy` capture works under the compose network in CI — the one spot in
   this track where a verification step could be flaky on a runner; keep the socket-level asserts as
   the gating check and the pcap counts as advisory if scapy is unreliable headless.
4. **03 — add one asserted dedup-count check** *(XS, opportunistic).* Turns the by-hand count into a
   committed assertion. **Promotable.**
5. **Module 11 — Concurrency & Performance for Security Tools** *(M–L, a decision — not a default).*
   async/`httpx.AsyncClient` enrichment over a large feed, bounded concurrency, benchmark + prove
   correctness preserved. **Needs new env scaffolding** (a larger IOC dataset + a rate-limiting mock,
   though it can extend the module-04 mock-api) **built and `make up`/`make demo`-validated** before
   it counts — and Docker may be unavailable in the authoring session, so treat as a follow-up that
   ships validated or not at all. **Confirm before building**; "fold into 04 instead" is acceptable.

Items 1–4 are all *promotions of a pattern the track already uses* (learner-written tests in 02/05/
08/09/10) onto the three labs that currently lean on reference-diff — cheap, no new Docker, low risk.
Item 5 is the only piece that needs new validated env, and it's optional.

## Non-goals / cautions

- **Don't overcorrect — this is the expected "the frame mostly doesn't apply" conclusion.** The
  track is build-by-nature and already strong; do **not** bolt extra builds onto labs that are fine,
  and do **not** manufacture a "find/audit" half that doesn't belong (there is no find-only lab to
  rebalance, unlike cloud/ZTNA). The entire fix is "make verification executable in 3–4 labs."
- **Reference-diff isn't worthless — keep it.** `make demo` as a *sanity check* is good pedagogy
  (the learner sees a working reference). The rec is to *add* a committed test alongside it, not
  replace it.
- Any change touches **both repos** (lab `lab.md` in `plaintext-labs`, light `README.md` note in
  `plaintext`) and must keep `mkdocs build --strict` green and ship a still-valid `make up`/`make
  demo`. Items 1–4 don't change the container images, so re-validation is light.
- **The capstone is the real verification backstop** — it already requires `pytest` covering failure
  modes as a rubric dimension. The per-lab fixes above just make sure the learner has *practiced*
  that habit in more than the four labs that currently demand it before they reach the capstone.
