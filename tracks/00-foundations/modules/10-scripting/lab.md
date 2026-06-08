# Lab 10 — A Failed-Login Parser in Python

## Setup
Docker-first (mounts the current directory so your script persists):
```bash
docker run --rm -it -v "$PWD":/work -w /work python:3.12-slim bash
```

## Scenario
Build a tool that reads an auth log and reports the top source IPs by failed-login count —
the triage script you'll write a hundred variations of.

## Do
Write the script yourself — or have AI draft it and then review every line. Don't paste
without reading.

1. [ ] Get a sample auth log with several `Failed password ... from <ip>` lines (make one if
   needed).
2. [ ] Write `topips.py` that reads the log, extracts each source IP with a regex, and
   tallies them. (Building blocks: `re` for the pattern, `collections.Counter` for the
   count.)
3. [ ] Print the top IPs ranked by count.
4. [ ] Feed it a malformed line, decide what it *should* do, and make it do that.

## Success criteria — you're done when
- [ ] The script prints a ranked count of source IPs from the sample.
- [ ] It does something sensible (doesn't crash) on a line it can't parse.
- [ ] You can explain every token in the regex.

## Deliverables
`topips.py` plus a one-paragraph README: what it does, how to run it, and one limitation
you'd fix next.

## AI acceleration
Have a model extend it to emit JSON or flag IPs over a threshold — then review the regex
and edge cases (IPv6? malformed lines?) before you trust the output.

## Connects forward
This is the on-ramp to Track 09 (Python for Security) and the parsing habit Track 02
(detection engineering) runs on.

## Marketable proof
> "I automate triage in Python — log parsing, enrichment, ranked output — and I can review
> and harden AI-generated tooling instead of pasting it blind."

## Stretch
- Add `--json` and `--threshold N` flags with `argparse`, and let it read from stdin too.
