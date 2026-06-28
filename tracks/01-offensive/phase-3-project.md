# Phase 3 Project — Single Attack Chain from Foothold

*Offensive · Phase 3 (modules 09–16) · ~6–8 hrs · Prereqs: finish modules 09–16 first.*

> You cracked hashes, escalated on Linux and Windows, pivoted, and ran post-ex one technique at a time. The project is the **integration**: from a single foothold, crack credentials, escalate to root/SYSTEM, and pivot — documented as one continuous attack chain with the artifact each step leaves behind.

## Why this is a project, not another module

Each Phase-3 module proved one post-access move on its own target. Alone they're eight separate technique notes; integrated they're the attack chain — and the defender-visible trail — that a real engagement narrates end to end:

- **09 · Password & Credential Attacks** → `cracking.md` + `auto_crack.py` (hash types, what cracked + mode/time, the prioritised defenses).
- **10 · Privesc — Linux** → `linux-privesc.md` + `enum.py` (the three vectors with proof-of-root, the remediation each).
- **11 · Privesc — Windows** → `windows-privesc.md` + extended `triage.py` (the three vectors with proof-of-SYSTEM, the fix each).
- **12 · Pivoting & Lateral Movement** → `pivoting.md` + `setup-pivot.sh` (network diagram, tunnel setup, proof of reaching the internal target).
- **13 · C2 & Post-Exploitation** → `c2-notes.md` + `operator.py` (session details, three post-ex outputs).
- **14 · Living-off-the-Land & Evasion** → `lolbins.md` + `lolbins_chain.sh` (native binaries per step, the detection artifact each generates).
- **15 · PowerShell Tradecraft** → `tradecraft-notes.md` + the `tradecraft.ps1` launcher-builder (each technique paired with the 4104 telemetry it leaves).
- **16 · Cloud & Container Primer** → `cloud-notes.md` + `enumerate_account.sh` (per step: the finding, the API call, the root cause, the fix).

## Build it

1. **Stitch one chain.** Pick a starting foothold and run a *continuous* path: crack a credential (09) → escalate to root/SYSTEM (10 or 11) → pivot to an internal host (12) → land a post-ex action (13/14/15, or the cloud step in 16). Each step must consume the *output of the prior step* — the cracked cred unlocks the box you escalate on, the escalated host is the pivot origin. The wiring between steps is the new work.
2. **Capture the trail.** For every step, record the **defender-visible artifact** it leaves — the auth event, the 4688/4104 record, the auditd entry, the tunnel connection, the cloud API call. Reuse the scripts you built (`auto_crack.py`, `enum.py`, `triage.py`, `setup-pivot.sh`, `operator.py`, `lolbins_chain.sh`) as the chain's tooling.
3. **Narrate it once.** Produce a single `attack-chain.md`: a step-by-step timeline (foothold → cred → root/SYSTEM → pivot → post-ex), each step with its command, its proof, and its artifact — leading with a two-sentence *what this step gained and what it left behind.*

## Success criteria

- [ ] The chain is **continuous** — each step consumes the prior step's output; no teleporting between unrelated targets.
- [ ] Escalation to root **and** SYSTEM is demonstrated, and the pivot reaches a host not directly reachable from the foothold.
- [ ] Every step names the defender-visible artifact it leaves, and each section opens with a two-sentence verdict.

## Deliverable

An `attack-chain/` folder in your repo: the **chain tooling** (your Phase-3 scripts wired together), the **`attack-chain.md`** timeline, and your committed module notes. **Only run this against the intentionally vulnerable targets you spin locally** — keep the authorization note in the writeup. **Do not** commit cracked hashes, dumps, keys/credentials, tunnels' captured traffic, or cloud secrets (see `.gitignore`).

## Self-check rubric

Grade your own `attack-chain/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Chain continuity** | Disconnected techniques on unrelated targets | One continuous path; each step consumes the prior step's output | Branches noted (the path not taken) and why this one was chosen |
| **Escalation & pivot** | One OS, no real pivot | Root *and* SYSTEM reached; pivot reaches an otherwise-unreachable host | Multiple escalation vectors compared for reliability; pivot tooling scripted |
| **Detection trail** | Artifacts not noted | Every step names its defender-visible artifact | Maps each step to MITRE ATT&CK; flags the quietest variant and why |
| **Hygiene & authorization** | Dumps/keys/secrets committed; no scope note | No artifacts or secrets in history; authorization stated; `.gitignore` present | Commits tell the foothold→DA/root→pivot story |

→ Next: **[Module 17 — Reporting & Remediation](modules/17-reporting/README.md)** opens Phase 4, whose project is the **[track capstone](README.md#capstone)** — the professional engagement report that integrates all three phases.
