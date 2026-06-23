# Labs Audit — through the Cloud Lens

*Created 2026-06-23. Every track's **labs** re-evaluated against the bar set by the gold
`plaintext-labs/cloud/` track: a lab meets the bar when it (1) is built around a **named real
breach/CVE/dataset/sample** (primary-sourced), (2) is **de-fictionalized** (no "Meridian"), (3)
uses **real artifacts** (a Vulhub CVE image, a real public dataset, a real sample) not hand-rolled
toy data, and (4) ships a **one-command reproducible env**.*

> Companion to `real-world-anchor-audit.md` (which covered module *prose*). This one is about the
> *labs* — the hands-on half. Validation/CI is deliberately out of scope here (deferred).

---

## TL;DR

**Cloud is still the only track whose labs broadly meet the cloud bar. `ztna` is the runner-up
(mostly de-fictionalized, real tools, real breach anchors). Every other track's labs need work,
and four are far from it.** Two problems dominate, and they're independent of validation:

1. **"Meridian Financial" fiction is nearly universal** — present in ~150 labs across 11 of 12
   non-cloud tracks. It's the single most common disqualifier. (cloud = scrubbed; ztna = 1 holdout.)
2. **"Cite real, ship synthetic"** — labs *name* the right public dataset in prose but commit
   hand-rolled synthetic seed data as the actual artifact. Pervasive in defensive, forensics,
   malware, python, AD analysis labs.

### Tier (labs only, vs the cloud bar)

| Tier | Tracks | Reading |
|---|---|---|
| 🟢 At/near bar | **cloud**, **ztna** | Real breach anchors + real tools; ztna's gaps are 1 Meridian holdout + 2 unbuilt labs |
| 🟡 Real tools, fictional frame / synthetic data | endpoint, automation, AD, cryptography | Genuine tooling + frameworks, but Meridian scenarios and/or synthetic seed; several "free wins" (real already, just de-Meridian) |
| 🔴 Synthetic + fictional (furthest) | **forensics**, **malware**, **python**, **defensive**, parts of **offensive**, **ai-ops** | Toy/mock data inside a Meridian story; real datasets only *cited*, not shipped |

### Rough scorecard (~190 labs)
- 🟢 Gold-ish: ~25 (+ cloud's 17) — e.g. offensive 04/14/15/16, defensive 17, endpoint 08/13, automation 04/05/09/10, AD 10, malware 03, ai-ops 09/11, most of ztna.
- 🟡 Partial: ~70.
- 🔴 Synthetic/fiction: ~60 — concentrated in forensics (14/16), malware (~8), python (~11), defensive (~9).

---

## Universal findings (apply almost everywhere)

- **De-Meridian is the #1 lever.** Re-anchoring each lab's scenario to the real breach its README
  *now* opens on (post the anchoring pass) turns most 🟡s toward 🟢 and removes the universal
  disqualifier. Often the only thing standing between a lab and the bar (the "free wins": offensive
  04, endpoint 08/13, automation 04/05/09/10, defensive 17, AD 10).
- **Ship the dataset you already cite.** The fix for the 🔴 data labs is to commit (or fetch at
  runtime) the *real* public dataset the lab.md already names: **EVTX-ATTACK-SAMPLES** (defensive,
  forensics, AD detection), **Malware-Traffic-Analysis.net** PCAPs (defensive/forensics network),
  **MemLabs** (forensics memory), **Digital Corpora M57/Nitroba** (forensics disk/browser),
  **MalwareBazaar** by family tag (malware), **abuse.ch URLhaus/Feodo** (python/automation intel),
  **CISA KEV** (already live in a few).
- **Reuse the patterns that already work:** malware/03's `fetch-sample.sh` (real MalwareBazaar pull
  with synthetic fallback) generalizes across malware *and* forensics *and* python; AD's real Samba
  DC (`02-enumeration/Dockerfile.dc`) should back the AD analysis/design labs instead of JSON fixtures.
- **Housekeeping surfaced:** stale "to-be-built" banners on already-built labs (defensive 18/19, AD
  12/13); spec-only/unbuilt labs (ztna 10-vpn-migration, ztna 11-redteam, automation 11-clickops,
  crypto 11 unvalidated); a ztna `10-` numbering collision.

---

## Highest-leverage remediation plan (ordered)

**Doable now without Docker** (prose + seed-data + script wiring; validation deferred):
1. **De-Meridian-ize the labs track-by-track** — rename the invented company/hosts/domains and
   re-anchor each scenario to the real breach the module already cites. Universal, mechanical-ish.
2. **Generalize `fetch-sample.sh`** (family-tag param) and thread real **MalwareBazaar** samples
   through malware 02/04/05/07/08/09/10/13 (retire loader.c/crackme/beacon.py/target.c).
