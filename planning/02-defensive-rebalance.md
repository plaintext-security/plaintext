# Defensive track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual **labs**
(where the find-vs-build skew really shows), not just the concept objectives. The question — "do we only
teach *find/analyse/detect*, or also *author & operate the control and prove it fires*?" — applied module
by module to Track 02.*

## TL;DR

Defensive is, as expected, **the most build-and-verify track in the curriculum** — a defensive track is
build-oriented *by nature*, and this one delivers it. The whole back half (06–17) has the learner **author a
correlation rule / Sigma rule / hunt step / SOAR fix and prove it fires (and stays quiet on benign)** —
detection-as-code, purple-team tuning, coverage mapping, gated containment. The skew is **narrow and entirely
front-loaded** in Phase 1's *telemetry-collection* labs: three of them (02, 03, 04) stop at *read the attack
in the telemetry and **note** a detection idea* — the learner never authors the detection and verifies it
against the data, even though each already carries that authored-rule step as the **Automate & own it** /
*Stretch*. Module 05 (one slot later, same phase) is the template they should match: it adds "write one
custom rule and confirm it fires." There is **no clean structural topical hole** — the obvious candidate
(detection coverage of a *known attack chain*) is already module 10, and KEV-driven defence (17) closes the
exploit→detect loop. Recommendation: surgical only — promote the existing author-and-verify step from
stretch to core in 02, 04 (and lightly 03). No teardown, no new module. The expected "already balanced"
verdict, with three early labs to nudge.

## What "build & operate and verify" means here

For a *defensive* track the bar is the detection-engineering loop, not "remediate a finding": **author a
detection/rule/hunt and prove it** — write the Sigma/Suricata/correlation rule, fire it at the malicious
event and confirm it matches, fire it at benign events and confirm it *doesn't* (false-positive discipline),
then tune. "Operate the control" = stand up and configure the sensor (auditd, osquery, Zeek, Suricata),
run the purple-team loop (atomic → did it fire? → fix → re-fire), map and close coverage, and
respond→automate (SOAR gated containment). Writing a Sigma rule, tuning a detector, building SIEM
correlation, and a SOAR playbook are all genuine build-and-operate — and most of this track does exactly
that. The audit is purely about where a lab stops at *analyse + note an idea*.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/operate-and-verify half? | Verdict |
|---|--------|-----------------|---------------------------------------|---------|
| 01 | Telemetry & Log Centralisation | stand up Elastic/pipeline, ingest real logs, search, **name one telemetry gap** | partial — *builds the pipeline* (the Automate step is a from-zero compose+ingest), but no detection authored | **By design** — Phase-1 collection substrate; the build *is* the pipeline. Leave pure |
| 02 | Windows & Endpoint Telemetry | load attack EVTX/Sysmon, trace malicious process + ancestry, name Event IDs, **"note what a detection would key on"** | **no** — detection is only *noted*; authoring+firing a rule is the Automate/Stretch | **Add build half** (promote the EVTX-flagging script to author+verify a rule) |
| 03 | Linux Telemetry | configure auditd `execve` + file watch, trigger an action and find it, run an osquery question, **"note one detection"** | partial — *operates the sensor* (auditd rules + osquery queries are authored & fired), but detection only noted | **OK; could deepen** — author one auditd/osquery detection and prove it fires on the triggered action |
| 04 | Network Security Monitoring | run Zeek over a real malicious PCAP, find C2/DNS/exfil, extract IOCs vs. write-up, **"note a detection"** | **no** — detection only *noted*; the indicator-flagging script is the Automate step | **Add build half** (author a Zeek/IOC detection and prove it fires on the known-bad PCAP) |
| 05 | Intrusion Detection | run Suricata over malicious PCAP, read alerts vs. write-up, **write one custom rule and confirm it fires** | yes — author + fire a custom rule | **Balanced** — the template the 02/04 fixes should match |
| 06 | SIEM Fundamentals | trace evidence chain, **add a new `@rule` correlation rule, prove it fires**, add `--export-rules`, refactor rules into modules | yes — author + verify correlation rules | **Balanced (proactive)** |
| 07 | Log Parsing & Normalisation | reimplement normalisation in **Vector VRL**, match the reference, route unparsed to dead-letter, **measure parse rate** | yes — build + verify the parser, with a committed test | **Balanced (proactive)** |
| 08 | Detection-as-Code | **write your own Sigma rule**, fire it (matches malicious, not benign), convert to SPL, reason FPs, **CI lint/convert gate** | yes — author + verify + CI gate; the reference exemplar | **Balanced (proactive)** |
| 09 | Detection Testing & Tuning | fire an atomic, **did the detection fire? fix the gap, re-fire, measure & cut FPs** | yes — the purple-team build/verify loop | **Balanced (proactive)** |
| 10 | ATT&CK Mapping & Coverage | map detections→techniques, build a Navigator layer, find gaps, **prioritise next 3 detections**; generate the layer programmatically | yes — build the coverage map + gap-driven plan (the "what's missing" lab) | **By design / Balanced** — the coverage build is the artifact |
| 11 | Threat Hunting — Endpoint | hunt the chain in SQL, **add a new hunt step (Step 8), add `--sigma` that emits a rule**, refactor with `@step` | yes — author hunt steps + emit a verified Sigma rule | **Balanced (proactive)** |
| 12 | Threat Hunting — Network | RITA-style beacon hunt, tune weights, **add a multi-port C2 step + `--min-score` JSON**, build a report mode | yes — extend + verify the hunt scorer | **Balanced (proactive)** |
| 13 | PowerShell Logging & Hunting | separate malicious 4104 blocks, **add a new indicator (fires on target, not benign), write a Sigma rule + a regression test** | yes — author rule + FP-aware regression gate | **Balanced (proactive)** |
| 14 | Alert Triage & IR | work NIST 800-61 phases, **write a certutil Sigma rule, add `--generate-report`, add `--api` TheHive export** | yes — respond→automate; authors a detection from the incident | **Balanced** |
| 15 | Threat Intelligence | ingest a real feed, enrich your own indicator, **enrich a detection (alert on known-bad), script the enrichment** | yes — build the enrichment that sharpens a detection | **Balanced** |
| 16 | Response Automation (SOAR) — capstone | trace scoring, **fix `step_contain` (block src not dst), add a YAML step, wire the human gate**, export workflow-as-code | yes — operate + fix + automate the gated pipeline | **Balanced (proactive)** |
| 17 | KEV-Driven Defense | refresh live KEV, **stand up Vulhub + exploit it, write `detection.yml` that fires on the attack and zero on benign**, `make grade`, diff-report tool | yes — exploit→detect→verify, graded | **Balanced (proactive)** |

