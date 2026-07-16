# python-track-dissector-stretch

## ADDED Requirements

### Requirement: A progressive dissector stretch thread runs across the track
The track SHALL carry a coherent, escalating **dissector** stretch thread: the core track parses
Suricata EVE `alert` events, and per-module `## Stretch` objectives grow `sift` to dissect additional
EVE `event_type`s. By the end of the track the learner's `sift` SHALL be able to parse multiple event
types and **quarantine unknown event types** rather than crash on them. The thread MUST progress
(each stretch builds on the prior dissectors), not repeat a single one-off task. The suggested
progression covers `dns`, `http`, `tls`/`ja3`, `flow`, and `fileinfo` events, distributed across the
modules where each fits the module's topic.

#### Scenario: The thread escalates and connects
- **WHEN** a learner reads the `## Stretch` sections across Modules 02→09 in order
- **THEN** they add dissectors for progressively more EVE `event_type`s (e.g. `dns` at M02, `http` at
  M03, `tls`/`ja3` at M04, `flow`/`fileinfo` at M05, and reinforcement at M06–M09), and each stretch
  references the growing multi-event dissector rather than restating the alert-only parser

#### Scenario: Unknown event types are handled, not fatal
- **WHEN** a stretch objective adds a new dissector to `sift`
- **THEN** the objective requires that an EVE line whose `event_type` is not yet dissected is
  quarantined/logged (the discriminated-union boundary holds), consistent with Module 02's reject-policy

### Requirement: Dissector stretches align to their host module's topic
Each dissector stretch SHALL exploit its host module's competency so the stretch teaches that module's
skill on a richer event, not merely "parse more JSON." For example: the streaming module's dissector
stretch runs columnar queries over the new event type; the concurrency module's stretch enriches on a
field the new dissector exposes (e.g. JA3/SNI); the eval/property module's stretch property-tests the
dissector union.

#### Scenario: A stretch reinforces its module's skill
- **WHEN** a learner does the dissector stretch in the data-at-scale module
- **THEN** the objective has them add an `http` (or equivalent) dissector **and** answer a triage
  question over it with a columnar query — i.e. the stretch exercises the module's own technique on the
  new event type

### Requirement: Dissector stretches are objectives, not solutions
Each dissector stretch SHALL be stated as an objective (what to add and the acceptance check), not a
transcribed implementation, consistent with the track's altitude and the "no building for the learner"
constraint. Any code shown MUST be a minimal illustrative anchor (e.g. the discriminated-union shape),
not a complete dissector.

#### Scenario: Stretch states the outcome, not the walkthrough
- **WHEN** a reviewer reads any dissector stretch objective
- **THEN** it names the EVE `event_type` to dissect, the typed model/fields required, and a measurable
  acceptance check — without transcribing the full parser the learner is meant to write
