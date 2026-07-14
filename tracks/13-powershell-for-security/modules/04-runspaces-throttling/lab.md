# Lab 04 — Concurrent Indicator Enrichment with `Invoke-VigilEnrichment`

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/04-runspaces-throttling/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, the cumulative
`Vigil` module (it keeps `Get-VigilEvent` from Module 01 and adds `Invoke-VigilEnrichment`), an offline
**snapshot** of the abuse.ch Feodo Tracker C2 blocklist, and a sample of events carrying destination IPs.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/04-runspaces-throttling
make up      # build the pwsh + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh with the Vigil module
make demo    # runs the gate: PSScriptAnalyzer + Pester over the module (offline)
make down    # stop when done
```

The lab runs **entirely offline and deterministic** — enrichment is against the bundled feed snapshot,
never the network — so the concurrency is reproducible and testable. It is reproducible at zero cost and
runs in the Linux container. A one-line switch (documented in step 8) points the same code at the live
Feodo Tracker feed.

## Scenario

`Vigil` now reads and normalizes Windows telemetry into typed `VigilEvent` objects (Modules 01–03). Those
events carry indicators — destination IPs on Sysmon network-connection events — and an analyst needs to
know which of them are known-bad. You're going to build the enrichment step: take the indicators, look
each up against a threat feed, and return which are malicious and what malware they're associated with.

The naive version is a `foreach` loop over a feed API — correct, and unusably slow at real volume. You're
going to build the *concurrent* version, and the whole difficulty is doing concurrency correctly in
PowerShell: fanning out without losing results to a race, without leaking runspace state, and without
hammering the feed into rate-limiting you. The anchor is a real feed — the
[abuse.ch Feodo Tracker](https://feodotracker.abuse.ch/) botnet C2 blocklist — frozen as a snapshot so the
lab is deterministic.

> Only test systems you own or have explicit written permission to test. Everything here runs locally in
> the lab container against a bundled feed snapshot; do not point the live-feed switch at any host you are
> not authorized to query, and respect abuse.ch's usage terms and rate limits if you do.

## Do

1. [ ] **Establish the sequential baseline.** Write (or have the copilot write) the obvious version first:
   a plain `foreach` over the indicators that looks each up in the feed. Time it. This is your correctness
   ground truth — the parallel version must return the *same set of results*, just faster.
2. [ ] **Pull the indicators off the events.** Load the sample events (`Get-VigilEvent` /
   `ConvertFrom-Json`) and project the destination IPs. Note that the input has **duplicates** — the same
   IP appears on more than one event. De-duplicate before you enrich: each unique indicator should be
   queried exactly once (the cheapest rate-limit win there is).
3. [ ] **Load the feed once, outside the loop.** Read the snapshot CSV
   (`data/feodo_ipblocklist.csv`) into an in-memory lookup keyed by IP — *before* any parallelism. Keep
   the feed read out of the per-indicator hot path; the parallel block should do pure lookups, not re-read
   the file.
4. [ ] **Fan out with `ForEach-Object -Parallel` — and get `$using:` right.** Convert the lookup to run in
   parallel with a bounded `-ThrottleLimit`. The trap: the parallel body is a *separate runspace* and
   can't see your feed table or result sink unless you reference them with `$using:`. Prove it — run it
   once *without* `$using:` and watch the feed come back empty (everything "clean"), then add `$using:` and
   watch the malicious hits reappear.
5. [ ] **Collect results thread-safe — reproduce the race.** First do it the copilot's way: append to a
   plain array with `+=` inside the parallel block, run it several times over the full indicator set, and
   record the result count each run. Watch it wobble (fewer than expected, non-deterministically). Now
   switch to a `[System.Collections.Concurrent.ConcurrentBag[pscustomobject]]` with `.Add()` and watch the
   count go constant. That reproducible difference is the deliverable's proof.
6. [ ] **Add retry with exponential backoff.** Wrap each lookup in a bounded retry loop (e.g. 3 attempts)
   that backs off exponentially (50ms → 100ms → 200ms) on a transient failure, and records the attempt
   count on the result. Against the snapshot it never faults — but the loop is the shape you keep when the
   lookup is a live HTTP call to a feed that can `429` or time out. Simulate a transient fault (fail the
   first attempt for one indicator) and prove it recovers on retry rather than failing the batch.
7. [ ] **Emit typed objects and make it deterministic.** Return one `[pscustomobject]` per unique
   indicator (`Indicator`, `Malicious`, `Malware`, `C2Status`, `Attempts`, …) — never a `Write-Host`'d
   string — and sort the output so runs are byte-stable. Add `[CmdletBinding()]`, `[OutputType]`,
   `ValidateRange` on `-ThrottleLimit`, and pipeline input for the indicators.
8. [ ] **Wire it into the gate, and document the live switch.** Get `Invoke-VigilEnrichment`
   `PSScriptAnalyzer`-clean and write `Pester` tests: emits objects, de-dups to the right count, flags
   exactly the malicious indicators, honors validation, and (the key one) *returns every result* — the
   count that the racy version couldn't hold. In the function's help, document the one-line switch to the
   live feed: `Invoke-RestMethod 'https://feodotracker.abuse.ch/downloads/ipblocklist.csv' | Set-Content
   feodo_live.csv` then point `-FeedPath` at it — network I/O stays *outside* the parallel body.
9. [ ] **Automate & own it.** Commit `Invoke-VigilEnrichment` into `Vigil` with its tests, the version
   bump, and the analyzer pass. In the PR, note what the copilot generated, which of the three traps it
   tripped ($using:, racy `+=`, unbounded throttle, or missing backoff), and the count-wobble evidence you
   used to prove the race was real.

## Success criteria — you're done when
- [ ] `Invoke-VigilEnrichment` enriches the sample indicators **concurrently** with a bounded `-ThrottleLimit`, and returns **one object per unique indicator** — the count is constant across repeated runs (the race is gone).
- [ ] It flags **exactly** the indicators present in the feed snapshot as malicious, with the malware family and C2 status attached, and does not flag benign IPs.
- [ ] You demonstrated the `$using:`-missing failure (feed empties) and the racy-`+=` failure (count wobbles), then fixed both.
- [ ] Each lookup retries with exponential backoff on a simulated transient fault and recovers, recording the attempt count.
- [ ] `PSScriptAnalyzer` is clean over the module and `Pester` tests pass, including the "returns every result" test; `make demo` is green **offline**.
- [ ] The live-feed switch is documented, and no network I/O lives inside the parallel block.

## Deliverables
`Invoke-VigilEnrichment` committed into the cumulative `Vigil` module — bounded concurrency, `$using:`
scoping, thread-safe `[ConcurrentBag]` collection, retry/backoff, typed output — plus its `Pester` tests
and the version bump. Commit the module and tests. Do **not** commit any live feed download, real event
exports beyond the bundled sample, or `.env`/secrets. The feed snapshot is the only feed data in the repo.

## AI acceleration
Have the copilot write the parallel enrichment from your spec, then review the *concurrency*, not the
enrichment. It will produce a `ForEach-Object -Parallel` loop that looks correct and trips at least one
silent trap — most often `$results += ...` inside the parallel block (races, drops results) and a missing
`$using:` on the feed variable (looks up against an empty table). Neither throws. The high-value catch is
exactly this class: code that runs, returns output, and is wrong in a way no error surfaces. Prove it with
the count-wobble test rather than by reading — reproducibility is the review technique here.

## Connects forward
`Invoke-VigilEnrichment` is the enrichment stage of the phase-2 pipeline: normalized events in, enriched
indicators out. Module 05 makes `Vigil` drive external binaries safely (no `Invoke-Expression`), and
Module 06 puts secrets (a real feed API key) behind `SecretManagement` and serves the hunt over a
constrained endpoint — at which point the throttle and backoff you built here become the difference
between a good API citizen and a blocked one. The thread-safe, bounded-concurrency muscle returns anywhere
`Vigil` fans work out: Module 07's MCP surface and Module 09's eval harness both run many things at once.

## Marketable proof
> "I build concurrent PowerShell enrichment that fans out over a runspace pool with a bounded throttle,
> retries with exponential backoff, and collects results thread-safe — so it enriches thousands of
> indicators against a threat feed fast, without dropping results to a race or getting rate-limited."

## Stretch (optional)
- Add **jitter** to the backoff (randomize the delay within the window) and explain, in a comment, why
  jitter prevents a thundering herd when many indicators fail at once.
- Point `-FeedPath` at a freshly downloaded *live* Feodo Tracker blocklist and enrich a larger real
  indicator set — then compare wall-clock time against the sequential baseline from step 1 and record the
  speedup.
- Swap the `ForEach-Object -Parallel` wrapper for a hand-built `[runspacefactory]::CreateRunspacePool()`
  that shares one initialized session state across runspaces, and note in an ADR-style comment when the
  lower-level pool is worth the extra code.
