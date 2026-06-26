# Defensive Operations — Course Overview

> **Find attackers in the noise and respond before they reach their goal.** Detection engineering,
> SIEM, log analysis, hunting, and incident response — treated as code: telemetry in, tested
> detections out, mapped to attacker behaviour.

| | |
|---|---|
| **Level** | Intermediate — Foundations assumed |
| **Format** | Self-paced · hands-on labs in every module · one-command Docker |
| **Shape** | 17 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The blue-team workflow, built end to end and treated like software. You stand up a telemetry pipeline
from host, network, and cloud into a searchable store, write and version detections mapped to MITRE
ATT&CK, hunt proactively across endpoint and network data, and drive an incident from alert to root
cause. The output isn't dashboards — it's tested detections and an investigation that holds up.

## What you'll be able to do

- Build a telemetry pipeline from host, network, and cloud into a searchable store.
- Write, test, and version detections mapped to MITRE ATT&CK.
- Hunt proactively across endpoint and network data.
- Triage and drive an incident from alert to root cause.

## How it's taught

Every detection lab sources a **real public dataset** — Malware-Traffic-Analysis.net, public PCAPs,
EVTX-ATTACK-SAMPLES — with a generate-it-here option, so you can complete the track standalone (and if
you did Offensive, bring your own attack artifacts). You don't just write a rule; you run a real
attack past it, prove it fires, and tune out the false positives.

AI authors, you own it: a small local model triages log lines cheaply at volume; a frontier model
drafts a Sigma rule or an incident narrative. The skill is review — a generated detection with broken
logic ships false confidence, and automation that buries a real signal is worse than none. **AI drafts
→ you map it to ATT&CK, test it, and own the alert.** No grading, no certificate — **your repo is the
credential.**

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Get the data** | Telemetry & Log Centralisation · Windows & Endpoint Telemetry · Linux Telemetry · Network Security Monitoring · Intrusion Detection · SIEM Fundamentals · Log Parsing & Normalisation | A telemetry pipeline ingesting host *and* network data into a searchable SIEM, with a real attack dataset flowing through it |
| **2 · Find the attacker** | Detection-as-Code · Detection Testing & Tuning · ATT&CK Mapping & Coverage · Threat Hunting (Endpoint) · Threat Hunting (Network) · PowerShell Logging & Hunting | Detections-as-code mapped to ATT&CK, tested against a real attack dataset, plus one documented threat hunt |
| **3 · Respond & stay current** | Alert Triage & Incident Response · Threat Intelligence · Response Automation (SOAR primer) · KEV-Driven Defense | The capstone — an incident handled alert to root cause, an automated enrich→contain→ticket step, and a KEV-driven coverage loop |

Every lab runs on real public attack data, so the signal you're hunting is the one practitioners see.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) built on real artifacts —
real PCAPs, real EVTX, a real attack dataset — not toy examples. You don't watch; you do.

## What you'll walk away with

A **tested-detections + investigation portfolio piece**: stand up a telemetry pipeline, simulate an
attack (Atomic Red Team or a replayed PCAP), and catch it — ship the logs, write the
detection-as-code mapped to ATT&CK, and produce an incident write-up from alert to root cause. The
detections and the investigation are the proof.

## Who it's for

Anyone who's done Foundations and wants to defend like a working SOC analyst or detection engineer —
not memorise SIEM features but build the pipeline, write the rule, and prove the catch. If you can
read a log but couldn't yet ship a tested detection mapped to ATT&CK, start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Telemetry & Log Centralisation →](modules/01-telemetry/README.md)
