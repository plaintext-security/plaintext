# Contributing to Plaintext

Thanks for helping make security education free and open.

> **Redesign in progress (`feat/verdict-redesign`).** Module *shape* is now governed by the type-driven
> model in **[`AUTHORING.md`](AUTHORING.md)** and **[`planning/MODULE-TYPE-LIBRARY.md`](planning/MODULE-TYPE-LIBRARY.md)**
> — read those before authoring a module. This file still governs the build mechanics (MkDocs, nav,
> grading machinery, secret hygiene). Where the two disagree on module shape, `AUTHORING.md` wins.

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-module-name`
3. Add your content following the structure and templates below
4. Preview it locally (see below), then submit a pull request

New modules can also be proposed first via the **New Module** issue template
(`.github/ISSUE_TEMPLATE/new-module.md`) — it captures everything a module needs.

## Preview locally

The site is built with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
from the Markdown under `tracks/`:

```bash
python3 -m pip install -r requirements.txt
mkdocs serve            # live preview at http://127.0.0.1:8000
mkdocs build --strict   # what CI runs — fails on broken links or pages missing from nav
```

When you add a module, also add its pages to the `nav:` tree in `mkdocs.yml`
(`--strict` fails on any page that is not in the nav).

## Module structure

Each module lives at `tracks/<track>/modules/<NN>-<name>/` and contains:

- `README.md` — the concept **and the guided study path** (the *Learn* section)
- `lab.md` — the hands-on **project** instructions

The lab's *runnable* environment (Dockerfiles, `docker-compose`, seed data, harnesses) does **not**
live here — it lives in the companion repo **[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs)**
at `<track>/<NN-module-name>/`, and `lab.md` links to it. Prose here, runnable there.

**A module is not done until its lab is built *and validated*** — the `plaintext-labs` directory exists
(custom build or wrapped known image) and you have actually run `make up`/`make demo` and seen it work.
A `lab.md` that only references an external target or an untested `docker run` line is a stub, not a
finished lab. A track counts as complete only when all its labs meet this bar.

Each **track** (`tracks/<NN>-<name>/README.md`) is a content map that ends in a
**capstone** — a portfolio-worthy artifact (its starter lives in `plaintext-labs`) that proves the track.

Tracks group their modules into **phases**, each ending in a **phase project**, and the **capstone is
the final phase's project, restated** in the `## Capstone` section. Keep the two in sync: the
`## Capstone` description (and its rubric) must match the last `Phase N · … — **Project:** the track
capstone …` line — same scenario, same deliverable. A `## Capstone` that describes an *earlier* phase's
project is a bug (the capstone integrates all phases but *culminates* in the final one). When you edit
either the phases list or the capstone, update the other.

**A module is a guided learning unit, not a summary page — and not a bare link list.** Plaintext
follows a **hybrid model**: *curate the raw explanation, write original prose for the bridge.*
The step-by-step "how it works" is covered well elsewhere — **link** to it in the **Learn** path.
Your original writing goes into **The core idea**: the mental model, the practitioner translation
("X is really the Y you already know"), the synthesis and judgment no single linked source gives.
A concept paragraph plus three bare links is *not* a finished module; neither is re-explaining at
length what a Learn link already nails. See "The hybrid model" and "Module anatomy" in `CLAUDE.md`,
and copy the reference exemplar at `tracks/02-defensive/modules/08-detection-as-code/`.

## Content rules

- **Write the bridge in your own words; curate the basics.** No copying from SANS,
  Offensive Security, or other proprietary course material — prose must be original. But
  originality goes where Plaintext adds value (the mental model, the practitioner translation,
  the synthesis); don't rewrite the step-by-step explanation a free resource already covers well
  — link to it in *Learn* instead.
- **Open-source first, not open-source only.** Prefer OSS tools; free/community editions
  and the genuine real-world tool are fine where that is what the job uses. Labs must
  stay reproducible at zero cost.
- **Hands-on and job-ready** — "in the dirt," not certification theory. Every module ends
  in something the learner *does* and *commits*.
- **Docker-first labs.** Default to containers; use VMs or cloud free-tier accounts only
  where the domain demands it (Active Directory, cloud).
- **AI woven through.** Show the AI-acceleration move for the topic, and the judgment that
  goes with it: *AI authors → you review → you own it*.
