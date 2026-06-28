# Phase 1 Project — Model-Driven CIS Baseline

*Endpoint & Host Hardening · Phase 1 (modules 01–04) · ~5–7 hrs · Prereqs: finish modules 01, 02, 03, 04 first.*

> You hardened each surface in isolation. The project is the **integration**: one threat model that *drives* a CIS baseline applied to a Windows **and** a Linux host — exploit mitigations and allowlisting included — with every control traced back to the threat it answers.

## Why this is a project, not another module

Each Phase-1 module left a hardening artifact for one surface. Alone they're four separate notes; integrated they're the justified baseline a reviewer can audit control by control:

- **01 · Threat model** → `threat-model.md` + `score_threat_model.py` (assets, attack paths, mitigations carrying CIS-control and ATT&CK IDs).
- **02 · Windows** → `score_report.md` + `lgpo-commands.ps1` (the LGPO hardening, the before/after delta with root-cause notes on failing controls).
- **03 · Linux** → `hardening-log.md` (the Lynis/OpenSCAP before/after scores, the three remediations applied, the two findings accepted with rationale).
- **04 · Exploit mitigations** → `apparmor-profile` + `denial-analysis.md` (the modified profile, the decoded denial, how confinement would have limited the payroll-API compromise).

## Build it

1. **Make the model the spine.** Take `threat-model.md` (01) and turn each prioritised attack path into a **control requirement** — every Windows (02) and Linux (03) hardening step and every mitigation/allowlist rule (04) gets tagged with the threat-model entry and CIS-control ID it answers. A control with no threat behind it is either dead weight or an exception you must justify.
2. **Apply to both hosts, consistently.** Run the Windows LGPO script and the Linux remediations against your own VMs, and capture **one before/after score format** for both — the Windows delta and the Linux Lynis/OpenSCAP delta side by side, not two unrelated reports.
3. **One justified baseline.** Produce a combined `baseline.md`: the threat model up top, then a control table — *threat → control → CIS ID → host(s) → before/after status* — each exception (the accepted Linux findings, any unconfined process from 04) named with its reason.

## Success criteria

- [ ] **Every** applied control traces to a threat-model entry **and** a CIS-control ID.
- [ ] **Both** a Windows and a Linux host are hardened, with one consistent before/after score format.
- [ ] Exploit mitigations and the AppArmor profile are in the baseline, not bolted on separately.
- [ ] Every accepted exception is named with a written rationale, not silently dropped.

## Deliverable

A `baseline/` folder in your repo: the **combined `baseline.md`** (model → control table → exceptions), the **Windows and Linux hardening scripts**, and your committed module notes. Work on VMs you own and **snapshot before destructive changes**. Reference the scan output — **do not** commit raw OpenSCAP XML, host images, credentials, or any captured secrets (see `.gitignore`).

## Self-check rubric

Grade your own `baseline/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Model-to-control trace** | Controls applied, no link to a threat | Every control tagged with a threat-model entry and CIS ID | Tailored profile — controls the model doesn't justify are dropped or exception-noted |
| **Host coverage** | One OS hardened | Both Windows and Linux hardened, one before/after format | Idempotent — the scripts re-apply cleanly on a fresh snapshot |
| **Mitigations & allowlisting** | ASLR/AppArmor mentioned, not enforced | Profile enforced and folded into the baseline | Unconfined processes enumerated and each one justified |
| **Exceptions & hygiene** | Failing controls ignored or secrets committed | Each exception has a rationale; no XML/images/secrets in history | Exceptions ranked by residual risk; commits tell the build story |

→ Next: **[Module 05 — Endpoint Telemetry & EDR](modules/05-endpoint-telemetry/README.md)** opens Phase 2, which ends in its own **[phase project](phase-2-project.md)** before the **[track capstone](README.md#capstone)**.
