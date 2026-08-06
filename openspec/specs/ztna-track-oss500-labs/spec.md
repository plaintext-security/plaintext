# ztna-track-oss500-labs Specification

## Purpose
TBD - created by archiving change add-ztna-oss500-edition. Update Purpose after archive.
## Requirements
### Requirement: Lab bodies live in plaintext-labs, environments unchanged
On promotion, each module's cognitive-load `lab.md` body SHALL live at `plaintext-labs/ztna/<module>/lab.md`
(the canonical location) and be **symlinked** into `tracks/11-ztna/modules/<module>/lab.md`, preserving the
repo's prose-here / labs-in-plaintext-labs architecture. The lab **environments** (`Makefile`,
`docker-compose.yml`, seed `data/`) SHALL be unchanged — only the `lab.md` instructions are replaced.

#### Scenario: Symlinked lab resolves to the new body
- **WHEN** `tracks/11-ztna/modules/<module>/lab.md` is inspected
- **THEN** it is a symlink resolving to `plaintext-labs/ztna/<module>/lab.md`, which carries the
  cognitive-load lab, and no `Makefile`/`docker-compose.yml`/`data/` file was modified

### Requirement: Cognitive-load template applied
Each edition `lab.md` SHALL follow the OSS-500 lab template: a **flight card** of 6 (±1) must-hold
facts with a one-line "why it matters" each; a **warm-up** (retrieval questions answered before
building); the relevant **concept folded into the step that uses it** (no required upfront reading);
`▸ On track if:` **rails** on the sticky spots (exact expected signal); a **recall check** at the end;
and **one finish line** ("prove the control" re-run from memory) plus a **definition of done** checklist.

#### Scenario: Template elements present
- **WHEN** an edition `lab.md` is reviewed against the template
- **THEN** it contains a flight card, a warm-up, per-step folded concept, at least one `On track if:`
  rail, a recall check, and a single finish line with a definition-of-done checklist

### Requirement: Rails map to the real environment
Every `▸ On track if:` rail and every shown command SHALL correspond to a command the wrapped
`plaintext-labs/ztna` environment actually supports and an output it actually produces; a lab SHALL NOT
instruct a step the shipped environment cannot perform.

#### Scenario: A rail is honest against the stack
- **WHEN** a rail states an expected command and output
- **THEN** running that command in the module's real `plaintext-labs/ztna` environment produces the
  stated signal (or the rail is corrected to match)

### Requirement: Authorization and honor-system preserved
Any edition lab that attacks a target SHALL carry the authorization note: only test systems you own or
have written permission to test, and point at intentionally vulnerable or owned targets. This binds the
identity-aware-proxy labs (which touch real access) and the red-team module (which attacks the
deployment). Completion SHALL rest on measurable, self-checked **success criteria** and a committed
**deliverable**, with no grading, receipt, or credential.

#### Scenario: Attack lab carries authorization
- **WHEN** an edition lab attacks a target
- **THEN** it states the authorization rule and points at an intentionally vulnerable / owned target

#### Scenario: Honor-system completion
- **WHEN** a learner finishes an edition lab
- **THEN** they self-verify against measurable success criteria and commit a portfolio deliverable; no
  tool grades or gates completion

