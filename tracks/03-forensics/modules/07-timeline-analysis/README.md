# Module 07 — Timeline Analysis

*Type 6 · Reconstruct — build a multi-source super-timeline from mixed artifacts with `log2timeline.py`/`psort`, pivot to the key events in the incident, and produce a timeline extract that anchors the incident report. (Secondary: Misconception Reveal — surface timezone-error and timestomp caveats that quietly corrupt a timeline.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Digital Forensics & IR** — *a timeline is the one artifact that turns a pile of evidence into a story.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    A super-timeline is the `JOIN` across six artifact sources where the key is *time* — plaso's
    `log2timeline.py` ingests EVTX, browser history, prefetch, registry, and logs, normalizes
    everything to UTC, and sorts it into one stream; `psort` filters and exports it. The payoff is
    seeing order and *silence* — gaps where something should have happened. The two recurring traps:
    a timezone error that fabricates a sequence, and timestomping (`$SI` vs `$FN` divergence) that
    plants a false time. Ingest everything first, filter second.

## Why this matters
Forensic artifacts are evidence, but they don't become a case until they're correlated. The Security event log, the browser history, the filesystem MAC times, the prefetch timestamps, and the memory acquisition time all record pieces of the same incident in different timezones, different timestamp formats, and different levels of granularity. A super-timeline stitches them together into a single, time-sorted view where every event from every source appears in order. It is the primary analytical tool for answering "what happened, in what order, and how long did it take?" — and it's often the evidence that turns a hypothesis into a finding.

For a concrete sense of what a finished timeline buys you, read a published intrusion writeup like The DFIR Report's **["Malicious ISO File Leads to Domain Wide Ransomware"](https://thedfirreport.com/2023/04/03/malicious-iso-file-leads-to-domain-wide-ransomware/)** — a real case reconstructed almost entirely as a time-ordered narrative: an IcedID payload executes, discovery and Cobalt Strike follow, ZeroLogon (CVE-2020-1472) escalates, and domain-wide Quantum ransomware fires roughly 78 hours after initial access. Every one of those claims is anchored to a timestamped artifact, and the "78 hours" figure — the answer to "how long did it take?" — only exists because someone merged endpoint, network, and log sources onto one clock. That is the deliverable this module teaches you to build.

## Objective
Build a multi-source forensic timeline using `log2timeline.py` (plaso) from a set of mixed artifact inputs; filter and pivot the timeline with `psort`; identify the key events in an incident scenario; and produce a timeline extract that could form the basis of an incident report.

## The core idea
Think of a super-timeline as a database index on time. Plaso's `log2timeline.py` is a parser engine — it ingests almost any forensic artifact (disk images, EVTX files, browser history, prefetch, registry hives, system logs, web server logs) and emits a normalized stream of timestamped events in a standard format (Plaso's storage format, exportable to CSV, JSONL, or Timesketch). Each event has a source type, a timestamp, a description, and a set of attributes. The power is that all sources are normalized to UTC and sorted together, so the chain of events — attacker logged in at 02:10, browser search at 02:05, file access at 02:15, log cleared at 02:31 — becomes visible in one view instead of requiring you to correlate six separate tool outputs manually. The practitioner translation: a super-timeline is the `JOIN` you'd otherwise do by hand across six tables, except the join key is *time* and plaso has already reconciled every source's clock to it.

!!! note "The mental model"
    A super-timeline is a `JOIN` across every artifact source with *time* as the join key — plaso
    reconciles each source's clock to UTC so the chain of events appears in one sorted view instead
    of six tool outputs you correlate by hand.

That reconciliation is also where the work goes wrong. **The single most common timeline mistake is a timezone error** — an artifact parsed in local time and silently shifted by hours against everything else, which fabricates a sequence that never happened. Pin the source timezone at ingest (`--timezone`), and treat any "impossible" ordering (an effect before its cause) as a clock problem to disprove before it's a finding to report. Order of operations matters too: ingest everything first, *then* filter with `psort` — narrowing the input before you can see the full picture is how you cut the one event the whole case turns on.

!!! warning "The gotcha"
    A timezone error is the easiest way to fabricate a sequence that never happened — one source
    parsed in local time, silently shifted hours against the rest. Pin the timezone at ingest, and
    treat any effect-before-cause ordering as a clock bug to disprove, not a finding to report. And
    filter *after* you ingest everything: narrow too early and you cut the one event the case turns
    on.

**The super-timeline's greatest contribution** is making gaps visible. When you look at timestamps from a single source, you see only what that source recorded. When you merge all sources and sort them, you see the *silences*: a 20-minute gap where a file should have been accessed but no event from any source shows activity. That gap is a hypothesis generator — was the attacker idle? Were they operating on a system that wasn't captured? Did they delete events that covered that window? The absence of evidence, made visible by a complete timeline, is itself evidence.

