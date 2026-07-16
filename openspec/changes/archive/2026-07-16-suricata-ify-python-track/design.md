## Context

Track 09 builds `sift` across nine modules on an invented alert schema fed by synthetic data. The
authoritative model lives in two places — M02 `sift_reference/sift/models.py` (`Alert`/`Indicator`) and
M06 `core.py` (`TriageResult`) — and real tool names (`suricata`, `zeek`, `sysmon`) appear only as string
labels. No real log is ever parsed; M03's "large feed" is a demo-time synthetic CSV, and the `data/`
dirs are empty or absent. The prose (`tracks/09-.../modules/<NN>/{README.md,lab.md,cheatsheet.md}`) is the
published source of truth; the runnable environment (`data/`, `demo.py`, `sift_starter/`,
`sift_reference/`, `Makefile`, plus a synced `lab.md` copy) lives in the `plaintext-labs` submodule.

Suricata **EVE JSON** is the natural real substrate: it is a standardized, freely produced NSM log; each
line is a JSON object keyed by `event_type` (`alert`, `dns`, `http`, `tls`, `flow`, `fileinfo`, …); alert
events carry real ET/Suricata signatures; and it is genuinely messy — a strictly better teacher for
`parse, don't trust` than the toy schema. It also makes the existing `source: "suricata"` label real.

## Goals / Non-Goals

**Goals:**
- Reground every stage of `sift` on real Suricata EVE JSON, preserving each module's learning objective.
- Define one EVE-based pydantic model (a discriminated union on `event_type`) that carries through M02→M09.
- Thread a progressive, per-module **dissector** stretch that grows `sift` from alert-only to multi-event.
- Ship a real, provenance-noted, offline-reproducible EVE corpus in `plaintext-labs`.
- Keep the honor-system, objective-driven altitude — swap the substrate and add optional objectives; do
  not transcribe solutions or build `sift` for the learner.

**Non-Goals:**
- Not changing the track's arc, module list, phases, nav, or capstone structure.
- Not adding automated grading, receipts, or `.ci-demo` marking now (Suricata runner still absent).
- Not replacing the enrichment/threat-intel feeds (URLhaus/Feodo stay valid enrichment sources).
- Not making Suricata the only format forever — this is "for now"; the dissector thread is the extension
  seam, and Zeek/others remain future options.

## Decisions

**D1 — EVE alert event is the canonical model; a discriminated union is the growth seam.**
The M02 boundary model becomes a pydantic v2 model over the real EVE alert event (`timestamp`, `flow_id`,
`event_type`, `src_ip`, `dest_ip`, `src_port`, `dest_port`, `proto`, `alert.{signature, signature_id,
category, severity, gid, rev}`). `event_type` is a `Literal`/discriminator so the core parses `alert`
and the dissector stretches add `dns`/`http`/`tls`/`flow`/`fileinfo` members; an unknown `event_type` is
quarantined by the reject-policy, not fatal. *Alternative considered:* one flat permissive model — rejected
because it loses the "invalid states unrepresentable" lesson and the natural dissector-extension shape.

**D2 — Indicators are derived from EVE, not invented.** The `Indicator{kind,value}` concept is reframed:
the enrichable indicators are the real `src_ip`/`dest_ip` (and, in stretches, `dns.rrname`, `http.hostname`,
`tls.sni`/`ja3`). M04's enricher takes IPs extracted from validated EVE events. *Alternative:* keep a
separate `Indicator` model — rejected as redundant now that fields are real.

**D3 — Corpus = small committed seed + generate-at-`make`-time from a real PCAP.** Commit a tiny curated
`eve.json` seed (clean + malformed lines) for M01/M02 fixtures; for scale (M03+) fetch a **named** real
public PCAP by URL + checksum and run Suricata (ET Open) to regenerate a larger `eve.json`. Provenance
(source URL, hash, Suricata version, ruleset) is recorded in the lab. *Alternatives:* (a) commit a large
real `eve.json` — rejected (heavy artifact, redistribution questions); (b) keep synthetic generation —
rejected (that is the fiction we are removing).

