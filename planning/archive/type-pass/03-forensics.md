# Type pass — Track 03 (Digital Forensics & IR)

Tagged against the 16-type library. Forensics leans hard on **6 Reconstruct** (the
track's spine) and **2 Misconception Reveal** (anti-forensics myths, timestamp myths),
with **9 Tool-Build** showing up wherever the lab's manual parse should become a reusable
parser. The whole track is anchored on one running narrative — the **Meridian Financial**
incident — which is exactly the right "anchor on something real" stance, even though it's a
synthetic case rather than a named public breach.

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Forensic Fundamentals & Evidence Handling | 1 Concept Autopsy | 2 Misconception Reveal | ✓ | Anchor on a real evidence-exclusion (court tossed an image because the hash didn't match / wasn't taken before access). Predict-then-reveal on "hash later, it's fine." |
| 02 Acquisition & Imaging | 7 Build-&-Operate | 11 Decision/ADR | ⚠ | Real activity is *build a verified image* + the **dead-box vs live** judgment call — that's an ADR ("choose and defend acquisition strategy"), currently framed as passive prose. Surface the ADR deliverable. |
| 03 File Systems & Carving | 6 Reconstruct | 9 Tool-Build | ✓ | Recover + prove deletion of a real file. "Automate & own it" makes the carve/recover step a reusable parser → Tool-Build. |
| 04 Windows Artifacts | 6 Reconstruct | 9 Tool-Build | ✓ | Anchored on real EVTX-ATTACK-SAMPLES; registry-hive parsing script is a Tool-Build seed. Strong. |
| 05 Browser & Application Artifacts | 6 Reconstruct | 2 Misconception Reveal | ✓ | Misconception payload is strong ("incognito leaves nothing" / "clearing history erases it" → WAL recovery). The 1601-epoch gotcha is a clean tiny-proof. |
| 06 Memory Forensics | 6 Reconstruct | 2 Misconception Reveal | ✓ | "Disk analysis sees everything" is the wrong intuition; reveal = fileless/injected lives only in RAM. Real Volatility3 + MemLabs images. Exemplary anchor. |
| 07 Timeline Analysis | 6 Reconstruct | 2 Misconception Reveal | ✓ | Super-timeline = the Reconstruct centerpiece. Timezone-error and timestomp caveats are Misconception sub-beats. Could carry a tiny Tool-Build (timeline-builder wrapper). |
| 08 Triage & Live Response | 7 Build-&-Operate | 9 Tool-Build | ✓ | Deploy Velociraptor + author VQL artifacts = build-&-operate; the reusable VQL artifact pack is a Tool-Build. "Triage ≠ forensics" is a nice latent misconception. |
| 09 Network Forensics | 6 Reconstruct | 9 Tool-Build | ✓ | Reconstruct session+file from PCAP. Real malware-traffic-analysis.net data. Zeek-log triage script → Tool-Build. |
| 10 Log & Cloud Forensics | 6 Reconstruct | 9 Tool-Build | ✓ | CloudTrail attack-chain reconstruction; the CloudTrail parser is an explicit Tool-Build. Real ATT&CK cloud matrix anchor. |
| 11 Anti-Forensics & Detecting It | 2 Misconception Reveal | 9 Tool-Build | ✓ | The track's flagship Misconception module — "wiping/timestomping erases the trail" → SI/FN divergence, 1102 gaps. The detection script is a real Tool-Build. Best-fit type-2 in the track. |
| 12 Malware Artifacts in IR | 9 Tool-Build | 6 Reconstruct | ✓ | CAPA triage + **write a YARA rule** = author a reusable detection artifact → Tool-Build. "Can do X ≠ did do X" is a sharp latent misconception. |
| 13 Incident Response Process | 1 Concept Autopsy | 11 Decision/ADR | ⚠ | Audit the Meridian response against NIST 800-61 — that's a judgment/autopsy, but the deliverable (containment-timing decision, post-incident causal analysis) is decision-shaped. No hands-on tool; lightest module — make sure the lab isn't a worksheet. |
| 14 Reporting & Root-Cause Analysis | 8 Judgment-as-Code/Gate | 6 Reconstruct | ✓ | The **report-linter / structural gate** ("all sections present, IOC table populated, every claim artifact-cited") is genuinely Judgment-as-Code — a CI gate on report completeness. Excellent and under-named as just "reporting." |

## Coverage gaps

- **13 Eval Harness — absent, and it should appear.** Anti-forensics detection (11) and YARA
  rules (12) are exactly the "non-deterministic detection improved by a held-out corpus + a
  regression gate" shape. A YARA/timestomp detector tested only against its own sample is a
  vibe; tested against a held-out benign+malicious corpus with a precision/recall scorecard it
  becomes type-13. Right now those modules stop at "write the rule," not "prove it on a corpus
  you didn't author."
- **11 Decision/ADR — latent in two places, named in none.** Module 02 (dead-box vs live) and
  Module 13 (containment timing, when-to-pull-power) are real decision-under-constraint calls.
  Naming an ADR deliverable would introduce the construct the way Foundations should have.
- **14 Adversarial Review — under-exploited given the track's own thesis.** The track's AI
  posture is explicitly "AI summary is a *lead*, never evidence — every conclusion traces to an
  artifact." That *is* type-14, but it's stated as advisory text in every module rather than
  built into one lab where the learner is handed a plausible-but-wrong AI-drafted timeline/
  narrative and must catch the fabricated events. The richest unused hook in the track.
- **5 Detonate & Detect — not present, and arguably should bookend 04/06.** The track only ever
  *receives* evidence; it never generates its own ground truth. A "run a known technique, then
  find it in the artifacts you just created" beat would make several reconstruct labs
  self-contained and teach why the artifact exists.
- **No named public breach anchor.** Everything rides the synthetic Meridian case. At least the
  capstone-adjacent modules (13/14) would hit harder anchored on a real disclosed incident with
  a public post-mortem (e.g., a CISA/Mandiant write-up) so learners compare their root-cause to a
  published one.

## Suggested additions

1. **Forensic Eval Harness (new module, late Phase 3).** Build a held-out corpus of timestomped/
   benign files (and/or malicious/benign PE samples), run your Module 11/12 detector against it,
   and produce a scorecard + a regression gate that fails when precision/recall drops. This is the
   single highest-value add — it converts the two detector-writing modules from "wrote a rule" into
   "proved a rule," and it's the type the whole track is missing. (Type 13, secondary 9.)
2. **"Trust the AI summary?" — Adversarial Review lab (new module or a hardened 13/14 lab).** Hand
   the learner an AI-generated incident narrative seeded with 2–3 fabricated/uncited events and a
   wrong root cause; task is to catch each, trace every surviving claim to an artifact, and codify a
   trust policy for AI-drafted forensic output. Makes the track's stated AI thesis hands-on instead
   of advisory. (Type 14, secondary 2.)
3. **Acquisition Decision Record (reframe of 02, not net-new — optional).** Promote the dead-box-vs-
   live call to an explicit ADR deliverable (options · volatility tradeoffs · pick · why), introducing
   the ADR construct early in the track. Low cost, high pedagogical payoff. (Type 11.)