**Tally:** ~12 balanced/proactive (05–09, 11–17) · 2 "by design" pure (01 collection substrate, 10 coverage —
the build *is* the map) · **2 analyse-only that should gain a build half (02, 04)** · 1 to lightly deepen (03).
The mirror-image of the cloud/ZTNA findings, but *smaller*: where those tracks had a build-heavy back half plus
2 audit-only modules **and** a structural pillar hole, this track's back half is even denser with build-and-verify
and there is **no defensible hole** — only 2–3 early collection labs to nudge.

## The narrow skew: 02, 04 (and lightly 03) stop at "note a detection"

All three already *contain* the build half — it's demoted to "note what a detection would key on" in the Do
steps, with the actual author-and-fire pushed to **Automate & own it** or a *Stretch*. So a learner can finish
the lab having only *read* the attack, never having written a detection and proven it against the data. The fix
is the same promote-the-stretch move the ZTNA audit used for its two front-loaded labs — and module **05 in the
same phase already does it** ("write one custom rule … confirm it fires"), so this is matching a sibling, not
inventing a pattern:

- **02 — author the rule and fire it.** Today: `analyze.py` reconstructs the spear-phish process tree and the
  learner *notes* "what a detection would key on" (Do step 4); writing the EVTX-flagging script is only
  *Automate & own it*. Add a core step: **author a detection** (the script that flags the Office-app→encoded-
  PowerShell / rundll32-LOLBin ancestry, or a Sigma rule on those Event IDs) and **prove it fires on the
  malicious event in `data/sysmon_events.json` and not on the benign ones.** Turns read→note into
  read→author→verify — exactly module 08's bar, one phase earlier.
- **04 — author the IOC/Zeek detection and prove it on the known-bad PCAP.** Today: run Zeek, find the
  beaconing/DGA/exfil, extract IOCs, *note* a detection (Do step 4); the indicator-flagging pass is only the
  Automate step. Add a core step: **write the detection** (flag the ~300 s beacon interval, the DGA queries,
  the long/large outbound connection in `data/zeek/`) and **confirm it fires on the C2 logs.** Mirrors 05's
  custom-rule-fires and 12's beacon scorer.
