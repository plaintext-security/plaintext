# Module 04 — Enrichment with Runspaces & Throttling

*Type 7 · Build-&-Operate — ship a working piece of the pipeline and run it: concurrent indicator enrichment against a live-shaped threat feed, with bounded parallelism, retry/backoff, and no shared-state races. The anchor isn't a breach — it's the toil of enriching thousands of indicators one at a time. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot writes the parallel loop in seconds; your edge is that it actually returns every result, respects a rate limit, and survives a flaky API.*

!!! abstract "In 60 seconds"
    You have thousands of indicators (IPs, hashes, URLs) pulled off your normalized events, and you
    need to enrich each against a threat feed. Sequentially that's a coffee break; concurrently it's a
    second — *if* you get the concurrency right. This module builds `Invoke-VigilEnrichment`: enrich
    indicators in parallel with `ForEach-Object -Parallel`, bounded by a `-ThrottleLimit` so you don't
    flood the feed API, wrapped in retry-with-backoff so a transient failure retries instead of poisoning
    the run, and collecting results in a **thread-safe** structure so nothing gets silently dropped. The
    anchor is a real feed — the [abuse.ch Feodo Tracker](https://feodotracker.abuse.ch/) botnet C2
    blocklist — which the lab ships as an offline snapshot so `make demo` is deterministic. The copilot
    will write you a parallel loop that *looks* right and quietly loses half its results; catching that is
    the whole module.

## Why this matters

Enrichment is the step that turns "an IP appeared in a log" into "that IP is a known Emotet C2, first
seen last month, still online." It's also the step where the naive version — a `foreach` loop calling a
feed API once per indicator — falls over at scale: ten thousand indicators at 200ms each is over half an
hour of wall-clock time, most of it spent waiting on the network. The obvious fix is to parallelise, and
PowerShell 7 makes that a one-flag change (`ForEach-Object -Parallel`). But parallelism in PowerShell is
a minefield the copilot walks straight into: the parallel body is a *separate runspace* that can't see
your variables unless you scope them with `$using:`; appending results to a plain array with `+=` races
across threads and silently drops results; and firing all ten thousand lookups at once gets you
rate-limited or IP-banned by the very feed you're trying to query.

None of these fail loudly. A racy `+=` doesn't throw — it just returns 6,000 results where you expected
9,000, and you won't notice until an analyst asks why a known-bad IP wasn't flagged. That's the specific
danger of concurrency bugs: they're *plausible*. The code runs, produces output, and is wrong in a way no
error message tells you about. This module is about building the concurrent path so it's *correct under
load* — bounded, retrying, thread-safe — and knowing exactly which lines of the copilot's parallel loop
to distrust.

## Objective

Build `Invoke-VigilEnrichment`: an advanced function that takes indicators from `VigilEvent` objects and
enriches each against a threat feed **concurrently**, with a configurable `-ThrottleLimit` bounding
parallelism, **retry with exponential backoff** per lookup, and a **thread-safe** result collection that
loses nothing. Prove it emits typed objects, de-duplicates its input, and honors the throttle — and run
it entirely offline against a bundled feed snapshot, with a documented one-line switch to the live feed.

## The core idea

**Parallelism in PowerShell 7 is one flag and three traps.** The flag is
`ForEach-Object -Parallel { ... } -ThrottleLimit N`: it runs the scriptblock across a pool of runspaces,
at most `N` at a time. That `-ThrottleLimit` is not a performance knob you tune for speed — it's a
*politeness contract* with whatever you're calling. A threat feed's API has a rate limit; unbounded
parallelism (or `-ThrottleLimit` cranked to the input size) is how you turn "enrich my indicators" into
"get my IP blocked by abuse.ch." Pick a throttle that respects the feed's documented limit and leave it
bounded. The three traps: (1) the parallel scriptblock is a **fresh runspace** with no access to your
outer variables — reference them with `$using:varName` or they're `$null`; (2) collecting results into a
normal array with `+=` is a **read-modify-write race** across threads that drops results non-
deterministically — use a thread-safe collection like `[System.Collections.Concurrent.ConcurrentBag[T]]`
and `.Add()`; (3) anything you mutate in shared state (a counter, a cache) is subject to the same race.

**The correct shape: load once, fan out, collect thread-safe, retry each.** Do the expensive, shared
work — loading the feed into a lookup table — *once*, on the calling thread, before the parallel block.
De-duplicate the indicators so each unique one is queried exactly once (the cheapest rate-limit win there
is). Then fan out: inside `-Parallel`, pull the shared feed and the result sink in with `$using:`, and
have each iteration `.Add()` its result to the `ConcurrentBag`. Wrap the per-indicator lookup in a
bounded retry loop with **exponential backoff** — first retry after 50ms, then 100, then 200 — so a
transient `429 Too Many Requests` or a dropped connection retries a few times before giving up, rather
than either failing the whole batch or hammering the API instantly. Backoff is what separates a
production enricher from a script that works on the demo and melts on the real feed.

**Keep the network out of the hot loop, and out of the test.** The feed is I/O; your enrichment logic is
not. Load the feed once (one network call, or in the lab, one CSV read) into an in-memory structure, and
let the parallel block do pure lookups against it. That's faster (no per-indicator round trip for data
you could fetch in bulk), it makes the throttle meaningful (you're bounding the *lookups you can't
batch*, not re-downloading the feed nine thousand times), and — critically — it makes the whole thing
**testable offline and deterministic**. The lab ships a frozen snapshot of the Feodo Tracker blocklist;
`make demo` enriches against it with zero network, and the same code points at the live feed by swapping
one path. A concurrency function you can only test against a live, rate-limited, changing API is a
function you can't actually test.

