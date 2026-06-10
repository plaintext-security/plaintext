# Instructor & Cohort Guide

Plaintext is built to be self-paced, but it works just as well run as a **cohort** — a bootcamp
section, a university security club, a SOC team leveling up together, or a mentor shepherding a few
learners through a track. This guide is for whoever is holding that group: how to pace it, how to
scaffold without spoon-feeding, and how to review the phase projects and capstones that are the real
deliverables.

The whole curriculum is CC BY 4.0 — use it, remix it, run a paid cohort on it. Credit Plaintext and
keep the [authorization rules](#the-non-negotiables) intact.

## The mental model for teaching this

Plaintext modules are deliberately *not* lectures. Each one is a **bridge + a curated Learn path + a
lab**: the original prose builds the mental model, the Learn links carry the step-by-step mechanics,
and the lab is where the learner *does* the thing and commits an artifact. Your job as instructor is
**not** to re-teach the Learn material — it's covered better by the resources it links. Your value is
the same as the curriculum's: synthesis, judgment, unblocking, and reviewing the work.

So a good session is mostly *their* hands on the keyboard. You frame the why, point at the Learn
path, and then get out of the way — surfacing only when someone is genuinely stuck or has produced
something worth reviewing.

## Pacing

A module is a few hours; a **phase** (several modules + a phase project) is the substantial unit; a
**capstone** integrates the whole track. Pace around the phases, not individual modules.

- **A sustainable cohort pace is one phase every 2–3 weeks**, at a few focused hours per week — fast
  enough to keep momentum, slow enough that the phase project gets real attention. Full-time
  bootcamp pace can run a phase a week; expect the phase projects to be where time actually goes.
- **Foundations (Track 00) is the bedrock** and everyone does it first. Don't let a cohort skip it to
  get to the "fun" track — the specialization labs assume it.
- **Tracks are standalone** (they depend only on Foundations, never on each other), so a cohort can
  pick one specialization and finish it end-to-end. Cross-references *enrich* but never *gate*, so
  you can follow the offense↔defense interplay without forcing two tracks at once.
- **Protect the phase project and capstone.** The temptation is to rush modules and shortchange the
  integrative builds — but those are the portfolio pieces. Budget real time for them.

A rough cohort cadence for one specialization track:

| Weeks | What | Checkpoint |
|---|---|---|
| 1–3 | Foundations phase 1 + labs | Each learner has a working Docker lab and first committed artifacts |
| 4–6 | Rest of Foundations + Foundations capstone | Capstone reviewed (see [Reviewing](#reviewing-phase-projects-and-capstones)) |
| 7–N | Chosen specialization, phase by phase | A phase project per phase; office-hours check-ins |
| Final | Track capstone | Capstone review + [Showcase](showcase.md) submission |

## Scaffolding without spoon-feeding

The labs deliberately scale their hand-holding: **Foundations** gives the objective plus a hint;
**specialization tracks** give the objective; **advanced** labs give just the scenario and the
outcome. Match your help to that — the goal is a learner who can derive the *how* from the Learn path
and `man`, not one who waits for the next command.

When someone's stuck, walk *up* the ladder of help, stopping as soon as they're unblocked:

1. **Point back at the Learn path** — "the [resource] in this module's Learn section covers exactly
   this; which part isn't landing?"
2. **Ask what they tried** — the exact command and full error, their environment. Half the time they
   debug it out loud while answering.
3. **Give the next *question*, not the next command** — "what does the container's log say?", "is the
   port actually listening?" Nudge the diagnosis, don't perform it.
4. **Show the mechanism only when the syntax itself is the lesson** — and even then, have them type
   it and explain it back.

The failure mode to avoid is becoming a walkthrough. A learner who copies your commands hasn't
learned the lab; a learner you asked three sharp questions has.

### On AI

AI is core to Plaintext, and learners *will* use it — that's intended. The standing posture is
**AI authors → you review → you own it**. As instructor, hold the line on the *own it* half: it's
fine to have AI draft the **Automate & own it** script, but the learner must be able to explain every
line, justify it, and reproduce the result by hand. "The AI wrote it and it passed" is not done.

## Reviewing phase projects and capstones

This is where you add the most value. Review for **understanding and reproducibility**, not polish.

**Before you review, the learner should hand you:**

- A **public repo** with a README: what it does, how to run it, what they'd do next.
- The **`make grade` receipt** (`receipt.json`) where the lab ships one — the green automated check.
- A clean tree — no captured credentials, keys, PII, memory/disk images, real malware, or client
  data committed (see [the non-negotiables](#the-non-negotiables)).

**What to look for:**

- **Reproducibility.** Can *you* clone it and `make up` / run it from the README alone? If it only
  runs on their machine, it isn't done.
- **They can explain it.** Pick one non-obvious decision and ask "why this and not that?" This is the
  single best signal — and it catches unreviewed AI output fast.
- **Honest scope.** A small, correct, well-understood build beats a sprawling one held together with
  copied snippets. Reward the former.
- **The Automate & own it step is real.** A reusable script/tool, not a transcript of manual
  commands — and the learner owns every line.
- **Hygiene held.** Artifacts referenced, not committed. Authorization respected (only intentionally
  vulnerable / owned targets).

**How to give it back:** lead with what worked, then **one or two** highest-leverage changes — not a
laundry list. End with a concrete "next" (a stretch goal, the matched offense/defense lab, or the
[Showcase](showcase.md) submission). A capstone that passes review and clears the hygiene checklist
is ready to feature.

A lightweight rubric you can adapt:

| Dimension | Looking for |
|---|---|
| Runs from README | Clean clone → up/run with no tribal knowledge |
| Correctness | Does the thing the lab/capstone asked; `make grade` green where present |
| Understanding | Learner explains key decisions and trade-offs unprompted |
| Automation owned | Reusable script/tool; every line reviewed and understood |
| Hygiene | No secrets/PII/samples committed; authorization respected |
| Scope & clarity | Honestly scoped; README makes the build legible |

## Running it on Discord

If your cohort lives in the [Plaintext Discord](https://discord.gg/sZjQYqVvG):

- **Use the track roles.** Self-assigned track roles let you @-mention your cohort to open a session
  or post a checkpoint. Ask a maintainer about a dedicated cohort channel or role if you're running a
  formal group.
- **Anchor on [Office Hours](office-hours.md).** Run your live check-ins in the 🎙 Office Hours voice
  channel (or a study room), and push the durable Q&A into the per-track `*-help` forums so it stays
  searchable for the next cohort.
- **Celebrate in `#wins`.** Finished capstones go in `#wins` and may land on the
  [Showcase](showcase.md) — proof is half of getting hired.

## The non-negotiables

These hold for every cohort, no exceptions:

- **Hack only what's yours.** Learners test only systems they own or have explicit written
  permission to test — and the labs point them at intentionally vulnerable targets (DVWA, Juice Shop,
  Vulhub, CloudGoat, CTF rooms). Never live or third-party systems.
- **No illegal goods.** No real malware samples, stolen data, credentials, or pirated course
  material (SANS/OffSec/etc.) shared in the cohort or committed to repos.
- **Respect the license.** CC BY 4.0 — credit Plaintext when you reuse or run a cohort on it.

These mirror the [community rules](https://github.com/plaintext-security/plaintext/blob/main/COMMUNITY.md);
breaking the first two is grounds for removal from the community.
