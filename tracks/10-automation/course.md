# Security Automation — Course Overview

> **Automate the pipeline, not just the script.** Infrastructure as code, CI/CD security gates, and
> SOAR — the standing automation discipline that runs through every other track, done deliberately.
> *Anyone can automate now; doing it well, and owning the result, is the skill.*

| | |
|---|---|
| **Level** | Intermediate — Foundations assumed; Track 09 (Python) helps |
| **Format** | Self-paced · hands-on labs · one-command Docker |
| **Shape** | 11 modules · 3 phases · 1 capstone |
| **Prerequisites** | Track 00 — Foundations (Track 09 — Python helps) |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The automation thesis made hands-on. You define infrastructure as code, gate misconfigurations in CI,
build a CI/CD pipeline from commit to deploy, containerise a security tool so it runs the same
everywhere, and build a SOAR playbook that enriches, contains, and tickets with a human in the loop —
then review an AI-generated version and catch what it got wrong.

## What you'll be able to do

- Define and review infrastructure as code, with security gated in CI.
- Manage configuration and hardening at scale.
- Build response playbooks that enrich, contain, and ticket — with a human approval step.
- Treat detections and remediation as code, version-controlled and tested.

## How it's taught

Every module follows the same honest loop: **express the work as code → gate it in CI → prove the gate
blocks the bad config (and passes the fix) → review what AI generated and document what you corrected.**
You run automation against your own accounts and lab infrastructure only — generated IaC can create real,
billable, internet-facing resources, so you review before you apply.

The whole track *is* the AI/automation thesis: AI writes the YAML, HCL, and playbook logic — and
generated automation is *exactly* where misconfigurations hide (over-broad RBAC, wildcard IAM, missing
approval gates). The posture: **AI authors → you review → scanners gate → you own it.** "I don't write the
YAML, I own the YAML." There's no grading and no certificate. **Your repo is the credential.**

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Infrastructure & config as code** | The Automation Mindset · Infrastructure as Code · IaC Security Scanning · Configuration Management · Click-ops → IaC Migration | A small environment defined in Terraform/OpenTofu and configured with Ansible, with a scanner *blocking* a deliberately over-broad rule before apply |
| **2 · Pipelines & portable tooling** | CI/CD Pipelines & Gates · Containerising Tooling · Enrichment & Data Pipelines | A CI/CD pipeline running secret-scanning and gates from commit to deploy, a containerised tool that runs the same everywhere, and a scheduled enrichment pipeline |
| **3 · Response & detection as code** | SOAR Fundamentals · Detection-as-Code Pipelines · Reviewing AI-Generated Automation | The capstone — a SOAR playbook that enriches → contains → tickets with a human approval step, detections-as-code tested in CI, and a review pass that catches what AI got wrong |

Every project is reviewed, version-controlled code with a note on what AI generated versus what you
corrected.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`). You run automation against
your own lab infrastructure only, and you review generated IaC before you apply it — it can spin up real,
billable resources. You don't watch; you do.

## What you'll walk away with

A **security-automation portfolio piece**: a CI gate that blocks a misconfiguration before deploy and
passes the fix, a SOAR playbook that enriches → contains → tickets with an explicit human approval step,
detections-as-code tested in CI, and a note naming what AI generated versus what you corrected — the
pipeline, the playbook, and the review, all committed.

## Who it's for

Engineers and defenders who want automation to be a deliberate discipline, not a pile of one-off scripts.
If you can write a script but can't yet gate a bad config in CI or stand up a playbook with a human in the
loop, this is your track.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — The Automation Mindset →](modules/01-automation-mindset/README.md)
