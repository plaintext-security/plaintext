## ADDED Requirements

### Requirement: Edition replaces Track 11 in place
The change SHALL author the OSS-500-methodology edition and **promote it to replace** the original
Track 11 (owner disposition, superseding the pilot's parallel-edition approach): the 12 module
`README.md` files at `tracks/11-ztna/modules/<NN>/`, the 12 lab bodies at `plaintext-labs/ztna/<NN>/lab.md`
(symlinked into `tracks/`), and the overview at `tracks/11-ztna/README.md`, with all
"edition"/"experimental" framing removed, such that `mkdocs build --strict` passes and Track 11 reads as
the canonical track. The temporary `tracks/11-ztna-oss500/` staging directory SHALL be deleted.

#### Scenario: Promoted track builds and reads as canonical
- **WHEN** `mkdocs build --strict` is run
- **THEN** it exits 0 with no orphan-page or broken-link error, and Track 11 renders the new
  self-contained, diagram-rich content with no "OSS-500 edition" or "experimental" framing

#### Scenario: Staging directory removed
- **WHEN** the promoted repo is inspected
- **THEN** `tracks/11-ztna-oss500/` no longer exists and its temporary nav section is gone

### Requirement: Self-contained teaching core
Each module `README.md` SHALL teach the module's mechanism in original prose that stands on its own
without requiring an external click, with external resources demoted to optional `[depth]`-tagged
links. Self-containment SHALL be applied **per topic** per design D3: bridge/synthesis/niche content is
taught in full; a genuinely-better-covered commodity fundamental MAY instead lean on a curated link,
and where it does the README states why in one line.

#### Scenario: A module stands alone
- **WHEN** a reader reads a module README without opening any external link
- **THEN** they can explain the mechanism and complete the module's concept objectives from the prose
  and diagrams alone; external links add depth but are not required to understand the mechanism

#### Scenario: Per-topic link-out is deliberate, not accidental
- **WHEN** a module leans on an external resource for a core explanation rather than teaching it in full
- **THEN** the README explicitly marks that as a deliberate per-topic choice (a one-line rationale),
  rather than leaving a bare link standing in for missing teaching

### Requirement: Case-study seam to an authoritative source
Each module SHALL be anchored to a **real incident or CVE**, teaching the mechanism self-contained while
linking an **authoritative external writeup** for the narrative of the real attack (breach report, CVE
analysis, or MITRE ATT&CK case). The link SHALL resolve to the specific claimed resource (no invented
URLs); an unresolved anchor carries a `<!-- VALIDATE -->` marker resolved before the module ships.

#### Scenario: Mechanism owned, attack narrative borrowed
- **WHEN** a module presents its real-world anchor
- **THEN** the "how it works" is taught in the module's own prose, and the "how it played out in the
  wild" links a named, resolving authoritative writeup of the actual incident/CVE

### Requirement: Visual and diagram discipline
The edition SHALL ship a Plaintext-local visual-conventions doc adapted from OSS-500's `DIAGRAMS.md`
(Mermaid-as-code only; diagram-type-follows-concept; diagram placed at the top of the section it
summarizes with the surrounding prose compressed against it; theme-safe with no hard-coded colors; one
idea per diagram). Every module README over the density threshold SHALL carry at least one Mermaid
diagram; short or non-spatial sections MAY use de-densifying formatting (callouts, comparison tables,
"at a glance" leads) instead.

#### Scenario: Diagrams follow the convention
- **WHEN** a module README contains a Mermaid diagram
- **THEN** its type matches the concept shape per the conventions doc (sequence for protocol/token hops
  such as OIDC/PKCE, mTLS, or SPIFFE attestation; flowchart for policy/decision; stateDiagram for
  lifecycle/migration; graph for broker topology/binding), it sits atop the section it summarizes, and
  it uses no inline color/style hacks

#### Scenario: Walls of text are broken up
- **WHEN** a module README section would otherwise be a long unbroken block of prose
- **THEN** it is de-densified with a diagram and/or a callout, comparison table, or "at a glance" lead,
  without deleting any objective mapping, resource link, or gotcha

### Requirement: Honor system preserved
The edition SHALL retain Plaintext's honor-system model and SHALL NOT introduce checkpoint quizzes, an
objective-code tracker, or any receipt/credential. Concept mastery is self-checked (e.g. a "check
yourself" prompt and the lab's measurable success criteria), not graded or gated by tooling.

#### Scenario: No grading machinery
- **WHEN** the edition is reviewed for assessment artifacts
- **THEN** there is no quiz-scoring, tracker-YAML, or receipt/credential mechanism; completion rests on
  self-checked success criteria and the committed portfolio deliverable

### Requirement: Original voice
All prose SHALL be original per `CLAUDE.md` — OSS-500 (and any proprietary course material) may inform
topic coverage and diagram shape, but prose and structure MUST be Plaintext's own, not copied.

#### Scenario: No copied prose
- **WHEN** an edition module is compared against its OSS-500 counterpart or any proprietary source
- **THEN** the teaching prose is original Plaintext writing, not a paraphrase-free lift

### Requirement: Definition of done per module
A module SHALL be considered complete only when its README teaches the mechanism self-contained, carries
at least one diagram (or justified de-densification), anchors to a real incident/CVE with a resolving
authoritative writeup, every link resolves, and its standalone lab (governed by `ztna-track-oss500-labs`)
is present and wraps a validated environment.

#### Scenario: Module meets the bar
- **WHEN** a module is proposed as done
- **THEN** all of: self-contained prose, ≥1 diagram-or-justified-de-densification, a resolving
  case-study anchor, resolving links, and a present validated-environment lab are satisfied
