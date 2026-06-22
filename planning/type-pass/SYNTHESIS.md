# Type pass — curriculum-wide synthesis

*One analysis pass per track (13 tracks, ~150 modules) tagged against the 16-type library in
`../MODULE-TYPE-LIBRARY.md`. Per-track tables live beside this file (`<NN-track>.md`). This is the
synthesis: where each type lives, the systemic gaps, the shape mismatches, the exemplars to copy, and a
prioritized roadmap.*

## Headline

The curriculum is **strong on the families we already had** (judgment, build, detonate/detect,
reconstruct) and **systematically missing four constructs** that the type library predicted — in priority
order: **Eval Harness (#13), Migration/Brownfield (#12), Decision/ADR-as-a-named-artifact (#11), and
Adversarial Review (#14)**. The most important single finding: **almost every detection, tooling, and AI
module across the curriculum *describes* the eval-harness thesis and *none ships one* — they build on
vibes.** That's the same gap in nine tracks.

## Where each type lives (curriculum-wide)

| # | Type | Status | Primary spine in | Notes |
|---|------|--------|------------------|-------|
| 1 | Concept Autopsy | ✅ used | forensics/AD/ztna openers, found 01, cloud 01 | solid |
| 2 | Misconception Reveal | ✅ strong | **foundations (9/12), cryptography (6/10)**, offensive | the beginner/crypto workhorse |
| 3 | Blast-Radius Trace | ✅ strong | **offensive (6)**, AD, cloud 02/03 | the offense spine |
| 4 | Audit→Build→Verify | ✅ used | endpoint, cloud 04/05, AD 10, crypto 05/10 | solid |
| 5 | Detonate & Detect | ✅ strong | offensive 13–15, defensive, malware 05/06, cloud 14/15 | exemplar: offensive 15 (PowerShell) |
| 6 | Reconstruct | ✅ strong | **forensics (03–10)**, defensive hunt/IR, malware, cloud 16 | the DFIR spine |
| 7 | Build-&-Operate | ✅ strong | **automation, ai-ops, ztna, defensive 01–07** | the engineering spine |
| 8 | Judgment-as-Code / Gate | ✅ used | cloud 06, automation 03/09, endpoint 07/08, ztna 07/08 | solid |
| 9 | Tool-Build | ✅ strong | **python (whole track)**, automation 06/07, malware/forensics parsers | exemplar: python track |
| 10 | Design → red-team-your-design | ⚠ thin | ztna 04/05, AD 11, cloud capstone | present but rarely a required deliverable |
| 11 | Decision / ADR | ⚠ latent | **only ztna 04 names it** | latent in ~8 tracks; ztna 04 is the template to copy |
| 12 | **Migration / Brownfield** | ❌ **absent** | nowhere | the most real-world task in ztna/automation/crypto/endpoint — missing in all |
| 13 | **Eval Harness** | ❌ **systemic gap** | only ai 07, ai 10 | **described in 9 tracks, shipped in ~2** — the #1 finding |
| 14 | Adversarial Review | ⚠ under-named | **only python 10** does it well | the "AI authors → you review" posture is everywhere, the lab almost nowhere |
| 15 | Red-team-the-AI | ◐ partial | ai 09/10 (good); python 09 latent | fine for now; only AI-touching tracks need it |
| 16 | Drift / Steady-State | ⚠ latent | endpoint/automation 04/ztna 09 (all as steps, not modules) | owned by no module despite being core to hardening/config |

## The four systemic gaps (ranked, with the specific modules)

### 1. Eval Harness (#13) — the curriculum's biggest hole
Every track that does **detection or AI or tooling** preaches "test set + known-good/known-bad + coverage ≠
effectiveness," then stops at "script the loop" — never a **held-out corpus + scorecard + CI regression
gate**. Confirmed in:
- **ai-augmented-ops** — 04 RAG, 05 MCP, 06 Copilot, 08 SOAR **build on vibes, no eval paired**; the
  capstone (the copilot) is the *least* evaluated thing in it. (07 is the lone exemplar.)
- **defensive** — 08/09/10 describe it; 09 gets closest but stops at "script the loop."
- **malware** 13, **cloud** 15, **AD** 09, **forensics** 11/12, **automation** 09, **python** (latent in 02/04/10) — all the same shape.

### 2. Migration / Brownfield (#12) — absent everywhere it's the real job
No module in the curriculum takes a *running legacy thing* and moves it incrementally without breakage:
- **ztna** — the **VPN→ZTNA cutover** is the confirmed missing centerpiece (no module, no `migration/` lab).
- **automation** — no **click-ops → gated-IaC** migration.
- **cryptography** — no **PQC / crypto-agility** migration (the most job-relevant crypto skill today).
- **endpoint** — no **fleet baseline rollout** without breaking running hosts.

### 3. Decision / ADR (#11) — latent everywhere, named once
Real tradeoffs are everywhere (local-vs-frontier, self-host-vs-SASE, CIS-vs-STIG, RSA-vs-Ed25519,
Vault-vs-SOPS) but only **ztna 04** commits an Architecture Decision Record. It's an *exemplary* one
(scoring table, Nygard format, honest consequences, a real attack-path paragraph) — **the template to
copy**. Latent in: foundations 02, automation 01, ai 01, cryptography, endpoint 01/03, forensics 02, malware 01.

### 4. Adversarial Review (#14) — the stated posture, rarely a lab
"AI authors → you review → you own it" is in nearly every module's AI section, but only **python 10**
makes *catching the subtly-wrong AI output* the actual lab. Natural homes going unused: offensive 17
(reporting), defensive (review AI detections), forensics (trust the AI summary?), malware (review the AI analysis).

*(Drift #16 is a fifth, milder gap — owned by no module despite being core to endpoint/config/ZT.)*

## Shape mismatches (modules currently written against their own content)

| Track | Module(s) | Currently | Should be |
|---|---|---|---|
| cloud | 02, 04 | audit-only (enumerate/map) | Audit→**Build**→Verify (the D-rewrite fixes this) |
| cloud | 15 | "validate against benign" prose | **Eval Harness** (ships no corpus/scorecard/gate) |
| cloud | 01 | passive orientation read | Misconception Reveal |
| defensive | 08, 09, 10 | "test your detections" prose | **Eval Harness** |
| ai-ops | 04, 05, 06, 08 | build-on-vibes | Build-&-Operate **+ paired Eval Harness** |
| automation | 01 | framework page | Concept Autopsy (Knight Capital / AWS-S3 typo) |
| automation | 05 | static review of 3 bad workflow files | Build/operate a **running** gate (or Adversarial Review) |
| offensive | 17 | writing-craft concept page | **Adversarial Review** (+ a completeness gate) |
| offensive | 01, 03 | concept pages | **Tool-Build** (labs already ship the tools) |
| forensics | 02 | passive concept | Build-&-Operate + **ADR** (dead-box vs live) |
| forensics | 13 | worksheet (no hands-on) | needs a tool/eval |
| malware | 13 | one-shot rule authoring | **Eval Harness** (grades vs corpus already) |
| crypto | 03 | passive, no failure anchor | Misconception Reveal (Debian RNG / PS3 nonce) |
| python | 09 | advisory prose on injection | **Red-team-the-AI** (exercise it) |
| foundations | 02, 10 | concept / generic build | **ADR** (02), **Tool-Build** (10) |

## Exemplars — the modules other modules should copy

- **Decision/ADR:** ztna 04 (proper scoring table + Nygard format + honest consequences).
- **Adversarial Review:** python 10 (the "AI authors → you verify every line" lab realized).
- **Eval Harness:** ai-ops 07 (confusion matrix vs ground truth) — the one to generalize.
- **Detonate & Detect:** offensive 15 (every evasion paired with its exact event-log telemetry).
- **Whole-track coherence:** AD (clean attack→close-it loop, all ✓) and endpoint (all ✓).

## Prioritized roadmap (what to build, in order)

1. **Make Eval Harness a first-class construct** — biggest leverage. Two moves: (a) add a **dedicated
   "AI Eval & Observability" module** to ai-ops that 04/05/06 plug into (shared held-out set + scorecard +
   regression gate) and add an eval row to its capstone rubric; (b) **upgrade-in-place** the detection
   modules that already get 80% there — defensive 09, cloud 15, malware 13, AD 09 — to ship a held-out
   corpus + regression gate. Generalize ai-ops 07 as the template.
2. **Add the Migration modules** — ztna **VPN→ZTNA** (highest, it's the track's missing centerpiece),
   automation **click-ops→gated-IaC**, cryptography **PQC/crypto-agility**, endpoint **fleet rollout**.
3. **Name the ADR construct and seed it early** — make foundations 02 a Decision/ADR using ztna 04 as the
   template, then retrofit the latent ones (automation 01, ai 01, crypto choice, endpoint 01).
4. **Generalize Adversarial Review** — promote it from an AI-section footnote to a real lab beat in
   offensive 17, defensive, forensics, malware (python 10 is the model).
5. **Own Drift** — a dedicated Drift/Steady-State module (or explicit build step) in endpoint, automation
   04, ztna 09.
6. **Fix the per-track shape mismatches** in the table above as each track is next touched.

## How this folds back into the rewrites
The cloud and foundations "Verdict" rewrites already fixed several mismatches above (cloud 02/04 build
halves, cloud 01 misconception, the foundations ADR/Tool-Build retrofits are now identified). The type
pass says the **next** rewrite priorities aren't more Verdict — they're **Eval Harness and Migration**,
the two constructs the breach-anchored family never needed and the engineering/AI tracks can't do without.
