# Module 14 — Living-off-the-Land & Evasion

*Type 5 · Detonate & Detect — accomplish download/execute/persist using only native LOLBAS/GTFOBins binaries and pair each with the behavioural telemetry it still leaves (why `certutil` spawned by Word is anomalous). (Secondary: Misconception Reveal — evasion shifts detection from signature to behaviour, it doesn't make you invisible.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Offensive Security** — *the quietest attacks bring no tools — they use what's already there.*

<!-- module-meta -->
**Difficulty:** Advanced &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Modern defenses flag unknown binaries, so the quietest attacks bring *no* tools — they abuse the
    trusted, signed, native binaries already on the box: `certutil` to download, `regsvr32`/`mshta` to
    execute, `bitsadmin` to transfer. An EDR can't simply block `certutil.exe` — it's Microsoft-signed
    and runs benignly a thousand times a day. The insight that keeps this honest: **evasion shifts you
    from signature detection to behavioural detection — it does not make you invisible.** The
    *behaviour* is still anomalous even when the *binary* is trusted.

## Why this matters
Modern defenses flag unknown binaries, so real operators "live off the land": abusing trusted,
signed, native tools (certutil, regsvr32, bitsadmin) to download, execute, and persist without
dropping anything obvious. LOLBin abuse is among the most common techniques in real intrusions
precisely because it blends into normal activity — which is exactly why understanding it
matters for both red and blue.

## Objective
Accomplish attacker tasks (download, execute, persist) using only native binaries, and
understand the telemetry that still catches them.

## The core idea
Modern defenses flag unknown binaries, so the quietest attacks bring *no* tools — they abuse the
trusted, signed, native binaries already on the box: `certutil` to download, `regsvr32`/`mshta` to
execute, `bitsadmin` to transfer. "Living off the land" is the name, and LOLBin abuse is among the most
common techniques in real intrusions precisely because it hides in the noise of legitimate admin
activity. An EDR that blocks `unknown.exe` can't simply block `certutil.exe` — it's signed by Microsoft
and runs a thousand times a day for benign reasons.

!!! note "The mental model"
    **Evasion shifts you from signature detection to behavioural detection — it does not make you
    invisible.** You can dodge "is this binary known-bad?", but you can't dodge "why is `certutil`
    downloading an executable from the internet, spawned by Word?" The *behaviour* is still anomalous
    even when the *binary* is trusted. That is the entire reason the defensive track invests in process
    ancestry and behavioural detection — they are the answer to living-off-the-land.

!!! warning "The gotcha"
    "Fileless" and "LOLBin" do not mean "undetectable." Defeating signature detection just hands the
    problem to behavioural detection, which catches the anomalous parent-child chain regardless of how
    trusted the binary is. Evasion that isn't is just extra noise that gets you caught.

!!! tip "AI caveat"
    A model suggests LOLBin one-liners instantly, but will just as happily hand you one that's heavily
    signatured or doesn't exist on the target. Verify each against LOLBAS/GTFOBins and the box's actual
    binaries. (This module is dual-use — the goal is to understand the technique so you can *detect* it;
    keep it in your own lab.)

## Learn (~4 hrs)

**The technique**
- [Living Off The Land Attacks Explained — LOLBins (video)](https://www.youtube.com/watch?v=lDK384LXhpU) — why and how attackers abuse native tooling.
- [LOLBAS Project](https://lolbas-project.github.io/) (Windows) and [GTFOBins](https://gtfobins.org/) (Unix) — the canonical catalogs; you'll search these constantly.

**Where it sits**
- [MITRE ATT&CK — Defense Evasion (TA0005)](https://attack.mitre.org/tactics/TA0005/) — the tactic, and how detections catch LOLBin abuse anyway.

## Key concepts
- Why "fileless" / LOLBin techniques evade signature defenses
- Common LOLBins: download cradles, execution, persistence
- Application allow-listing bypasses
- Basic AV/EDR evasion concepts — and their limits
- Why behaviour-based detection still catches you

## AI acceleration
A model suggests LOLBin one-liners instantly — and just as easily suggests one that's heavily
signatured or that doesn't exist on the target. Verify each against LOLBAS/GTFOBins and the
target's actual binaries; evasion that isn't is just noise. (This module is dual-use — the goal
is to understand the technique so you can *detect* it; keep it in your own lab.)

!!! question "Check yourself"
    - Why can't an EDR just block `certutil.exe` the way it blocks an unknown binary?
    - What does evasion actually shift — and why does that mean "fileless" isn't "undetectable"?
    - Give an example of a LOLBin chain whose individual binaries are trusted but whose behaviour is anomalous.
