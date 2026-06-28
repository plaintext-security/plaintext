# Phase 1 Project — Map & Break In

*Active Directory · Phase 1 (modules 01–05) · ~5–7 hrs · Prereqs: finish modules 01–05 first.*

> You enumerated the domain, roasted Kerberos, stole and replayed credentials, and abused an ACL one technique at a time. The project is the **integration**: from a single low-privilege user, map the domain with BloodHound and run the core credential attacks as one documented chain — each tied to its ATT&CK technique.

## Why this is a project, not another module

Each Phase-1 module left a report and a reusable audit script for one technique. Alone they're five separate write-ups; integrated they're the foothold-to-findings package an internal pentester delivers:

- **01 · AD model** → `meridian-map.md` (the annotated domain map, Kerberos walkthrough, high-value groups) + `parse_domain.py` — the reference doc every later module builds on.
- **02 · Enumeration** → `enumeration-report.md` (users/SPNs/delegation flags, shortest path to DA) + `enumerate.py`.
- **03 · Kerberos** → `kerberoast-report.md` (SPNs, cracked accounts, detection notes) + `kerberoast-scan.py`.
- **04 · Credential theft** → `credential-theft-report.md` (the extraction chain, the PtH outcome, event IDs) + `hash-chain.sh`.
- **05 · ACL & delegation** → `acl-abuse-report.md` (the misconfig with LDAP evidence, the exploitation chain) + `acl-findings.json` + `acl-audit.py`.

## Build it

1. **Start from one low-privilege user.** Pick a single foothold account and, with SharpHound/BloodHound (module 02), map the domain — confirm the shortest path to DA by hand, not just on faith. This map is the spine every attack below hangs off.
2. **Run the core attacks as one chain.** Execute, in narrated order: Kerberoast / AS-REP (03) → pass-the-hash or pass-the-ticket (04) → one ACL or delegation abuse (05). Each step should *feed the next* — the roasted credential opens the replay, the replay opens the ACL write.
3. **Tie every hop to ATT&CK.** Label each technique with its ID (T1558.003 Kerberoasting, T1550.002 PtH, T1484.001 / T1134.001 for the ACL/delegation hop) and note the event IDs it generated — you'll write detections against these in Phase 3.
4. **One break-in report.** Produce a combined `break-in-report.md`: the BloodHound map, the chain step by step, each technique's ATT&CK ID and the event it left behind — leading with a two-sentence *who you started as, what you reached, and the one path that got you there.*

## Success criteria

- [ ] From a single low-privilege user, the shortest-to-DA BloodHound path is mapped and **confirmed by hand**.
- [ ] Kerberoast/AS-REP, pass-the-hash/ticket, and one ACL or delegation abuse are run and documented as a chain that feeds forward.
- [ ] Every hop carries its ATT&CK technique ID and the event ID it generated.
- [ ] The report opens with a two-sentence verdict, not raw tool output.

## Deliverable

A `ad-break-in/` folder in your repo: the **combined `break-in-report.md`**, the **BloodHound map/export**, and your committed audit scripts (`enumerate.py`, `kerberoast-scan.py`, `hash-chain.sh`, `acl-audit.py`). **Never commit full hashes** — redact to the first 8–20 chars — and keep tickets, plaintext credentials, and live secrets out of the commit (`acl-findings.json` seed data is fine). **Only attack your own lab domain.**

## Self-check rubric

Grade your own `ad-break-in/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Domain map** | A tool dump, no path read | Shortest-to-DA path mapped and confirmed by hand from one foothold | Alternative paths noted; the enabling edge type named for each |
| **Attack chain** | Techniques run in isolation | Kerberoast/AS-REP → PtH/PtT → ACL abuse run as a chain that feeds forward | Each step's output demonstrably opens the next; cleanest path chosen |
| **ATT&CK mapping** | Technique named, no IDs | Each hop carries its ATT&CK ID and the event ID it generated | Mapping ready to drive Phase 3 detections; detection opportunities flagged |
| **Automation** | Manual only, nothing reusable | Each technique has a reviewed audit script that reproduces the finding | Scripts are reusable domain health checks; every line audited and owned |
| **Hygiene** | Full hashes/tickets/creds committed | Hashes redacted; no tickets/plaintext creds/secrets in history | Commits tell the break-in story; redaction is consistent and disciplined |

→ Next: **[Module 06 — Lateral Movement](modules/06-lateral-movement/README.md)** opens Phase 2, which ends in its own **[phase project](phase-2-project.md)**; the track closes with the **[capstone](README.md#capstone)**.
