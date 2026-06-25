# Type pass — Track 01 Offensive Security

Canonical = the shipped track (`tracks/01-offensive`), 17 modules across four phases (recon →
finding the way in → after access → reporting). The capstone is a professional engagement report.

Offense leans hard on the **attack** verb, so the dominant shapes are **Blast-Radius Trace (#3)**
(attack a target, predict how far it reaches, end in a guardrail/fix note) and **Concept/Misconception
autopsy (#1/#2)** for the literacy modules that teach a mechanism. Two modules are really
**Tool-Build (#9)** wearing concept-page clothing (01 recon, 03 vuln-id — their labs ship reusable
harnesses), and the track's editorial spine — "every exploit leaves telemetry the defender hunts" —
is a latent **Detonate & Detect (#5)** thread that's narrated but rarely the deliverable. Reporting
(17) is the track's outlier: it's an **Adversarial Review (#14)** in spirit (verify every AI-drafted
finding) sitting on a Judgment-as-Code-shaped validator.

| Module | Primary type | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Recon & OSINT | 1 Concept Autopsy | 9 Tool-Build | ⚠ | Prose teaches the passive/active *boundary* (a principle/boundary memo = Concept Autopsy), but the lab ships a reusable recon/attack-surface harness — that's a Tool-Build the module doesn't name. Anchor: a real forgotten-subdomain/shadow-IT exposure; CT-log discovery is the concrete hook. |
| 02 Scanning & Enumeration | 2 Misconception Reveal | 5 Detonate & Detect | ✓ | "A port number is a hypothesis, not an answer" is a clean reveal; the "your scan *is* the rows the blue team sees" thread is a latent Detonate&Detect. Could close the loop by showing the T1595 telemetry the scan generates. |
| 03 Vulnerability Identification | 9 Tool-Build | 11 Decision/ADR | ⚠ | Lab already ships `vuln_assess.py` walking CVE→CWE→CVSS→KEV→PoC and emitting `vuln-assessment.md` — it *is* a Tool-Build, but the module reads as a concept page. The "prioritise by real risk, defend the ranking" output (P1 vs P2 verdict) is a latent ADR/judgment deliverable. KEV/EPSS is the real anchor. |
| 04 Exploitation Fundamentals | 3 Blast-Radius Trace | 5 Detonate & Detect | ✓ | Real Vulhub CVE → access; vuln→exploit→payload→session chain is the trace. "Every exploit leaves artifacts (T1190 from the other side)" is the Detonate&Detect half — narrated, worth making a deliverable. |
| 05 Memory Corruption Primer | 1 Concept Autopsy | 2 Misconception Reveal | ✓ | "Smash the stack" demystified into overwrite-the-saved-RIP = a mechanism autopsy; mitigations (ASLR/canary/NX) as the arms-race reveal. Anchor a real RCE-via-overflow CVE to keep it from floating free. Correctly an Advanced concept module, not a Tool-Build. |
| 06 Web — Injection | 3 Blast-Radius Trace | 2 Misconception Reveal | ✓ | Reference exemplar (shipped vulnerable app). "Sanitise the bad chars" is the misconception; "injection isn't about SQL — it's untrusted data crossing into a control plane" is the reveal; ends in the structural fix (parameterised queries) = the guardrail. Strong fit. |
| 07 Web — Auth & Access Control | 3 Blast-Radius Trace | 2 Misconception Reveal | ✓ | IDOR/privilege-escalation = attack + predict reach; "server trusting the client" reveal ties it to injection. Deliverable should be the every-role × every-endpoint sweep + the deny-by-default fix. OWASP A01 is the anchor. |
| 08 Web — SSRF, XXE & Deserialization | 3 Blast-Radius Trace | 1 Concept Autopsy | ✓ | The blast-radius module of the track: SSRF→metadata→IAM creds, anchored on Capital One 2019 (100M records). "Confused deputy" is the unifying autopsy. Web-bug→infra-compromise pivot is exactly a reach trace. Exemplary anchor. |
| 09 Password & Credential Attacks | 2 Misconception Reveal | 9 Tool-Build | ✓ | "Encryption ≠ hashing; security = cost-per-guess" is the reveal (fast vs slow KDF). Lab cracks real hashes hands-on; "reuse, not cracking, is the real vector" is the gotcha. Defender payoff (argue for length+KDF+MFA) is the bridge. |
| 10 Privesc — Linux | 2 Misconception Reveal | 5 Detonate & Detect | ✓ | "Privesc is misconfiguration, not exploits" is the reveal; enumerate-first workflow via GTFOBins/linpeas. The "same list a CIS benchmark audits, read from the attacker's end" is the hardening/detect bridge. Good fit. |
| 11 Privesc — Windows | 2 Misconception Reveal | 3 Blast-Radius Trace | ✓ | Sibling to 10; the "local SYSTEM is a springboard to the domain" framing is a genuine blast-radius trace (foothold→DA). Preconditions-are-a-minefield is the judgment. Anchor a real service-misconfig/potato technique. |
| 12 Pivoting & Lateral Movement | 3 Blast-Radius Trace | 2 Misconception Reveal | ✓ | The textbook reach trace: one foothold → domain-wide via the segmentation ladder (port-forward → SOCKS → tunnel). "Every pivot defeats a boundary someone drew" = the guardrail bridge (argue for segmentation). Strong fit. |
| 13 C2 & Post-Exploitation | 5 Detonate & Detect | 7 Build-&-Operate | ✓ | Stand up OSS C2 (Sliver), beacon, post-ex — and the spine is "you are the thing the blue team hunts" (beacon timing/JA3). The most explicit Detonate&Detect in the track; the stand-up-and-operate half is Build-&-Operate. Sits opposite the defensive C2-detection module. |
| 14 Living-off-the-Land & Evasion | 5 Detonate & Detect | 2 Misconception Reveal | ✓ | "Evasion shifts you from signature to behavioural detection — it does not make you invisible" is both reveal and the Detonate&Detect thesis (why `certutil` spawned by Word is still anomalous). Dual-use note is right. LOLBAS/GTFOBins anchor. |
| 15 PowerShell Tradecraft | 5 Detonate & Detect | 2 Misconception Reveal | ✓ | Best-built module: every evasion (cradle, EncodedCommand, obfuscation, AMSI bypass) paired with the exact telemetry it leaves (4104 script-block logging). Explicitly the offensive half of Defensive Module 13. Exemplary Detonate&Detect — "quiet, not invisible." |
| 16 Cloud & Container Attack Primer | 3 Blast-Radius Trace | 11 Decision/ADR | ✓ | SSRF→metadata→IAM, key→bucket, container-escape→node = reach traces; "identity is the perimeter" is the reveal. Pays off Capital One from 08. Real targets (flaws.cloud, CloudGoat). Deliberately a primer handing off to T05. |
| 17 Reporting & Remediation | 14 Adversarial Review | 8 Judgment-as-Code/Gate | ⚠ | Content is "AI drafts the report → you verify every finding, number, CVE → you sign it" = textbook Adversarial Review, and the lab ships a structural validator (11 sections, reference-URL checks) = a Judgment-as-Code gate. But the module is shaped as a craft/writing concept page. Naming it an Adversarial Review surfaces the curriculum-wide "AI authors → you review → you own it" thread at the point it matters most. Anchor: model on real public pentest reports. |

## Coverage gaps

- **Eval Harness (#13)** — absent, and there's one place it genuinely belongs: a detection/scanner
  module needs a labelled corpus + metric + regression gate, not vibes. The closest seed is 03
  (vuln triage) and 17 (report-validator), neither of which is scored against a held-out set. Per
  the library this is the curriculum-wide standout gap; offense touches it only latently. A
  *false-positive/false-negative-aware* recon-or-scan eval would seed it (see additions).
- **Adversarial Review (#14)** — present in content only at 17 (and latently in every AI-acceleration
  note: "AI hallucinates a subdomain / wrong CVE / mismatched payload — verify"). It's never the
  *spine* of a lab except reporting, and even there it isn't named. This is the track's most
  under-named type given how heavily the AI-verification thread runs through it.
- **Decision/ADR (#11)** — latent in 03 (defend the P1/P2 ranking) and 16 (which cloud target/path),
  never a deliverable. Offense is genuinely attack-heavy so this is a minor gap, but a "which CVE do
  you exploit first, and defend it" ADR beat in 03 would introduce the construct the way Foundations
  02 should.
- **Detonate & Detect (#5)** — *narrated everywhere* (02, 04, 10, 13, 14, 15 all say "here's the
  telemetry you leave") but only 13/14/15 make it the spine and none make the *detection* a committed
  deliverable. The single highest-leverage track-wide upgrade: have one or two attack labs emit the
  detection/telemetry artifact, not just mention it — that's the offense↔defense connective tissue
  the charter wants, made concrete.
- **Correctly light/absent:** Build-&-Operate (#7) appears only as the secondary in 13 (stand up C2),
  which is right — offense is attack-anchored, not build-anchored. Migration (#12), Red-team-the-AI
  (#15), Drift (#16) are out of scope for this track.

## Suggested additions

1. **Retrofit, not a new module — name 17 an Adversarial Review (#14).** The content already *is*
   "AI drafts → you verify every finding/number/CVE → you sign it." Reframe the deliverable around
   the review-and-trust step (catch the finding you can't reproduce, the invented impact, the wrong
   CVE) layered on the existing structural-gate validator. This names the track's heaviest implicit
   thread at its natural home and gives the curriculum a non-AI-track home for type 14.

2. **New module/beat — "Verify the AI's findings" Eval Harness (#13), light.** The whole track warns
   that models hallucinate subdomains, CVE IDs, and mismatched payloads. Turn that into one scored
   rep: a small labelled set of AI-generated recon/vuln claims (some real, some hallucinated) + a
   precision/recall metric + a gate that fails when the learner's verification process lets a false
   positive through. Seeds the highest-value missing type using offense's own most-repeated warning.
   Could live as a phase-1 project beat rather than a standalone module.

3. **Retrofit, not a new module — make one attack lab's detection artifact a *deliverable* (#5).**
   Pick 04 (exploitation) or 13 (C2): the prose already describes the T1190/beacon telemetry; require
   the learner to commit the detection note/IOC alongside the exploit. Makes the offense↔defense
   bridge concrete (it's currently narrated, not produced) and is the cheapest track-wide win.
