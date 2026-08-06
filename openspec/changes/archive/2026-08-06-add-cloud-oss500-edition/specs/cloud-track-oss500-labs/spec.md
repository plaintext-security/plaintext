## ADDED Requirements

### Requirement: Cognitive-load labs wrap the unchanged environments
Each module's `lab.md` body SHALL be rewritten to the cognitive-load template at
`plaintext-labs/cloud/<NN>/lab.md` (the canonical symlink target of `tracks/05-cloud/modules/<NN>/lab.md`).
The lab **environments** (`docker-compose.yml`, `Makefile`, the floci emulator config, kind config,
`data/`) SHALL be unchanged — only the `lab.md` instructions are replaced.

#### Scenario: Symlink resolves to the new cognitive-load body, env untouched
- **WHEN** `tracks/05-cloud/modules/<NN>/lab.md` is inspected
- **THEN** it is a symlink resolving to `plaintext-labs/cloud/<NN>/lab.md` carrying the cognitive-load
  lab, and no `docker-compose.yml`/`Makefile`/floci/kind/`data/` file was modified

### Requirement: Cognitive-load template applied
Each `lab.md` SHALL contain a flight card (6±1 must-hold facts + why each), a warm-up (retrieval
questions before building), the concept folded into each step, `▸ On track if:` rails on the sticky
spots, a recall check, and one finish line plus a definition-of-done checklist.

#### Scenario: Template elements present
- **WHEN** a rebuilt `lab.md` is reviewed
- **THEN** it contains a flight card, a warm-up, per-step folded concept, at least one `On track if:`
  rail, a recall check, and a single finish line with a definition-of-done checklist

### Requirement: Rails honest against floci / kind / external targets
Every `▸ On track if:` rail and shown command SHALL correspond to what the real env produces. Where the
floci emulator fakes an API without enforcing it, the lab SHALL keep the honesty caveat and point at the
real-AWS route for true enforcement. External-target steps (CloudGoat, flaws.cloud, real free-tier AWS)
SHALL be labelled as such.

#### Scenario: A floci rail is honest
- **WHEN** a lab step runs against the floci emulator
- **THEN** its rail asserts what floci actually returns, and any enforcement the emulator does not
  perform is flagged with the real-AWS caveat

### Requirement: Authorization preserved on attack labs
Any lab that attacks a target (IAM attack paths, container escape, cloud attack techniques) SHALL carry
the authorization note: only test accounts/systems you own or have written permission to test, and use
intentionally vulnerable targets (CloudGoat, flaws.cloud) or your own resources. Completion SHALL rest
on measurable, self-checked success criteria and a committed deliverable, with no grading.

#### Scenario: Attack lab carries authorization
- **WHEN** a lab attacks a target
- **THEN** it states the authorization rule and points at an intentionally vulnerable / owned target
