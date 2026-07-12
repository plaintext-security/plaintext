# Module 03 — Data at Scale & Structured Logs

*Type 9 · Tool-Build — grow `sift` from a toy that reads one alert into a tool that streams a real, large feed, queries it with a columnar engine, and emits logs a SIEM can actually parse. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot's `json.load()` and `print()` work fine on 100 rows and fall over on ten million.*

!!! abstract "In 60 seconds"
    Real alert and log feeds don't fit in a list, and `print()` isn't a log. This module takes `sift`
    from "reads one validated alert" to "streams a large public feed without blowing up memory, answers
    triage questions with `polars`/`duckdb` instead of hand-rolled loops, and emits `structlog` JSON that
    a SIEM can ingest." The copilot's reflex — `data = json.load(open(f))` then a `for` loop with
    `print()` — is a memory bomb and an unparseable log at scale. You'll swap it for streaming, columnar
    queries, and structured logging, and feel the difference on a feed with millions of rows.

## Why this matters

The gap between a script that works in a demo and a tool that works in production is almost always
*scale* and *observability*. A threat feed like abuse.ch's URLhaus is millions of rows; load it whole
into a Python list of dicts and you'll exhaust memory before you've triaged anything. And when `sift`
runs unattended in a pipeline, `print("processed alert")` tells you nothing — you can't search it,
correlate it, or alert on it. Structured JSON logs are the difference between "something went wrong last
night" and a queryable record of exactly what, when, and to which alert.

None of this is advanced Python — it's the altitude the copilot doesn't default to. Ask it to "process
this feed" and you'll get the in-memory load and the `print`. Knowing to reach for streaming, a columnar
engine, and `structlog` — and holding the generated code to that bar — is the module.

## The core idea

**Stream the parse; never load the whole feed.** A generator that yields one validated `Alert` at a time
(building on Module 02's models) keeps memory flat whether the feed is 100 rows or 100 million. The shape
is simple — read line by line, parse, `yield` — but it's the difference between a tool that scales and
one that dies on real data. The copilot writes `json.load()`; you write the generator.

**Push aggregation into a columnar engine.** Triage questions — "how many alerts per source in the last
hour," "top 20 indicators by frequency" — are analytical queries, and Python loops are the wrong tool for
them. `polars` (lazy DataFrames) and `duckdb` (SQL directly over CSV/Parquet/JSON files, no import step)
do this in optimized, vectorized C, over data larger than memory. A `duckdb` `SELECT ... FROM 'feed.csv'
GROUP BY source` replaces fifty lines of hand-rolled counting — and runs faster on more data.

**Logs are data, so structure them.** `structlog` turns `print("enriched " + ioc)` into
`log.info("enriched", indicator=ioc, verdict="malicious", source="urlhaus")` — a JSON event with fields
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

- [abuse.ch URLhaus — full dataset / API](https://urlhaus.abuse.ch/api/) (~10 min) — the real
  malicious-URL feed `sift` triages; the full CSV dump regenerates every 5 minutes. Note it's abuse.ch
  **Fair Use** terms (free, but the full dump now needs a registered Auth-Key), not a public-domain
  license — respect that when you redistribute.

## Key concepts
- **Stream, don't slurp** — a generator keeps memory flat on feeds of any size; `json.load()` doesn't.
- **Columnar beats loops** — `polars`/`duckdb` answer triage questions in vectorized C over out-of-memory data.
- **`duckdb` queries files in place** — SQL over CSV/Parquet with no import step.
- **`structlog` makes logs queryable** — JSON events with fields, not `print()` prose.
- **Your structured logs are someone's detection input** — the seam into the defensive track.

## AI acceleration
Have the copilot write the feed processor, then check it against the two things it reliably gets wrong at
scale: does it *stream* (a generator) or *slurp* (`json.load()` / `read().splitlines()`)? And does it log
*structured events* or `print()`? Point it at the real URLhaus dump, not a 10-row sample, and the
in-memory approach will announce itself by eating your RAM. The fix — streaming + a columnar query + a
`structlog` config — is the reviewed increment you commit.

!!! question "Check yourself"
    - Why does `json.load(open(feed))` fail on a 10-million-row feed when a generator doesn't?
    - Give a triage question that's one line of `duckdb` SQL and twenty lines of hand-rolled Python.
    - What can you do with `log.info("enriched", indicator=ioc, verdict=v)` that you can't with
      `print(f"enriched {ioc}")`?
