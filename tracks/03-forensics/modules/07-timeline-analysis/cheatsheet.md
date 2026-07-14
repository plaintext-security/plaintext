---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Timeline Analysis

*Companion to [Module 07 — Timeline Analysis](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The plaso three-step workflow

```
log2timeline.py  → ingest + parse every artifact into a .plaso store
psort.py         → sort, filter, and export the store
pinfo.py         → inspect what a store contains (parsers, event counts, date range)
```

## log2timeline.py — ingest (do this first, over everything)

```bash
log2timeline.py --storage-file case.plaso evidence.dd     # image → super-timeline
log2timeline.py --storage-file case.plaso artifacts/       # a directory of mixed artifacts
log2timeline.py -z UTC --storage-file case.plaso image.dd  # -z / --timezone: PIN the source TZ
log2timeline.py --parsers 'winevtx,chrome_cache' \
    --storage-file case.plaso artifacts/                   # restrict to specific parsers (faster)
```

- `--parsers list` prints every available parser. Ingest broadly first; scope with `--parsers` only
  when you know the artifact types.

## pinfo.py — inspect the store before you filter

```bash
pinfo.py case.plaso                        # summary: parsers used, event count, first/last event
pinfo.py --sections events case.plaso      # per-parser event breakdown
```

## psort.py — sort, filter, export

```bash
psort.py -o dynamic -w timeline.csv case.plaso                 # full timeline → CSV
psort.py -o l2tcsv -w timeline.csv case.plaso                  # classic log2timeline CSV columns
psort.py -o json_line -w timeline.jsonl case.plaso             # JSONL for further tooling

# Time-window filter (narrow AFTER ingesting everything)
psort.py -w window.csv case.plaso \
  "date > '2026-07-10 00:00:00' AND date < '2026-07-11 00:00:00'"

# Content filter — one process / user across all sources
psort.py -w hits.csv case.plaso "parser is 'winevtx' AND message contains 'powershell'"
```

## Filter language — the pieces you reuse

```
date > '2026-07-10 14:00:00'          # time bounds (store times are UTC)
parser is 'winevtx'                    # restrict to a source type
message contains 'cmd.exe'             # substring match on the description
source is 'FILE'                       # by source category
AND / OR / NOT ( ... )                 # combine
```

## Timesketch — scale up (web UI over plaso output)

```bash
# Import a .plaso store, then filter/annotate/share in the browser
psort.py -o timesketch --name "case42" case.plaso     # push directly to Timesketch
```

- Timesketch is the pivot/query/annotate layer for millions of events; for lab-scale data, `psort`
  CSV is equivalent.

## Gotchas worth remembering

- **Timezone error is the #1 way to fabricate a sequence.** One source parsed in local time silently
  shifts hours against the rest. Pin `--timezone` at ingest, and treat any *effect-before-cause*
  ordering as a clock bug to disprove — not a finding to report.
- **Ingest everything, *then* filter.** Narrowing the input before you've seen the full picture is
  how you cut the one event the case turns on. Filter at the `psort` stage, not at ingest.
- **Silence is a signal.** A merged timeline makes *gaps* visible — a 20-minute window with no events
  from any source is a hypothesis generator (idle attacker? uncaptured host? deleted events?).
- **Compare `$SI` and `$FN`.** plaso surfaces both NTFS timestamp sets per entry; a divergence flags
  timestomping (Module 11) right inside the super-timeline.
- **A super-timeline is the report's evidentiary spine** — dwell-time figures like "78 hours" only
  exist because every source was reconciled onto one UTC clock.