- **Cite multiple primary sources** (CVEs, RFCs, tool docs, research papers, MITRE ATT&CK).
- **Keep lab artifacts out of commits** — packet captures, keys, dumps, and logs are
  referenced in the prose, never checked in (see `.gitignore`).

## Module README template

```markdown
# Module NN — Title

**<Track>** — *one-line hook: why this is worth your time.*

## Why this matters
The 90-second "so what" — and where this gets reused in later tracks.

## Objective
What the learner will be able to do after this module (measurable, job-relevant).

## The core idea
2–5 short paragraphs of **original prose** — the bridge, and the heart of the module. The mental
model, the practitioner translation ("X is really the Y you already know"), the synthesis across
your Learn sources, and the judgment/gotchas no single link states. Frame and connect; do **not**
re-derive what a Learn link explains step-by-step.

## Learn (~N hrs)
A curated, time-boxed, opinionated study path — this carries the raw explanation, so "The core
idea" doesn't have to. Group it, lead with video where it helps, and say why each resource earns
the time.

**<Sub-topic>**
- [Resource title](https://…) — one line on what it gives you and why it's here.
- [Resource title](https://…) — …

## Key concepts
A short recap checklist of "The core idea" — not the teaching itself.
- Concept 1
- Concept 2

## AI acceleration
The specific way AI/automation speeds this up — and what you must review and own.
```

### Required top line — the type tag
Every module README opens with a one-line italic **type tag** in the form
`*Type N · <Type Name> — <one-line, module-specific description>. (Secondary: <Type Name> — <short>.) [Go to the hands-on lab →](lab.md)*`,
where the type is one of the constructs in [`planning/MODULE-TYPE-LIBRARY.md`](planning/MODULE-TYPE-LIBRARY.md)
(Type 1 Concept Autopsy … Type 16 Drift/Steady-State). This is **not optional** and must match the
module's actual shape. (An earlier `Variant D · …` scheme has been retired — do not use it.)

### Optional presentation layer (the "deluxe" tier)
A few exemplar modules — **offensive/06-web-injection**, **defensive/08-detection-as-code**,
**defensive/18-detection-drift**, **defensive/19-reviewing-ai-detections** — add richer Material
furniture on top of the baseline anatomy: a `!!! abstract "In 60 seconds"` summary, `!!! note/warning/tip`
admonitions and a `??? note` "go deeper" collapsible inside *The core idea*, and a closing
`!!! question "Check yourself"` self-quiz. **This is the preferred presentation and the template for
new and substantially-edited modules** — it reads better and aids retention. It is **not** a blocking
back-fill requirement for the existing baseline modules; adopt it incrementally as modules are touched.
Keep the same section *content*; the furniture is presentation only.

## Bridge-prose quality checklist

**"The core idea" is the bar a module lives or dies on.** It is the original-prose bridge — the part
no Learn link can hand the reader. Before you call a module's core idea done, hold it against this
checklist. If it fails, it's a *thin* module (concept-plus-links) or a *regurgitation* module
(re-teaching what a link already nails) — both are unfinished.

A strong "The core idea" has, in 2–5 short paragraphs:

- [ ] **A mental model.** One sharp framing the learner keeps: *"a super-timeline is the `JOIN`
  you'd do by hand, with time as the join key"*, *"a port number is a hypothesis, not an answer"*,
  *"the graph is a road map and each edge is a road with its own toll and traffic camera."* Not a
  definition — a way to *think* about the thing.
- [ ] **A practitioner translation** — "X is really the Y you already know." Anchor the new concept
  to something the reader has done before (a firewall rule, a database join, a flow log), ideally
  naming the prior skill explicitly. This is the single most valuable move and the one most often
  missing.
- [ ] **Cross-source synthesis** — at least one connection no single Learn link makes: how this ties
  to another module/track (offense↔defense interplay especially), or how two linked sources fit
  together. The bridge connects; the links explain.
- [ ] **The judgment / the gotcha** — the non-obvious thing that separates someone who *uses* the
  tool from someone who *understands* it: the false-positive economics, the precondition that
  decides whether a vector works, the timezone error that fabricates a sequence, the "this is the
  loudest thing you'll do." State the trap and the discipline that avoids it.
