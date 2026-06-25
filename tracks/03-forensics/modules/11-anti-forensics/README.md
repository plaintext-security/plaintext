# Module 11 — Anti-Forensics & Detecting It

*Type 2 · Misconception Reveal — disprove "timestomping erases the trail" by comparing NTFS Standard-Information vs File-Name timestamps on a manipulated file with The Sleuth Kit, then codify the SI/FN divergence into a Python detector. (Secondary: Tool-Build — the mismatch-flagging script is a real reusable detection tool.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Digital Forensics & IR** — *recognise the attacker's attempts to erase their tracks — and understand why those attempts rarely succeed completely.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~3.5–5.5 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Attackers timestomp, delete, wipe, and clear logs to cover their tracks — but those attempts
    rarely succeed completely, and the attempt itself usually leaves a trace. Timestomping is the
    canonical case: changing the easy-to-edit NTFS `$SI` timestamp typically leaves the
    kernel-maintained `$FN` timestamp intact, and the discrepancy is the detection (`istat` dumps
    both). The governing principle is that **absence is evidence** — the wiper's prefetch record,
    the log-clear event (1102), a sequence-number gap, or a missing-but-expected log all testify.

## Why this matters

An attacker who knows they've been detected — or who anticipates forensic investigation — will try
to cover their trail. Timestomping, log deletion, file wiping, and volume shadow copy destruction
are standard post-exploitation steps in sophisticated intrusions. A responder who doesn't know what
anti-forensics looks like will declare a disk clean when it isn't. A responder who does recognise
the artifacts of evasion can often reconstruct what was hidden — because the *absence* of expected
data is itself evidence, and because many anti-forensics techniques leave their own traces.

This is not a theoretical threat: timestomping specifically (MITRE ATT&CK
[T1070.006](https://attack.mitre.org/techniques/T1070/006/)) is documented in real intrusions by
**Stuxnet**, **APT28**, **APT29**, **Lazarus Group**, and as a built-in feature of **Cobalt
Strike's** `timestomp` command — the ATT&CK page lists dozens of such procedure examples. Stuxnet is
the textbook case: it set its dropped driver files' timestamps to match legitimate Windows files so
they would not stand out in a directory listing sorted by date. Each of those operations left the
`$FILE_NAME` timestamps it didn't touch — which is exactly the muddy-boot-print discrepancy this
module teaches you to find.

## Objective

Detect timestomping on a synthetic disk image using The Sleuth Kit: compare NTFS Standard
Information and File Name attribute timestamps for a manipulated file, identify the discrepancy,
and write a Python detection script that flags the mismatch.

## The core idea

Timestamps are recorded in multiple places in NTFS, and attackers who manipulate one set often
don't manipulate all of them. The Standard Information (SI) attribute — what Windows Explorer
shows you as "Date modified" — is easy to set via the Win32 API. The File Name (FN) attribute
— which records when the directory entry itself was created or modified — requires more deliberate
effort and is frequently left intact. **Timestomping that changes only the SI attribute while
leaving the FN attribute unchanged is the forensic equivalent of a muddy boot print under a clean
alibi.** The boot print is right there; you just have to know to look.

!!! note "The mental model"
    NTFS keeps timestamps in two places — `$SI` (easy to set via Win32) and `$FN` (kernel-set,
    harder to touch). An attacker who edits one rarely edits both. Timestomping that changes only
    `$SI` is a muddy boot print under a clean alibi: the contradiction is right there once you
    `istat` both attributes and compare.

The Sleuth Kit's `istat` command dumps all four NTFS timestamps (created, modified, accessed,
changed) for both the SI and FN attributes. A mismatch — especially SI modified *before* FN
created, or SI dates that are implausibly round (exactly midnight, or the exact compile timestamp
of a known toolkit) — is a strong indicator of manipulation. The investigation question is always:
does this file's timestamp tell a coherent story with everything else in the timeline? A file
created in 2019 appearing in a directory alongside files from this morning, without a clear
explanation, deserves a second look.

!!! warning "The gotcha"
    Absence of a file is *not* absence of evidence — and a clean disk is not a clean host. A wiped
    file leaves the wiper's prefetch record, a `$LogFile` MFT entry, shell history, or a process-
    execution trace; a missing-but-expected Security log is itself a finding you document. The
    failure mode is declaring a host clean because the obvious artifact is gone, when the *gap* was
    the artifact.

Wiping and deletion are the other major anti-forensics categories, and they're worth understanding
because the defenses are asymmetric. A deleted file on an HDD is often recoverable from slack
space; a deleted file on an SSD may not be, because TRIM instructs the drive controller to zero
the cells immediately. A wiped file (overwritten with zeros or random data) is generally not
recoverable by standard carving, but the *fact that wiping happened* is often visible from log
artifacts, shell history, or the presence of a wiper binary in the process execution record.
**Absence of a file is not absence of evidence** — the event log entry for the process that
deleted it, the prefetch record for the wiper, or the $LogFile entry for the MFT update may all
survive.

Log tampering is the third pillar, and Windows event log manipulation specifically is detectable
in several ways. Legitimate log clearing generates its own event (Event ID 1102 on Security log,
104 on System log). Logs cleared with no preceding 1102 entry — which happens when the log file
is deleted or corrupted rather than cleared through the API — create a gap in the sequence
numbers in the remaining records. If you have a continuous feed to a SIEM, the gap is immediately
visible. If you're working from a disk image and the log file was wiped, the absence itself is
worth documenting: "the Security event log, which should be present, was not found on the imaged
volume." That absence goes in the report.

??? note "Go deeper: the asymmetry of wiping and log clearing"
    Defenses are asymmetric across techniques. A deleted file on an HDD often recovers from slack;
    on an SSD, TRIM may have zeroed the cells immediately. A wiped (overwritten) file rarely carves
    back — but the *fact* of wiping shows in the wiper binary's prefetch, shell history, or
    `$LogFile`. Log clearing through the API fires Event ID 1102 (Security) or 104 (System); raw
    deletion or corruption instead leaves a *gap in the sequence numbers* of the surviving records,
    which a continuous SIEM feed makes obvious.

!!! tip "AI caveat"
    A model can scan a large file-metadata listing for statistically anomalous timestamp
    relationships faster than you can by hand — but it doesn't replace `istat`; you still need the
    raw attribute data from the forensic tool. The craft is understanding *why* a flagged timestamp
    is anomalous, because "this is unusual" without the why doesn't make a defensible finding.

## Learn (~2.5 hrs)

**NTFS forensics and timestomping (~1 hr)**
- [SANS FOR508 — NTFS Timestamps White Paper (PDF)](https://www.sans.org/white-papers/36842/) — the definitive reference on how NTFS timestamps propagate (copy, move, open, execute) under normal conditions; the baseline you need to recognise abnormal SI/FN divergence. Free download.

**Anti-forensics techniques and detection (~1 hr)**
- [Timestomping — MITRE ATT&CK T1070.006](https://attack.mitre.org/techniques/T1070/006/) — the technique page: how it's done, which tools implement it, and the detection recommendations. Read the "Detection" section carefully — it maps directly to the lab exercise; the "Procedure Examples" list (Stuxnet, APT28/29, Lazarus, Cobalt Strike) shows how broadly real adversaries use it.
- [Harlan Carvey — "Windows Anti-Forensics"](https://windowsir.blogspot.com/) — Carvey's blog is the practitioner reference for Windows artifact analysis, including anti-forensics detection; search the blog for "timestomp" and "log clearing" entries.

**File system carving and wiping (~0.5 hrs)**
- [Autopsy User's Guide — File Analysis](https://sleuthkit.org/autopsy/docs/user-docs/4.19.1/uilayout_page.html) — covers deleted file recovery and carving in the Autopsy GUI (built on The Sleuth Kit); understanding how carving works explains why wiping defeats it.

## Key concepts
- NTFS records timestamps in two attributes: Standard Information (SI, user-visible) and File Name (FN, directory-entry level)
- Timestomping that changes only SI leaves FN intact — the discrepancy is the detection
- SI modified-before-FN-created is a strong indicator of timestamp manipulation
- Deleted files: recoverable on HDD from slack/unallocated; TRIM on SSD may zero cells immediately
- Log tampering: event 1102/104 signals legitimate clearing; sequence-number gaps signal raw deletion
- Wiping artifacts: wiper binary in prefetch, $LogFile MFT update entries, shell history
- Timestomping is real and widespread (ATT&CK T1070.006: Stuxnet, APT28/29, Lazarus, Cobalt Strike) — Stuxnet matched its drivers' timestamps to legitimate Windows files

## AI acceleration

AI-assisted analysis is limited but specific here: you can feed a list of file metadata (timestamps,
paths, sizes) to a model and ask it to identify statistically anomalous timestamp relationships —
files whose SI timestamps are inconsistent with surrounding directory entries, or timestamps that
cluster on suspiciously round values. The model doesn't replace `istat` — you still need the raw
attribute data from the forensic tool — but it can process a large file listing faster than manual
review. The craft is understanding what the model flags and why; "this timestamp is unusual" without
knowing *why* it's unusual leaves you unable to write a defensible finding.

!!! question "Check yourself"
    - An attacker timestomped a file's "Date modified" to 2019. How do you detect the manipulation, and which attribute gives it away?
    - The wiper overwrote the malware and the Security log is gone. Name two things that still let you prove wiping happened.
    - Why does "I found nothing on the disk" not equal "the host is clean"?
