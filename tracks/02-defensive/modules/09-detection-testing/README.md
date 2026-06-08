# Module 09 — Detection Testing & Tuning

**Defensive Operations** — *an untested detection is a hope; fire the real technique and find out.*

## Why this matters
Detections rot. The only way to know yours actually work is to *fire the technique* and watch —
purple teaming. Atomic Red Team runs real ATT&CK techniques safely and repeatably, so you can
validate that your detection catches the behaviour, measure your false-positive rate, and tune. This
closes the loop: attack → detect → tune, the daily reality of detection engineering.

## Objective
Run a real ATT&CK technique with Atomic Red Team, validate your detection catches it, and tune for
false positives.

## Learn (~4 hrs)

**Adversary emulation**
- [Atomic Red Team explained — Red Canary (video)](https://www.youtube.com/watch?v=eAtlwqXDZYc) — a crash course from the project's own team.
- [Atomic Red Team (project + atomics)](https://github.com/redcanaryco/atomic-red-team) — the library of real, ATT&CK-mapped tests you'll run.

**Method**
- [MITRE ATT&CK](https://attack.mitre.org/) — pick the technique; the atomic maps to it directly.

## Key concepts
- Purple teaming: attack → detect → tune
- Detection validation (does it actually fire?)
- True/false positives and negatives
- Tuning for signal without losing coverage
- Coverage as a moving target

## AI acceleration
A model helps interpret why a detection didn't fire and suggests tuning — useful. But it can't run the
test or see your environment's noise; it'll suggest a threshold that looks clean and silently drops
real detections. You run the atomic, read the result, and own the tuning.
