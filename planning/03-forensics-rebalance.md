# Forensics track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual
**labs** (the real `lab.md` + env under `plaintext-labs/forensics/`), not just the concept
objectives. The cloud audit's question — "do we only teach *find/audit*, or also *build & operate
something reusable*?" — re-asked for a track that is **investigation by nature**.*

## TL;DR

**Forensics is the "by-design pure" case the framework anticipated** — the job *is* examine the
evidence and report defensibly, exactly as cloud 01/14 and ZTNA 01/04 are legitimately pure. But
this track does **not** stop at find-and-report: **every one of the 14 labs carries a *required*
"Automate & own it" step that turns the manual analysis into a real reusable tool** — a carving
report parser (03), a Windows-triage parser (04), a browser-triage tool with exfil-domain flagging
(05), a memory parent-PID anomaly flagger (06), a timeline-pivot/corroboration tool (07), a
suspicious-process triage parser (08), a **Zeek beacon-detector** (09), a CloudTrail recon→persistence
correlator (10), an extended **timestomp detector** (11), a YARA-driven sample scanner (12), an IR
timeline-gap checker (13), and an extended report linter (14). Several labs (06, 07, 10, 11, 14) even
**ship a reference version of that tool in the env** that the learner reads, extends, and re-validates.
So the "build/operate-and-verify half" the other audits had to *add* is **already structurally present
track-wide** as the Automate move. The skew the cloud/ZTNA audits found does **not** appear here.

**Recommendation: leave the track essentially as-is.** No module needs a build half bolted on, and
there is **no clean structural hole** (the obvious candidates — disk/memory/timeline/network/cloud/
anti-forensics/malware-triage/IR/reporting — are all present). Two *optional, low-priority* deepenings
are noted for honesty (08's and 13's Automate scripts are the lightest), and one *defensible-but-not-
recommended* topical addition (mobile/structured-storage forensics). The expected conclusion for an
investigation track — "already appropriate" — is the right one here.

## What "build & operate" means here (and why it's narrower than cloud/ZTNA)

Forensics doesn't *build a control* — there is no firewall to author, no Rego to write, no realm to
harden. The legitimate build/own-it move is the charter's **Automate & own it**: take the manual
investigation the lab just walked and **make it a reusable, verified tool** — a parser, an automated
triage/timeline pass, or a **detection over the forensic artifacts** (a beacon detector, a timestomp
detector, a YARA scanner). The bar for "has a build half": the lab ends in the learner *authoring (or
extending) and validating against the seed data* a script they'd actually re-run on the next case —
not merely running a shipped tool and writing prose. Judged that way, this track clears the bar in
every module; the question per row below is only *how substantive* the build is.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation (Do-steps) | Build/operate-and-verify half? | Verdict |
|---|--------|----------------------------|--------------------------------|---------|
| 01 | Forensic Fundamentals | hash both files, image with `dc3dd`, verify hashes match, write chain-of-custody | yes — `hash-evidence.sh`: hash every file in a dir → timestamped evidence log | **By design + tooled** — intake/integrity lab; Automate adds a reusable hasher |
| 02 | Acquisition & Imaging | image a test device with `dc3dd`, verify source==image==log, simulate write-block | yes — `acquire.sh`: dc3dd + re-hash + PASS/FAIL verdict + evidence-log append | **Balanced** — acquisition wrapped into a reusable verified tool |
| 03 | File Systems & Carving | `fsstat`/`fls -d`/`istat`/`icat` recover deleted file, `foremost` carve | yes — `carve-report.sh`: parse `fls -d`, `icat` each deleted inode, MD report | **Balanced** — manual recovery → repeatable triage script |
| 04 | Windows Artifacts | chainsaw hunt EVTX (4624/4688/1102), python-registry Run keys + MRU | yes — `parse-windows-artifacts.py`: EVTX events + run keys → timeline/persistence report (env ships `parse_artifacts.py`) | **Balanced** — first-pass Windows-triage parser |
| 05 | Browser & App Artifacts | hindsight + sqlite over Chrome `History`, downloads, search terms, WAL | yes — `browser-triage.py`: window query + downloads + terms, **flags exfil domains** | **Balanced** — analysis → triage tool with a detection flag |
| 06 | Memory Forensics | analyze Volatility3 JSON: pslist/cmdline/netscan/malfind, decode `-enc` | yes — `memory-triage.py`: flag bad parent-PID, flag non-whitelisted netconns (env ships `analyze_memory.py`) | **Balanced** — memory triage detection over the artifacts |
| 07 | Timeline Analysis | `log2timeline`/`psort` super-timeline, filter window, find 8 key events, gaps | yes — `timeline-pivot.py`: window+keyword filter, **flag cross-source corroboration <60s** (env ships `analyze_timeline.py`) | **Balanced (strong)** — scriptable timeline pivot/correlation |
| 08 | Triage & Live Response | run Velociraptor VQL artifacts, **write a custom VQL query**, scope decision | yes — VQL authored live + `triage_report.py` flags encoded/double-ext/odd-path procs | **Balanced** — *and* authors live VQL (a built+run artifact) |
| 09 | Network Forensics | Zeek conn/dns/http/files/ssl logs, tshark follow stream, extract hash | yes — `beacon_detect.py`: per-dest interval mean/stdev, **flag regular-timing beacons** | **Balanced (strong)** — real detection-as-code over Zeek output |
| 10 | Log & Cloud Forensics | hayabusa/chainsaw EVTX triage + CloudTrail recon/persistence/AssumeRole, ATT&CK map | yes — `cloudtrail_pivot.py`: per-principal timeline, **flag recon+persistence <60min** (env ships `parse_cloudtrail.py`) | **Balanced (strong)** — cross-evidence correlation detector |
| 11 | Anti-Forensics & Detecting It | `fls`/`istat` SI vs FN timestomp, `icat` recover, run shipped detector | yes — **extend `detect_timestomping.py`**: SI<Created impossible-time check, deployment-window check, JSON out | **Balanced (strong)** — extend & re-validate a real detection |
| 12 | Malware Artifacts in IR | CAPA capability profiling, **write a YARA rule**, false-positive check on benign set | yes — authored YARA rule + `triage_samples.py` (yara over a dir, match report) | **Balanced (strong)** — authors a detection rule and a scanner |
| 13 | IR Process | map Meridian brief to NIST 800-61 phases, fill gaps, score containment | yes — `ir_timeline_checker.py`: validate 4 phases present, flag >2h response delays | **By design + tooled** — analysis/judgment lab; Automate is the lightest (a CSV gap-checker) |
| 14 | Reporting & Root-Cause | label confirmed/inferred, exec summary, 5-Whys root cause, IOC table, lint | yes — **extend `lint_report.py`**: enforce artifact-citation format, IOC-type coverage, word cap | **By design + tooled** — the report *is* the artifact; Automate hardens it into a validator |

