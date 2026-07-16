# python-track-suricata-curriculum

## ADDED Requirements

### Requirement: Canonical data model is Suricata EVE JSON
The track SHALL replace the invented `Alert{id, source, severity, indicator}` /
`Indicator{kind, value}` schema with a data model built over **real Suricata EVE JSON** (`eve.json`)
events. The authoritative pydantic model (defined in Module 02 and carried through the track) MUST be
grounded in real EVE fields: top-level `timestamp`, `flow_id`, `event_type`, `src_ip`, `dest_ip`,
`src_port`, `dest_port`, `proto`, and — for alert events — the nested `alert` object
(`signature`, `signature_id`, `category`, `severity`, `gid`, `rev`). Any indicator concept (an IP, a
domain, a hash, a signature) MUST be **derived** from real EVE fields, never invented. Where the old
prose named a made-up field, the new prose MUST reference the actual EVE field it replaces.

#### Scenario: Module 02 model reflects real EVE fields
- **WHEN** a learner reads `tracks/09-python-for-security/modules/02-parse-dont-validate/{README.md,lab.md}`
- **THEN** the boundary model is expressed over real Suricata EVE alert-event fields (e.g. `src_ip`,
  `dest_ip`, `proto`, `alert.signature`, `alert.signature_id`, `alert.severity`), not the invented
  `Alert{id, source, severity, indicator}` schema

#### Scenario: No invented schema survives the regrounding
- **WHEN** the full Track 09 prose is searched after the change
- **THEN** no module presents the invented `Indicator{kind: ipv4|domain|sha256, value}` schema or the
  synthetic `id,source,indicator,severity` record as the substrate `sift` ingests; real EVE is the input

### Requirement: The substrate swap covers all nine modules and the capstone
The change SHALL reground each module's prose so `sift`'s input at every stage is real Suricata EVE JSON,
while preserving each module's existing pedagogical purpose, structure, and altitude. The regrounding
MUST cover: M01 (legacy script parses `eve.json`), M02 (the EVE boundary model and malformed fixtures as
real EVE breakage), M03 (stream a real `eve.json` at scale in place of synthetic CSV), M04 (enrich real
EVE `src_ip`/`dest_ip`), M05 (frame EVE as a real dissector's structured output and drive
`suricata`/`tshark`), M06 (CLI + API over the EVE model), M07/M08 (MCP enrich/triage and red-team over
EVE-derived indicators), M09 (the held-out eval corpus is labelled **real** alerts), and the capstone
(require a real `eve.json`, provenance noted).

#### Scenario: Every module ingests real EVE
- **WHEN** a learner reads any module `README.md`/`lab.md` in Track 09
- **THEN** the data `sift` consumes at that stage is real Suricata EVE JSON (or a real feed/tool output),
  and the module's original learning objective (typing, streaming, concurrency, subprocess safety,
  two surfaces, MCP, red-team, eval) is unchanged

#### Scenario: Malformed fixtures are real EVE breakage
- **WHEN** a learner reaches Module 02's reject-policy step
- **THEN** the malformed cases are realistic EVE failures (a truncated/non-JSON line, a missing
  `dest_ip`, a `severity` outside Suricata's 1–3 range, an `event_type` the model does not yet handle),
  not the old invented fixtures (`999.1.1.1`, `SEV-9`, `"id": "seven"`)

### Requirement: The `parse, don't trust` through-line is updated for EVE
The track's identity through-line SHALL still teach one discipline across three edges (validate input
with `pydantic`, validate LLM output with `instructor`, measure with `pydantic-evals`), but every
mention of the input edge MUST reference the real EVE substrate. The track README's "through-line" and
per-module "Connects forward" notes MUST be consistent with the EVE model.

#### Scenario: Through-line prose names the real substrate
- **WHEN** a learner reads the track README's through-line and any module's "Connects forward"
- **THEN** the input edge is described as validating untrusted **Suricata EVE JSON** at the boundary,
  and the cross-references (streaming it, enriching it, measuring it) refer to the same EVE model

### Requirement: Regrounding preserves altitude — no building for the learner
The change SHALL preserve the intermediate-plus, objective-driven style of the labs. It MUST NOT add
transcribed step-by-step solutions, and it MUST NOT convert `sift_reference/` finished code into the
lab body. `## Do` steps stay stated as objectives (goal + a hint where the track calls for it); the
substrate swap and any new tasks are expressed as outcomes the learner achieves, not walkthroughs.

#### Scenario: Labs remain objective-driven after regrounding
- **WHEN** a reviewer diffs a regrounded `lab.md` against its original
- **THEN** the `## Do` steps remain objective-level (state the goal, optionally a hint), no full solution
  is transcribed, and the finished `sift_reference/` remains a peek-after reference rather than the
  lab body

### Requirement: Prose keeps a validated, buildable form
The regrounded prose SHALL keep Track 09 building under `mkdocs build --strict`: nav is unchanged, every
internal link resolves, and each module still follows the module anatomy (Why / Objective / The core
idea / Learn / Key concepts / AI acceleration in README; Setup / Scenario / Do / Success criteria /
Deliverables / Automate & own it / Stretch in lab). Every lab that attacks a target MUST retain its
authorization note.

#### Scenario: Site build stays green
- **WHEN** `mkdocs build --strict` runs after the regrounding
- **THEN** it succeeds with no broken links or orphan pages, and each regrounded module still contains
  its required anatomy sections and (where applicable) the authorization note
