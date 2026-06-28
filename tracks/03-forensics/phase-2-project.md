# Phase 2 Project — Compromised-Host Super-Timeline

*Forensics · Phase 2 (modules 04–08) · ~6–8 hrs · Prereqs: finish modules 04, 05, 06, 07, 08 first.*

> You pulled artifacts from one surface at a time — registry here, browser there, memory, then a triage
> sweep. The project is the **integration**: from a single compromised-host image, fuse Windows artifacts,
> browser/app traces, and memory into **one** `plaso`/Timesketch super-timeline, and triage it at scale with
> Velociraptor.

## Why this is a project, not another module

Each Phase-2 module left findings for one artifact class. Alone they're five disconnected notes; correlated
on one timeline they reconstruct the intrusion:

- **04 · Windows artifacts** → `windows-artifact-findings.md` — registry, event logs, prefetch, execution
  evidence.
- **05 · Browser & app artifacts** → `browser-findings.md` — user activity and app traces (`hindsight`).
- **06 · Memory forensics** → `memory-findings.md` — processes, injection, and connections recovered from
  RAM.
- **07 · Timeline analysis** → `timeline-narrative.md` — the `plaso`/Timesketch super-timeline with the key
  events called out.
- **08 · Triage & live response** → `triage-note.md` + `custom.vql` — the scoping assessment and the
  Velociraptor query that scales collection across hosts.

## Build it

1. **Fuse the artifacts into one timeline.** Feed the Windows artifacts (04), browser/app traces (05), and
   memory findings (06) into a **single** `plaso` super-timeline (07) and load it in Timesketch. The unified,
   cross-source timeline — not five separate notes — *is* the new work.
2. **Pivot to the sequence.** Pivot on the timeline to reconstruct initial access → execution → persistence,
   each pivot citing the artifact (Event ID, registry key, prefetch entry, or memory finding) behind it.
3. **Triage at scale.** Use your Velociraptor VQL (08) to show the same indicators would be hunted across a
   fleet, then produce a combined `host-timeline.md` whose narrative leads with a two-sentence *who got in,
   how, blast radius* and traces every claim to an artifact.

## Success criteria

- [ ] Windows, browser/app, and memory findings land on **one** `plaso`/Timesketch super-timeline.
- [ ] Timeline pivots reconstruct the intrusion sequence, each event cited to its artifact.
- [ ] A Velociraptor VQL query shows the indicators being hunted at scale, and the narrative opens with a
  verdict.

## Deliverable

A `host-timeline/` folder in your repo: the **super-timeline narrative `host-timeline.md`**, your `custom.vql`,
and your committed module notes (`windows-artifact-findings.md`, `browser-findings.md`, `memory-findings.md`,
`timeline-narrative.md`, `triage-note.md`). Reference the evidence — **do not** commit the host image, memory
dump, `.evtx`/hive files, the `.plaso`/CSV timelines, or any credentials (see `.gitignore`).

## Self-check rubric

Grade your own `host-timeline/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Artifact coverage** | One artifact class, or classes kept separate | Windows, browser/app, and memory all fused into one timeline | A finding confirmed by pivoting across two sources (e.g. memory → registry) |
| **Timeline correlation** | Events listed, not correlated | Pivots reconstruct initial access → execution → persistence, each cited | Gaps and anti-forensic tells noted; confidence stated per event |
| **Triage at scale** | No fleet view | A Velociraptor VQL hunts the indicators across hosts | VQL refined and reusable; scoping decision justified |
| **Verdict quality** | Raw dump, no judgment | Narrative opens with who/how/blast-radius, claims tied to artifacts | An IR lead could action it as-is |
| **Hygiene** | Images/timelines committed | No image/`.evtx`/`.plaso`/secrets in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 09 — Network Forensics](modules/09-network-forensics/README.md)** opens Phase 3, which ends in the **[Phase 3 Project](phase-3-project.md)**.
