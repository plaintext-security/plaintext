# Foundations "Verdict" track — build status & open items

*Full 12-module rewrite drafted under this directory: track `README.md`, `DESIGN.md` (spine/brief), 12 ×
(README.md + lab.md), each module's lab env colocated beside it, and the capstone. Mirrors the cloud
`planning/cloud-track-d/` build. Honest punch-list below.*

## Done

- **27 files:** track README + DESIGN + 12 × (README.md + lab.md), all written to the beginner-honest,
  skill-first Verdict form.
- **Lab environments colocated.** Each module dir holds its runnable env (`Makefile`, `data/`, `demo.py`,
  Dockerfiles, scripts), copied from `plaintext-labs/foundations/`. `plaintext-labs` and the shipped
  `tracks/00-foundations/` are **untouched**. (Provisional layout — resort into `tracks/` + `plaintext-labs/`
  once a direction is chosen.)
- **Meridian fully scraped** (0 residual) across prose and the colocated env; the few seed strings
  de-branded to neutral framing. Each module names its *real* anchor instead.
- Every module anchored to a **real, public breach/primary source**: Equifax 2017, VENOM/WannaCry,
  exposed-Docker-API cryptojacking, Mirai 2016, Emotet persistence, SUNBURST DNS C2, Firesheep 2010,
  base64 PowerShell malware, Adobe 2013, real IOC/log scale, Toyota 2022, Target 2013.

## The discipline held (skill-first vs. predict-then-reveal)

Per `DESIGN.md`, predict-then-reveal was used **only** where a beginner's intuition is reliably wrong and
the correction is load-bearing — and skill-first everywhere else:

- **Predict-then-reveal (misconception):** 08 (base64 ≠ encryption), 09 (Adobe "encrypted" ≠ safe),
  11 (git delete ≠ gone).
- **Predict-then-reveal (concept autopsy):** 01 (Equifax — what *one* thing failed? none did, all did),
  12 (Target — the unguarded vendor trust boundary).
- **Skill-first, breach as stakes (short hook, ≤1 light predict):** 02, 03, 04, 05, 06, 07, 10.

The fourth beat is a **small reviewable script** (cert check, triage extension, decode tool, header audit,
pre-commit hook), not an enterprise guardrail — fitting the beginner level and feeding module 10 + the capstone.

## `<!-- VALIDATE -->` link markers (confirm before any publish)

11 markers total (run `grep -rn VALIDATE modules/`):
- 07 (2): the two MDN security-header reference paths.
- 02 (2): the two VirtualBox manual chapter deep-links.
- 10 (2): the CISA-advisory-with-IOCs and two doc links.
- 03, 05, 06, 08, 09 (1 each): the cryptojacking vendor report (03), CISA Emotet AA20-280A (05, fetch 403'd),
  a YouTube ID (06), the CISA encoded-PowerShell advisory (08), the two Sophos/NakedSecurity Adobe links (09).
- Modules 01, 04, 11, 12 reported zero markers — links written from known primary sources (still worth a click-check).

## Lab-environment backfill (to make these *validated*, not just colocated)

The prose assumes a few artifacts/steps the existing envs don't ship yet — each a small task:

| Module | Backfill |
|---|---|
| 01 | the env's `guide.py` is breach-template/CISA-KEV oriented; add the `cert_check.py` "own it" script the lab references |
| 05 | seed an encoded-PowerShell `4688` event in `data/evtx_sample.json` (or keep it as the learner's gap, by design) |
| 06 | add the "beacon" capture the lab hunts (env currently ships only the handshake/DNS capture) |
| 09 | add the ECB-pattern-vs-salted-hash step (step 5) to `demo.py` |
| 02, 03, 04, 07, 08, 10, 11, 12 | largely consistent with their existing envs as-is |

## Housekeeping before promotion

- READMEs carry an `` block where used — strip on promotion.
- Lengths are on-target (README ~90–135, lab ~90–123 lines) — tighter than the cloud rewrite.
- Add pages to `mkdocs.yml` `nav:` (rewrite lives outside `tracks/`, not wired in).
- Same charter caveat as cloud: the predict-then-reveal/skill-first form needs the CONTRIBUTING.md
  "rules scale with module position" amendment to pass the current bridge-prose rubric.

## Suggested review path
Read three contrasting modules end to end: **09 (crypto — the strongest misconception reveal)**, **04
(linux — pure skill-first)**, and **01 (principles — concept autopsy)** — to judge whether the form fits a
*beginner* track as well as it fit cloud.
