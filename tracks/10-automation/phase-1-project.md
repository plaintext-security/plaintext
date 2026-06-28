# Phase 1 Project — Infrastructure & Config as Code

*Automation · Phase 1 (modules 01–04, 11) · ~5–7 hrs · Prereqs: finish modules 01, 02, 03, 04, 11 first.*

> You wrote the HCL, hardened with a role, and watched a scanner block a bad rule — one surface at a time. The project is the **integration**: one small environment that's *defined* in Terraform/OpenTofu, *configured* by Ansible, *gated* by `checkov`/`tfsec` in CI, and then has a hand-built resource pulled under that same code with zero drift.

## Why this is a project, not another module

Each Phase-1 module left a piece of the as-code discipline for one surface. Alone they're five separate artifacts; integrated they're the loop you'd actually run a real environment on:

- **01 · Automation Mindset** → `ADR-001-automation-cut-line.md` + the filled `automation-assessment.md` (where automation pays, where it bites — the decision construct the rest leans on).
- **02 · Infrastructure as Code** → `main.tf` (with your variable and output) + the extended `Makefile` (reproducible-from-zero infra).
- **03 · IaC Security Scanning** → `findings.md` (the cross-tool matrix), `iac-scan.yml` (the CI gate, action pinned to SHA), `gate-proof.md` (exit code on the bad vs. fixed tree).
- **04 · Configuration Management** → the `hardening/` role, `drift-detect.sh` (the check-mode loop that exits non-zero on drift), and `LOOP.md` (steady → drift → detected → reconciled → steady).
- **11 · Click-ops → IaC Migration** → `migration-runbook.md`, the reconciled `*.tf`, `zero-drift-proof.md` (`plan` shows `No changes`), and `rollback-note.md`.

## Build it

1. **Define and configure as one environment.** Wrap your `main.tf` (02) and the `hardening/` role (04) behind a **single bring-up** — `make up` provisions the infra, then applies the role — so the environment is defined *and* configured by code from one command. The two layers driven together *is* the new work.
2. **Gate it in CI.** Wire your `iac-scan.yml` gate (03) over the whole environment's HCL: prove a deliberately over-broad rule is *blocked before apply*, and that the fixed tree passes. One `gate-proof.md` showing the exit code flip.
3. **Pull a hand-built resource under code.** Take one resource you stood up by hand and run the strangler-fig migration from 11 — `import`, reconcile, and produce a full-estate `plan` showing **`No changes`** (zero drift), with the per-slice `state rm` rollback proven non-destructive.
4. **One decision record.** Fold it together in `ENVIRONMENT.md`: what the ADR (01) decided to automate vs. leave manual, and a two-sentence *what's defined, what's configured, what's gated* lede.

## Success criteria

- [ ] **One** `make up` defines the infra (Terraform/OpenTofu) **and** configures it (Ansible).
- [ ] An over-broad misconfiguration is *blocked in CI before apply*; the fixed tree passes the same gate.
- [ ] A hand-built resource is brought under code with a full-estate `plan` proving **zero drift**, and a proven rollback.
- [ ] `ENVIRONMENT.md` opens with what's defined / configured / gated — not a raw dump.

## Deliverable

An `iac-environment/` folder in your repo: the **unified `main.tf` + role + `Makefile`**, the **CI gate** with its `gate-proof.md`, the **migration runbook + zero-drift proof + rollback note**, and `ENVIRONMENT.md`. Run automation against **your own accounts and lab infra only** — generated IaC can create real, billable, internet-facing resources. **Do not** commit `terraform.tfstate` (it holds real resource bindings — treat it as a credential), `.terraform/`, scanner JSON, or `generated.tf` scratch (see `.gitignore`).

## Self-check rubric

Grade your own `iac-environment/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **As-code coverage** | Infra OR config, run separately | One `make up` both defines and configures the environment | A third layer (a second role/module) slots in without rewrites |
| **CI gate** | Scanner runs but doesn't block | An over-broad rule is blocked before apply; fixed tree passes | Gate is tuned (no false-positive noise) and explains the failure |
| **Click-ops migration** | Resource re-created, not imported | Imported under code; full-estate `plan` shows zero drift; rollback proven | Migration order (least-risky first) justified; transition visible as a diff |
| **Decision quality** | Raw output, no judgment | `ENVIRONMENT.md` leads with defined/configured/gated and the automation cut-line | An operator could run and extend it as-is |
| **Hygiene** | `tfstate`/scanner output committed | No state/secrets/scratch in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 05 — CI/CD Pipelines & Gates](modules/05-cicd-pipelines/README.md)** opens Phase 2.
