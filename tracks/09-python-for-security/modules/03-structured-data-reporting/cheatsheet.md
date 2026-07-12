# Cheat sheet — Structured Data & Reporting

*Companion to [Module 03 — Structured Data & Reporting](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## JSON in and out

```python
import json

data = json.loads(text)                 # str  -> Python object
text = json.dumps(data, indent=2)       # Python object -> str (pretty)

with open("alerts.json") as fh:
    data = json.load(fh)                # read straight from a file object
with open("out.json", "w") as fh:
    json.dump(data, fh, indent=2)       # write straight to a file object

json.dumps(data, sort_keys=True)        # stable ordering — useful for diffs/fingerprints
json.dumps(data, default=str)           # serialize datetimes/Path with str() instead of crashing
```

## Defensive access — parsed JSON is untrusted

```python
# .get() returns a default instead of raising KeyError on a missing field.
rule = record.get("rule_id", "unknown")
port = record.get("dst", {}).get("port")     # chain .get() through nested dicts safely

# Skip the broken record; don't kill the run on record 3 of 50.
for rec in data:
    if "rule_id" not in rec or "src_ip" not in rec:
        continue                             # log-and-skip beats crash
    process(rec)
```

## Deduplicate by fingerprint

```python
# A fingerprint is a tuple of the fields that make two alerts "the same thing".
seen = set()
unique = []
for rec in data:
    fp = (rec.get("rule_id"), rec.get("src_ip"), rec.get("dst_port"))
    if fp in seen:                           # three sensors, one finding -> one ticket
        continue
    seen.add(fp)
    unique.append(rec)
```

## CSV — let DictWriter quote and escape

```python
import csv

fieldnames = ["rule_id", "src_ip", "dst_port", "severity"]
with open("report.csv", "w", newline="") as fh:   # newline="" avoids blank rows on Windows
    w = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
    w.writeheader()
    for rec in unique:
        w.writerow(rec)                      # extra keys ignored; missing keys -> empty cell

# Reading back:
with open("report.csv", newline="") as fh:
    for row in csv.DictReader(fh):           # each row is a dict keyed by the header
        ...
```

## rich — the human-readable table

```python
from rich.console import Console
from rich.table import Table

console = Console()

table = Table(title="Alerts")
table.add_column("Rule", style="cyan", no_wrap=True)
table.add_column("Source IP")
table.add_column("Severity", justify="right")

for rec in unique:
    sev = rec.get("severity", "—")
    style = "red" if sev == "high" else "yellow"
    table.add_row(rec["rule_id"], rec["src_ip"], f"[{style}]{sev}[/{style}]")

console.print(table)                          # degrades gracefully when piped to a file
```

## rich — other output you'll reuse

```python
console.print("[bold red]ALERT[/]", "escalate now")   # inline markup
console.print_json(data=record)                        # pretty, colourized JSON
console.rule("Summary")                                # a titled horizontal divider

from rich.progress import track
for rec in track(data, description="Enriching..."):    # progress bar for long loops
    ...
```

## Gotchas worth remembering

- **Never build CSV by string concatenation.** The first field containing a comma, quote, or
  newline breaks hand-rolled output silently. `csv.DictWriter` quotes and escapes correctly.
- **Use `.get()` for anything off the wire.** `record["key"]` raises `KeyError` on the first
  malformed record and kills a 50-record run; `.get(key, default)` skips it and keeps going.
- **Open CSV files with `newline=""`.** Omitting it inserts blank rows between records on Windows —
  the classic "why does my CSV have gaps" bug.
- **Compute and filter first; render last.** Keep the data pipeline (parse → dedup → filter)
  separate from the presentation (`rich`). Rendering woven into filtering is hard to test and reuse.
- **Fingerprint on the fields that define identity, not the whole record.** Two alerts differing
  only in timestamp are the same finding — leave volatile fields out of the tuple.
- **`json.dumps` can't serialize datetimes or `Path` by default.** Pass `default=str` (or a custom
  encoder) instead of letting it raise `TypeError` mid-write.
