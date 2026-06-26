# Digital Forensics & Incident Response — Course Overview

> **Reconstruct events from the artifacts left behind** and tell the story of what happened on a
> system — defensibly, so the timeline holds up. Acquisition through root-cause report.

| | |
|---|---|
| **Level** | Intermediate — Foundations assumed |
| **Format** | Self-paced · hands-on labs in every module · one-command Docker |
| **Shape** | 14 modules · 4 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations |
| **Cost** | Free, forever. Open-source tools only. |

## What this course is

The investigator's workflow, run from acquisition to verdict. You acquire and verify evidence without
altering it, recover and interpret artifacts from disk, memory, and the network, build a
super-timeline that correlates activity across sources, and drive an investigation to a root-cause
report. The bar throughout is **defensibility**: every claim traces back to an artifact, and integrity
holds.

## What you'll be able to do

- Acquire and verify evidence without altering it.
- Recover and interpret artifacts from disk, memory, and the network.
- Build a super-timeline that correlates activity across sources.
- Drive an investigation to a root-cause verdict and write it up.

## How it's taught

Every module works real evidence — public training disk and memory images, sample PCAPs, real EVTX —
with the tools investigators actually use (`sleuthkit`, `volatility3`, `plaso`/Timesketch,
`velociraptor`, `hayabusa`). You don't read about timelines; you build one from a single compromised
host, pivot through it, and call out what's proven and what isn't.

AI accelerates the grind — summarising timelines, correlating artifacts, drafting the narrative — but
forensic soundness sets the limit: an AI summary is a *lead*, never evidence, and every conclusion
traces back to the artifact. **Automate collection and parsing; never automate the judgment about what
happened.** No grading, no certificate — **your repo is the credential.**

> Labs use public training images and sample memory dumps. Never examine evidence you're not
> authorised to handle.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Acquire & preserve** | Forensic Fundamentals & Evidence Handling · Acquisition & Imaging · File Systems & Carving | A forensically sound acquisition kit — image a disk, capture memory, verify with hashes, carve back deleted files, with a chain-of-custody log that survives challenge |
| **2 · Reconstruct the host** | Windows Artifacts · Browser & Application Artifacts · Memory Forensics · Timeline Analysis · Triage & Live Response | One `plaso`/Timesketch super-timeline fusing Windows artifacts, browser/app traces, and memory from a compromised host, triaged at scale with Velociraptor |
| **3 · Beyond the host** | Network Forensics · Log & Cloud Forensics · Anti-Forensics & Detecting It · Malware Artifacts in IR | The investigation extended off the box — sessions reconstructed from PCAP, log/cloud pivots, anti-forensic tampering spotted, malware handed off to deep analysis |
| **4 · Investigation & report** | Incident Response Process · Reporting & Root-Cause Analysis | The capstone — the full NIST lifecycle and a root-cause report where every claim traces to an artifact |

Every lab works real evidence — public training images, sample memory dumps, real PCAPs — so the
artifacts are the ones investigators actually see.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) built on real evidence —
training disk and memory images, sample PCAPs, real EVTX — not toy examples. You don't watch; you do.

## What you'll walk away with

A **super-timeline + root-cause report**: take a training disk or memory image from acquisition to a
defensible incident report — acquire and verify, build the timeline, reconstruct what happened, every
claim tied to an artifact. The timeline and a report that would survive scrutiny are the proof.

## Who it's for

Anyone who's done Foundations and wants to investigate like a working DFIR analyst — not list
artifacts but acquire soundly, fuse a timeline, and reach a verdict that holds up. If you can find an
artifact but couldn't yet defend a root-cause claim against challenge, start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Forensic Fundamentals & Evidence Handling →](modules/01-forensic-fundamentals/README.md)
