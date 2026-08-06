## Context

Track 05 (Cloud & Container Security, 17 modules, 3 phases) is the third track rebuilt to the OSS-500
standard. Its `lab.md` files are symlinks into `plaintext-labs/cloud/<NN>/lab.md`; nearly all modules
have a real container env (docker-compose + the **floci** AWS emulator post the LocalStack→floci
migration), and the Kubernetes modules (12/13) use **kind** via Makefile. Module prose is substantial
but visually thin (module 01: 0 diagrams), so the diagram uplift is the largest delta. The methodology
and shipped infra (`VISUAL-CONVENTIONS.md`, `mermaid-zoom.js`) transfer directly from Tracks 11/12.

## Goals / Non-Goals

**Goals:** rebuild Track 05 to the proven standard (self-contained teaching, 2–4 diagrams/module,
case-study seam, "Go deeper", cognitive-load labs) with zero change to lab environments, honor system,
every link validated.
**Non-Goals:** changing envs; grading; other tracks; the global rulebook.

## Decisions

### D1 — Author in place (no staging dir), reuse shipped infra
Promote-and-replace is decided; author directly into `tracks/05-cloud/` and `plaintext-labs/cloud/`.
Reuse the global `VISUAL-CONVENTIONS.md` + `mermaid-zoom.js` (no new infra).

### D2 — Cognitive-load labs wrap the real, unchanged envs (floci / kind / compose)
Every `lab.md` re-instructs the existing env; rails match real output. The 8 floci-backed AWS labs keep
`make up`/`demo` on floci; kind labs (12/13) use their real kind targets; external-target steps
(CloudGoat, flaws.cloud, real free-tier AWS) are explicitly labelled and carry the authorization note.
Where floci fakes an API without enforcing it, keep the existing honesty caveat.

### D3 — Case-study seam, cloud edition
Each module anchors to a real incident/CVE and links an authoritative writeup; mechanism taught in our
prose. Non-binding anchors:

| # | Module | Candidate anchor |
|---|--------|------------------|
| 02/03 | IAM / attack paths | Capital One 2019 SSRF→IAM (DOJ + Krebs) |
| 05 | Posture / misconfig | Public S3 exposure (documented UpGuard reports) |
| 06 | IaC security | A Terraform/IaC misconfig class (CIS / real breach) |
| 09 | Serverless | A Lambda/exec-role confused-deputy or event-injection finding |
| 11 | Container escape | CVE-2019-5736 runc escape (NVD + disclosure) |
| 13 | K8s admission/runtime | Tesla K8s cryptojacking (RedLock 2018) |
| 14 | Cloud attack techniques | A CISA KEV / Stratus-mapped ATT&CK cloud technique |
| 17 | Data protection / KMS | A key-management / unencrypted-data exposure |

Rule: never invent a URL — reuse links already in the module (validated); mark uncertain new links
`<!-- VALIDATE -->` and resolve before ship (WebFetch/WebSearch; CISA 403s to bots — verify by search).

### D4 — Honor system, original voice (unchanged)
No quizzes/tracker/receipts. Original prose per `CLAUDE.md`; preserve all real links/IDs/CVEs/gotchas.

### D5 — Reference module first, then parallel fan-out
Author `01-cloud-fundamentals` end-to-end as the locked exemplar (light README touch: Go-deeper + add
diagrams; cognitive-load lab on floci), then rebuild 02–17 with parallel subagents anchored on it +
`VISUAL-CONVENTIONS.md` + each module's real source and env. Brief agents to **reuse existing validated
IDs/links and NOT web-verify inline** (a Track-12 agent stalled 19 min verifying ATLAS IDs). Verify
(strict build, link validation, rail honesty), then commit/push/merge.

## Risks / Trade-offs

- **Scale (17 modules).** Largest fan-out yet. One reference + one wave of 16; distinct files, no conflicts.
- **floci honesty.** floci fakes some APIs without enforcing; rails must assert what floci really returns,
  and keep the "real-AWS route proves enforcement" caveat where the original had it.
- **Agent stalls on ID verification.** Brief agents to reuse existing IDs and mark-don't-verify (D5).
- **CDN Mermaid race (pre-existing).** Renders on deploy; local preview may stall. Tracked; self-host is a separate follow-up.

## Open Questions

- Cheat sheets: keep existing per-module `cheatsheet.md` (lean: keep).
- Self-host Mermaid: keep as a separate follow-up, not this change.
