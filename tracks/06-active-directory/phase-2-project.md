# Phase 2 Project — Own the Domain

*Active Directory · Phase 2 (modules 06–08) · ~5–7 hrs · Prereqs: finish modules 06–08 first (and Phase 1).*

> You moved host to host, planted a persistence foothold, and chained findings to Domain Admin one technique at a time. The project is the **integration**: weld it all into a single, replayable path from foothold to DA — lateral movement, a golden/silver-ticket foothold, and the BloodHound path that explains why it works.

## Why this is a project, not another module

Each Phase-2 module left a report for one stage of the takeover. Alone they're three separate write-ups; integrated they're the single attack-path narrative a red-team lead hands a client:

- **06 · Lateral movement** → `lateral-movement-report.md` (host enumeration, the credential per hop, the psexec/smbexec/wmiexec artefact comparison) + `sweep.sh`.
- **07 · Persistence** → `persistence-report.md` (golden/silver ticket, the artefacts generated, ATT&CK IDs T1558.001/T1558.002/T1003.006, per-method remediation).
- **08 · Path to DA** → `attack-path-report.md` (the full hop-by-hop analysis, ATT&CK mapping, client narrative, prioritised mitigation table).

## Build it

1. **Chain the hops into one path.** Starting from your Phase-1 foothold, run the takeover as a single ordered sequence — lateral movement (06) to reach the right host, then the chain to Domain Admin (08). Use `sweep.sh` to map where your credential lands. Confirm the route on the BloodHound graph by hand.
2. **Plant the foothold.** Add a persistence step (07): forge a golden or silver ticket and show it survives a user-password reset. Capture the artefacts (ticket filenames, *not* the hashes) and the event IDs each step left.
3. **Make it replayable.** The deliverable is a path someone else can re-walk — write the sequence so each hop states the credential it used (redacted), the technique, and the host it reached, and `sweep.sh` reproduces the access map.
4. **One ownership report.** Produce a combined `domain-takeover.md`: the hop-by-hop path from low-priv to DA, the persistence foothold and why a password reset alone doesn't evict it, the BloodHound path that explains the route, and the prioritised mitigation table — leading with a two-sentence *where you started, that you reached DA, and the one chain that got there.*

## Success criteria

- [ ] One **replayable** path from the Phase-1 foothold to Domain Admin, each hop naming credential · technique · host.
- [ ] A persistence foothold (golden/silver ticket) demonstrated to survive a password reset, with the eviction caveat written down.
- [ ] The BloodHound path is confirmed by hand and explains *why* the route works.
- [ ] The report opens with a two-sentence verdict and carries a prioritised mitigation table.

## Deliverable

A `domain-takeover/` folder in your repo: the **combined `domain-takeover.md`**, the **BloodHound path export**, and your committed **`sweep.sh`**. Record artefacts as **filenames and event IDs, never the actual tickets or hashes** (redact); keep plaintext credentials and live secrets out of the commit. **Only attack your own lab domain (GOAD or a local eval VM).**

## Self-check rubric

Grade your own `domain-takeover/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Attack path** | Hops listed, not connected | One replayable low-priv → DA path, each hop's credential/technique/host named | BloodHound path confirmed by hand, alternative routes noted, mapped to ATT&CK |
| **Persistence** | Ticket forged, no proof of survival | Golden/silver ticket shown to survive a password reset, artefacts captured | Eviction reasoning (krbtgt double-rotation) written; remediation per method |
| **Replayability** | A one-off transcript | The path re-walks from the report; `sweep.sh` reproduces the access map | Someone else could re-run it end to end from the doc alone |
| **Write-up** | Screenshots without narrative | Hop-by-hop story with a prioritised mitigation table a client could action | Reads as a professional pentest report; residual risk acknowledged |
| **Hygiene** | Tickets/hashes/creds committed | Artefacts are filenames + event IDs only; no tickets/hashes/creds in history | Redaction disciplined and consistent; commits tell the takeover story |

→ Next: **[Module 09 — Detecting AD Attacks](modules/09-detecting-ad-attacks/README.md)** opens Phase 3, whose project **is** the **[track capstone](README.md#capstone)**.
