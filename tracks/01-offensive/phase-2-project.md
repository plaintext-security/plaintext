# Phase 2 Project — Replayable PoC & Exploit Writeup

*Offensive · Phase 2 (modules 04–08) · ~5–7 hrs · Prereqs: finish modules 04, 05, 06, 07, 08 first.*

> You exploited a CVE, smashed a stack, and worked the web classes one app at a time. The project is the **integration**: gain access to a real-CVE Vulhub target *and* exploit one web class on a deliberately vulnerable app, both captured as a single replayable PoC + writeup a defender could reproduce.

## Why this is a project, not another module

Each Phase-2 module proved one way in on one target. Alone they're five separate exploit notes; integrated they're the access-and-evidence package every engagement is judged on:

- **04 · Exploitation Fundamentals** → `exploitation.md` (the CVE/CWE, the traversal path, proof of access via `id`, the defender-visible artifact + Sigma annotation).
- **05 · Memory Corruption** → `overflow.md` (the vulnerable line, the stack diagram with offsets, the payload in hex, the mitigation argument).
- **06 · Web — Injection** → `sqli.md` + your extraction script (injectable parameter, working payloads, data extracted, the parameterised-query fix).
- **07 · Web — Auth & Access Control** → `access-control.md` + `enumerate.py` (per-bug: vulnerable snippet, exploit request, the proving response, the fix).
- **08 · Web — SSRF, XXE & Deserialization** → `ssrf-xxe.md` + `probe.py` (per-bug: vulnerable snippet, exploit payload, the proving response, the fix).

## Build it

1. **Pick the two targets.** One **real-CVE Vulhub** image (the system-level access from module 04's class) and one **deliberately vulnerable web app** for one web class you exploited (06, 07, or 08 — your pick). Both spun by one `make up`.
2. **Make each exploit replayable.** Turn the manual steps into a single PoC script per target (build on the scripts you already wrote — the extraction, `enumerate.py`, or `probe.py`) so `make demo` re-runs the exploit end to end and *prints the proof* (the `id` output, the extracted row, the internal-address response).
3. **Write it up once, for a defender.** Produce a combined `poc-writeup.md`: per target — the CVE/CWE, the exploit walkthrough, the captured proof, **and** the defender-visible artifact (the log line / Sigma annotation) plus the fix. Lead each with a two-sentence *what fell, how, and what an attacker gets.*

## Success criteria

- [ ] **One** `make up` stands up both the Vulhub target and the vulnerable web app; **one** `make demo` replays both exploits and prints the proof.
- [ ] The writeup pairs every exploit with its defender-visible artifact and its concrete fix — not just the payload.
- [ ] Each target section opens with a two-sentence verdict, and a defender could reproduce the access from the writeup alone.

## Deliverable

A `phase2-poc/` folder in your repo: the **two replayable PoC scripts** (+ `Makefile`/compose), the combined **`poc-writeup.md`**, and your committed module notes. **Only test the intentionally vulnerable targets you spin locally** — keep the authorization note in the writeup. **Do not** commit captured payloads, extracted data, compiled binaries, or any credentials (see `.gitignore`).

## Self-check rubric

Grade your own `phase2-poc/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Replayability** | Manual steps in prose; nothing re-runs | One `make up` + `make demo` replays both exploits and prints proof | Deterministic and idempotent; runs clean on a fresh checkout |
| **Exploitation depth** | One-click exploit, mechanism unexplained | Access gained on both; can explain *why* each exploit works | Chains or extends the payload; notes the detection opportunity at each step |
| **Defender value** | Payload only, no fix or artifact | Each exploit paired with its log artifact and a specific fix | Fix mapped to root cause; Sigma/annotation a defender can ship as-is |
| **Hygiene & authorization** | Captures/binaries/creds committed; no scope note | No artifacts or secrets in history; authorization stated; `.gitignore` present | Commits tell the exploit→proof→fix story |

→ Next: **[Module 09 — Password & Credential Attacks](modules/09-password-attacks/README.md)** opens Phase 3, *After access*.
