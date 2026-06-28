# Phase 2 Project — Compliance-as-Code Pipeline

*Endpoint & Host Hardening · Phase 2 (modules 05–08) · ~5–7 hrs · Prereqs: finish modules 05, 06, 07, 08 first.*

> Phase 1 hardened two hosts by hand. The project is the **integration**: push that baseline at scale with Ansible, watch telemetry and a scored audit confirm it held, and prove drift detection catches a deliberate misconfiguration — one loop, not four scripts.

## Why this is a project, not another module

Each Phase-2 module left a piece of the pipeline. Alone they're separate tools; integrated they're the continuous-compliance loop a program actually runs:

- **05 · Telemetry** → `queries.sql` + `pack.json` + `run-queries.py` (the osquery pack mapped to ATT&CK, and the socket client that feeds a SIEM).
- **06 · Config management** → `playbook.yml` + `drift-check.sh` (the Ansible baseline at scale and the drift check, wired to a scheduled CI job).
- **07 · Compliance scoring** → `compliance-evidence/` (`results-before.xml`, `results-after.xml`, `delta-summary.md`, `exception-report.md`) + `compliance-diff.py`.
- **08 · Patch & vuln** → `remediation.md` + `vuln-report.py` (grype findings cross-referenced against CISA KEV, ranked KEV-first).

## Build it

1. **One push, one score.** Chain the Ansible playbook (06) → an OpenSCAP scan (07) so that **applying the baseline and scoring it is one command**. Capture `results-before.xml` and `results-after.xml` and let `compliance-diff.py` emit the delta table — this is the evidence, generated, not hand-typed.
2. **Prove drift is caught.** Deliberately break one hardened control on the host, then run `drift-check.sh` (06) and re-score (07) — both must flag the change, and the report must say *what* drifted, not just *that* something did.
3. **Close the loop with telemetry and patching.** Run `run-queries.py` (05) to show the host is observable, and fold `vuln-report.py`'s KEV-first list (08) into the same run so the loop reports posture *and* exposure.
4. **One pipeline report.** Produce `pipeline-report.md`: apply → score → drift-injected → re-score → telemetry + vuln snapshot, each stage leading with a one-line *what this proves*.

## Success criteria

- [ ] **One command** applies the Ansible baseline and produces a before/after OpenSCAP score.
- [ ] A deliberate misconfiguration is caught by **both** drift detection and the re-score, naming *what* changed.
- [ ] Telemetry output and the KEV-first vuln list are part of the same loop, not a separate exercise.
- [ ] The compliance delta and remediation list are **generated** by the committed tooling.

## Deliverable

A `pipeline/` folder in your repo: the **`playbook.yml`**, the **drift + diff + vuln tooling**, the **`pipeline-report.md`** (apply → score → drift → re-score → telemetry/vuln), and your committed module notes. Work on VMs/containers you own and **snapshot before destructive changes**. Reference the artifacts — **do not** commit raw OpenSCAP/grype XML/JSON, host images, logs, or any secrets (see `.gitignore`).

## Self-check rubric

Grade your own `pipeline/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **As-code apply & score** | Manual steps, score hand-typed | One command applies the baseline and scores it before/after | Idempotent; re-runs from a clean host and re-scores reproducibly |
| **Drift detection** | None, or only flags *that* it changed | A deliberate misconfig is caught and *what* drifted is named | Scheduled (CI/cron); reports the changed control automatically |
| **Telemetry & exposure** | Fires on nothing, or vuln list unranked | Telemetry observable and KEV-first vuln list in the same loop | Detections mapped to ATT&CK; vuln triage ties to the baseline |
| **Evidence & hygiene** | Findings without before/after; raw files committed | Delta + remediation generated; no XML/JSON/images/secrets in history | Severity-ranked, tool output referenced; commits tell the build story |

→ Next: **[Module 09 — Local Privilege-Escalation Defense](modules/09-privesc-defense/README.md)** opens Phase 3, which **is** the **[track capstone](README.md#capstone)**.
