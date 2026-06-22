# Cloud Track — "Verdict" rewrite (Variant-D vein)

*A complete, parallel rewrite of `tracks/05-cloud/` in the form prototyped by Module 01 Variant D.
Lives under `planning/` so it builds nothing and leaves the shipped track in place for comparison.
This file is the **spine and the authoring brief** — every module is written against its row below.*

## The thesis

The shipped track teaches cloud security and *grounds* it in real artifacts where convenient. This
rewrite inverts that: **every module is anchored to a real, public cloud breach or primary-source
artifact, and the learner's job is to render judgment on what actually happened and then encode the fix
so it can't recur.** You don't read about the shared-responsibility line; you rule on which side of it
Capital One's encryption sat. You don't "learn least privilege"; you re-walk the role that killed Code
Spaces and write the guardrail that would have stopped it.

## The recurring move

Most modules run the same four-beat loop. It is the track's signature and the thing that makes it D-vein:

1. **Predict** — the learner commits to a verdict *before* reading/running, on a question where the
   common intuition is *wrong in an instructive way* (encryption protected the data; the metadata
   service was AWS's fault; "more managed = safer"). The wrong prediction is the teaching event.
2. **Reproduce** — they recreate the *responsibility conditions* of the real breach hop locally (LocalStack,
   Vulhub, kind), honestly (state where the simulator doesn't enforce and use `simulate-principal-policy`
   / logical checks instead of pretending).
3. **Verdict** — they render owner (provider vs. customer) · plane (control vs. data) · the one change
   that breaks the chain there. This is a real cloud-IR/GRC artifact, not a worksheet.
4. **Guardrail (judgment-as-code)** — the "Automate & own it" step is reframed: instead of scripting
   keystrokes, they encode the verdict as a check that *fails the bad state and passes the fix* (a Checkov/
   OPA rule, a Sigma rule, a Falco rule, a `simulate`-based assertion). Their judgment, made un-recurrable.

## "Outside the box, only for good reason" — the discipline

Do **not** force predict-then-reveal on every module. Match the shape to where the learning actually is:

| Module shape | When | The D-move |
|---|---|---|
| **Predict-then-reveal verdict** | orientation/judgment modules where intuition misleads (01, 09, 10) | call it → reproduce → verdict → guardrail |
| **Predict-the-blast-radius** | offense/enumeration modules (02, 03, 14) | predict reach → reproduce/trace → guardrail or detection |
| **Audit → build → re-verify** | audit modules (04, 05) — *the rebalance audit's "add a build half"* | find → author the fix → prove it holds |
| **Build-first, real artifact as the "why"** | procedural build/operate modules (06, 07, 11, 12, 13) | ship it (wrong) → break it → encode least-priv/policy as code |
| **Predict-what-fires** | detection/IR (15, 16) | the logs existed → predict the signal → write the detection → reconstruct |

The test for using a prediction prompt: *would a competent beginner likely guess wrong, and is the
correct answer load-bearing?* If yes, prompt. If the skill is purely "here's how you write a Kyverno
policy," lead with the build and let the real breach carry the stakes, not a contrived quiz.

## House rules that still bind (don't break these)

- Two files per module (`README.md` + `lab.md`) — the publishing reality. D delivers its interleaving
  *within* that, not by abolishing it.
- `README.md` keeps the recognizable sections (meta line, an objective, key concepts, AI acceleration)
  but may restructure "The core idea" into predict-then-reveal where the table above says so.
- **Real links only.** Cite primary sources (DOJ/SEC filings, vendor post-mortems, CVE/NVD, CISA KEV,
  MITRE ATT&CK, RFCs, tool docs). **Do not invent URLs.** If unsure a specific URL resolves, name the
  source precisely and mark it `<!-- VALIDATE -->` rather than fabricate a link.
- **Honest about tooling.** LocalStack CE does not enforce IAM; say so and use logical evaluation. Mark
  any hop that can't be reproduced locally as *assessed from config*, not *exploited*.
- **Original prose.** No copying SANS/OffSec. Curate the mechanism; own the bridge.
- **Lean Learn for foundations, richer for specialist modules.** A foundations module owns its spine;
  a deep module curates more.

## Phases & capstone (unchanged structure, D-vein framing)

- **Phase 1 · Identity, posture & the pipeline (01–08)** — Project: take a real-breach-shaped CloudGoat/
  flaws.cloud account, render the verdict on its IAM privesc chain, then close it as Terraform gated by a
  scanner in CI, secrets pulled into a broker.
- **Phase 2 · Containers & Kubernetes (09–13)** — Project: harden a workload end to end — scan the image,
  least-priv the serverless role, demonstrate a runc-style breakout caught by Falco, enforce RBAC/
  NetworkPolicy/admission as code on kind.
- **Phase 3 · Attack, detect & respond (14–16) → Capstone** — Re-litigate a real cloud breach end to
  end: reproduce the chain, render the verdict memo, close every hop as code, simulate the attack
  (stratus/Pacu), detect it (native detector **and** a Sigma rule), and write the IR timeline.

## Known design decisions (state them, don't bury them)

- **Module count held at 16** for clean module-for-module diff against the shipped track. The rebalance
  audit's recommended **KMS / Data-Protection module is NOT added here** to keep the comparison honest —
  but it remains the one real topical hole; a truly *complete* D-track should slot it after 04 or
  alongside 07. Flagged, not silently restructured.
- **Build-halves folded in** per the rebalance audit: 02 and 04 now end in authoring-and-verifying the
  fix; 07 deepens to dynamic/leased creds + runtime fetch + rotation. D's judgment-as-code makes this natural.
- **This form will fail the current CONTRIBUTING.md bridge-prose rubric** (it's written for the essay).
  Adopting the track means amending the charter so rules scale with module position — out of scope for
  the build, in scope for the decision.

---

## Per-module spine (the authoring brief)

> Each row: **Anchor** (real artifact) · **Shape** (from the table above) · **Predict** (the prompt, if
> any) · **Reproduce** (the hands-on) · **Verdict/Guardrail** (the deliverable) · **Connects**.
> Authors: preserve the real tool/technical content from the existing module; change the *frame*, not the rigor.

### Phase 1 — Identity, posture & the pipeline

**01 · Cloud Fundamentals & Shared Responsibility** — *(already built; port from `../module-01-alternatives/variant-d-verdict/`)*
- **Anchor:** Capital One 2019 (SSRF → IMDS → over-broad role → S3, 100M records).
- **Shape:** predict-then-reveal verdict.
- **Deliverable:** verdict memo + Checkov-style guardrail failing `s3:*`/`Resource:"*"` on an instance role.

**02 · Cloud Identity & IAM**
- **Anchor:** Code Spaces 2014 (leaked AWS console/API creds → attacker deleted everything → company dead in ~12h). Secondary: Golden SAML / SolarWinds for the federation/trust angle.
- **Shape:** predict-the-blast-radius **+ audit→build** (rebalance build-half).
- **Predict:** "one leaked key — how much of the business can it touch?" (most under-guess catastrophic + irreversible).
- **Reproduce:** enumerate a seeded principal, prove reach with `simulate-principal-policy`; then **author the least-privilege policy that closes it and re-simulate to prove the path is gone.**
- **Verdict/Guardrail:** policy-eval-order explainer (explicit deny > allow > implicit) as the model; the fixed policy + a denial assertion as the guardrail.
- **Connects:** 03 (privesc chains), 05 (posture).

**03 · IAM Attack Paths**
- **Anchor:** Rhino Security Labs "AWS IAM Privilege Escalation — 21 methods" (primary research) + a CloudGoat privesc scenario.
- **Shape:** predict-the-blast-radius (graph).
- **Predict:** "which of these innocuous-looking permissions chains to admin?" (`iam:CreatePolicyVersion`, `iam:PassRole`, `lambda:*`).
- **Reproduce:** build the privesc graph with pmapper/cloudfox, walk a chain, identify the **minimum cut-set** — then implement the cut and re-verify the path is gone.
- **Guardrail:** the cut, applied as policy + re-run graph showing the edge removed.
- **Connects:** 02, 14 (detonation), capstone.

**04 · Cloud Network Security**
- **Anchor:** Capital One's WAF/SSRF as a *network-control* failure + the 2017–19 wave of `0.0.0.0/0`-exposed services.
- **Shape:** audit→build→re-verify (rebalance build-half).
- **Predict:** reachability — "given these SGs, what's actually reachable from the internet?" (people under-count transitive paths).
- **Reproduce:** cloudmapper/SG audit, find the exposure; **author the corrected SG ruleset + a default-deny baseline and re-verify reachability** (mirrors how K8s module 12 ends in NetworkPolicies).
- **Guardrail:** the SG-as-code + a Checkov rule failing `0.0.0.0/0` on sensitive ports.
- **Connects:** 12 (NetworkPolicy), 05.

**05 · Posture & Misconfiguration Auditing**
- **Anchor:** the 2017 public-S3-bucket leak wave (Accenture, Verizon/Nice Systems, Booz Allen/INSCOM, Dow Jones).
- **Shape:** audit → remediate → verify (already balanced; keep, add real anchor + verdict framing).
- **Reproduce:** prowler/scoutsuite scan a seeded account, triage signal vs. noise, draft+verify a remediation.
- **Guardrail:** a benchmark check that stays green on the fixed account; map findings to CIS.
- **Connects:** 06 (gate it in CI), 01 (the bucket finding returns).

**06 · Infrastructure-as-Code Security**
- **Anchor:** the class of misconfig that *ships* in real public Terraform (unencrypted buckets, open SGs, `*` IAM) — cite Checkov/tfsec real rule sets and a concrete CVE in a Terraform module/provider. `<!-- VALIDATE the specific CVE -->`
- **Shape:** build-first (this *is* the judgment-as-code module — make it the exemplar).
- **Predict:** "which lines of this `main.tf` would a scanner fail, and which would it miss?"
- **Reproduce:** scan with Checkov/tfsec/trivy, fix, suppress a true false-positive correctly, **write the CI gate** that blocks merge on the specific finding and passes on the fix.
- **Connects:** every build module downstream; the capstone gate.

**07 · Secrets Management & Detection**
- **Anchor:** Uber 2016 (hardcoded AWS keys in a private GitHub repo → 57M records → the cover-up & FTC action).
- **Shape:** build-first, deepened (rebalance "deepen operate side").
- **Reproduce:** trufflehog finds the leaked key (the find half) → store in Vault **and** an AWS-native store (Secrets Manager/SSM); mint a **dynamic/leased** DB credential; have a small app **fetch it at runtime** (not env-var); **automate rotation.**
- **Guardrail:** gitleaks pre-commit hook + an IAM-gated read policy on the native store.
- **Connects:** 08 (CI secrets), capstone.

**08 · CI/CD Pipeline Security**
- **Anchor:** SolarWinds / SUNBURST 2020 (build-system compromise → signed malware to 18k orgs).
- **Shape:** predict-the-injection-point → harden.
- **Predict:** "in the path from commit to deploy, where does the attacker inject — and which step would have caught them?"
- **Reproduce:** gitleaks + trivy + SBOM over a sample pipeline; **write the hardened workflow** (pinned actions, least-priv tokens, provenance/attestation).
- **Connects:** the repo's own Actions-hardening work (T23); capstone delivery.

### Phase 2 — Containers & Kubernetes

**09 · Serverless Security**
- **Anchor:** Denonia 2022 (first known Lambda-specific malware) + OWASP Serverless Top 10 (event-injection).
- **Shape:** predict-then-reveal verdict + attacker→fixer.
- **Predict:** "what's a Lambda's blast radius — is it the function, or the execution role?" (people under-weight the role).
- **Reproduce:** enumerate the exec role, inject via the event, **fix the code + least-priv the role + redeploy.**
- **Guardrail:** a check failing an over-broad execution role.
- **Connects:** 02/03 (roles), 14.

**10 · Container & Image Security**
- **Anchor:** the 2018 Docker Hub backdoored images (`docker123321`/Kromtech — cryptomining images, millions of pulls) + Codecov 2021.
- **Shape:** predict-then-reveal verdict.
- **Predict:** "this image runs your app fine — what else is in it?" (latent layers, CVEs, secrets).
- **Reproduce:** trivy/grype scan, triage, **make the hardened multi-stage rebuild an explicit graded step** (rebalance minor).
- **Guardrail:** a CI image-scan gate that fails on critical CVEs / non-distroless base.
- **Connects:** 08, 11.

**11 · Container Escape & Runtime**
- **Anchor:** CVE-2019-5736 (runc breakout) — Vulhub has it.
- **Shape:** build-first (reproduce the escape, then detect).
- **Reproduce:** exploit the breakout in the lab; **deploy + tune Falco** to catch it; reduce a false positive.
- **Guardrail:** the tuned Falco rule (detection-as-build).
- **Connects:** 13 (runtime), 15.

**12 · Kubernetes — RBAC & Network Policy**
- **Anchor:** Tesla 2018 (open Kubernetes dashboard → AWS creds → cryptojacking).
- **Shape:** build-first / audit→build (strong build half already).
- **Reproduce:** kube-bench, exploit over-broad RBAC, **apply least-priv RBAC + NetworkPolicies and re-verify** segmentation.
- **Guardrail:** the RBAC/NetworkPolicy as code + a kube-bench/conftest check.
- **Connects:** 04 (network), 13.

**13 · Kubernetes — Admission & Runtime**
- **Anchor:** Graboid 2019 (crypto-worm via unsecured Docker/K8s) or Siloscape 2021. `<!-- pick one, VALIDATE -->`
- **Shape:** build-first (policy-as-code prevention).
- **Predict (light):** "which of these pod specs should never have been admitted?" (privileged, hostPath, hostNetwork).
- **Reproduce:** **write Kyverno admission policies** that block them; Falco for what slips past at runtime.
- **Connects:** 12, capstone.

### Phase 3 — Attack, detect & respond

**14 · Cloud Attack Techniques**
- **Anchor:** LastPass 2022 (stolen keys → S3 + DynamoDB exfil) + Scattered Spider / LUCR-3 cloud TTPs.
- **Shape:** predict-the-blast-radius / detonate (purple-team; pure by design — *no* build half).
- **Reproduce:** detonate T1078.004 / T1530 / T1537 with stratus-red-team / Pacu, map each to ATT&CK for Cloud; capture the telemetry it generates (feeds 15/16).
- **Connects:** feeds 15 (detect) and 16 (respond).

**15 · Cloud Logging & Detection**
- **Anchor:** the detection-gap that defines both Capital One and LastPass — *the logs existed; nobody watched.*
- **Shape:** predict-what-fires → write the detection.
- **Predict:** "which of the module-14 events shows up in CloudTrail, and which is invisible?"
- **Reproduce:** map the detonation's events, **write a Sigma rule** (and a native GuardDuty/equivalent equivalent), **validate against benign activity** for false positives.
- **Guardrail/Deliverable:** the tuned Sigma rule + the FP analysis.
- **Connects:** 16, capstone detection.

**16 · Cloud Incident Response**
- **Anchor:** LastPass 2022 two-incident saga (the second breach reused data exfiltrated in the first — a rich, real IR narrative).
- **Shape:** predict-what-fires / reconstruct.
- **Reproduce:** from CloudTrail/equivalent, **reconstruct the timeline**, pull IOCs, contain; **extend a triage script** to automate the reconstruction.
- **Deliverable:** the IR timeline + IOCs + the automation.
- **Connects:** capstone (the respond half).

### Capstone — "Re-litigate a real breach, end to end"
Pick a documented cloud breach (or the seeded one). **Reproduce** its chain in a lab account, **render
the verdict memo** (every hop: owner · plane · breaking change), then **close every hop as code**
(Terraform gated by a scanner in CI), **simulate** the attack (stratus/Pacu), **detect** it (native
detector *and* a Sigma rule), and **write the IR timeline.** Deliverable: the verdict, the fix-as-code,
the detection. The bar: a green `terraform apply` rebuilds the *fixed* system, the gate fails the
*original* config, and the detection fires on the simulation but not on benign traffic.
