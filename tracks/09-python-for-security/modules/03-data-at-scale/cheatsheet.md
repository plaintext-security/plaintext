---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Data at Scale & Structured Logs

*Companion to [Module 03 — Data at Scale & Structured Logs](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Stream, don't slurp

```python
# The copilot's default — reads the WHOLE feed into memory (OOMs at scale):
data = json.load(open("eve.json"))           # a memory bomb on a real capture
for line in open("eve.json").read().splitlines():   # same trap, line-buffered flavour
    ...

# Stream instead: one line at a time, memory stays flat regardless of feed size.
def iter_alerts(path):
    with open(path) as f:
        for line in f:                       # the file object IS a lazy iterator
            row = line.rstrip("\n")
            if not row:
                continue
            yield AlertEvent.model_validate_json(row)   # parse+validate one EVE line, yield, drop

for alert in iter_alerts("eve.json"):        # process the real feed without ever holding it all
    triage(alert)
```

```python
from itertools import islice, chain

islice(iter_alerts(p), 20)          # first 20 without materializing the rest
chain(iter_alerts(a), iter_alerts(b))   # concatenate two eve.json feeds lazily, no concat in RAM
```

## polars — lazy frames

```python
import polars as pl

# scan_* is LAZY (builds a plan); read_* is EAGER (loads now). Prefer scan at scale.
lf = pl.scan_ndjson("eve.json")              # nothing read yet — a query plan over the EVE feed
(
    lf
    .filter(pl.col("event_type") == "alert")
    .group_by(pl.col("alert").struct.field("signature"))   # nested EVE field
    .agg(pl.len().alias("n"))                 # count alerts per signature
    .sort("n", descending=True)
    .head(20)                                 # top 20 alert.signature by count
    .collect()                               # ← runs the fused plan, spills to disk if needed
)

pl.scan_parquet("out.parquet")               # Parquet scans even faster (columnar on disk)
lf.select(pl.col("timestamp"), pl.col("dest_ip"))   # column projection — only reads what you use
```

## duckdb — SQL over files, no import

```python
import duckdb

# Query the EVE file IN PLACE — no load step; duckdb reads nested JSON and dots into structs.
duckdb.sql("SELECT * FROM 'eve.json' LIMIT 5").show()

# Top 20 alert.signature by count — one SQL statement over the raw feed:
duckdb.sql("""
    SELECT alert.signature AS signature, count(*) AS n
    FROM 'eve.json'                           -- newline-delimited EVE JSON, read directly
    WHERE event_type = 'alert'
    GROUP BY signature
    ORDER BY n DESC
    LIMIT 20
""").pl()                                     # → polars DataFrame (.df() for pandas, .fetchall() for rows)

# Loudest-talker dest_ip, and per-hour alert volume from the timestamp:
duckdb.sql("SELECT dest_ip, count(*) n FROM 'eve.json' WHERE event_type='alert' GROUP BY dest_ip ORDER BY n DESC LIMIT 20")
duckdb.sql("SELECT date_trunc('hour', timestamp::TIMESTAMP) hr, count(*) n FROM 'eve.json' WHERE event_type='alert' GROUP BY hr ORDER BY hr")

# read_json_auto sniffs the schema; use it when you need explicit control:
duckdb.sql("SELECT count(*) FROM read_json_auto('eve.json')")

# Persist a triaged slice as Parquet, then query it back:
duckdb.sql("COPY (SELECT * FROM 'eve.json' WHERE event_type='alert') TO 'out.parquet'")
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
log.info("triaged", signature=sig, dest_ip=str(dest_ip), verdict="malicious")
log.warning("parse_failed", line_no=n, error=str(e))

# Bind context once; every later line for this run carries it (correlate a whole run):
run = log.bind(run_id=uuid4().hex, feed="eve.json")
run.info("ingest_start", path=path)
run.info("ingest_done", rows=count)          # → {..."run_id":"..","event":"ingest_done","rows":42}
```

## Gotchas worth remembering

- **Stream, don't slurp.** `json.load(open("eve.json"))` and `f.read().splitlines()` pull the entire feed
  into RAM — fine on 100 lines, an OOM on a real capture. A generator that `yield`s one validated line
  keeps memory flat at any size. This is the scale bug the copilot ships by default.
- **Columnar beats loops.** A `dict` counter in a `for` loop is the wrong tool for "top 20
  `alert.signature` by count" — `polars`/`duckdb` do it in vectorized C, over data larger than memory.
  Reach for the engine before you hand-roll aggregation.
- **`scan_*` is lazy; `collect()` is where the work happens.** `pl.scan_ndjson(...)` only builds a plan —
  nothing reads until `.collect()`. `pl.read_ndjson` is eager and loads immediately; prefer `scan` so
  polars can fuse operations and push down filters/projections.
- **duckdb queries files in place, structs and all.** `SELECT alert.signature FROM 'eve.json'` needs no
  import, no schema, no load — point SQL straight at the newline-delimited EVE JSON and dot into nested
  fields. That's the whole speedup: it reads only the columns and rows the query touches.
- **structlog fields, not `print()`.** `log.info("triaged", signature=sig, dest_ip=str(ip))` is a
  queryable JSON event; `print(f"triaged {sig}")` is prose you have to grep. Pass data as `key=value` —
  never string-concatenate it into the message.
- **Your logs are someone's detection input.** The `structlog` JSON `sift` emits is exactly what Track 02
  parses and detects on. Stable event names and field keys aren't cosmetic — downstream detections bind to
  them, so treat your log schema as an interface.
