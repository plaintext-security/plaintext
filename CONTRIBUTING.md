# Contributing to Plaintext

Thanks for helping make security education free and open.

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

Each **track** (`tracks/<NN>-<name>/README.md`) is a content map that ends in a
**capstone** — a portfolio-worthy artifact (its starter lives in `plaintext-labs`) that proves the track.

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
