# Cloud & Container Security — Course Overview

> **In the cloud, the infrastructure *is* code — and so are its mistakes.** Attack and defend
> cloud-native environments across AWS/GCP/Azure, containers, and Kubernetes: walk an IAM
> privilege-escalation chain, audit posture and Terraform in CI, harden a cluster, then simulate an
> attack and detect it from the logs.

| | |
|---|---|
| **Level** | Intermediate — Foundations assumed; comfort with a cloud CLI helps |
| **Format** | Self-paced · hands-on labs · one-command Docker, plus a cloud free-tier account where the domain needs it |
| **Shape** | 17 modules · 3 phases · 1 capstone |
| **Prerequisites** | Track 00 — Foundations |
| **Cost** | Free — OSS-first; a cloud free-tier account where the domain needs it |

## What this course is

The full attack-and-defend loop for cloud-native systems. You don't read about shared responsibility —
you find a real privilege-escalation path through IAM, close it as Terraform gated in CI, harden a
container and a Kubernetes cluster, and finish by simulating a cloud attack and catching it from the
logs. Everything is expressed as code, because in the cloud that's the only thing that scales.

## What you'll be able to do

- Reason about shared responsibility, cloud identity, network controls, and trust boundaries.
- Find and explain privilege-escalation paths through IAM and serverless execution roles.
- Audit posture and infrastructure-as-code for misconfigurations, gated in CI.
- Secure containers and Kubernetes — image hygiene, RBAC, network policy, admission, runtime.
- Detect and respond to cloud attacks using both open tools and native services (GuardDuty, Defender for Cloud, GCP SCC).

## How it's taught

Every module follows the same honest loop: **anchor on a real cloud misconfiguration → build the skill
on a deliberately vulnerable account or a shipped workload → explain the trust relationship that made it
possible → turn the fix into reviewable code gated in CI.** Labs use intentionally vulnerable
environments (CloudGoat, flaws.cloud) or your own free-tier account — never anything you don't own, and
you tear down billable resources when done.

AI is assumed: in the cloud the infrastructure *is* code, and increasingly that code is AI-written —
exactly where misconfigurations hide. The posture: **AI authors → you review → scanners gate → you own
it.** There's no grading and no certificate. **Your repo is the credential.**

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Identity, posture & the pipeline** | Cloud Fundamentals · Cloud Identity & IAM · IAM Attack Paths · Cloud Network Security · Posture Auditing · IaC Security · Secrets Management · CI/CD Security · Data Protection & KMS | A walked IAM privesc path on a vulnerable account, closed as Terraform gated by a scanner in CI, with secrets pulled into a broker |
| **2 · Containers & Kubernetes** | Serverless Security · Container & Image Security · Container Escape & Runtime · Kubernetes RBAC & Network Policy · Kubernetes Admission & Runtime | A hardened workload end to end — scanned image, locked-down execution role, a Falco-caught breakout, and RBAC/NetworkPolicy/admission as code on a kind cluster |
| **3 · Attack, detect & respond** | Cloud Attack Techniques · Cloud Logging & Detection · Cloud Incident Response | The capstone — a simulated cloud attack, detected from logs (native detector *and* a Sigma rule) and contained |

Each module grounds in real artifacts — CloudGoat, flaws.cloud, ATT&CK for Cloud — so the misconfig is
never abstract.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated lab built on real, vulnerable cloud environments — not toy examples.
Reference labs are one command (`git clone` + `make up`); where the domain demands it (live IAM, cloud
logging), you work in your own free-tier account and tear it down clean. You don't watch; you do.

## What you'll walk away with

A **cloud security portfolio piece**: an IAM privilege-escalation path mapped and explained, the fix
expressed as Terraform that closes it, a CI gate that fails the bad config and passes the fix, and a
detection — native and Sigma — validated against benign activity. Attack path, fix-as-code, detection,
all committed.

## Who it's for

Engineers and defenders moving into cloud and container security who have the fundamentals down. If you
can read a network capture and operate a Linux host but can't yet explain why an over-broad IAM trust
policy is a privesc waiting to happen, this is your track.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Cloud Fundamentals & Shared Responsibility →](modules/01-cloud-fundamentals/README.md)
