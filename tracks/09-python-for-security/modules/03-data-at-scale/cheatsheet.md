# Cheat sheet — Data at Scale & Structured Logs

*Companion to [Module 03 — Data at Scale & Structured Logs](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Stream, don't slurp

```python
# The copilot's default — reads the WHOLE feed into memory (OOMs at scale):
data = json.load(open("feed.json"))          # a memory bomb on 10M rows
for line in open("feed.csv").read().splitlines():   # same trap, CSV flavour
    ...

# Stream instead: one line at a time, memory stays flat regardless of feed size.
def iter_alerts(path):
    with open(path) as f:
        for line in f:                       # the file object IS a lazy iterator
            row = line.rstrip("\n")
            if not row:
                continue
            yield Alert.model_validate_json(row)   # parse+validate one, yield, drop

for alert in iter_alerts("feed.jsonl"):      # process without ever holding it all
    triage(alert)
```

```python
from itertools import islice, chain

islice(iter_alerts(p), 20)          # first 20 without materializing the rest
chain(iter_alerts(a), iter_alerts(b))   # concatenate feeds lazily, no concat in RAM
```

## polars — lazy frames

```python
import polars as pl

# scan_* is LAZY (builds a plan); read_* is EAGER (loads now). Prefer scan at scale.
lf = pl.scan_csv("urlhaus.csv")              # nothing read yet — a query plan
(
    lf
    .filter(pl.col("threat") == "malware_download")
    .group_by("source")
    .agg(pl.len().alias("n"))                 # count rows per group
    .sort("n", descending=True)
    .head(20)
    .collect()                               # ← runs the fused plan, spills to disk if needed
)

pl.scan_parquet("out.parquet")               # Parquet scans even faster (columnar on disk)
lf.select(pl.col("url"), pl.col("date"))     # column projection — only reads what you use
```

## duckdb — SQL over files, no import

```python
import duckdb

# Query the file IN PLACE — no load step, no schema declaration.
duckdb.sql("SELECT * FROM 'urlhaus.csv' LIMIT 5").show()

duckdb.sql("""
    SELECT source, count(*) AS n
    FROM 'urlhaus.csv'                        -- CSV, Parquet, or JSON path works directly
    WHERE threat = 'malware_download'
    GROUP BY source
    ORDER BY n DESC
    LIMIT 20
""").pl()                                     # → polars DataFrame (.df() for pandas, .fetchall() for rows)

# read_csv_auto sniffs types/delimiter; use it when you need explicit control:
duckdb.sql("SELECT * FROM read_csv_auto('feed.csv', header=true)")
duckdb.sql("SELECT count(*) FROM read_json_auto('feed.jsonl')")

# Persist a triaged slice as Parquet, then query it back:
duckdb.sql("COPY (SELECT * FROM 'feed.csv' WHERE threat='x') TO 'out.parquet'")
```

## structlog — JSON events, not print()

```python
import logging, structlog

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),     # emit one JSON object per event
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
)

log = structlog.get_logger()

# Event name first, then key=value FIELDS — searchable, filterable, alertable:
log.info("triaged", indicator=ioc, verdict="malicious", source="urlhaus")
log.warning("parse_failed", line_no=n, error=str(e))

# Bind context once; every later line for this run carries it (correlate a whole run):
run = log.bind(run_id=uuid4().hex, feed="urlhaus")
run.info("ingest_start", path=path)
run.info("ingest_done", rows=count)          # → {..."run_id":"..","event":"ingest_done","rows":42}
```

## Gotchas worth remembering

- **Stream, don't slurp.** `json.load(open(f))` and `f.read().splitlines()` pull the entire feed into
  RAM — fine on 100 rows, an OOM on ten million. A generator that `yield`s one row keeps memory flat at
  any size. This is the scale bug the copilot ships by default.
- **Columnar beats loops.** A `dict` counter in a `for` loop is the wrong tool for "top 20 by count" —
  `polars`/`duckdb` do it in vectorized C, over data larger than memory. Reach for the engine before you
  hand-roll aggregation.
- **`scan_*` is lazy; `collect()` is where the work happens.** `pl.scan_csv(...)` only builds a plan —
  nothing reads until `.collect()`. `pl.read_csv` is eager and loads immediately; prefer `scan` so polars
  can fuse operations and push down filters/projections.
- **duckdb queries files in place.** `SELECT ... FROM 'feed.csv'` needs no import, no schema, no load —
  point SQL straight at CSV/Parquet/JSON. That's the whole speedup: it reads only the columns and rows the
  query touches.
- **structlog fields, not `print()`.** `log.info("enriched", indicator=ioc)` is a queryable JSON event;
  `print(f"enriched {ioc}")` is prose you have to grep. Pass data as `key=value` — never string-concatenate
  it into the message.
- **Your logs are someone's detection input.** The `structlog` JSON `sift` emits is exactly what Track 02
  parses and detects on. Stable event names and field keys aren't cosmetic — downstream detections bind to
  them, so treat your log schema as an interface.