**Anchor PCAP (validated, pinned):**
- **Primary — Malware-Traffic-Analysis.net, 2024-07-30 "You dirty rat!"** (a real RAT-infection capture,
  ~11.5k packets, fires real ET Open signatures — maximally "what a practitioner sees").
  - URL: `https://www.malware-traffic-analysis.net/2024/07/30/2024-07-30-traffic-analysis-exercise.pcap.zip`
  - `sha256 = 420530cefb5f0001e12aacc554cef14f6273f1e2ec01008567a68f3471e0ed70`, size 10,750,172 bytes
    (HEAD-verified 200, `Last-Modified: 2024-07-30`; hash computed from the downloaded zip on 2026-07-15).
  - Zip password `infected_20240730` (MTA's scheme is `infected_YYYYMMDD` using the post date; documented on
    the site's About page). **Fetch only —
    do not mirror/commit the PCAP;** the `make` step verifies the checksum before unzipping, then runs
    Suricata to produce `eve.json`.
- **Fallback — Stratosphere IPS / CTU-13 (CC-BY, redistribution permitted)** at
  `https://www.stratosphereips.org/datasets-ctu13` — used where MTA hotlinking is unreliable (CI) or a
  redistribution-clean source is required; its exact capture + hash are pinned at labs-build time.

**D4 — Dissector thread reuses existing `## Stretch` sections.** Every lab already has a `## Stretch
(optional)` block; the dissector objectives slot in there, escalating and cross-referencing the growing
union. This keeps the core narrative intact and honors "add stretch tasks throughout." Each stretch is
tied to its host module's skill (stream→columnar over `http`; concurrency→enrich on JA3/SNI;
eval→property-test the union). *Alternative:* new core `Do` steps — rejected; that would enlarge modules
and cross the "don't build it for them" line.

**D5 — Prose is source of truth; labs synced separately.** The openspec change edits `tracks/09-…`
(this repo). The `plaintext-labs` environment (data, demos, models, and its `lab.md` copies) is updated
and committed in that submodule as a paired obligation described by `python-track-suricata-labs`. This
mirrors the archived Track 13 change's curriculum/labs split.

**D6 — Altitude guardrail is explicit and reviewable.** Regrounding edits swap nouns (schema/fields/data)
and add optional objectives; they must not add transcribed solutions or promote `sift_reference/` into the
lab body. This is asserted as a spec requirement with a diff-level scenario so `/opsx:verify` can check it.

## Risks / Trade-offs

- **[Suricata not installed on contributor/runner machines]** → Corpus generation requires Suricata; the
  committed seed covers M01/M02 offline, and the generate step is documented + designed for a later
  Suricata-capable CI runner. `.ci-demo` stays deferred until then.
- **[PCAP redistribution / link rot]** → Do not commit third-party PCAPs; fetch by URL + verified checksum
  at `make` time and record provenance; validate the chosen link at apply time and prefer sources that
  permit educational use.
- **[EVE is verbose — scope creep across event types]** → The *core* track parses only `alert`; all other
  event types are **stretch-only**, keeping module size stable.
- **[Model drift across modules]** (M06/M07 already define slightly different `Verdict`s) → Unify the input
  model on the EVE alert event in M02 and reference it downstream; leave triage `Verdict` semantics as-is
  unless a module explicitly needs them, to bound the change.
- **[Two `lab.md` copies drift]** (tracks/ vs plaintext-labs) → Treat `tracks/` as source of truth and sync
  the labs copy in the same change; call it out in tasks so neither is forgotten.
- **[Over-featuring the "parse" lesson]** → Keep malformed fixtures realistic (real EVE breakage), not
  contrived, so the boundary lesson stays honest.

## Migration Plan

1. Land the prose regrounding in `tracks/09-…` (README + 9× README/lab/cheatsheet), keeping nav unchanged
   and `mkdocs build --strict` green.
2. In `plaintext-labs`, add the EVE seed + generation script, update `demo.py`/`sift_starter/`/
   `sift_reference/`/`Makefile` per module, and sync each `lab.md`. Commit and bump the submodule pointer.
3. Verify: `mkdocs build --strict` (prose) and a manual `make up && make demo` on M02/M03 (labs) on a
   machine with Suricata. Defer `.ci-demo` until a runner exists.
- **Rollback:** the change is additive-in-place prose + labs; revert the track commit and the submodule
  bump to restore the prior (fictional) substrate. No site nav or external contract changes.

## Open Questions

Both prior open questions are now resolved:
- **Anchor PCAP — RESOLVED.** Primary = MTA 2024-07-30 "You dirty rat!" (URL + `sha256` pinned in D3);
  fallback = Stratosphere CTU-13 (CC-BY). Both links validated to resolve.
- **Dissector event-type → module mapping — RESOLVED (accepted as proposed):** `dns`→M02, `http`→M03,
  `tls`/`ja3`→M04, `flow`/`fileinfo`→M05, reinforcement M06–M09.
