# Track 05 — Cloud Security

Attack and defend cloud-native environments. Find and fix the misconfigurations that
lead to real-world breaches across AWS, GCP, and Azure — and learn to express security
as code, because in the cloud the infrastructure *is* code.

## What you'll be able to do

- Reason about the shared-responsibility model and cloud identity.
- Find and explain privilege-escalation paths through IAM.
- Audit posture and infrastructure-as-code for misconfigurations, gated in CI.
- Secure containers and Kubernetes, and detect and respond to cloud attacks.

## The arc

| Phase | Modules | Focus |
|-------|---------|-------|
| Ground rules | 01 | Shared responsibility, identity, accounts |
| Find the gaps | 02–04 | IAM paths, posture, IaC and container security |
| Attack & defend | 05–07 | Cloud attack techniques, detection, secrets/data |

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Cloud Fundamentals & IAM | Shared responsibility, identity, policies, and trust | cloud CLIs |
| 02 | IAM Attack Paths | Finding and explaining privilege-escalation chains | `pmapper`, `cloudfox` |
| 03 | Posture & Configuration Auditing | Benchmarking accounts against known misconfigurations | `prowler`, `scoutsuite`, `cloudsploit` |
| 04 | Infrastructure-as-Code Security | Scanning Terraform/manifests before they deploy | `checkov`, `trivy`, `tfsec` |
| 05 | Container & Kubernetes Security | Image hygiene, RBAC, network policy, runtime detection | `trivy`, `kube-bench`, `falco` |
| 06 | Cloud Attack Techniques | Exploiting misconfig and simulating attacks safely | `pacu`, `stratus-red-team` |
| 07 | Cloud Detection & Secrets | Logging-based detection and finding leaked credentials | `falco`, `gitleaks`, `trufflehog` |

## Prerequisites

Complete Track 00 — Foundations first.

> All labs use your own free-tier cloud accounts or intentionally vulnerable
> environments (e.g. CloudGoat, flaws.cloud). Never test against accounts or tenants you
> don't own or aren't authorised to assess, and tear down billable resources when done.

## AI & automation

In the cloud the infrastructure *is* code — and increasingly that code is AI-written,
which is exactly where misconfigurations hide (over-broad IAM, `0.0.0.0/0`, privileged
containers, wildcard policies). The posture this track drills: **AI authors → you review
→ scanners gate → you own it.** The marketable skill is not typing HCL or YAML; it is
directing the model to generate it and rigorously reviewing what came back.

## Standards & further reading

- CIS Benchmarks for AWS/GCP/Azure and Kubernetes
- MITRE ATT&CK for Cloud and the Cloud Matrix
- Cloud provider Well-Architected / security best-practice guidance
- OWASP Kubernetes and Cloud-Native security guidance
