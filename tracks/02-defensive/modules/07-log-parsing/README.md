# Module 07 — Log Parsing & Normalisation

**Defensive Operations** — *raw logs are chaos; a common schema is what makes detection scale.*

## Why this matters
Every source logs differently — Apache, sshd, Sysmon, and a firewall each describe a "source IP" in
their own way. Until logs are *parsed* into fields and *normalised* to a common schema, you can't
write one detection that works across sources, or correlate them. Normalisation (e.g. to the Elastic
Common Schema) is the unglamorous plumbing that makes everything downstream possible — and it's
exactly where AI both helps most and breaks things silently.

## Objective
Parse a real, messy log into structured fields and normalise it to a common schema, handling the
malformed lines.

## Learn (~4 hrs)

**Pipelines**
- [Vector documentation](https://vector.dev/docs/) — a modern, fast log pipeline; read the "Quickstart" and the VRL (transform language) intro.
- [Elastic Common Schema (ECS)](https://www.elastic.co/guide/en/ecs/current/index.html) — the normalisation target: a shared field set so detections work across sources.

**What good logs contain**
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) — what parseable, useful logs should include.

## Key concepts
- Parsing: unstructured text → fields (grok / regex / VRL)
- Normalisation to a common schema (ECS)
- Enrichment (geoIP, asset/user context)
- Handling malformed / multiline logs
- Why normalisation makes one detection work across many sources

## AI acceleration
This is AI's home turf — a model writes a grok/VRL parser for an unfamiliar format in seconds. It's
also where it fails *silently*: a parser that drops 5% of lines or mislabels a field looks fine until
a detection misses. Always check the parse rate and the field values against the raw log.
