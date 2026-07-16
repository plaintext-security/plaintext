# Module 03 — Data at Scale & Structured Logs

*Type 9 · Tool-Build — grow `sift` from a toy that reads one alert into a tool that streams a real, large feed, queries it with a columnar engine, and emits logs a SIEM can actually parse. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot's `json.load()` and `print()` work fine on 100 rows and fall over on a real `eve.json`.*

!!! abstract "In 60 seconds"
    A real Suricata `eve.json` doesn't fit in a list, and `print()` isn't a log. This module takes `sift`
    from "reads one validated alert" to "streams a large real EVE feed without blowing up memory, answers
    triage questions with `polars`/`duckdb` instead of hand-rolled loops, and emits `structlog` JSON that
    a SIEM can ingest." The copilot's reflex — `data = json.load(open(f))` then a `for` loop with
    `print()` — is a memory bomb and an unparseable log at scale. You'll swap it for streaming, columnar
    queries, and structured logging, and feel the difference on a real `eve.json` — the demo replays the
    capture to hundreds of thousands of events.

## Why this matters

The gap between a script that works in a demo and a tool that works in production is almost always
*scale* and *observability*. A Suricata `eve.json` over a busy capture is hundreds of thousands of
newline-delimited events; load it whole into a Python list of dicts and you'll exhaust memory before
you've triaged anything. And when `sift`
runs unattended in a pipeline, `print("processed alert")` tells you nothing — you can't search it,
correlate it, or alert on it. Structured JSON logs are the difference between "something went wrong last
night" and a queryable record of exactly what, when, and to which alert.

None of this is advanced Python — it's the altitude the copilot doesn't default to. Ask it to "process
this feed" and you'll get the in-memory load and the `print`. Knowing to reach for streaming, a columnar
engine, and `structlog` — and holding the generated code to that bar — is the module.

## The core idea

**Stream the parse; never load the whole feed.** A generator that yields one validated `AlertEvent` at a
time (building on Module 02's EVE models) keeps memory flat whether the `eve.json` is 100 lines or 100
million. The shape is simple — read line by line, validate, `yield` — but it's the difference between a
tool that scales and one that dies on a real capture. The copilot writes `json.load()`; you write the
generator.

**Push aggregation into a columnar engine.** Triage questions — "alert volume per hour," "top 20
`alert.signature` by count," "which `dest_ip` is the loudest talker" — are analytical queries, and Python
loops are the wrong tool for them. `polars` (lazy DataFrames) and `duckdb` (SQL directly over
CSV/Parquet/JSON files, no import step) do this in optimized, vectorized C, over data larger than memory.
A `duckdb` `SELECT alert.signature, count(*) FROM 'eve.json' GROUP BY alert.signature` replaces fifty
lines of hand-rolled counting — and runs faster on more data. (DuckDB reads the nested EVE JSON directly;
`alert.signature` is just a struct field access.)

**Logs are data, so structure them.** `structlog` turns `print("enriched " + ip)` into
`log.info("triaged", signature=sig, dest_ip=str(ip), verdict="malicious")` — a JSON event with fields
you can search, filter, and alert on. This is the observability half of "build-and-operate": a tool you
run in production needs logs you can query, not prose you have to grep. It's also the seam Track 02
(defensive) consumes — your structured logs are somebody's detection input.

??? note "polars or duckdb — which, when?"
    Reach for **`duckdb`** when the question is naturally SQL and the data lives in files (`SELECT`,
    `JOIN`, `GROUP BY` over CSV/Parquet you don't want to import). Reach for **`polars`** when you're
    transforming *within* Python — a typed, lazy DataFrame pipeline that fuses operations and spills to
    disk when it must. They interoperate (polars ↔ Arrow ↔ duckdb) freely; the point is that *either*
    beats a `for` loop with a `dict` counter on real data. Don't agonize — pick the one that fits the
    question and move.

## Learn (~2–3 hrs)

**Streaming & memory**

- [Python `itertools` and generator patterns (official docs)](https://docs.python.org/3/library/itertools.html)
  (~20 min) — the streaming primitives; skim `islice`, `chain`, and the generator idiom for line-at-a-time processing.

**Columnar engines (pick one to go deep, skim the other)**

- [Polars — "Getting started" + "Lazy API"](https://docs.pola.rs/) (~40 min) — why lazy frames scale and
  fuse; read the lazy-vs-eager section, it's the whole point.
- [DuckDB — "Querying files directly"](https://duckdb.org/docs/) (~30 min) — SQL over CSV/Parquet/JSON
  with no import step; read the `read_csv`/`read_json` and aggregation sections.

**Structured logging**

- [structlog — "Getting started"](https://www.structlog.org/en/stable/getting-started.html) (~25 min) —
  configure JSON output and bound context; this is the pattern every later `sift` module logs through.

**The spine dataset**

- The primary substrate is a **real `eve.json`** — Suricata (ET Open ruleset) run over the pinned
  Malware-Traffic-Analysis.net 2024-07-30 "You dirty rat!" RAT-infection PCAP; the lab's `make` step
  fetches, checksums, unzips, and runs Suricata to produce a large newline-delimited EVE feed. Every line
  is a genuine `alert`/`dns`/`http`/`tls`/`flow` event — big and messy enough that streaming and
  `duckdb`/`polars` genuinely earn their place. Provenance (URL, hash, Suricata version, ruleset) is
  recorded in the lab.

**Secondary / enrichment corpora (optional)**

- [Loghub (logpai) — real system-log corpora](https://github.com/logpai/loghub) (~10 min) — a
  **redistributable** enrichment corpus: 24 real log datasets (Thunderbird alone is ~30 GB), for when you
  want an even larger non-EVE stream to stress the same streaming/columnar patterns. Licensed **CC BY
  4.0** via its [Zenodo record](https://zenodo.org/records/8196385) — free to bundle and reuse with
  attribution.
- [abuse.ch URLhaus](https://urlhaus.abuse.ch/api/) (optional — an enrichment feed) — a live
  malicious-URL feed you can pull *at lab time* to enrich EVE `http.hostname`/`http.url` against known-bad
  URLs; its Fair-Use terms **prohibit redistribution** and require an Auth-Key, so point `sift` at it
  live, never bundle it.

## Key concepts
- **Stream, don't slurp** — a generator keeps memory flat on feeds of any size; `json.load()` doesn't.
- **Columnar beats loops** — `polars`/`duckdb` answer triage questions in vectorized C over out-of-memory data.
- **`duckdb` queries files in place** — SQL over CSV/Parquet with no import step.
- **`structlog` makes logs queryable** — JSON events with fields, not `print()` prose.
- **Your structured logs are someone's detection input** — the seam into the defensive track.

## AI acceleration
Have the copilot write the feed processor, then check it against the two things it reliably gets wrong at
scale: does it *stream* (a generator) or *slurp* (`json.load()` / `read().splitlines()`)? And does it log
*structured events* or `print()`? Point it at the real `eve.json` (or an even larger Loghub dataset), not
a 10-line sample, and the in-memory approach will announce itself by eating your RAM. The fix — streaming
+ a columnar query + a `structlog` config — is the reviewed increment you commit.

!!! question "Check yourself"
    - Why does `json.load(open("eve.json"))` fail on a large EVE feed when a generator doesn't?
    - Give a triage question over EVE — e.g. top 20 `alert.signature` by count — that's one line of
      `duckdb` SQL and twenty lines of hand-rolled Python.
    - What can you do with `log.info("triaged", signature=sig, dest_ip=str(ip), verdict=v)` that you can't
      with `print(f"triaged {sig}")`?
