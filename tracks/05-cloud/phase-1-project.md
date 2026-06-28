# Phase 1 Project — Account Audit to Fix-as-Code Pipeline

*Cloud · Phase 1 (modules 01–08, 17) · ~6–8 hrs · Prereqs: finish modules 01–08 and 17 first.*

> You audited identity, network, posture, the pipeline, and the keys one surface at a time. The project is the **integration**: one pass that maps a privilege-escalation path through a vulnerable account, closes it as Terraform gated in CI, pulls the secrets out of code, and proves the KMS key's reach is scoped.

## Why this is a project, not another module

Each Phase-1 module left a guardrail or a finding for one plane. Alone they're nine separate checks; integrated they're the audit-to-fix-as-code loop a cloud security engineer actually runs:

- **01 · Fundamentals** → `verdict-memo.md` + your Capital-One-shaped policy guardrail (fails `s3:*`/`Resource:"*"` on an instance role).
- **02 · Identity & IAM** → `blast-radius-report.md` + `dev-alice-fixed-policy.json` + `assert_no_escalation.py` (denies `iam:PassRole` to admin roles).
- **03 · IAM attack paths** → `remediation.md` + `graph-fixed.json` + `analyze.py` as a posture gate (fails on a path to admin).
- **04 · Network** → `findings.md` + `security-groups-fixed.json` (default-deny baseline; no `0.0.0.0/0` on a sensitive port).
- **05 · Posture auditing** → `findings-summary.md` + `remediation-notes.md` + `check_public_bucket.py`.
- **06 · IaC security** → `finding-matrix.md` + `iac-scan.yml` (the CI gate) + `gate-proof.md`.
- **07 · Secrets** → `incident-notes.md` + `app-ro.hcl` (Vault policy) + `secret-handling.md` + `secrets-guard.sh`.
- **08 · CI/CD** → `workflow-hardened.yml` + `pipeline-audit.md` + `trivy.yaml` + `pipeline-gate.sh`.
- **17 · Data protection & KMS** → `findings.md` + `key-policy-fixed.json` + `check_keypolicy.py` (separates key admin from key use).

## Build it

1. **Walk one path end to end.** Against a deliberately vulnerable account ([CloudGoat](https://github.com/RhinoSecurityLabs/cloudgoat) or [flaws.cloud](http://flaws.cloud/)), use your module-03/05 tooling (`pmapper`/`prowler`) to map **one** IAM privilege-escalation chain — name each edge and the trust relationship that enables the hop. This single, narrated path *is* the spine the rest hangs off.
2. **Close it as code, gated.** Express the fix as **Terraform**, not console clicks: the scoped IAM policy (02), the default-deny Security Group (04), the public-bucket fix (05). Wire your module-06 `iac-scan.yml` so a `checkov`/`trivy` gate **fails** on the original config and **passes** on the fix — reuse `gate-proof.md` to show the exit code flips.
3. **Pull the secrets out, lock the keys.** Take any credential the path leaned on and move it behind the module-07 broker (`app-ro.hcl` + `secrets-guard.sh` so it can't re-enter git). Then prove the module-17 key policy **separates admin from use** — `check_keypolicy.py` fails the collapsed policy, passes `key-policy-fixed.json`.
4. **One audit, one verdict.** Produce a combined `account-audit.md`: the escalation path, the fix-as-code diff, the CI gate proof, the secrets relocation, and the scoped-key result — leading with a two-sentence *who could escalate, how, blast radius.*

## Success criteria

- [ ] One narrated IAM privilege-escalation path, each hop tied to the trust relationship that enables it.
- [ ] The fix is **Terraform**, and a scanner gate in CI **fails** the original and **passes** the fix (exit code shown both ways).
- [ ] Secrets are out of code and behind a broker; the KMS key policy separates admin from use, proven both ways.
- [ ] The audit opens with a two-sentence verdict, not a raw scanner dump.

## Deliverable

A `cloud-account-audit/` folder in your repo: the **combined `account-audit.md`**, the **Terraform fix**, the **`iac-scan.yml` gate** with its proof, and your committed module guardrails (`assert_no_escalation.py`, `analyze.py`, `check_public_bucket.py`, `secrets-guard.sh`, `check_keypolicy.py`). Reference the account — **do not** commit credentials, real account IDs, `*.tfstate`, scanner JSON, Vault tokens, key IDs, or bucket contents (see `.gitignore`). **Tear down billable resources when done.**

## Self-check rubric

Grade your own `cloud-account-audit/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Attack path** | A single misconfig noted, no chain | An IAM privesc path walked end to end, each hop's trust relationship named | Multi-step chain mapped to ATT&CK for Cloud, alternative edges noted |
| **Fix as code** | Fixed in the console (click-ops) | The fix is Terraform that closes the path | Least-privilege, parameterised and reusable, with the diff that proves the path is gone |
| **CI gate** | No scanner, or not enforced | A scanner runs in CI and *fails* the bad config, passes the fix | The gate is tuned (no noise), blocks merge on the specific finding only |
| **Secrets & keys** | Secret still in code, key admin = key use | Secret behind a broker; key policy separates admin from use, proven both ways | Leased over stored-static; the off-switch reasoning written down |
| **Hygiene & cost** | State/secrets/IDs committed, resources left running | No secrets/state/IDs in history; resources torn down | Rebuilds from `terraform apply`, tears down cleanly; budget-safe by design |

→ Next: **[Module 09 — Serverless Security](modules/09-serverless-security/README.md)** opens Phase 2, which ends in its own **[phase project](phase-2-project.md)**; the track closes with the **[capstone](README.md#capstone)**.
