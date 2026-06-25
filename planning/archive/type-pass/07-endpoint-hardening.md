# Type pass — Track 07: Endpoint & Host Hardening

Track spine (as predicted): **4 Audit→Build→Verify**, **7 Build-&-Operate** (baselines),
**16 Drift/Steady-State**, **8 Gate**. The track is well-built for the audit/build/verify
and drift loop. The notable absences are **#12 Migration/Brownfield** (rolling a baseline
across a fleet without breakage) and **#11 Decision/ADR** (which benchmark/EDR/baseline to
adopt) — both flagged as likely-missing and both confirmed missing.

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Threat Model of the Endpoint | 1 Concept Autopsy | 11 Decision/ADR | ✓ | Pure model→prioritise; STRIDE + ATT&CK + asset/path. Deliverable is a prioritised backlog, not a verdict on a breach — closer to a scoping ADR than a true autopsy, but the predict-then-prioritise shape fits. |
| 02 Windows Hardening to CIS | 4 Audit→Build→Verify | 7 Build-&-Operate | ✓ | Textbook 4: scan-before → apply LGPO/CIS controls → rescan-and-diff. The diff (not the score) is the lesson — exactly type 4. |
| 03 Linux Hardening to CIS | 4 Audit→Build→Verify | 11 Decision/ADR | ✓ | Same scan→remediate→rescan loop; the Lynis-vs-OpenSCAP "which tool when" thread is a latent ADR. "Accept with justification" is good exception discipline. |
| 04 Exploit Mitigation & Allowlisting | 7 Build-&-Operate | 4 Audit→Build→Verify | ✓ | Build/tune/enforce an AppArmor profile (complain→enforce); operate-it shape. Light detonate flavour (confined process denied) but the artifact is the operating control. |
| 05 Endpoint Telemetry & EDR | 7 Build-&-Operate | 5 Detonate&Detect | ✓ | Stand up osquery/Wazuh, author queries + a scheduled pack. Build-&-operate of a telemetry system; each query maps to an ATT&CK technique. |
| 06 Configuration Management | 7 Build-&-Operate | 16 Drift/Steady-State | ✓ | Idempotent Ansible baseline; step 5–6 deliberately drifts a setting and `--check` flags it, plus a `drift-check.sh`. Strong 16 secondary — could be promoted. |
| 07 Compliance Scoring & Auditing | 8 Judgment-as-Code/Gate | 16 Drift/Steady-State | ✓ | Before/after scoring as evidence; continuous-compliance + score-drift alerting is the gate-and-drift core. Exception management = managed-risk judgment. |
| 08 Patch & Vulnerability Management | 8 Judgment-as-Code/Gate | 4 Audit→Build→Verify | ✓ | Triage model (CVSS × KEV × reachability × fix) turned into a prioritised list. Judgment encoded as a repeatable triage; grype+osquery inventory→CVE match. |
| 09 Local Privilege-Escalation Defense | 4 Audit→Build→Verify | 5 Detonate&Detect | ✓ | Attack (GTFOBins SUID) → remediate (remove bit + AppArmor) → re-attempt-and-confirm-fail. Clean attack→build→verify; ties the audit into the module-07 scan. |
| 10 Detecting Host Compromise | 5 Detonate&Detect | 8 Gate (detection-as-code) | ✓ | Write Sigma rules against compromise artefacts, map coverage to ATT&CK, output a gap analysis. Detection-as-code; an eval-harness/regression angle is latent (see gaps). |

## Coverage gaps

- **#16 Drift/Steady-State is present but under-built as a first-class module.** Drift shows
  up as a *step* inside 06 (Ansible `--check`) and 07 (score-drift alerting), and the capstone
  rubric rewards "automated/scheduled drift that reports *what* changed." But no module *owns*
  the t=0-fine / t=30-wrong reconciliation loop end-to-end (detect → diff → reconcile →
  re-enforce → alert on the delta). For a track whose thesis is "a baseline that's enforced and
  then drifts," this deserves a dedicated module, not just two steps.
- **#12 Migration/Brownfield is absent.** The single most real-world endpoint task — rolling a
  hardening baseline across an existing fleet *without breaking production* (staged rollout,
  test ring → canary → fleet, exception carve-outs for legacy apps, rollback) — has no module.
  Modules 02/03/06 harden a *single* host or apply a role to groups, but never confront the
  brownfield problem of a host that's already in service and can't take downtime. This is the
  clearest gap and maps directly to the type-library prediction for endpoint.
- **#11 Decision/ADR is latent but never the deliverable.** Real choices the track makes
  implicitly — CIS Level 1 vs Level 2, CIS vs DISA STIG, Lynis vs OpenSCAP, osquery+Wazuh vs a
  commercial EDR, AppArmor vs fapolicyd vs SELinux — are discussed as prose but never produced
  as a defended ADR. 01 and 03 are the natural homes for an ADR deliverable.
- **#13 Eval Harness is latent in 10.** Detection rules (module 10) are the canonical place a
  test-corpus + metric + regression gate belongs. The lab tests rules against one sample
  `alerts.json`, but there's no held-out benign-noise corpus or regression gate that fails when
  a tuning change drops coverage. Tuning "against benign noise" is in the capstone rubric but
  never operationalised as an eval. A light eval-harness step would harden module 10.
- **Windows is thin past the baseline.** Hardening (02) is Windows+Linux, but exploit-mitigation
  (04), allowlisting, telemetry (05), config-mgmt (06), privesc (09) skew Linux-only in the
  labs (AppArmor/fapolicyd, osquery on deb_packages, GTFOBins/SUID). AppLocker, Sysmon, and
  Windows privesc paths are named in the README but not exercised. Not a *type* gap, but a
  coverage imbalance against the track's "Windows *and* Linux" promise.

## Suggested additions

1. **Module: Drift Detection & Reconciliation (type 16, primary).** A dedicated steady-state
   module: enforce a baseline, let it drift (package update flips a sysctl; an operator re-opens
   `PermitRootLogin`), then build the *full* loop — scheduled detection, a diff that reports
   *what* changed and against which control, automated reconciliation (re-converge via Ansible),
   and an alert on the delta. Promotes the drift steps currently buried in 06/07 into the
   track's signature skill and directly feeds the capstone's "drift detection is
   automated/scheduled and reports *what* changed" Exemplary bar.

2. **Module: Rolling a Hardening Baseline Across a Fleet (type 12 Migration/Brownfield).**
   The missing centerpiece: take a fleet of already-running hosts and apply the baseline
   incrementally without an outage — test ring → canary → fleet, a break-glass/rollback path,
   exception carve-outs for a legacy app that the benchmark would break, and proof nothing broke
   (service-health checks before/after each ring). Anchor on a real "hardening broke prod"
   failure class. This is the highest-value add and is currently entirely unrepresented.

3. **Reframe (no new module): make 01 and/or 03 carry an explicit ADR deliverable (type 11).**
   Have 01 produce a defended "which baseline (CIS L1/L2 vs STIG) for which host class" ADR, or
   03 a "Lynis vs OpenSCAP, and which EDR" ADR — options · tradeoffs · pick · why. Introduces the
   ADR construct the brownfield/migration module then leans on, at zero new module cost.
