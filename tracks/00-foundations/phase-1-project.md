# Phase 1 Project — Stand Up Your Lab

*Foundations · Phase 1 (modules 01–03) · ~3–5 hrs · Prereqs: finish modules 01, 02, 03 first.*

> A module is a few hours; a **phase project** is the portfolio-worthy unit that *integrates* the
> phase. Here you fold the three Phase-1 artifacts into one reproducible lab you can rebuild from zero
> and reason about with the principles you just learned.

## Why this is a project, not another module

Modules 01–03 each left you a real artifact. On their own they're notes; integrated, they're a lab you
own and can defend:

- **01 · Security First Principles** → `principle-autopsy.md` and the CIA / AAA / defense-in-depth lens.
- **02 · Building a Safe Lab** → `ADR-001-lab-setup.md` (your VM-vs-container decision) and the lab itself.
- **03 · Docker & Containers** → your fixed `Dockerfile` and `docker-notes.md` (what isolates a
  container — and where that isolation ends).

## Build it

1. **Make it reproducible.** Write a rebuild-from-zero script (`rebuild.sh` or a `Makefile`) that stands
   up the whole lab — base config plus the container(s) — from nothing, idempotently. The test: a reader
   clones your repo, runs **one command**, and has your lab.
2. **Threat-model it (first pass).** Sketch the lab's **trust boundaries** — host ↔ VM ↔ container — and
   map each to a principle from module 01. Where does module 03's "isolation ends here" bite? (Full
   STRIDE comes in module 12; here it's a principled trust-boundary sketch, not the whole method.)
3. **Tie it together.** A short `lab-README.md` that explains the lab, links the ADR, and states the one
   rule it enforces: *run untrusted software without risking the host.*

## Success criteria

- [ ] One command rebuilds the lab from zero on a clean machine (you tested it from scratch).
- [ ] The threat-model sketch names the host/VM/container trust boundaries and maps each to a principle.
- [ ] What you built matches the decision your ADR committed to (or the ADR is updated to match reality).

## Deliverable

A `phase-1-lab/` folder in your repo: the **rebuild script**, the **`lab-README.md`**, the
**threat-model sketch**, and the committed module artifacts (the ADR, the Dockerfile, the docker notes).
Keep lab *artifacts* out — no images, container output, or captured host data (see `.gitignore`).

## Self-check rubric

Grade your own `phase-1-lab/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Reproducibility** | Steps written in prose only | One command rebuilds the lab from zero | Idempotent; re-runs cleanly on a fresh machine and tears down clean |
| **Threat model** | Assets listed, no boundaries | Trust boundaries named and each mapped to a principle | A concrete threat per boundary, with the control that answers it |
| **Decision trail** | No rationale | The ADR explains the VM-vs-container choice honestly | Consequences (the accepted downsides) are stated, not hidden |
| **Hygiene** | Images/output committed | No artifacts or secrets in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 04 — Linux for Security](modules/04-linux/README.md)** opens Phase 2.
