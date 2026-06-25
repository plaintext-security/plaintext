# Offensive track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audited 2026-06-12 against the actual **labs**
(the real Do-steps under `plaintext-labs/offensive/<module>/lab.md`), not just the concept
objectives. The frame is adapted for an attack-oriented track — see below.*

## TL;DR

**No rebalance needed. This track is already balanced by its own correct standard.** An offensive
track is attack-oriented *by design*; forcing a "build a defensive control" half onto exploit labs
would be the wrong move (the non-goal the cloud/ztna audits warned about, applied to the whole
track). The honest question here is whether each attack lab still ends in something the learner
**builds** — and it does. **Every one of the 17 labs carries a required `Automate & own it` step
that turns the manual attack into a reusable tool/PoC the learner commits**, and the three web labs
(06/07/08) plus the memory-corruption lab (05) go further into genuine **attacker→fixer** (write the
parameterised query / add the ownership check / harden the parser, then re-run and prove the exploit
now fails). The track's build half *is* the tool-build and the patch — and it is present throughout.
There is no audit-only "find it and write a finding" lab. **One small deepen** (16 cloud-primer's
tool-build is thinner and the lab is external/VM-gated) and **one defensible-but-optional structural
note** (no dedicated AD/Kerberos foothold module — but that's a whole sibling track by charter).
Recommendation: **leave it**; at most promote 06's attacker→fixer pattern (the only graded fix today)
into 07/08 as graded steps. No teardown, no new module.

## What "build & operate" means *for an offensive track*

The defensive framing ("author least-priv policy and prove the deny / stand up a control and prove
it") does **not** transfer wholesale — most offensive labs are legitimately exploit/attack labs and
must stay that way. The build bar here is the charter's own offensive bar:

1. **Turn the attack into a reusable tool/automation** — the required `Automate & own it` step: a
   recon harness, a scanner, a cracker, an enumerator, a pivot script, a C2 operator, a launcher-
   builder. AI drafts, the learner reviews every line and commits it. This is the dominant build move.
2. **A replayable PoC the learner authored** (not a one-click module run) — e.g. 04/05 craft and
   commit the exploit script.
3. **attacker→fixer** — the learner patches what they broke and proves the exploit now fails. The
   charter calls this out explicitly for web labs; it appears in 05/06/07/08.

A lab is "find/run-only" (the thing to fix) only if it ends at *run a tool and write a finding* with
no learner-authored tool or PoC or patch. **No lab in this track does that.**

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/own-it half? | Verdict |
|---|--------|-----------------|---------------------------|---------|
| 01 | Recon & OSINT | passive recon harness; rank targets | yes — extend `score_interest()`, build a `--live` crt.sh fetcher | **Balanced (tool-build)** |
| 02 | Scanning & Enum | 3-phase nmap, parse XML | yes — add `--json` structured-inventory emitter | **Balanced (tool-build)** |
| 03 | Vuln Identification | CVE→CWE→CVSS→KEV chain | yes — extend `vuln_assess.py` to hit live NVD + CISA KEV feed | **Balanced (tool-build)** |
| 04 | Exploitation | exploit CVE-2021-41773 (path traversal RCE) | yes — author/extend `exploit.py` into a committed replayable PoC; *(patch is stretch)* | **Balanced (PoC-build)** |
| 05 | Memory Corruption | ret2win stack overflow | yes — generalise `exploit.py` (any binary, auto-offset) **+ recompile with `-fstack-protector` and re-fire** | **Balanced (tool + fix-touch)** |
| 06 | Web — Injection | SQLi → UNION dump → sqlmap | yes — **rewrite the line as a parameterised query** + script the extraction; the **only** lab with `grade.yaml` today | **Balanced (attacker→fixer)** |
| 07 | Web — Access Control | IDOR + vertical privesc | yes — **fix both bugs, re-run `make demo`, prove 403** + write `enumerate.py` matrix tool | **Balanced (attacker→fixer)** |
| 08 | Web — SSRF/XXE | SSRF→IMDS, XXE file read | yes — **add URL allow-list + harden XML parser, prove the deny** + write `probe.py` | **Balanced (attacker→fixer)** |
| 09 | Password Attacks | identify hashes, crack, rules | yes — write `auto_crack.py` (auto-ID + select mode + Markdown report) | **Balanced (tool-build)** |
| 10 | Privesc — Linux | SUID/sudo/cron escalation | yes — write `enum.py` privesc scanner (parses sudoers/crontab, ranks vectors) | **Balanced (tool-build)** |
| 11 | Privesc — Windows | winPEAS triage → SYSTEM | yes — extend `triage.py` (+2 vectors, confidence score). *VM-gated; Docker triage-only fallback* | **Balanced (tool-build)** |
| 12 | Pivoting | tunnel DMZ→internal | yes — write `setup-pivot.sh` (parametrised, self-verifying tunnel) | **Balanced (tool-build)** |
| 13 | C2 & Post-Ex | operate HTTP C2, beacon | yes — write `operator.py` (API client, tasked cmds, timestamped log) | **Balanced (tool-build)** |
| 14 | LOLBins & Evasion | download→exec→persist chain | yes — write `lolbins_chain.sh` **+ author the auditd/osquery detections** for it | **Balanced (tool + detection)** |
| 15 | PowerShell Tradecraft | cradle, encode, obfuscate | yes — extend `tradecraft.ps1` into a launcher-builder that emits the 4104 telemetry | **Balanced (tool-build)** |
| 16 | Cloud & Container Primer | flaws.cloud + CloudGoat | yes, but **thin** — `enumerate_account.sh` is a light triage wrapper; lab is **external/free-tier-gated**, on-ramp/handoff to Track 05 | **By design (handoff) — minor deepen optional** |
| 17 | Reporting & Remediation | turn findings into a report | yes — the **report itself is the build** + `gen_finding.py` generator + validator | **Balanced (synthesis build) — by design** |

**Tally:** **15 balanced (tool-build / PoC / attacker→fixer)** · **2 by-design** (16 cloud handoff,
17 reporting-synthesis) · **0 find/run-only that should gain a build half** · 1 minor deepen (16).
The expected "already balanced" outcome the prompt flagged as valid.

## Structural hole

**Essentially none that this track owes.** Coverage runs recon → scan → vuln-ID → exploitation
(memory + 3 web classes) → creds → privesc (Linux+Windows) → pivot → C2 → evasion (LOLBins+
PowerShell) → cloud on-ramp → reporting — a complete PTES-shaped arc, each phase ending in a project,
capped by the engagement-report capstone. The one arguable gap is a **dedicated Active Directory /
Kerberos foothold module** (Kerberoasting, AS-REP, DCSync) — the labs *reference* it repeatedly
(`Connects forward` in 09/11/12/13 all point at "Track 06 — Active Directory"). But that is **a whole
sibling track by the charter's own map, not a missing module here** — tracks are standalone and AD is
its own specialization. So: **not a hole this track should fill.** (If anything were promoted, it
would be a single "AD attack primer" mirroring 16's cloud-primer handoff shape — optional, low
priority, and only if the AD track does not already exist.)

## Rebalance plan (sequenced — all small / optional)

1. **07 & 08 — promote the attacker→fixer fix to a *graded* step** *(S, promotable — rests on the
   already-validated env).* Both labs *already* have the learner fix the bugs and re-run `make demo`
   to prove 403 (07 steps 5–6; 08 steps 4–5) — the build half is present in the Do-steps. The only
   gap vs. 06 is that **06 is the sole web lab with a `grade.yaml`**; 07/08 prove the fix by `make
   demo` but don't gate it. Adding a `grade.yaml` (target-state: exploit now returns 403) makes the
   already-written fix a *graded* deliverable. Cheap: no new services, the audit/demo scripts and
   compose already exist. **This is the only concrete fix worth doing, and it's a polish, not a gap.**
2. **16 — deepen the tool-build (optional)** *(S, promotable).* `enumerate_account.sh` is a thin
   `sts/s3 ls/list-policies` wrapper. Could grow into a small IAM privesc-path triager (parse the
   policy JSON, flag `iam:PutUserPolicy`/`PassRole`-style escalations) to match the depth of 10's
   `enum.py`. Low priority — 16 is deliberately a *handoff* to Track 05, where that depth lives.
3. **Do nothing else.** 01–15 each already ship a required, committed tool/PoC build; the
   attack-then-automate pattern delivers the build half by design.

## Non-goals / cautions

- **Do not bolt defensive controls onto exploit labs.** The whole point of an offensive track is the
  attack; the build move is the *tool/PoC/patch*, which is already present. Turning 04/05/09/12/13
  into "now build a detection/defense" would mis-specify the track (the explicit non-goal from the
  cloud/ztna audits, applied here). The defensive inverse is what the **defensive track** is for, and
  every offensive lab already cross-links to it under `Connects forward`.
- **15 already crosses the line correctly** — its build (a launcher-builder that emits the 4104
  telemetry the defensive track hunts) is a *tool*, not a defense, and is the right shape.
- **VM/external-gated labs (11 Windows, 16 cloud) are by design** — the charter permits VMs/cloud
  free-tier where the domain demands it. 11 ships a Docker triage-only fallback so the *tool-build*
  half is still reachable without a Windows host; that's the right compromise, not a defect.
- This audit changes nothing on its own; any future edit touches **both repos** (prose in `plaintext`,
  lab env in `plaintext-labs`) and must keep `mkdocs build --strict` green and a validated
  `make up`/`make demo`. The one recommended change (07/08 `grade.yaml`) rests on the existing,
  already-validated envs — promotable, no new scaffolding to stand up.
```
