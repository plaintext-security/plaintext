# Track 05 — Cloud & Container Security *(Verdict rewrite)*

> **This is an experimental, parallel rewrite** of the shipped cloud track, built in the "Variant D"
> vein (see `../module-01-alternatives/`). It lives under `planning/` and builds nothing — the shipped
> track at `tracks/05-cloud/` stays in place. Read `DESIGN.md` for the thesis and `SOURCES.md` for the
> anchor catalogue.

**Attack and defend cloud-native environments by re-litigating the breaches that actually happened.**
Every module is anchored to a real, public cloud breach or primary-source artifact. You don't read
about the shared-responsibility line — you rule on which side of it Capital One's encryption sat, then
write the guardrail that would have stopped it. AWS/GCP/Azure plus containers and Kubernetes.

## How this track works — the verdict loop

Most modules run the same four beats:

1. **Predict** — call the verdict *before* you read or run, on a question where the common intuition is
   wrong in an instructive way. Being wrong is the point.
2. **Reproduce** — recreate the breach hop's conditions locally (LocalStack, Vulhub, kind) — honestly,
   stating where the simulator doesn't enforce and reasoning with policy evaluation instead.
3. **Verdict** — render owner (provider vs. customer) · plane (control vs. data) · the one change that
   breaks the chain. A real cloud-IR/GRC artifact, not a worksheet.
4. **Guardrail** — encode your verdict as code that *fails the bad state and passes the fix* (Checkov/OPA,
   Sigma, Falco, a policy assertion). Your judgment, made un-recurrable.

## What you'll be able to do
- Render a per-hop responsibility verdict on a real cloud breach — owner, plane, breaking change.
- Find and explain IAM and serverless privilege-escalation paths, and *close* them as code.
- Audit posture and infrastructure-as-code for the misconfigurations that caused real leaks, gated in CI.
- Secure containers and Kubernetes, and detect and respond to cloud attacks using both open tools and
  native cloud services (GuardDuty, Defender for Cloud, GCP SCC).

## Modules

| # | Module | Real anchor | What you'll render / build | OSS / free tools |
|---|--------|-------------|----------------------------|------------------|
| 01 | [Cloud Fundamentals & Shared Responsibility](modules/01-cloud-fundamentals/README.md) | Capital One 2019 | verdict memo + Checkov guardrail | cloud CLIs, Checkov |
| 02 | [Cloud Identity & IAM](modules/02-cloud-identity-iam/README.md) | Code Spaces 2014 | blast-radius verdict + least-priv policy, re-proven | `cloudfox`, `simulate-principal-policy` |
| 03 | [IAM Attack Paths](modules/03-iam-attack-paths/README.md) | Rhino "21 privesc methods" | privesc graph + the minimum cut, re-verified | `pmapper`, `cloudfox` |
| 04 | [Cloud Network Security](modules/04-cloud-network-security/README.md) | the `0.0.0.0/0` exposure wave | corrected SG + default-deny, reachability re-proven | `cloudmapper`, cloud CLIs |
| 05 | [Posture & Misconfiguration Auditing](modules/05-posture-auditing/README.md) | the 2017 public-S3 leaks | triaged findings + a green benchmark on the fix | `prowler`, `scoutsuite` |
| 06 | [Infrastructure-as-Code Security](modules/06-iac-security/README.md) | misconfig that ships in real Terraform | the CI gate that blocks the bad config | `checkov`, `tfsec`, `trivy` |
| 07 | [Secrets Management & Detection](modules/07-secrets-management/README.md) | Uber 2016 | a broker with leased creds + runtime fetch + rotation | `vault`, `trufflehog`, Secrets Manager |
| 08 | [CI/CD Pipeline Security](modules/08-cicd-security/README.md) | SolarWinds / SUNBURST 2020 | the hardened, provenance-signed workflow | `trivy`, `gitleaks` |
| 09 | [Serverless Security](modules/09-serverless-security/README.md) | Denonia 2022 | exec-role verdict + fixed code & least-priv role | `cloudfox`, `pacu`, `aws-sam-cli` |
| 10 | [Container & Image Security](modules/10-container-image-security/README.md) | Docker Hub backdoored images 2018 | hardened multi-stage rebuild + scan gate | `trivy`, `grype` |
| 11 | [Container Escape & Runtime](modules/11-container-escape-runtime/README.md) | runc CVE-2019-5736 | the breakout, caught by a tuned Falco rule | `falco` |
| 12 | [Kubernetes — RBAC & Network Policy](modules/12-kubernetes-rbac-network/README.md) | Tesla 2018 | least-priv RBAC + NetworkPolicy, re-verified | `kube-bench` |
| 13 | [Kubernetes — Admission & Runtime](modules/13-kubernetes-admission-runtime/README.md) | Graboid 2019 | Kyverno admission policies + Falco | `kyverno`, `falco` |
| 14 | [Cloud Attack Techniques](modules/14-cloud-attack-techniques/README.md) | LastPass 2022 | detonations mapped to ATT&CK + telemetry | `pacu`, `stratus-red-team` |
| 15 | [Cloud Logging & Detection](modules/15-cloud-logging-detection/README.md) | the detection gap (Capital One / LastPass) | a tuned Sigma rule + FP analysis | `falco`, `sigma`; GuardDuty / Defender / SCC |
| 16 | [Cloud Incident Response](modules/16-cloud-incident-response/README.md) | LastPass 2022 (two-incident saga) | the IR timeline + IOCs + triage automation | `cloudtrail`, `hayabusa` |

