# Track 03 — Digital Forensics

Disk, memory, and network forensics. Reconstruct events from the artifacts left behind
and tell the story of what happened on a system — defensibly, so the timeline holds up.

## What you'll be able to do

- Acquire and verify evidence without altering it.
- Recover and interpret artifacts from disks, memory, and the file system.
- Build a super-timeline that correlates activity across sources.
- Reconstruct an intrusion from network and host evidence and write a root-cause report.

## The arc

| Phase | Modules | Focus |
|-------|---------|-------|
| Handle evidence | 01 | Acquisition, integrity, chain of custody |
| Examine sources | 02–05 | Disk, OS artifacts, memory, network |
| Tell the story | 06–07 | Timeline correlation and reporting |

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Forensic Fundamentals & Evidence Handling | Acquisition, hashing, write-blocking, chain of custody | `dc3dd`, `sleuthkit` |
| 02 | Disk & File System Forensics | Partitions, file systems, deleted-file recovery, carving | `autopsy`, `sleuthkit` |
| 03 | Operating System Artifacts | Registry, logs, browser, and execution artifacts (Windows + Linux) | `RegRipper`, `plaso` |
| 04 | Memory Forensics | Processes, network connections, and injected code from a RAM image | `volatility3`, `MemProcFS` |
| 05 | Network Forensics | Reconstructing sessions and extracting files from captures | `wireshark`, `zeek` |
| 06 | Timeline Analysis | Building and pivoting through a super-timeline | `plaso`, `timesketch` |
| 07 | Investigation & Reporting | Driving an investigation to root cause and documenting it | `Velociraptor` |

## Prerequisites

Complete Track 00 — Foundations first.

> All labs use publicly available forensic images and sample memory dumps intended for
> training (e.g. DFIR images, the Volatility sample set). Never examine evidence you are
> not authorised to handle.

## AI & automation

AI summarises timelines, correlates artifacts, and drafts the incident narrative far
faster than you can by hand. Forensic soundness sets the limit: an AI summary is a lead,
never evidence — every conclusion is traced back to the underlying artifact, and chain of
custody is non-negotiable. Automate the collection and the parsing; never automate the
judgment about what actually happened.

## Standards & further reading

- NIST SP 800-86 (Guide to Integrating Forensic Techniques into Incident Response)
- SWGDE best practices for digital evidence
- The Volatility and Sleuth Kit documentation for artifact reference