- [ ] **The AI caveat, specific to this topic** — not "verify AI output" in the abstract, but the
  concrete failure mode here (it labels a CDN's polling "C2"; it proposes a vector whose
  preconditions your box doesn't meet; it invents events not in your data) and what the learner
  must check by hand.

And it must **not**:

- [ ] **Re-derive what a Learn link explains step-by-step** — no "how TCP works / how Kerberos works"
  walkthrough. If a linked resource covers the mechanism well, frame and connect it; don't rewrite it.
- [ ] **Be a list in disguise** — a paragraph that's just key concepts strung into sentences isn't
  bridge prose. Bold the load-bearing idea, but the prose around it must teach the *judgment*.

The exemplars to copy: [`00-foundations/.../01-security-principles`](tracks/00-foundations/modules/01-security-principles/README.md)
and [`02-defensive/.../08-detection-as-code`](tracks/02-defensive/modules/08-detection-as-code/README.md).

## Lab template

```markdown
# Lab NN — Title

## Setup
A *reference* lab ships its one-command environment in the **`plaintext-labs`** companion repo at
`plaintext-labs/<track>/<NN-module-name>/` (`docker-compose.yml` + a small bundled `data/` + a
`Makefile` with `up`/`down`/`reset`/`demo`). The `lab.md` here links to it:
`git clone …/plaintext-labs && cd <track>/<module> && make up`. (VM or cloud free-tier only if the
domain requires it.) Reproducible at zero cost.

**Choosing a lab target, in order of preference:** (1) **wrap a known vulnerable image** when a mature
one exists — Vulhub (per-CVE), OWASP Juice Shop, DVWA, CloudGoat — in your `docker-compose.yml`, with
our `Makefile`/demo on top (the default; if Vulhub has it, prefer Vulhub); (2) **point at an external
target** (PortSwigger Academy, a TryHackMe room) when hosting adds nothing; (3) **build a custom minimal
target** only when it teaches the mechanism better — legible/deterministic demo, attacker→fixer on the
source, or Meridian narrative. Never a toy standing in for a real CVE that already exists.

## Scenario
What you're doing and why — against an intentionally vulnerable target.

> Only test systems you own or have explicit written permission to test.

## Do
1. [ ] Step one
2. [ ] Step two   (each step feeds the next)

## Success criteria — you're done when
- [ ] Measurable outcome 1
- [ ] Measurable outcome 2

## Deliverables
What gets committed (the portfolio artifact). Reference captures/keys/dumps — never
commit them.

## AI acceleration
Where a model helps (triage, generation, summarising) and what you verify by hand.

## Connects forward
Which later modules/tracks build on this.

## Marketable proof
> The résumé bullet / interview sentence the learner can now honestly say.

## Stretch (optional)
- A harder extension for the motivated.
```

## Validating a lab (honor system — no grading)

Plaintext is an **honor-system** curriculum: there is **no automated grading, no receipts, and no
credentials**. A finished lab isn't *graded* — it makes its **Success criteria** clear enough that a
learner can verify them *for themselves*, and names a **Deliverable** (the portfolio artifact they commit
to their own repo). The committed work is the proof. Your job as an author is to make "you're done when…"
unambiguous, not to build a checker.

**What a finished lab provides:**

1. A `lab.md` with measurable **Success criteria** (checkbox "you're done when…") and a clear
   **Deliverable**. Where you can, make the criteria *observable* (a file exists, a tool exits 0, a
   detection fires on the attack and stays quiet on benign data) so self-verification is honest.
2. A `Makefile` with the standard targets — `up` / `down` / `reset` / `demo` (and `shell`/`check` where
   useful). `make demo` is the worked reference run, not a grader.
3. Capstones additionally ship a self-assessment **`rubric.md`** the learner grades their own work against
   (peer or reviewer feedback welcome).

**Hold "general" claims to a held-out set.** Where a lab's point is a *general* solution (a detection
quiet on benign data, a parser that works on unseen logs), have the learner test against data **distinct
from the `demo` set** — and say so in the criteria, so "it worked once" isn't mistaken for "it works."

**Opt the lab into CI (`.ci-demo`).** Labs CI runs `make demo` for a lab **only if** its directory
contains a `.ci-demo` marker — this is **lab quality assurance** (the lab runs on a clean runner), not
learner grading. Add one **only once `make up && make demo && make down` is green on a Linux runner.**
Do *not* add it to a learner-exercise lab (whose demo fails until the learner completes it) or a VM/cloud
lab (needs Windows, a hypervisor, or real cloud credentials) — those are intentionally left out of CI.