*Anchors are drawn from the catalogue in `SOURCES.md`; a few modules reach to Azure/GCP incidents
(Storm-0558, ChaosDB) to prove the model is provider-agnostic.*

## Phases & projects

Sixteen modules in three phases; each ends in a **project** that integrates its modules.

- **Phase 1 · Identity, posture & the pipeline (01–08)** — **Project:** take a real-breach-shaped
  CloudGoat/flaws.cloud account, render the verdict on its IAM privesc chain, then close it as Terraform
  gated by `checkov`/`trivy` in CI, with secrets pulled into a broker.
- **Phase 2 · Containers & Kubernetes (09–13)** — **Project:** harden a workload end to end — scan the
  image, least-priv a serverless role, demonstrate a runc-style breakout caught by Falco, and enforce
  RBAC, NetworkPolicy, and an admission policy as code on a kind cluster.
- **Phase 3 · Attack, detect & respond (14–16)** — **Project (the capstone):** re-litigate a real cloud
  breach end to end.

## Prerequisites
Complete Track 00 — Foundations first.

> Labs use your own free-tier accounts or intentionally vulnerable environments (CloudGoat,
> flaws.cloud, Vulhub). Never test accounts or tenants you don't own, and tear down billable resources
> when done.

## Capstone — "Re-litigate a real breach, end to end"
The capstone is the Phase 3 project; it integrates all three phases. Pick a documented cloud breach (or
the seeded one). **Reproduce** its chain in a lab account, **render the verdict memo** (every hop:
owner · plane · breaking change), then **close every hop as code** (Terraform gated by a scanner in CI),
**simulate** the attack (`stratus-red-team`/Pacu), **detect** it (a native detector *and* a Sigma rule),
and **write the IR timeline**. **Deliverable:** the verdict, the fix-as-code, and the detection.

The starter scaffold and acceptance checks live in
[`plaintext-labs/cloud/capstone/`](https://github.com/plaintext-security/plaintext-labs/tree/main/cloud/capstone).

### Capstone rubric
The loop is **reproduce → verdict → fix-as-code → detect**, and the fix must be *gated*, not just written.
**Proficient is the bar to ship.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Verdict** | hops listed, ownership unclear | every hop assigned owner · plane · breaking change | mapped to ATT&CK for Cloud, with the trust relationship that enabled each hop |
| **Reproduce** | described, not reproduced | the key hop reproduced locally (or honestly assessed from config) | the chain reproduced end to end in a one-command lab |
| **Fix as code** | fixed in the console (click-ops) | the fix expressed as Terraform/IaC that closes the path | least-privilege, parameterised, with the diff proving the path is gone |
| **CI gate** | no scanner, or not enforced | a scanner runs in CI and *fails* the original config | tuned (no noise), blocks merge on the specific finding, passes on the fix |
| **Detection** | none, or fires on nothing | a detection from cloud logs that catches the simulation | validated against benign activity for false positives, mapped to the technique |
| **Cost & teardown** | left billable resources running | torn down; no secrets in code | rebuilds from `terraform apply` and tears down cleanly; budget-safe by design |

## AI & automation
In the cloud the infrastructure *is* code, and increasingly that code is AI-written — exactly where
misconfigurations hide (over-broad IAM, `0.0.0.0/0`, privileged containers). The posture this track
drills: **AI authors → you review → scanners gate → you own the verdict.** Each module also uses a model
as an *adversary to check*: have it render the verdict first, then catch the misattributions it reliably
makes (it "protected the data with encryption"; it blames the provider's mechanism).

## Standards & further reading
- CIS Benchmarks for AWS/GCP/Azure and Kubernetes
- MITRE ATT&CK for Cloud and Containers
- Cloud provider Well-Architected / security best-practice guidance
- OWASP Kubernetes and Cloud-Native security guidance
- Breach anchor catalogue: `SOURCES.md`
