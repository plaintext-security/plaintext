# Start Here

New to Plaintext? This page is the 5-minute orientation: how the curriculum works, what order to
take it in, and how to prove what you've learned. Read it once, then dive into
[Foundations](00-foundations/README.md).

## What Plaintext is (and isn't)

Plaintext is a hands-on, job-ready security curriculum — free, open, and AI-native. It is **not** a
pile of links and **not** a textbook you passively read. Every module follows the same shape:

- **The core idea** — original prose that builds the *mental model* and the practitioner translation
  (the "bridge"). This is what we write; it's the part no single link gives you.
- **Learn** — a curated, time-boxed path to the best existing explanations of the mechanics. We
  *curate* these rather than re-teach them.
- **The lab** — a one-command environment where you *do* the thing and commit an artifact you own.

So the rhythm is: read the bridge → follow the Learn path for the details → do the lab → keep the
artifact. The depth comes from the bridge + the lab + the automation you build, not from
re-reading fundamentals.

## What order to take it in

- **Everyone starts with [Foundations (Track 00)](00-foundations/README.md).** It's the bedrock the
  rest assumes — networking, Linux, scripting, crypto, web, threat modeling.
- **Then pick a specialization.** Tracks are standalone and depend only on Foundations, never on each
  other — so go where your goal points: offense ([01](01-offensive/README.md)), defense
  ([02](02-defensive/README.md)), forensics, malware, cloud, AD, hardening, crypto, Python,
  automation, ZTNA, or AI-augmented ops. Cross-references *enrich* but never *gate*.
- **Lean into the offense ↔ defense interplay.** Many labs have a matched pair (attack here, detect
  it there). Doing both sides is where the understanding compounds.

## Prerequisites

A computer that runs **Docker** (most labs are `git clone` + `make up`), comfort in a terminal, and
a **GitHub account** (your committed artifacts *are* your portfolio). A few labs need a VM or a
cloud free-tier account where the domain demands it (Active Directory, cloud) — each says so.

## How the labs work

The curriculum prose lives in this repo; the runnable labs live in
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs). For a reference lab:

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/<track>/<module>
make up      # start the environment
make demo    # watch the worked example
make grade   # check your work (writes a completion receipt)
make down    # stop it
```

Every lab ends in an **Automate & own it** step: turn the manual work into a small reusable script.
The standing posture for AI is **AI authors → you review → you own it** — automation is assumed; the
skill is directing and rigorously reviewing it. Never submit something you can't reproduce by hand.

## How to prove what you learned

There's no paywalled exam — your **portfolio is the credential**:

- Each lab's committed artifact (writeup, script, detection rule, report) is evidence.
- `make grade` runs the lab's checks and, on a pass, writes a **`receipt.json`** you commit to your
  own repo — verifiable, and it runs as a green check in *your* GitHub Actions.
- A track's **capstone** integrates the whole track into one portfolio-worthy build.

## Get help

Stuck on a lab or a concept? Join the **[Discord](https://discord.gg/sZjQYqVvG)** — there's a help
forum per track plus `#labs-and-docker`. Per-page comments (via GitHub Discussions) live at the
bottom of each module page. New to a term? Check the [Glossary](glossary.md).
