# All-tracks build-vs-find rebalance — master index

*Applies the cloud/ztna "build & operate vs. find/analyze" audit to **every** track. Per-track detail
lives in the sibling `planning/<NN-track>-rebalance.md` docs; this is the consolidated map and the
decision list. Audited 2026-06-11/12 against the actual **labs** (Do-steps), not just concept objectives.*

## The headline

**The build-vs-find skew was real but concentrated in cloud and ztna.** Audited across all 13 tracks,
every other track is **already largely balanced** — because the charter's patterns (attacker→fixer,
audit→remediate→verify, the required *Automate & own it* tool-build, detection-as-code) already deliver
the build half almost everywhere. The frame *correctly does not apply* to the analysis/orientation tracks
(foundations, forensics) and *inverts* on the build-by-nature tracks (python, automation, AI-ops, where
the question becomes "is the build verified/owned, not transcribed?"). Net work across the other 11 tracks:
a handful of **surgical, promotable** fixes (mostly "promote an existing stretch/finding to a core,
verified step"), **no teardowns**, and only two optional new-module *decisions*.

## Per-track verdict

| Track | Tally (balanced · by-design · gap · deepen) | Frame applies? | Action |
|---|---|---|---|
| 00 Foundations | 2 · 9 · 0 · 1 | Mostly no (entry track) | **None needed**; optional: 09 deepen |
| 01 Offensive | 15 · 2 · 0 · 0 | Mostly no (attack+automate already builds) | **None needed**; optional: grade-gate 07/08's fix |
| 02 Defensive | 12 · 2 · **2** · 1 | Lightly | **DONE:** 02, 04 author+verify a detection (03 light) |
| 03 Forensics | 9 · 3 · 0 · 2 | Inverts (investigation + Automate tool = build) | **None needed**; optional deepens (08, 13) |
| 04 Malware | 7 · 0 · **5** · 1 | Lightly | **Backlog:** 03/05/07/09/10 promote finding→graded YARA/Sigma |
| 05 Cloud | — | Yes | **DONE earlier:** 02/03/04/07/10 + new Module 17 (KMS) |
| 06 Active Directory | 1 · 8 · **1** · 0 | Bites on one module | **DONE:** 10 apply hardening to live DC + re-attack |
| 07 Endpoint Hardening | 7 · 1 · 0 · 1 | Yes (already apply+verify) | **Backlog:** 07 deepen remediation to a set |
| 08 Cryptography | 7 · 2 · **1** · 1 | Mostly no (break↔build already) | **DONE:** 09 apply hardened DNS to live zone + re-verify |
| 09 Python for Security | 7 · 0 · 0 · 3 | Inverts (this IS the build track) | **Backlog:** 04/06/07 add learner-written tests |
| 10 Automation | 8 · 1 · **1** · 1 | Yes (already build-heavy) | **DONE:** 08 human-approval containment gate to core |
| 11 ZTNA | — | Yes | **DONE earlier:** 02/03 + new Module 10 (SPIFFE/SPIRE) |
| 12 AI-Augmented Ops | 8 · 1 · **1** · 1 | Mostly no (build+evaluate already) | **Backlog:** 04 RAG eval harness; 03 fixture |

## Implemented this pass (promotable, rest on already-validated envs)

All are concept (Objective + Key concepts) realignment in `plaintext` + lab Do-step/success-criteria
promotion in `plaintext-labs`, no new Docker scaffolding (the env already shipped what's needed):

- **08-cryptography / 09** — apply the hardened SPF/DMARC to the live bind9 zone, reload, re-`dig` and
  re-run `validate-email-auth.py` to prove WARN/FAIL→PASS (was "write the corrected record" only).
- **10-automation / 08** — promote the human-in-the-loop containment gate from stretch to core: prove a
  HIGH alert yields a pending-approval record and **no** containment artifact until approved.
- **02-defensive / 02 & 04** — promote "note a detection you could build" to authoring a detection and
  proving it fires on the bundled malicious telemetry and stays quiet on a benign sample.
- **06-active-directory / 10** — apply two fixes to the live Samba4 DC with `samba-tool` and prove it:
  the AS-REP roast against `svc-legacy` now fails and `posture-audit.py` shows the HIGH findings cleared
  (was an Ansible-debug playbook + a *conceptual* delta).

(Plus, earlier: **05-cloud** 02/03/04/07/10 + new KMS module; **11-ztna** 02/03 + new SPIFFE module.)

## Promotable backlog (recommended next; each cheap, on validated envs)

- **04-malware / 03, 05, 07, 09, 10** — the track's consistent narrow skew: strong analysis that stops
  before a *corpus-verified* detection even though Module 04 is the model. Promote the existing
  stretch/finding to a graded step: 09 (UPX-YARA, rule already written — cheapest), 03 (YARA from
  IAT/strings), 10 (YARA from anti-analysis indicators), 07 (hex rule on the recovered XOR stub), 05
  (Sigma/auditd from the syscall timeline — newest artifact type, validate the conversion).
- **09-python / 04, 06, 07** — promote the track's own test pattern (02/05/08/09/10 already ship learner
  tests) into the three labs that currently verify by eyeballing `make demo`: add `test_enrich.py`,
  scapy/socket port-scan asserts, `test_scraper.py`.
- **12-ai-augmented-ops / 04** — reframe the RAG lab's required automation from ingest-dedup to an
  `eval_rag.py` + a small labeled query→expected-doc set (incl. a not-in-corpus case) run as `make eval`
  (retrieval@k + grounding). One script + a make target — but `make eval` needs re-validation. Plus 03:
  ship a committed known-good/known-bad fixture so the existing gate is reproducible.
- **07-endpoint / 07** — deepen the compliance-scoring lab to remediate a 3–5 finding set and show the
  score delta climb (it currently fixes one).
- **01-offensive / 07 & 08** — add a `target-state grade.yaml` so the already-written attacker→fixer
  (fix the bug, re-run, prove HTTP 403) becomes a *graded* deliverable, matching module 06.
- **Minor:** 00-foundations/09 (operate the verify-an-artifact tool against a real published hash/cert),
  03-forensics/08 & 13 (package the VQL artifact; phase-completeness check), 08-crypto/01 (one verified
  GCM round-trip in the Do-steps).

## Decisions to make (optional new modules — not defaults)

The cloud (KMS) and ztna (SPIFFE) audits each found a genuine missing pillar and a module was built. The
remaining tracks have **no must-fill structural hole** — but two defensible optional additions surfaced:

1. **10-automation — "Secrets handling in pipelines"** (OIDC / short-lived federated creds): the build-side
   mirror of all the leak-*detection* the track already teaches. Could also fold into Module 05. *Needs a
   new validated env.*
2. **07-endpoint — "Host & boot integrity"** (AIDE file-integrity is the container-validatable slice;
   Secure Boot/TPM/FDE is a VM lab). The one arguable missing endpoint pillar. *Needs a new validated env.*

Both are genuine "build & operate" topics but each is a full KMS/SPIFFE-style unit (env + validation), so
they're decisions for the owner, not defaults. Everything else above is surgical and promotable.

## Non-goals / cautions (held throughout)

- **Don't overcorrect.** Foundations and forensics are analysis/orientation by design; offensive is attack
  by design; the by-design-pure labs (assessment, ADR, attack-sim feeding later detection) were left pure,
  exactly as cloud 01/14 and ztna 01/04 were.
- The build-by-nature tracks (python, automation, AI-ops) were judged on *verification rigor* (owned+tested
  vs. transcribed), not "find vs. build" — the frame inverts there.
- Every change keeps `mkdocs build --strict` green and rests on an already-validated `make up`/`make demo`;
  anything needing new env scaffolding is flagged as a validation follow-up (Docker was unavailable in the
  authoring session).
