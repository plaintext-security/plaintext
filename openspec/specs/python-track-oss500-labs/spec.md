# python-track-oss500-labs Specification

## Purpose
TBD - created by archiving change add-python-oss500-edition. Update Purpose after archive.
## Requirements
### Requirement: Cognitive-load labs preserve the `sift` spine
Each module's `lab.md` body SHALL be rewritten to the cognitive-load template at
`plaintext-labs/python-for-security/<NN>/lab.md` (the canonical symlink target), and SHALL continue the
single evolving **`sift`** tool — adding that module's capability to the same tool, NOT reframing the lab
as a standalone project. The lab **environments** SHALL be unchanged.

#### Scenario: Lab grows the same tool
- **WHEN** a rebuilt `lab.md` is reviewed
- **THEN** it adds its stage to the same `sift` tool grown across the track, and no env file was modified

### Requirement: Cognitive-load template applied
Each `lab.md` SHALL contain a flight card (6±1 facts + why each), a warm-up, the concept folded into each
step, `▸ On track if:` rails, a recall check, and one finish line plus a definition-of-done checklist.

#### Scenario: Template elements present
- **WHEN** a rebuilt `lab.md` is reviewed
- **THEN** it contains a flight card, warm-up, folded concepts, at least one `On track if:` rail, a recall
  check, and a single finish line with a definition-of-done checklist

### Requirement: Intermediate-plus altitude (objective-level rails)
`▸ On track if:` rails SHALL be objective-level SIGNALS (an observable outcome), NOT transcribed commands,
because the track assumes a learner who already writes Python and pairs with an AI copilot. Steps state the
objective and let the learner derive the how.

#### Scenario: A rail states a signal, not a command
- **WHEN** a lab step sets an objective
- **THEN** its rail describes an observable success signal (e.g. "the validator rejects the truncated
  event") rather than a copy-paste command sequence

### Requirement: Authorization preserved on the red-team lab
The module 08 lab (red-teaming the learner's own MCP server) SHALL carry the authorization note: only
attack the MCP server you built. Completion SHALL rest on measurable, self-checked success criteria and a
committed deliverable, with no grading.

#### Scenario: Red-team lab carries authorization
- **WHEN** the module 08 lab attacks the MCP server
- **THEN** it states that the learner attacks only their own `sift` MCP server