3. **Swap committed synthetic seeds for real public datasets** where vendorable or runtime-fetchable:
   forensics (MemLabs/MTA.net/Digital Corpora/EVTX), defensive (EVTX-ATTACK-SAMPLES/MTA via Zeek),
   python (a real auth-log corpus + a live URLhaus/Feodo feed replacing the mock API → de-mocks
   python 04/05/08/09 at once).
4. **Wire AD analysis labs (08/11/12/13) to the in-repo Samba DC**; implement the `NotImplementedError`
   live-collection stubs; fix the stale banners + the `10-` numbering.
5. **Build the spec-only labs** (ztna 10-vpn-migration, ztna 11-redteam, automation 11-clickops).

**Needs your Docker/Linux runner** (the deferred half):
6. Run `make up && make demo && make down` per lab; confirm real Vulhub CVE targets negotiate
   (crypto 05 Heartbleed, offensive 02/06/10 Vulhub swaps, crypto 11 hybrid PQC); add `.ci-demo`.

---

## Per-track summary (labs)

- **00-foundations** — 0 gold. Meridian + synthetic in 04/05/06/10 (🔴). Real anchors *cited* (Equifax, Adobe, SUNBURST, Target) but artifacts are hand-rolled. Closest: 09 (real openssl ECB), 08 (live CISA KEV). Some `*.log` seeds aren't even committed.
- **01-offensive** — 4 gold (04 httpd 2.4.49 CVE, 14 LOLBins, 15 PowerShell, 16 flaws.cloud/CloudGoat). Meridian in 17/18 labs incl. both CLAUDE.md "exemplars" (06,16). 🔴: 01,05,12,13,capstone (toy targets where Vulhub exists).
- **02-defensive** — 0 gold; 17-KEV closest (real KEV + Vulhub Log4Shell). "Cite real, ship synthetic" everywhere; Meridian in 18/20. Real datasets named (EVTX/MTA/Atomic/abuse.ch) but seeds hand-rolled.
- **03-forensics** — **worst track: 14/16 🔴.** Whole track is one invented Meridian intrusion on planted/synthetic seed; real datasets (MemLabs, EVTX, MTA, Digital Corpora) only cited as optional. No real anchor anywhere. Capstone is the only piece reaching for real images.
- **04-malware** — 1 gold (**03**, the template: real Agent Tesla via MalwareBazaar + FortiGuard). Rest synthetic benign stand-ins. Generalize 03's fetcher across the chain.
- **05-cloud** — the benchmark. (Not re-audited.)
- **06-active-directory** — 2 gold (10 hardening, capstone). Real Samba DC exists and the offensive labs use it live (good), but 08/11/12/13 simulate over JSON; `meridian.local` in 13/14 labs; no named CVE (add Zerologon/noPac/PetitPotam).
- **07-endpoint-hardening** — 2 gold (08 KEV+grype, 13 CrowdStrike-2024 fleet). Strong real tools/benchmarks (Lynis/OpenSCAP/osquery/AIDE/grype); Meridian in all 13 + 3 synthetic-data labs (01,05,10). Mostly "free wins" (de-Meridian).
- **08-cryptography** — 0 gold; 11(PQC)/12(ADR) closest but 11 unvalidated, 12 still "Meridian Notes." Real OSS tools but invented config matrices; 05 & 10 should become real Vulhub CVE targets (Heartbleed/POODLE).
- **09-python-for-security** — all 🔴/mock by design: synthetic logs + mock VT/MISP/AbuseIPDB Flask APIs; doc-range IPs. One change (real abuse.ch feed replacing the mock) de-mocks 04/05/08/09.
- **10-automation** — 4 gold (04 CISA-AA23-278A, 05 Codecov, 09 Sigma/ATT&CK, 10 CVE-2025-30066). Build-first track; Meridian in 5 labs; 11-clickops unbuilt, 11-secrets unvalidated.
- **11-ztna** — runner-up to cloud: 7 gold (Colonial, Storm-0558, LastPass, NotPetya, CVE-2026-40575). Gaps: 10-workload-identity-mtls is the lone Meridian holdout (baked into the env), and 10-vpn-migration + 11-redteam are spec-only (unbuilt). `10-` numbering collision.
- **12-ai-augmented-ops** — 2 gold (09 EchoLeak/Chevy, 11 eval). Real OSS stacks + working envs, but Meridian seed corpora in 10/12; named anchors already exist in 08/09/10/01 to propagate to the RAG/MCP/copilot labs.

---

## The honest bottom line

The prose pass made the curriculum *read* real-world. **The labs are not there yet** outside cloud
(and largely ztna). By the cloud lens, most labs are either fictional (Meridian) or synthetic
(toy/mock data inside a real-sounding story) — and the highest-leverage, no-Docker-needed fix is the
exact thing cloud did: **de-fictionalize and swap in the real artifact each lab already points at.**
