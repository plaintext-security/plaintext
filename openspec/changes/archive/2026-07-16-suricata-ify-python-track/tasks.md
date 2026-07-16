## 1. Define the EVE data model and corpus contract

- [x] 1.1 Decide the canonical EVE alert-event pydantic shape (top-level `timestamp`, `flow_id`, `event_type`, `src_ip`, `dest_ip`, `src_port`, `dest_port`, `proto`; nested `alert.{signature, signature_id, category, severity, gid, rev}`) and the discriminated-union pattern on `event_type` that later dissectors extend.
- [x] 1.2 Use the pinned anchor PCAP (design D3): primary = MTA 2024-07-30 "You dirty rat!" (`sha256 420530cefb5f0001e12aacc554cef14f6273f1e2ec01008567a68f3471e0ed70`, 10,750,172 bytes, zip password `infected_20240730` (scheme `infected_YYYYMMDD`), fetch-only/do-not-mirror); fallback = Stratosphere CTU-13 (CC-BY). Wire URL + checksum verification into the fetch step.
- [x] 1.3 Define the realistic malformed-EVE fixture set (truncated/non-JSON line, missing `dest_ip`, `severity` outside 1–3, an unhandled `event_type`) that replaces the old invented fixtures.
- [x] 1.4 Map the five dissector event types to their host modules (proposed `dns`→M02, `http`→M03, `tls`/`ja3`→M04, `flow`/`fileinfo`→M05, reinforcement M06–M09).

## 2. Reground the track README

- [x] 2.1 Update `tracks/09-python-for-security/README.md`: the spine description, the module table's "What you add to `sift`" column, and the "parse, don't trust" through-line to reference real Suricata EVE JSON.
- [x] 2.2 Tighten the capstone + rubric to require a real `eve.json` (provenance noted), consistent with the regrounded substrate.

## 3. Reground the module prose (README + lab + cheatsheet)

- [x] 3.1 M01 Modern Toolchain: legacy script + bundled sample parse real `eve.json`; update README/lab/cheatsheet and the "Do" objectives (no transcribed solution).
- [x] 3.2 M02 Parse, Don't Validate: rewrite the boundary model over real EVE alert fields; replace the malformed fixtures with real EVE breakage; keep the reject-policy and altitude; update README/lab/cheatsheet.
- [x] 3.3 M03 Data at Scale: stream a real `eve.json` (not synthetic CSV); columnar triage queries over real signatures/flows; keep URLhaus/Loghub as enrichment/secondary corpus; update README/lab/cheatsheet.
- [x] 3.4 M04 Async & Concurrency: enrich real `src_ip`/`dest_ip` extracted from validated EVE events; update README/lab/cheatsheet.
- [x] 3.5 M05 Driving Tools Safely: frame EVE as a real dissector's structured output; drive `suricata`/`tshark` (alongside `nmap -oX`); update README/lab/cheatsheet.
- [x] 3.6 M06 Two Surfaces: CLI + API over the EVE model; update README/lab/cheatsheet and unify the input model on the EVE alert event.
- [x] 3.7 M07 LLM-Native & MCP: MCP enrich/triage over EVE-derived indicators; update README/lab/cheatsheet.
- [x] 3.8 M08 Red-Team Your MCP: poisoned enrichment record framed on real EVE-derived fields; update README/lab/cheatsheet.
- [x] 3.9 M09 Eval, Property, Supply Chain: held-out corpus becomes labelled **real** alerts; property tests fuzz the EVE boundary; update README/lab/cheatsheet.

## 4. Add the progressive dissector stretch thread

- [x] 4.1 M02 `## Stretch`: add a `dns` event dissector (typed union member) that quarantines unknown `event_type`s.
- [x] 4.2 M03 `## Stretch`: add an `http` dissector and answer a triage question over it with a columnar query.
- [x] 4.3 M04 `## Stretch`: add a `tls`/`ja3` dissector and enrich on JA3/SNI concurrently.
- [x] 4.4 M05 `## Stretch`: add `flow`/`fileinfo` dissectors; optionally reconcile with `tshark -T ek` dissection.
- [x] 4.5 M06–M08 `## Stretch`: expose an `event_type` filter across CLI+API (M06) and an MCP dissect tool + red-team a poisoned `http.hostname`/`dns.rrname` (M07/M08).
- [x] 4.6 M09 `## Stretch`: property-test the dissector union (every EVE line parses to a known event or is quarantined) and add drift detection over the new events.
- [x] 4.7 Verify the thread escalates and cross-references the growing multi-event dissector, and that each stretch stays an objective (no transcribed dissector).

## 5. Update the plaintext-labs environment (sibling submodule)

- [x] 5.1 Add the committed curated `eve.json` seed (clean + malformed lines) under `python-for-security/02-.../data/`; gitignore heavy/generated artifacts.
- [x] 5.2 Add the `make`-time generation path: fetch the anchor PCAP by URL + verified checksum, run Suricata (ET Open), emit the larger `eve.json`; record provenance (URL, hash, Suricata version, ruleset).
- [x] 5.3 Update `demo.py`, `sift_starter/`, and `sift_reference/sift/*.py` per module to read/stream real EVE; keep `sift_reference/` a peek-after reference.
- [x] 5.4 Update each lab `Makefile` (`up`/`shell`/`demo`/`down`) to exercise the real substrate; ensure the M02 demo contrasts trust vs. typed boundary on real malformed EVE.
- [x] 5.5 Sync each `plaintext-labs` `lab.md` copy with the `tracks/` source of truth.

## 6. Validate and finalize

- [x] 6.1 Run `mkdocs build --strict` and fix any broken links / orphan pages introduced by the regrounding.
- [x] 6.2 Diff-review each regrounded lab to confirm the altitude guardrail (objective-driven `Do` steps, no transcribed solutions, `sift_reference/` still peek-after) and that every attacking lab keeps its authorization note.
- [x] 6.3 Manually run `make up && make demo` for M02 and M03 on a Suricata-capable machine; leave `.ci-demo` deferred until a Suricata runner exists.
- [x] 6.4 Bump the `plaintext-labs` submodule pointer in the `plaintext` repo once the labs changes land.
- [x] 6.5 Run `openspec validate suricata-ify-python-track` and resolve any issues.
