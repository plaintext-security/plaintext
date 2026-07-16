## Why

Track 09 (Python for Security) builds `sift`, an alert enrichment/triage tool, on an **invented alert
schema** — `Alert{id, source, severity, indicator}` / `Indicator{kind: ipv4|domain|sha256, value}` — fed
by synthetic data generated at demo time. Real tool names (`suricata`, `zeek`, `sysmon`) appear only as
opaque string labels on a toy format; no real log artifact is ever parsed. This violates the curriculum's
own "tie it to the real world" rule: the track *talks about* real feeds but ingests fiction, so the
`parse, don't trust` skill it teaches never touches the messy real input a practitioner actually sees.

Reground the whole track on **real Suricata EVE JSON** (`eve.json`) — a real, standardized, freely
available NSM log format produced by a tool the `source` field already name-drops — and thread a
progressive **dissector** stretch through the modules so learners grow `sift` from an alert-only parser
into a multi-`event_type` EVE dissector. This is a substrate + stretch change; it does **not** do the
learner's work for them — the labs stay honor-system and objective-driven.

## What Changes

- **Reground the canonical data model on Suricata EVE JSON.** Replace the invented `Alert`/`Indicator`
  schema with a pydantic model over real EVE alert events (`timestamp`, `flow_id`, `event_type`,
  `src_ip`/`dest_ip`/`src_port`/`dest_port`, `proto`, nested `alert{signature, signature_id, category,
  severity, gid, rev}`). Indicators become *derived* from real EVE fields, not invented. The "parse,
  don't validate" pedagogy is preserved and strengthened — real EVE is messier (optional fields,
  event-type unions, integer severities 1–3) and a better adversarial-input teacher. **BREAKING** for the
  module data model, not for the track's arc or pedagogy.
- **Swap the substrate in all 9 modules + capstone** (prose in `tracks/09-.../`): M01 legacy script parses
  `eve.json`; M02 defines the EVE boundary model and malformed fixtures become real EVE breakage
  (truncated line, missing field, out-of-range severity, an unhandled `event_type`); M03 streams a *real*
  `eve.json` at scale instead of synthetic CSV; M04 enriches real EVE src/dest IPs; M05 frames EVE as a
  real dissector's structured output and drives `suricata`/`tshark`; M06–M09 carry the EVE model through
  CLI/API, MCP, red-team, and the eval corpus (labelled real alerts).
- **Add a progressive "dissector" stretch thread.** Every module gains/extends a **Stretch** task that
  adds a typed dissector for one more EVE `event_type` (`dns`, `http`, `tls`/`ja3`, `flow`, `fileinfo`),
  escalating across the track so the finished `sift` dissects multiple protocols and quarantines unknown
  event types. Stated as objectives, not walkthroughs.
- **Ship a real, redistributable, offline-reproducible corpus** in `plaintext-labs`: a small committed
  `eve.json` seed plus a `make`-time regeneration path (fetch a named real public PCAP by URL + hash → run
  Suricata with ET Open rules → `eve.json`), with provenance noted. Update each lab's `demo.py`,
  `sift_starter/`, `sift_reference/`, and `Makefile` to read real EVE. Keep `sift_reference/` a peek-after
  reference, not the lab body.
- **Preserve altitude.** No transcribed solutions are added; the regrounding must keep the intermediate-plus,
  objective-driven style. The change swaps *what* `sift` eats and adds *optional* dissector objectives — it
  does not build `sift` for the learner.

## Capabilities

### New Capabilities
- `python-track-suricata-curriculum`: The prose regrounding of Track 09 — the track README and all nine
  module `README.md`/`lab.md`/`cheatsheet.md` files rewritten so `sift` ingests real Suricata EVE JSON, the
  canonical EVE-based data model, the per-module substrate swap, the updated `parse, don't trust`
  through-line, and the tightened capstone — all preserving the honor-system, objective-driven altitude.
- `python-track-dissector-stretch`: The progressive, cross-module dissector stretch thread — per-module
  Stretch objectives that grow `sift` from alert-only into a multi-`event_type` EVE dissector, stated as
  objectives (not solutions) and escalating in scope across the track.
- `python-track-suricata-labs`: The `plaintext-labs` environment obligations — a real, provenance-noted,
  offline-reproducible `eve.json` corpus; updated demos, starter, and reference code that read real EVE;
  and `make up`/`make demo` that exercise the real substrate.

### Modified Capabilities
<!-- No existing specs cover Track 09; the three capabilities above are new. -->

## Impact

- **`plaintext` repo (this repo):** `tracks/09-python-for-security/README.md` and every
  `modules/<NN>/{README.md,lab.md,cheatsheet.md}` (27 module files + track README). No site config change
  (nav unchanged); `mkdocs build --strict` must stay green.
- **`plaintext-labs` submodule (sibling repo):** `python-for-security/<NN>/` environments — `data/`
  (new real `eve.json` seed + fetch/generate script), `demo.py`, `sift_starter/`, `sift_reference/sift/*.py`
  (EVE models), `Makefile`, and each `lab.md` copy kept in sync with `tracks/`. Implemented and committed
  separately in that repo; described here as an obligation.
- **Data model:** the invented `Alert`/`Indicator`/`TriageResult` shapes in M02 `models.py` and M06
  `core.py` change to EVE-based models — breaking for any code pinned to the old schema, but the track is
  self-contained so blast radius is the track itself.
- **Pedagogy:** unchanged in kind (honor system, objective-driven, `parse, don't trust`); strengthened by
  real input. No new grading, credentials, or hand-holding.
- **Lab validation:** already-deferred `.ci-demo` marking stays deferred (needs a Linux runner with
  Suricata); the corpus-generation path is designed to be runnable there later.
