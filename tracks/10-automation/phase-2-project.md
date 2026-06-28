# Phase 2 Project — Pipelines & Portable Tooling

*Automation · Phase 2 (modules 05–07) · ~5–7 hrs · Prereqs: finish modules 05, 06, 07 first.*

> You built a pipeline that gates, a tool that runs anywhere, and a pipeline that collects on a schedule — separately. The project is the **integration**: one repo where every commit runs the security gate, the gate calls *your* containerised tool, and a scheduled enrichment pipeline feeds processed data downstream.

## Why this is a project, not another module

Each Phase-2 module left a working piece of the delivery-and-data chain. Alone they're three standalone builds; integrated they're the automation backbone a small team would actually run on:

- **05 · CI/CD Pipelines & Gates** → `.github/workflows/security-gate.yml` (+ deploy workflow), the captured **blocking** run (`demo-bad`), the generated SBOM, and `PIPELINE.md` (what each gate catches, the trust-boundary choices — trigger, permissions, pinned SHAs, OIDC).
- **06 · Containerising Tooling** → the hardened pinned non-root `Dockerfile`, the `Makefile` (`up`/`down`/`reset`/`demo`/`shell`/`scan`), and the tool's `README.md` (usage, the pinned version, the authorization note).
- **07 · Enrichment & Data Pipelines** → `processor/processor.py` (the durable consumer) and `monitor.py` (visibility over the producer → consumer flow).

## Build it

1. **Make the pipeline run your tool.** Wire the containerised security tool (06) into the CI gate (05): the workflow pulls/builds your pinned image and runs `make scan` over the tree, and the captured `demo-bad` run proves the gate **blocks** on a finding from *your* tool — not a stock action. The pipeline invoking the portable tool *is* the new work.
2. **Run the enrichment on a schedule.** Stand up the producer → durable consumer pipeline (07) and drive it on a `cron`/scheduled trigger, with `monitor.py` reporting pending/processed/errors so a stall is visible.
3. **Prove portability.** Show the containerised tool produces the same result in CI and locally (the build-anyone-can-reproduce claim from 06), pinned by SHA/version.
4. **One operations note.** Fold it into `PIPELINE.md`: a two-sentence *what gates, what the tool catches, what the enrichment feeds* lede, plus the trust-boundary choices carried forward from 05.

## Success criteria

- [ ] Every commit runs the security gate, and the gate calls **your containerised tool**, blocking on a finding.
- [ ] The containerised tool runs the **same** in CI and locally, pinned by SHA/version.
- [ ] A **scheduled** enrichment pipeline runs producer → durable consumer, with `monitor.py` making a stall visible.
- [ ] `PIPELINE.md` opens with what-gates / what-the-tool-catches / what-the-enrichment-feeds.

## Deliverable

A `delivery-pipeline/` folder in your repo: the **workflows** (`security-gate.yml` + deploy), the **containerised tool** (`Dockerfile` + `Makefile` + tool `README.md`), the **enrichment pipeline** (`processor.py` + `monitor.py`), the generated **SBOM**, the captured **blocking run**, and `PIPELINE.md`. Run only against **your own accounts and lab infra**. **Do not** commit secrets, the runner's environment, the `shared/` volume contents (pending/processed/errors are runtime artifacts), or generated artifacts beyond the SBOM (see `.gitignore`).

## Self-check rubric

Grade your own `delivery-pipeline/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Gate integration** | Stock action runs, doesn't block | Gate calls your containerised tool and blocks on a finding | Gate is tuned, passes the fixed tree, explains the failure |
| **Portability** | Runs only on your machine | Same containerised tool, same result in CI and locally, pinned | Hardened (non-root, checksum-verified); a reader builds it from the README |
| **Enrichment pipeline** | One-shot script, no durability | Scheduled producer → durable consumer; stalls are visible | Idempotent; handles failure/retry; the monitor feeds an alert |
| **Trust boundaries** | Default permissions, unpinned actions | `PIPELINE.md` names trigger/permissions/SHA/OIDC choices and why | Least-privilege throughout; secrets handled out of band |
| **Hygiene** | Secrets/runtime artifacts committed | No secrets, runner env, or `shared/` volume in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 08 — SOAR Fundamentals](modules/08-soar-fundamentals/README.md)** opens Phase 3, which ends in the **[track capstone](README.md#capstone)**.
