# Phase 2 Project — Host & Network Triage Toolkit

*Foundations · Phase 2 (modules 04–07) · ~4–6 hrs · Prereqs: finish modules 04, 05, 06, 07 first.*

> You built the pieces one host at a time. The project is the **integration**: one toolkit that profiles
> a Linux *and* a Windows host with a consistent report, and reads the wire to say what that host was
> talking to.

## Why this is a project, not another module

Each Phase-2 module left a triage artifact for one surface. Alone they're four separate notes; integrated
they're a tool you'd actually reach for:

- **04 · Linux** → `linux-triage.md` + your Linux triage script (privileged accounts, SUID, ranked
  failed-logins).
- **05 · Windows** → `windows-triage.md` + your extended `triage.py` (the encoded-PowerShell **4688**
  event, Run-key persistence).
- **06 · Networking** → `networking.md` + the capture walk (DNS resolution, the SYN/SYN-ACK/ACK
  handshake, the beacon tell) over `cap.pcap`.
- **07 · Web & HTTP** → `http-notes.md` (the request/response pair and the missing cookie flag).

## Build it

1. **Unify the host triage.** Wrap your Linux script (04) and your Windows `triage.py` (05) behind **one
   entrypoint** — `triage <target>` — that runs the right OS profile (users, SUID/services, logon/4688
   events) and emits **one consistent report format** for both. The single tool with two OS backends *is*
   the new work.
2. **Read the wire.** Add a step (or a `capture` subcommand) that walks `cap.pcap` from module 06 —
   resolve the DNS, identify the three-packet handshake, and flag the beacon (which packet, and the tell).
   Optionally fold in the module 07 finding (the session the host holds, and the missing flag).
3. **One verdict.** Produce a combined `triage-report.md`: the Linux verdict, the Windows verdict, and the
   capture's DNS + handshake + beacon — each host section leading with a two-sentence *who got in, how,
   blast radius.*

## Success criteria

- [ ] **One** tool profiles **both** a Linux and a Windows host, with a consistent report format.
- [ ] The capture walk names the DNS resolution, the SYN/SYN-ACK/ACK handshake, and the beacon's tell.
- [ ] Every host section opens with a two-sentence verdict, not a raw dump.

## Deliverable

A `triage-toolkit/` folder in your repo: the **unified tool**, the **combined `triage-report.md`**, and
your committed module notes. Reference the capture — **do not** commit `cap.pcap`, raw logs, the `.evtx`,
or any credentials (see `.gitignore`).

## Self-check rubric

Grade your own `triage-toolkit/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Host coverage** | One OS, or two separate scripts | One entrypoint profiles both Linux and Windows, one report format | Extensible — a third collector slots in without rewrites |
| **Network read** | Packets listed, layers conflated | DNS, handshake, and beacon each identified and explained | Ties the beacon to the host triage (the *same* host's outbound) |
| **Verdict quality** | Raw output, no judgment | Each section opens with who/how/blast-radius | Findings ranked; an analyst could act on it as-is |
| **Hygiene** | Captures/logs committed | No `.pcap`/`.evtx`/logs/secrets in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 08 — Data & Encoding](modules/08-data-encoding/README.md)** opens Phase 3, which ends in the **[track capstone](README.md#capstone)**.
