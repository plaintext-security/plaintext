# Endpoint & Host Hardening — Course Overview

> **Make the host expensive to attack and loud when attacked.** Harden Windows *and* Linux to
> recognised CIS benchmarks — as code, with compliance scoring and drift detection — then stand up the
> telemetry that catches what hardening doesn't stop.

| | |
|---|---|
| **Level** | Intermediate — Foundations assumed; comfortable on Windows and Linux |
| **Format** | Self-paced · hands-on labs · one-command Docker; some hardening runs on VMs you own |
| **Shape** | 10 modules · 3 phases · 1 capstone |
| **Prerequisites** | Track 00 — Foundations |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The discipline of turning a default install into a host that resists attack and reports when it's
probed. You don't apply settings by hand — you threat-model the endpoint, push a CIS baseline as code to
*both* a Windows and a Linux host, score the before/after, prove drift detection catches a deliberate
misconfiguration, and watch telemetry fire on a simulated compromise.

## What you'll be able to do

- Threat-model the endpoint and prioritise the controls that actually matter.
- Harden Windows and Linux to CIS benchmarks, expressed as code.
- Score compliance against a benchmark and detect configuration drift.
- Apply exploit mitigations and application allowlisting, and reason about what they stop.
- Stand up endpoint telemetry that catches what the baseline didn't.

## How it's taught

Every module follows the same honest loop: **model what you're defending → apply the control as code →
measure it against the benchmark → prove the tooling catches it when the config drifts.** You work on VMs
or containers you own, and snapshot before destructive changes — some hardening will lock you out if you
skip that step.

AI is assumed: it generates the hardening — Ansible, GPO, SCAP profiles — and that's exactly where silent
mistakes hide. The skill is reviewing generated configuration against the benchmark and your threat model
before it ships. AI authors the baseline; you own what it breaks. There's no grading and no certificate.
**Your repo is the credential.**

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Model & baseline** | Threat Model of the Endpoint · Windows Hardening to CIS · Linux Hardening to CIS · Exploit Mitigation & Allowlisting | A CIS baseline applied to a Windows *and* a Linux host — mitigations and allowlisting included — every control justified against the model |
| **2 · Scale, score & patch** | Endpoint Telemetry & EDR · Configuration Management · Compliance Scoring & Auditing · Patch & Vulnerability Management | Telemetry stood up, the baseline pushed at scale with Ansible, an OpenSCAP score, and a patch/vuln loop — with drift detection catching a deliberate misconfiguration |
| **3 · Detect & defend** | Local Privilege-Escalation Defense · Detecting Host Compromise | The capstone — privesc paths closed, telemetry firing on a simulated compromise, and the config-as-code + score delta + detection delivered |

Each module ties to recognised baselines — CIS Benchmarks, the CIS Controls — and to the attacks the
hardening is meant to stop.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated lab. Reference labs are one command (`git clone` + `make up`); hardening
work runs on VMs or containers you own — snapshot first, because some of it is destructive. You don't
watch; you do.

## What you'll walk away with

An **endpoint-hardening portfolio piece**: both a Windows and a Linux host hardened to a CIS profile as
code, an OpenSCAP score before and after with the delta documented, drift detection that flags a
deliberate misconfiguration, and telemetry that catches a simulated attack the baseline didn't stop —
config-as-code, score delta, and detection, all committed.

## Who it's for

Defenders, sysadmins, and blue-teamers who can operate Windows and Linux and want to make hosts
measurably harder to attack. If you can use a host but can't yet express its hardening as reproducible,
scored, drift-detected code, start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Threat Model of the Endpoint →](modules/01-endpoint-threat-model/README.md)
