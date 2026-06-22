# Authoring Plaintext modules (v2 — the type-driven model)

*This is the canonical authoring guide for the curriculum redesign. It supersedes the module-shape
guidance in `CONTRIBUTING.md` (which still governs the build mechanics — MkDocs, nav, secret hygiene,
the grading machinery). Where the two disagree on module **shape**, this wins.*

## What changed, in one paragraph

The old model was: *every module is a "bridge" (original concept prose) plus a hands-on lab.* That's
true but under-specified — it produced a uniform essay-then-lab shape that fit security-analysis modules
and fought engineering/AI modules. The new model: **every module is one of a small set of named *types*,
each anchored on something real, each ending in an owned, committed artifact.** The bridge-prose essay
is now *one* type's shape (the judgment types), not the universal one. Pick the type that fits the
content; write to its template.

## The non-negotiable spine (every type obeys these)

1. **Anchor on something real.** A public breach, a real engineering disaster, a reference architecture,
   the actual toil being eliminated, a documented AI incident, a labelled corpus. Never an invented toy
   when a real artifact exists. Pull anchors from `planning/SOURCES.md`.
2. **Make the learner commit a judgment.** Where intuition reliably misleads, that's a *predict-then-
   reveal*; where it doesn't, it's a design/build/measure decision they must defend. Either way the
   learner takes a position, not just reads one.
3. **End in an owned, committed artifact.** A verdict memo, a guardrail, a working system, an ADR, an
   eval harness, a migration runbook, review findings. "AI drafts → you review every line → you own it."
4. **Ship a validated lab.** The module is not done until its lab environment is built and
   `make up`/`make demo` has actually been run and works (see the validated-lab bar below).

## Step 1 — Pick the type

The 16 types and their authoring templates live in **`planning/MODULE-TYPE-LIBRARY.md`**. Read the "Use
when" tells and pick the one that matches the content. The decision rule when two fit: **choose by the
deliverable the learner should walk away with** — that's the module's real point. If none fits, the
module is probably doing two jobs; split it.

Quick index:

| Family | Types | The verb |
|---|---|---|
| I · Judgment | 1 Concept Autopsy · 2 Misconception Reveal · 3 Blast-Radius Trace · 4 Audit→Build→Verify · 5 Detonate&Detect · 6 Reconstruct | observe / attack |
| II · Build | 7 Build-&-Operate · 8 Judgment-as-Code/Gate · 9 Tool-Build | build |
| III · Design | 10 Design→red-team-your-design · 11 Decision/ADR · 12 Migration/Brownfield | design / decide / migrate |
| IV · Measure | 13 Eval Harness · 14 Adversarial Review | measure / review |
| V · AI-adversarial | 15 Red-team-the-AI | attack |
| VI · Operate | 16 Drift/Steady-State | operate |

## Step 2 — Rules scale with the type (the charter amendment)

This is the core correction from the old guide. **One size taught two different jobs.** The rules now
scale:

- **Judgment types (Family I) and concept modules** earn the full **predict-then-reveal bridge**: "The
  core idea" is restructured into call-it-first prompts whose reveal *is* the teaching. The bridge-prose
  quality checklist in `CONTRIBUTING.md` applies **here**.
- **Build / design / measure types (Families II–VI)** are **build-first**: lead with the thing being
  built, let the real anchor carry the stakes, and do **not** front-load a long essay or force a
  prediction quiz. Their "core idea" is the architecture + the one load-bearing judgment, kept short.
- **Beginner tracks stay skill-first.** Predict-then-reveal is reserved for the handful of places a
  beginner's intuition is reliably *wrong* and the correction is load-bearing. The breach is a short
  hook, never a horror story.
- **The "Automate & own it" beat scales too.** For security-analysis modules it's *judgment-as-code* (a
  guardrail/eval). For beginner modules it's *a small reviewable script*. Don't bolt an enterprise gate
  onto a literacy module.

