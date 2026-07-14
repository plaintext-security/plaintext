---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Log Parsing & Normalisation

*Companion to [Module 07 — Log Parsing & Normalisation](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The two steps, always in order

1. **Parse** — unstructured text → typed fields (grok / regex / VRL).
2. **Normalise** — rename those fields into a shared vocabulary (ECS) so one detection works everywhere.

## Vector VRL — transform structure

```coffee
# .message holds the raw line; parse into a map, then reshape
. = parse_grok!(.message, "%{IPORHOST:client} %{WORD:method} %{URIPATHPARAM:uri} %{NUMBER:status:int}")

# fallible functions end in ! (abort on error) or use ?? for a fallback:
parsed, err = parse_json(.message)
.ts = to_timestamp!(.timestamp)          # coerce types explicitly

# rename raw field → ECS field, then drop the original
.source.ip = del(.client)
.http.request.method = del(.method)
.url.path = del(.uri)
.http.response.status_code = del(.status)
```

Handy VRL parsers: `parse_json`, `parse_grok`, `parse_regex`, `parse_key_value`, `parse_syslog`, `parse_apache_log`, `parse_common_log`, `parse_timestamp`.

## Grok — named patterns over regex

```
%{PATTERN:field_name}                    # capture PATTERN into field_name
%{PATTERN:field_name:int}                # ...and coerce to int/float
```

Common built-in patterns:

```
%{IP} %{IPORHOST} %{HOSTNAME}            # hosts
%{NUMBER} %{INT} %{WORD} %{NOTSPACE}     # scalars
%{TIMESTAMP_ISO8601} %{HTTPDATE}         # timestamps
%{GREEDYDATA} %{DATA}                    # catch-all (greedy vs lazy)
%{COMBINEDAPACHELOG}                     # a full Apache access line in one pattern
```

## Regex — the escape hatch when grok won't fit

```
(?P<field>pattern)      # named capture group (Python/VRL/Vector style)
^ $  \d \w \s  + * ?    # anchors, classes, quantifiers
(?:...)                 # non-capturing group
```

Prefer named groups over positional — the field name *is* the parser's contract.

## ECS — the normalisation target (canonical field names)

| Concept | ECS field | Beats these vendor names |
|---------|-----------|--------------------------|
| Source IP | `source.ip` | Apache `clientip`, sshd `rhost`, firewall `src` |
| Dest IP | `destination.ip` | `dst`, `dstip` |
| Timestamp | `@timestamp` | `time`, `ts`, `eventtime` |
| User | `user.name` | `username`, `usr`, `account` |
| Process | `process.name`, `process.pid` | `image`, `proc`, `comm` |
| Host | `host.name` | `hostname`, `computer` |
| Event action | `event.action`, `event.category` | mixed |

## Verify the parse — the number that matters

```bash
# parse rate = parsed lines / total lines. Anything <100% is silently dropping events.
vector top                               # live throughput + component error counts
grep -c . raw.log                        # total lines in
# compare against parsed count out; investigate every dropped line
```

## Gotchas worth remembering

- **Parse ≠ normalise, and you need both.** Parsing gives you fields; normalising renames them to a shared schema. Skip normalisation and a "suspicious source IP" rule needs rewriting per vendor — the whole point was to write it once.
- **A green pipeline is not a correct pipeline.** A parser that drops 5%, mislabels a field, or mangles a timestamp looks fine until a detection misses the one event that mattered. Always check the *parse rate* and spot-check field values against the raw log.
- **This is AI's home turf *and* where it fails most silently.** A model writes a grok/VRL parser in seconds — and just as fast produces one that quietly drops malformed lines. Test it against the messy real log, not the clean sample.
- **Timestamps are the classic silent bug.** Wrong timezone, wrong format, or epoch-vs-ISO mismatch corrupts every time-based correlation downstream. Coerce and verify `@timestamp` explicitly.
- **`GREEDYDATA` matches everything — including the failure.** An over-greedy pattern "succeeds" on lines it shouldn't, hiding malformed input. Anchor patterns and keep a route for lines that don't parse.
- **Keep the raw line.** Preserve `event.original` so you can re-parse when (not if) the format shifts — you can't recover a field you threw away.
