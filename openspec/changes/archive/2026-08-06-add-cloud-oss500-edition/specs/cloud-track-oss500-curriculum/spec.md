## ADDED Requirements

### Requirement: Track 05 rebuilt in place in the OSS-500 methodology
The change SHALL rebuild Track 05 in place: the 17 module `README.md` files at
`tracks/05-cloud/modules/<NN>/` and the overview at `tracks/05-cloud/README.md`, authored to the OSS-500
methodology, such that `mkdocs build --strict` passes and Track 05 reads as the canonical track (no
staging directory, no "edition/experimental" framing). Existing per-module `cheatsheet.md` files SHALL be kept.

#### Scenario: Track builds and reads as canonical
- **WHEN** `mkdocs build --strict` is run
- **THEN** it exits 0 with no orphan-page or broken-link error, and Track 05 renders the rebuilt content

### Requirement: Self-contained teaching core
Each module `README.md` SHALL teach the module's mechanism in original prose that stands on its own
without requiring an external click; external resources SHALL be demoted to optional `[depth]`-tagged
links under a section titled **"Go deeper"** (never "Learn").

#### Scenario: A module stands alone
- **WHEN** a reader reads a module README without opening any external link
- **THEN** they can explain the mechanism from the prose and diagrams alone; external links add depth
  but are not required

### Requirement: Case-study seam to an authoritative source
Each module SHALL be anchored to a real cloud incident, CVE, or authoritative framework, with the
mechanism taught in our own prose and the attack/finding narrative linked to a resolving authoritative
source. The change SHALL NOT invent URLs; an uncertain new link carries `<!-- VALIDATE -->` and is
resolved before ship.

#### Scenario: Mechanism owned, narrative sourced
- **WHEN** a module presents its anchor
- **THEN** the "how it works" is taught in the module's prose and the narrative links a named, resolving
  authoritative source

### Requirement: Visual and diagram discipline
Each module README over the density threshold SHALL carry at least one theme-safe Mermaid diagram
authored to `VISUAL-CONVENTIONS.md` (type follows concept, atop the section it summarizes, no inline
colors), targeting 2–4 diagrams per module, and SHALL use de-densifying formatting (callouts, tables,
"at a glance" leads) to break up walls of text.

#### Scenario: Diagrams follow the convention
- **WHEN** a module README contains a Mermaid diagram
- **THEN** its type matches the concept shape, it sits atop the section it summarizes, and it uses no
  inline color/style hacks

### Requirement: Honor system and original voice preserved
The change SHALL NOT introduce quizzes, an objective-code tracker, or receipts; completion rests on
self-checked success criteria and committed deliverables. All prose SHALL be original per `CLAUDE.md`,
preserving every real link, CVE ID, and gotcha from the source module.

#### Scenario: No grading machinery, original prose
- **WHEN** the rebuilt track is reviewed
- **THEN** there is no quiz/tracker/receipt mechanism, and the teaching prose is original Plaintext
  writing rather than a copied source
