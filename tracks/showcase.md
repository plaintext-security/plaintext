# Showcase

The point of Plaintext is the thing you walk away owning. Every lab ends in a committed artifact,
every phase in a portfolio-worthy build, and every track in a **capstone** — and this page is where
that work gets seen.

This is a wall of finished work, not a leaderboard. There's no paywalled exam and no certificate to
frame: your repos *are* the credential. The showcase exists so a capstone you're proud of can point
a hiring manager at proof — and so the next learner can see what "done" looks like.

## What belongs here

- **Capstones** — the per-track integrative build (the offensive engagement report, the
  detection-as-code pipeline, the SoC copilot, the cloud-hardening project).
- **Phase projects** — the larger mid-track builds that integrate a phase's modules.
- **Standout lab artifacts** — a detection rule that caught a real technique, a tool from an
  **Automate & own it** step that other learners actually use.

Every entry is a real, public repo with a green `make grade` receipt where the lab provides one, so
each link is verifiable rather than a claim.

## Featured work

!!! note "This wall is seeded by the community"
    Plaintext is early and we are not inventing entries. The table below is the format; real
    capstones land here as learners submit them (see [How to get featured](#how-to-get-featured)).
    Until then, treat it as the template, not a portfolio to compare yourself against.

| Learner | Track | Capstone / project | Repo | `make grade` |
|---|---|---|---|---|
| *(your handle)* | *(e.g. 02 · Defensive Operations)* | *(one-line description of the build)* | *(link to public repo)* | *(✅ receipt / n/a)* |
| — | — | *Be the first — submit yours below.* | — | — |

## How to get featured

1. **Finish a capstone or phase project** and push it to a **public** repo of your own. Include a
   short README: what it does, how to run it, and what you'd do next.
2. **Run `make grade`** if the lab ships it, and commit the resulting `receipt.json` — that's the
   verifiable green check that backs your entry.
3. **Scrub artifacts.** No captured credentials, keys, PII, real malware samples, or client data —
   see [secret & artifact hygiene](#a-note-on-hygiene) below. Sanitize before you publish.
4. **Submit it** one of two ways:
    - Post in **`#wins`** on the [Discord](https://discord.gg/sZjQYqVvG) with the repo link, or
    - Open a PR adding a row to the table above (handle, track, one-line description, repo link,
      grade status). A maintainer reviews for the hygiene checklist and merges.

We feature work that someone else could *learn from* — clean, reproducible, honestly scoped. A small
build you fully understand beats a sprawling one you can't explain.

## A note on hygiene

The labs drive real tooling and emit exactly the files you must never publish: packet captures,
keys and credentials, memory and disk images, tokens, and verbose logs. Commit the *write-up,
script, rule, or report* — never the raw artifacts. When in doubt, regenerate from a clean run and
review the diff before you push.

## For employers

These repos are unedited learner work, reviewed only for hygiene and reproducibility — not curated
to flatter. A green `make grade` receipt means the artifact passed the lab's automated checks. If a
capstone interests you, the repo's history shows the work, and the learner is reachable in the
[Discord](https://discord.gg/sZjQYqVvG) `#career-and-jobs` channel.