??? note "Go deeper: timestomping and the $SI/$FN tell"
    NTFS records four timestamps in `$STANDARD_INFORMATION` (`$SI`, user-modifiable) and a separate
    set in `$FILE_NAME` (`$FN`, kernel-updated, harder to touch). **Timestomping** sets the `$SI`
    creation time to an implausibly old date to bury a new file in a sorted timeline. The defense:
    compare `$SI` and `$FN` for the same file — a discrepancy is a red flag, and plaso surfaces both
    sets per entry so the comparison is possible right in the super-timeline. (Full treatment in
    Module 11.)

**Timesketch** is the web-based analysis interface designed to work on plaso output. Where plaso is the ingestion and normalization engine, Timesketch is the pivot and query layer: filter by time window, search for a specific process name across all sources, annotate events as "confirmed C2 activity" or "false positive," and share the timeline with the IR team. For large incidents spanning millions of events, Timesketch's faceting and search are essential. For the lab, we'll work with CSV output from `psort`, which is equivalent for smaller datasets.

!!! tip "AI caveat"
    A model summarizes a 50-event window into a usable narrative draft well — but it cannot ingest a
    plaso store, generate real timestamps, or resist inventing events that aren't in your data. Use
    it to draft the narrative from the timeline you built, then trace every sentence back to a
    specific event.

## Learn (~4 hrs)

**Plaso fundamentals (~2 hrs)**
- [log2timeline / plaso — GitHub documentation](https://github.com/log2timeline/plaso) — read the "Getting Started" and "Usage" sections; understand the three-step workflow: `log2timeline.py` (ingest), `psort.py` (filter/sort), `pstatus.py` (inspect).
- [plaso documentation — log2timeline.readthedocs.io](https://plaso.readthedocs.io/en/latest/) — the full plugin reference; skim the parser list to understand what artifact types plaso can ingest.

**Timesketch (~1 hr)**
- [Timesketch — GitHub](https://github.com/google/timesketch) — the README covers installation and the import workflow from plaso. Skim the "Usage" section.
- [Timesketch documentation — timesketch.org](https://timesketch.org/guides/user/upload-data/) — explains how to upload a plaso store and begin querying; read the "Searching" section.

**A real reconstructed timeline (~0.5 hr)**
- [The DFIR Report — "Malicious ISO File Leads to Domain Wide Ransomware"](https://thedfirreport.com/2023/04/03/malicious-iso-file-leads-to-domain-wide-ransomware/) — a real intrusion written up as a multi-source timeline (initial access → discovery → escalation → ransomware) with each step cited to an artifact. Read the "Timeline" and "Summary" sections (~25 min) to see what a finished super-timeline looks like as a report.

**Timestamp forensics (~0.5 hr)**
- [MITRE ATT&CK T1070.006 — Timestomp](https://attack.mitre.org/techniques/T1070/006/) — the ATT&CK page for timestomping; understand what it does and the detection approaches.

## Key concepts
- Plaso's three-step workflow: `log2timeline.py` (ingest + parse) → `psort.py` (sort + filter + export) → analysis.
- All sources are normalized to UTC — timezone errors are the single most common mistake in timeline analysis.
- A super-timeline makes gaps visible — absence of events is an analytical signal, not just a gap.
- NTFS has two timestamp sets per file: `$SI` (user-modifiable) and `$FN` (kernel-updated). Discrepancy = possible timestomping.
- Timesketch is the web UI for querying and annotating plaso output at scale.
- Timeline events have source type, timestamp, and description — filter by all three to narrow hypotheses.
- The super-timeline is an IR report's primary evidentiary basis.
- Published DFIR Report writeups (e.g. the IcedID→Quantum case) are real worked timelines: dwell-time figures like "78 hours" come straight from merging sources onto one clock.

## AI acceleration
AI is highly effective at summarizing and interpreting timeline segments: paste a 50-event window and ask "what is the attacker doing in this sequence?" and you'll get a useful narrative draft. Where it fails: it cannot ingest plaso stores or generate real timestamps, and it will invent events that aren't in your data. Use it to draft the incident narrative from the timeline you've already built — then trace every sentence back to a specific event before finalizing the report.

!!! question "Check yourself"
    - Why must you ingest all sources *before* filtering with `psort`, rather than narrowing as you go?
    - Your timeline shows a file being read before it was created. What's the most likely explanation, and what do you check first?
    - A super-timeline reveals a 20-minute window with no events from any source. Why is that absence itself analytically useful?
