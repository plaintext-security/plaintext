# aiops-track-oss500-labs Specification

## Purpose
TBD - created by archiving change add-aiops-oss500-edition. Update Purpose after archive.
## Requirements
### Requirement: Cognitive-load labs wrap the unchanged environments
Each module's `lab.md` body SHALL be rewritten to the cognitive-load template at
`plaintext-labs/ai-augmented-ops/<NN>/lab.md` (the canonical symlink target of
`tracks/12-ai-augmented-ops/modules/<NN>/lab.md`). The lab **environments** (`Makefile`,
`docker-compose.yml`, `Dockerfile`, `data/`, `scripts/`) SHALL be unchanged — only the `lab.md`
instructions are replaced.

#### Scenario: Symlink resolves to the new cognitive-load body, env untouched
- **WHEN** `tracks/12-ai-augmented-ops/modules/<NN>/lab.md` is inspected
- **THEN** it is a symlink resolving to `plaintext-labs/ai-augmented-ops/<NN>/lab.md` carrying the
  cognitive-load lab, and no `Makefile`/`docker-compose.yml`/`data/`/`scripts/` file was modified

### Requirement: Cognitive-load template applied
Each `lab.md` SHALL contain a flight card (6±1 must-hold facts + why each), a warm-up (retrieval
questions before building), the concept folded into each step, `▸ On track if:` rails on the sticky
spots, a recall check, and one finish line plus a definition-of-done checklist.

#### Scenario: Template elements present
- **WHEN** a rebuilt `lab.md` is reviewed
- **THEN** it contains a flight card, a warm-up, per-step folded concept, at least one `On track if:`
  rail, a recall check, and a single finish line with a definition-of-done checklist

### Requirement: Rails honest against nondeterministic AI output
Every `▸ On track if:` rail and shown command SHALL correspond to what the real env produces; where LLM
output is nondeterministic, the rail SHALL assert a robust signal (exit code, a schema field, a
non-empty response) rather than exact generated text.

#### Scenario: A rail asserts a robust signal
- **WHEN** a lab step invokes a model or nondeterministic tool
- **THEN** its rail checks a stable signal (exit status, JSON field, non-empty output), not verbatim
  model text

### Requirement: Authorization and honor system preserved
Any lab that attacks an AI system (e.g. red-teaming with garak/promptfoo) SHALL carry the authorization
note: only test systems you own or have written permission to test. Completion SHALL rest on measurable,
self-checked success criteria and a committed deliverable, with no grading, receipt, or credential.

#### Scenario: Attack lab carries authorization
- **WHEN** a lab red-teams an AI system
- **THEN** it states the authorization rule and targets only the learner's own deployment

