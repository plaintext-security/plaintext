# Type pass — Track 05 Cloud & Container Security

*Tags the **shipped** track (`tracks/05-cloud/`) against the 16-type library
(`planning/MODULE-TYPE-LIBRARY.md`). The `planning/cloud-track-d/` Verdict rewrite has its own
per-module types decided in its DESIGN.md; where the shipped shape differs from what the type
suggests, the Note says so. Fit: ✓ shipped shape matches its content; ⚠ shape fights the content.*

| Module | Primary | Secondary | Fit | Note |
|---|---|---|:--:|---|
| 01 Cloud Fundamentals & Shared Responsibility | 1 Concept Autopsy | 2 Misconception Reveal | ✓ | Enumerate-then-articulate-the-boundary; library cites it as a Concept Autopsy. Shipped is a light orientation read, not predict-then-reveal — D-rewrite anchors it to Capital One; shipped leaves the autopsy implicit. |
| 02 Cloud Identity & IAM | 1 Concept Autopsy | 3 Blast-Radius Trace | ⚠ | Strong IAM-eval mental model, but enumerate-and-describe only — no fix authored. D adds the audit→build half (author least-priv policy + re-simulate). Shipped is concept-heavy, no #4 build. |
| 03 IAM Attack Paths | 3 Blast-Radius Trace | 9 Tool-Build | ✓ | Graph the privesc chain, find min cut-set, remediate. Matches library (cloud 03 = Blast-Radius). Automate-step builds a reusable graph tool → latent #9. |
| 04 Cloud Network Security | 4 Audit→Build→Verify | 3 Blast-Radius Trace | ⚠ | Shipped is map-and-report (audit only); objective ends in a "findings report," not an authored fix. D pushes it to audit→build→re-verify. The build half is the gap. |
| 05 Posture & Misconfiguration Auditing | 4 Audit→Build→Verify | 16 Drift/Steady-State | ✓ | prowler/ScoutSuite → triage → remediation plan mapped to CIS; `audit.sh`. Posture *is* drift-against-baseline → latent #16. Could go further to a re-verify gate. |
| 06 Infrastructure-as-Code Security | 8 Judgment-as-Code/Gate | 9 Tool-Build | ✓ | The exemplar gate module — scanner runs in CI and fails the bad config. Library tags it #8. Cleanest fit in the track. |
| 07 Secrets Management & Detection | 7 Build-&-Operate | 9 Tool-Build | ✓ | trufflehog detect + Vault store/retrieve/**rotate** (operate side deepened). `secrets-scanner.sh` → #9. This is the track's de-facto data-protection module (see gap on KMS). |
| 08 CI/CD Pipeline Security | 8 Judgment-as-Code/Gate | 7 Build-&-Operate | ✓ | Build a hardened workflow that gates on gitleaks+trivy+workflow-review. Anchored to SolarWinds/XZ. `pipeline-gate.sh`. |
| 09 Serverless Security | 4 Audit→Build→Verify | 3 Blast-Radius Trace | ✓ | Deploy vuln Lambda → enumerate role → privesc → fix as code+IAM. Attacker→fixer; both halves present. D frames it predict-then-reveal verdict; shipped is procedural but complete. |
| 10 Container & Image Security | 8 Judgment-as-Code/Gate | 4 Audit→Build→Verify | ✓ | trivy/grype scan → hygiene report that gates a PR. Anchored to SolarWinds/CodeCov. Gate framing implicit; report → could be a hard CI gate. |
| 11 Container Escape & Runtime | 5 Detonate & Detect | 7 Build-&-Operate | ✓ | Reproduce privileged escape (CVE-2019-5736 etc.) → Falco detects the syscalls. Textbook Detonate&Detect. |
| 12 Kubernetes — RBAC & Network Policy | 4 Audit→Build→Verify | 7 Build-&-Operate | ✓ | kube-bench audit → exploit cluster-admin SA → least-priv fix + NetworkPolicy. Strong build half; least-privilege-as-code. |
| 13 Kubernetes — Admission & Runtime | 7 Build-&-Operate | 8 Judgment-as-Code/Gate | ✓ | Kyverno admission policy (block privileged/root) + Falco runtime. Policy-as-code prevention → also #8. |
| 14 Cloud Attack Techniques | 5 Detonate & Detect | 3 Blast-Radius Trace | ✓ | Simulate 3 ATT&CK-Cloud techniques, capture CloudTrail-shaped calls, name distinguishing fields. Purple-team, pure-by-design (no build half — correct). |
| 15 Cloud Logging & Detection | 5 Detonate & Detect | **13 Eval Harness** | ⚠ | Write a Sigma rule + Python matcher over bundled events, compare to GuardDuty, "tune signal / validate against benign." This is an Eval Harness in everything but name — no held-out set / scorecard / regression gate is made explicit. Biggest latent-#13 in the track. |
| 16 Cloud Incident Response | 6 Reconstruct | 9 Tool-Build | ✓ | CloudTrail+flow-log export → timeline → IOCs → containment checklist via `triage.py`. Library tags cloud 16 = Reconstruct. `triage.py` → #9. |

## Coverage gaps

- **#13 Eval Harness — latent and under-formalized.** Module 15 (and the capstone's "detection
  validated against benign activity for false positives" rubric row) is an eval in disguise: it
  scores a detection but never ships the *test corpus + metric + regression gate* that defines type
  13. The single highest-value upgrade is to make 15 an explicit Eval Harness — a labelled
  malicious/benign event set, a precision/recall scorecard, and a CI gate that fails on a rule
  regression. This also retro-fits the "tuning" language the README already uses. Module 16's
  `triage.py` could ride the same corpus.
- **KMS / Data-Protection hole (the known gap).** No module owns encryption-at-rest/in-transit, KMS
  key policies, envelope encryption, BYOK, or `kms:Decrypt`-as-a-privesc-edge. Module 07 covers
  *secrets* (Vault/credential leakage) but not *data protection / key management* — they are
  adjacent but distinct. Capital One's "encryption was on but the role could decrypt" is the
  canonical anchor, and it's exactly the predict-then-reveal the track otherwise loves. The
  rebalance audit and the D-DESIGN both flag this as the one real topical hole; mostly
  **#7 Build-&-Operate** with a **#3 Blast-Radius** key-policy-as-privesc-edge secondary.
- **#11 Decision/ADR — absent despite multi-cloud framing.** The track promises "AWS/GCP/Azure plus
  native detectors (GuardDuty/Defender/SCC)" but never makes the learner *choose and defend* among
  them. "Native detector vs. open tooling" (module 15) and "which scanner gates CI" (06) are real
  ADR moments left as prose. No module produces an Architecture Decision Record.
- **#12 Migration/Brownfield — absent.** Nothing addresses the realest cloud-security task:
  click-ops → IaC, or migrating an existing account to least-privilege/gated posture without an
  outage. Modules fix greenfield/seeded accounts; the brownfield strangler-fig move is missing.
- **#2 Misconception Reveal — thin.** Module 01's shared-responsibility content is prime
  misconception territory ("the cloud handles it") but shipped framing states the model rather than
  baiting the wrong intuition first. The D-rewrite recovers this; the shipped track does not.

## Suggested additions

1. **KMS & Cloud Data Protection** (new module, slot after 04 or alongside 07) — **#7 Build-&-Operate**
   + **#3 Blast-Radius** secondary. Build envelope encryption with KMS, write a restrictive key
   policy, then show `kms:Decrypt` / over-broad key grant as a privesc edge that defeats
   "encryption is on." Closes the one acknowledged topical hole; LocalStack/`simulate-principal-policy`
   keeps it zero-cost. Anchor: Capital One's decrypt-capable role.
2. **Cloud Detection Eval Harness** (new module, or hard rewrite of 15) — **#13 Eval Harness**. A
   labelled CloudTrail malicious/benign corpus, a precision/recall scorecard, and a CI regression
   gate over Sigma/GuardDuty rules. Turns the track's "tune signal / validate against benign"
   promise into eval-as-code and seeds the pattern the AI/automation tracks compound on.
3. **(Optional) VPN/Click-ops → Gated-IaC Migration** (new phase-1 module or capstone variant) —
   **#12 Migration/Brownfield** + **#11 ADR** secondary. Take an existing click-ops account to
   IaC-under-CI-gate incrementally with proof nothing broke, and record the tooling choice as an
   ADR. Fills both absent design/migration types in one job-shaped build.