??? note "`ForEach-Object -Parallel` vs a raw runspace pool — when to reach lower"
    `ForEach-Object -Parallel` (PowerShell 7+) is a friendly wrapper over a **runspace pool**, and it's
    the right default: it handles pool creation, throttling, and result marshalling for you. Reach for a
    hand-built `[runspacefactory]::CreateRunspacePool()` only when you need something the wrapper doesn't
    give you — sharing one initialized session state across all runspaces (e.g. a pre-imported module or a
    single reused HTTP client), fine-grained control over `BeginInvoke`/`EndInvoke`, or a long-lived pool
    you feed work over time. For fan-out-enrich-collect, the wrapper is enough; the cheat sheet shows the
    raw pool so you recognize it in older code and know what the wrapper is doing underneath. Note also
    that `-Parallel` runspaces don't share the parent's loaded modules by default — if the body needs a
    cmdlet from a module, import it inside the block or accept the startup cost.

## Learn (~2–3 hrs)

**The concurrency primitives (do these first — they replace the copilot's naive loop)**

- [Microsoft Learn — `ForEach-Object` (read the `-Parallel` and `-ThrottleLimit` sections)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/foreach-object) (~25 min)
  — the canonical reference for the flag this module is built on; read specifically how `-Parallel` runs
  a scriptblock in separate runspaces and why `$using:` is mandatory to reach outer variables.
- ["PowerShell ForEach-Object Parallel" — Microsoft PowerShell team blog (Jack Franklin/Staffan Gustafsson)](https://devblogs.microsoft.com/powershell/powershell-foreach-object-parallel-feature/) (~20 min)
  — the announcement/design post: the runspace model, the `$using:` scoping rule, and the explicit
  warning that variables are *copied* into the runspace, not shared. This is the primary source for the
  `$using:` gotcha.
- [.NET docs — `System.Collections.Concurrent.ConcurrentBag<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentbag-1) (~15 min)
  — why a thread-safe collection exists and how `.Add()` is safe from many threads; skim the "Thread
  Safety" remarks. This is the fix for the racy-`+=` trap.

**Retry, backoff, and rate limits (the operate half)**

- [MDN — "429 Too Many Requests" and the `Retry-After` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) (~10 min)
  — what a rate-limited API actually returns and why exponential backoff (not instant retry) is the
  correct response. Short, but it's the *why* behind the backoff loop.
- ["AWS Architecture Blog — Exponential Backoff And Jitter"](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) (~15 min)
  — the definitive short read on why backoff needs to grow and why adding jitter prevents a thundering
  herd; the concept is client-agnostic and applies directly to a throttled enricher.

**The anchor (the real feed you enrich against)**

- [abuse.ch — Feodo Tracker (the project overview)](https://feodotracker.abuse.ch/) (~10 min)
  — the free feed this lab uses: botnet C2 servers for Dridex, Emotet, TrickBot, QakBot, and BazarLoader.
  Read what the blocklist contains and how the CSV is structured (`first_seen_utc,dst_ip,dst_port,c2_status,last_online,malware`).
- [Cloudbrothers — "Automated response to C2 traffic on your devices"](https://cloudbrothers.info/en/automated-response-c2-traffic-devices/) (~15 min)
  — a real-world walkthrough of consuming the Feodo Tracker blocklist to act on C2 traffic; grounds *why*
  you enrich indicators against this feed at all, beyond the mechanics.

## Key concepts
- **`ForEach-Object -Parallel -ThrottleLimit N`** runs the body in separate runspaces, at most `N` at once — the throttle is a politeness contract with the API, not just a speed dial.
- **`$using:var` is mandatory** to read an outer-scope variable inside `-Parallel`; without it the variable is `$null`.
- **`+=` on a plain array races** across threads and silently drops results — collect with a thread-safe `[ConcurrentBag[T]]` and `.Add()`.
- **Retry with exponential backoff** per lookup so a transient `429`/timeout retries instead of failing the batch or hammering the feed.
- **Load the feed once, fan out over lookups** — keep network I/O out of the parallel hot loop; de-dup input so each indicator is queried once.
- **Deterministic and offline-testable** — enrich against a snapshot in tests; swap one path for the live feed in production.

## AI acceleration

Ask a copilot to "enrich these IPs against a threat feed in parallel in PowerShell" and you'll get a
`ForEach-Object -Parallel` loop that trips at least one of the three traps — most often the racy result
collection (`$results += ...` inside the parallel block) and a missing `$using:` on the feed variable.
Both are *silent*: the code runs and returns *some* results, so a happy-path glance passes it. Your job is
to review the concurrency, not the enrichment. The tells to check, every time: does the parallel body
reference outer variables through `$using:` (or are they mysteriously empty)? are results collected in a
thread-safe structure, or appended to an array that races? is `-ThrottleLimit` bounded to something that
respects the feed's rate limit, or is it unset/set to the input size (unbounded)? is each lookup wrapped
in bounded retry, or does one transient failure take down the batch? The way to *prove* the race is real:
run the naive version over a few thousand indicators several times and watch the result count wobble —
then run yours and watch it stay constant. That reproducible count difference is the whole lesson.

!!! question "Check yourself"
    - Why does `$results += $x` inside `ForEach-Object -Parallel` lose results, and what specifically
      makes a `[ConcurrentBag[T]]` safe where the array is not?
    - What is `-ThrottleLimit` actually protecting — your machine, or the feed you're calling? What
      happens if you set it to the number of indicators?
    - Why load the feed once before the parallel block instead of fetching it inside each iteration —
      name both the performance and the correctness reasons.
