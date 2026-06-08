# Lab 07 — Normalise a Real Messy Log

## Setup
Docker-first — Vector:
```bash
docker run --rm -it -v "$PWD":/etc/vector timberio/vector:latest-alpine --config /etc/vector/vector.toml
```
Real data: a real raw log from [loghub](https://github.com/logpai/loghub) (e.g. Apache, Linux, or
OpenSSH) — genuinely messy, with real variety.

## Scenario
Take a real, unstructured log and turn it into clean, normalised, queryable events — without losing
lines.

## Do
1. [ ] Pick a real loghub log and inspect its format(s). (How many distinct line shapes are there?)
2. [ ] Write a parser (Vector VRL, or grok) that extracts the key fields (timestamp, source, severity,
   message, IP).
3. [ ] Normalise the field names to a common schema (ECS): e.g. `source.ip`, `event.action`.
4. [ ] Handle the malformed lines deliberately — measure your parse rate and decide what to do with
   the failures.

## Success criteria — you're done when
- [ ] The raw log is emitted as structured, normalised events.
- [ ] Your field names follow a common schema.
- [ ] You know your parse rate and how failures are handled (not silently dropped).

## Deliverables
`parsing.md`: your parser config, the before/after of a line, your parse rate, and your failure
handling.

## AI acceleration
Have a model draft the grok/VRL parser — then **check the parse rate and spot-check fields against the
raw log**. A silently-dropped 5% is invisible until a detection misses; you own catching it.

## Connects forward
Normalised logs make detections (module 08) portable across sources — and they complete **Phase 1's
project**: a host + network telemetry pipeline with a real attack flowing through it.

## Marketable proof
> "I parse and normalise real, messy logs to a common schema (ECS) — measuring parse rate and
> handling failures — so detections work across every source."

## Automate & own it
**Required.** Your Vector/parser config *is* the artifact — commit it with a test that proves the
parse rate on the real log; have AI extend it to a second log format and review the diff.

## Stretch
- Add enrichment (geoIP on the source IP) and explain how that sharpens a later detection.