**Tally:** **9 balanced/proactive** (02–12, of which 07·09·10·11·12 are *strong* detection/parser
builds) · **3 "by design" pure-but-tooled** (01 intake, 13 IR-process judgment, 14 reporting — each
still ships a required Automate tool) · **0 analysis-only modules needing a build half added** ·
**2 optional deepenings** (08, 13 — lightest Automate scripts). Contrast with cloud (2 audit-only +
1 hole) and ZTNA (2 inspect-only + 1 hole): **this track has neither the audit-only gap nor a clean
structural hole.**

## Structural hole: none defensible

The investigation surface is covered end-to-end across the four phases — acquire/preserve (01–03),
reconstruct the host (04–08: disk, Windows, browser, memory, timeline, triage), beyond the host
(09–12: network, log/cloud, anti-forensics, malware triage), and investigation/report (13–14). The
usual "missing pillar" candidates are all present, including the ones easy to drop: **anti-forensics
detection** (11), **cloud/log forensics** (10), **live-response at scale** (08), and **malware-artifact
handoff** (12). The one arguable gap — **mobile / structured-app-storage forensics** (iOS/Android,
SQLite/plist/`KnowledgeC`, Cellebrite-style extraction) — is real but **not recommended** as a fill:
it is largely closed-tool and device-bound (no clean zero-cost one-command Docker env, against the
charter's reference-lab rule), and module 05 already teaches the transferable core (SQLite/WAL
artifact parsing). Flagging it for completeness, not as a build item. **Verdict: no new module.**

## Rebalance plan (sequenced — all optional, smallest-disruption first)

This track needs **no required changes**. The items below are opportunistic polish; none is a gap in
the charter's "definition of done."

1. **(Optional, S) 08 — deepen the Automate tool.** `triage_report.py` flags encoded/double-extension/
   odd-path processes from a JSON result — solid but the lightest of the network/host detectors.
   Could promote the **VQL-against-VirusTotal** stretch, or have the learner package their custom VQL
   as a reusable Velociraptor *artifact* (YAML) rather than a one-off query, deepening "build a
   reusable collector." **Promotable** — rests on the already-validated Velociraptor env (server +
   agent, `data/` JSON), no new scaffolding.
2. **(Optional, S) 13 — deepen the Automate tool.** `ir_timeline_checker.py` (phase-coverage + delay
   flagging over a CSV) is the lightest build because the module is judgment-first. Could add a
   "phase-completeness" check (each NIST phase has ≥1 required action type) to make it more than a
   gap-timer. **Promotable** — no container; rests on the shipped `meridian-timeline.csv`.
3. **(Note only, not recommended) Mobile/app-storage forensics module.** See above — defensible topic,
   but **needs entirely new env scaffolding** and fights the OSS-first/one-command-Docker rule.
   Would require a built+validated `plaintext-labs/forensics/15-…` (`make up`/`make demo`) — a full
   new unit, not a promotion. Decision, not a default; recommend **no**.

**Promotable-vs-needs-validation summary:** both optional deepenings (08, 13) are **cheap promotions**
on already-validated envs — no `make up`/`make demo` re-scaffolding, just extending an existing
shipped script and its seed data. The only "needs new env + validation" item is the mobile module,
which is **not recommended**. (Docker availability is therefore not a blocker for anything recommended
here.)

## Non-goals / cautions

- **Don't overcorrect — this is the track the framework predicted would be fine.** Forensics is
  investigate-and-report by nature; the Automate & own it tool *is* the build half, and it is present
  and substantive in all 14 labs (detection-as-code in 09/10/11, a parser/triage tool elsewhere). Do
  **not** invent "build a control" halves for investigation labs — that would be the overcorrection the
  cloud audit warned against (cloud 01/14, ZTNA 01/04).
- **Don't add a module to hit a quota.** The one arguable hole (mobile) violates the reference-lab
  charter; leaving it out is the correct call, the same way the cloud audit added KMS only because it
  was a genuine, lab-able, mostly-build pillar — mobile is neither cheaply lab-able nor mostly-build.
- Any change still touches **both repos** (prose in `plaintext`, env/script in `plaintext-labs`) and
  must keep `mkdocs build --strict` green and a validated `make up`/`make demo` — but nothing here
  *requires* such a change. **Bottom line: ship as-is.**