- **03 — lightly deepen.** It already *operates the sensor* (the learner authors auditd `execve`/file-watch
  rules and osquery SQL and fires them — that's a real build), so it is **not** in the same bucket as 02/04.
  The only gap is that the captured event ends at "note one detection." Optional nudge: turn one of those
  authored auditd rules / osquery queries into a **named detection and prove it fires on the triggered
  action** — small, and the env already supports it.

Each change touches the module `README.md` (objective + key concepts, in `plaintext`) and the lab `lab.md` Do
steps + success criteria (in `plaintext-labs`), and must keep `make up`/`make demo` validated — the same
dual-repo discipline the cloud and ZTNA rebalances followed.

## Structural topical hole: none (defensibly)

Unlike cloud (KMS) and ZTNA (workload identity / SPIFFE), Track 02 has **no clean missing pillar.** The
detection-engineering lifecycle is covered end-to-end: collect (01–07) → detect-as-code (08) → test/tune (09)
→ measure coverage (10) → hunt (11–13) → respond (14) → enrich (15) → automate (16) → operationalise KEV (17).
Candidates considered and rejected:
- *"We detect but never measure coverage of a known attack chain"* — that **is** module 10 (ATT&CK
  Navigator + gap-driven prioritisation).
- *"No deception / honeypots"* — a real defensive sub-discipline, but adjacent/optional, not a gap in the core
  detection→response spine this track teaches; it would be additive breadth, not a missing pillar. Note it as a
  *possible future module*, not a rebalancing fix.
- *"No purple-team emulation of a full adversary"* — covered by 09 (atomics) + 17 (real exploit→detect) + the
  capstone (simulate an attack and catch it).

So the honest answer is **none** — and that is the expected result for a track whose nature is already build.

## Rebalance plan (sequenced, smallest-disruption first)

1. **02 — add the build half** *(S, promotable — rests on the validated env).* Promote the EVTX/Sysmon
   detection from *Automate & own it* to a core graded step: author the rule/script and prove it fires on the
   malicious event in `data/sysmon_events.json` and is quiet on the benign ones. **No new env** — `analyze.py`,
   the bundled 10-event chain, and `make demo` already exist; this is prose + a success-criterion line, with at
   most a small assertion in/around `analyze.py`. Re-validate `make demo`.
2. **04 — add the build half** *(S, promotable — rests on the validated env).* Promote the indicator/Zeek
   detection to a core step: author it and prove it fires on `data/zeek/conn.log|dns.log|http.log`. **No new
   env** — the synthetic C2 logs, `analyze.py`, and the Zeek profile already ship. Re-validate `make demo`.
3. **03 — optional deepen** *(S, promotable).* Turn one authored auditd rule / osquery query into a named
   detection that provably fires on the triggered action. Rests on the existing Ubuntu+osquery+`audit.log`
   env. Lowest priority — 03 already operates a sensor.

All three are **promotable / cheap**: each rests on an already-built, already-validated `plaintext-labs/defensive/<NN>`
env (Dockerfile + compose + bundled data + `analyze.py`/`demo.py`). None needs new env scaffolding. The only
validation cost is re-running `make up`/`make demo` after the Do-step edits — **a follow-up if Docker is
unavailable in the editing session**, but no new image to build from scratch.

## Non-goals / cautions

- **Don't overcorrect — this is the expected "already balanced" track.** The back half (05–17) is a model of
  author-and-verify; leave it. 01 (the Phase-1 pipeline substrate) and 10 (the coverage map *is* the build) are
  pure by design and should stay that way — do **not** bolt a synthetic "detection" onto the collection or
  mapping labs.
- The fix is **narrow and front-loaded**: 2 promote-the-stretch edits (02, 04) and 1 optional nudge (03). No new
  module, no teardown.
- Any change touches **both repos** (prose in `plaintext`, lab env in `plaintext-labs`) and must keep
  `mkdocs build --strict` green and ship a re-validated `make up`/`make demo`.
- Honest framing of 03: it is **not** analyse-only — it already authors and fires auditd/osquery, so its rec is
  "deepen," not "add from scratch." Same correction shape as the cloud audit's module-07 note.
