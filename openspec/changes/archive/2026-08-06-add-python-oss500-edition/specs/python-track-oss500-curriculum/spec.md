## ADDED Requirements

### Requirement: Track 09 enhanced in place in the OSS-500 methodology
The change SHALL enhance Track 09 in place: the 9 module `README.md` files at
`tracks/09-python-for-security/modules/<NN>/` and the overview at
`tracks/09-python-for-security/README.md`, such that `mkdocs build --strict` passes and the track reads as
canonical (no staging dir, no "edition/experimental" framing). Existing per-module `cheatsheet.md` files
SHALL be kept, and the track's `sift`-spine design, intermediate-plus altitude, and "parse, don't trust"
through-line SHALL be preserved.

#### Scenario: Track builds and preserves its design
- **WHEN** `mkdocs build --strict` is run
- **THEN** it exits 0 with no orphan-page or broken-link error, and Track 09 still describes the single
  evolving `sift` tool grown across the modules

### Requirement: Self-contained teaching with "Go deeper"
Each module `README.md` SHALL teach its mechanism in prose that stands on its own; external resources SHALL
be demoted to optional `[depth]`-tagged links under a section titled **"Go deeper"** (never "Learn").

#### Scenario: A module stands alone
- **WHEN** a reader reads a module README without opening any external link
- **THEN** they can understand the mechanism from the prose and diagrams alone

### Requirement: Visual and diagram discipline
Each module README SHALL carry **2–4 theme-safe Mermaid diagrams** authored to `VISUAL-CONVENTIONS.md`
(type follows concept, atop the section it summarizes, no inline colors), since the track currently has
zero.

#### Scenario: Diagrams follow the convention
- **WHEN** a module README contains a Mermaid diagram
- **THEN** its type matches the concept shape and it uses no inline color/style hacks

### Requirement: Real-artifact anchor made explicit
Each module SHALL make its real anchor explicit — genuine Suricata EVE JSON, or a real tool/CVE the code
processes (`torchtriton`, command injection, prompt injection) — linked to an authoritative source; the
change SHALL NOT invent URLs (uncertain new links carry `<!-- VALIDATE -->` and are resolved before ship).

#### Scenario: Anchor is real and sourced
- **WHEN** a module presents its anchor
- **THEN** it is a real artifact/incident with a named, resolving source, not an invented example

### Requirement: Honor system and altitude preserved
The change SHALL NOT introduce quizzes, a tracker, or receipts. Prose SHALL remain **intermediate-plus**
(assuming a learner who writes Python and pairs with a copilot) and original per `CLAUDE.md`, preserving
every real link, ID, and gotcha.

#### Scenario: No grading; altitude intact
- **WHEN** the enhanced track is reviewed
- **THEN** there is no grading machinery and the prose still targets an intermediate-plus learner