The test for a prediction prompt, everywhere: *would a competent learner at this level likely guess
wrong, and is the correct answer load-bearing?* If not, skip it and teach the skill well.

## Step 3 — Write to the type's template

Each type in the library gives a **README shape**, a **Lab shape**, the **deliverable**, the
**self-check signal** (how the learner verifies they're done — honor system, no grader), and the
**exemplar to copy**. Use them. The README still keeps the recognizable house
sections (the `module-meta` line, an objective, *Learn*, *Key concepts*, *AI acceleration*); what varies is
whether "The core idea" is a predict-then-reveal or a build/decision framing.

## The real-anchor rule

- **Cite primary sources** — court/regulator filings, first-party post-mortems, the discovering
  researcher's writeup, CVE/NVD, CISA KEV, MITRE ATT&CK, RFCs, tool docs. Prefer these over journalism.
- **Do not invent URLs.** If unsure a link resolves, name the source precisely and mark it
  `<!-- VALIDATE -->`. Every `VALIDATE` is resolved before the module ships.
- **Vary anchors across a track** — don't hang five modules on one breach. The catalogue and vetting
  checklist are in `planning/SOURCES.md`.
- **Reach beyond AWS / one vendor** where it proves the point is provider-agnostic (Azure/GCP incidents,
  multi-cloud).

## The honesty rules

- **State tooling limits.** If a simulator doesn't enforce what production does (LocalStack ≠ IAM
  enforcement), say so and use the honest substitute (logical evaluation, `simulate-principal-policy`).
- **"Assessed from config" vs "exploited."** If a hop can't be reproduced locally, label it as assessed,
  not demonstrated. Never imply a thing ran that didn't.
- **No silent caps.** If a lab bounds coverage (a sample, a held-out set, no-retry), say what was left out.

## The validated-lab bar (a module isn't done until…)

- The lab environment exists — colocated with the module during the redesign, destined for
  `plaintext-labs/<track>/<NN-module>/` at promotion.
- `make up && make demo && make down` has **actually been run** on a Linux runner and works (add the
  `.ci-demo` marker only then; learner-exercise and VM/cloud labs stay unmarked — see `CONTRIBUTING.md`).
- The **Success criteria are observable and self-verified** — honor system, no grader. Make them
  concrete (a file exists, a tool exits 0, a detection fires on the attack and is quiet on benign data)
  so the learner can honestly check their own work; each library entry names the self-check signal. Hold
  general-solution claims to a **held-out** set, never the demo set — doubly true for Type 13 (Eval Harness).
- A `lab.md` that only references an external target or an untested `docker run` line is a **stub**, not a
  finished lab.

## The AI posture (now first-class, not a footnote)

The standing stance is unchanged — **AI authors → you review → you own it** — but the redesign promotes
two of its consequences to *their own module types*: **Adversarial Review (14)** makes "catch what the
model got wrong" the lab, and **Eval Harness (13)** makes "measure it, don't trust the vibe" the
deliverable. Any AI-touching or detection module that builds on vibes (no eval) is incomplete by this
guide.

## What still governs (from `CONTRIBUTING.md`)

The build mechanics are unchanged: MkDocs (`docs_dir: tracks`, explicit `nav:`, `mkdocs build --strict`),
the two-repo split (prose here, runnable labs in `plaintext-labs`), and secret & artifact hygiene (never
commit captures, keys, dumps). **There is no grading, receipt, or credential machinery** — Plaintext is an
honor system; the committed portfolio artifact is the only proof. Read `CONTRIBUTING.md` for the mechanics;
read this for *what shape a module takes and why*.

## Definition of done (a module)

1. Tagged with a **type**; written to that type's template.
2. **Anchored** on a real, cited artifact (no `VALIDATE` markers left).
3. Rules-scaled correctly (predict-then-reveal vs build-first per the type).
4. **Lab built and validated** (`make demo` green); Success criteria observable and self-checkable.
5. Ends in the **owned artifact** the type prescribes.
6. Honest about tooling; original prose; AI parts reviewed and noted.
