# Endpoint & Host Hardening track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual
**labs** (the Do-steps in `plaintext-labs/endpoint-hardening/<module>/lab.md`), not the concept
objectives. The recurring question — "do we only teach *find/audit*, or also *build & operate the
hardening and prove it holds*?" — applied module by module to Track 07.*

## TL;DR

This is the **most build-balanced track audited so far, and that is expected** — an endpoint
hardening track is build-oriented *by nature*: applying CIS baselines, authoring MAC profiles and
allowlists, pushing config-as-code, and **re-scanning to prove the gap closed** is the whole job,
and almost every lab already does exactly that (apply → verify, or exploit → remediate → re-verify).
The skew is **very narrow**: there is **no pure audit-only lab that stops at "list the findings."**
The only soft spots are two *depth* nits — 07 (compliance scoring) remediates just **one** finding
before the rescan, which under-sells its own "scoring & auditing" identity, and 02 (Windows) carries
a real apply+verify cycle but its build half is **VM-gated** (the containerized `make demo` only
scores sample JSON). One module (01) is pure-by-design orientation and should stay that way. **No
teardown, no audit-only-to-apply rescue needed (unlike cloud 02/04), and the structural hole is
defensible-but-optional.** This is a "track is already balanced" finding, with two opportunistic
deepens.

## What "build & operate the hardening" means here

The bar is the charter's, specialized to hardening: not "scan a baseline and list what fails," but
hands-on *applying the control and proving it* — apply a CIS remediation / LGPO setting / sysctl and
**re-scan to show the score moved**; author and enforce an AppArmor profile and **prove the denial in
the logs**; write an idempotent Ansible playbook and **prove drift is caught**; remove a SUID bit and
**re-attempt the exploit to prove the path is closed**; patch a package and **confirm the CVE count
dropped**. Nearly the entire track clears this bar already — which is the expected result the prompt
called out, not a failure to fix.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/operate-and-verify half? | Verdict |
|---|--------|-----------------|---------------------------------------|---------|
| 01 | Threat Model of the Endpoint | read Meridian profiles, fill assets/STRIDE paths/mitigations, rank top-5 backlog; `score_threat_model.py` | no | **By design** — foundational orientation/assessment lab (the track's "orient yourself," like cloud 01 / ztna 01); the document *is* the artifact |
| 02 | Windows Hardening to CIS | CIS-CAT scan → apply LGPO/PowerShell L1 controls + 3 manual → rescan → `score_report.py` delta → root-cause the still-failing | **yes** — apply + re-scan + delta | **Balanced**, but the build half is **VM-gated** (container `make demo` only scores sample JSON; the apply step needs a Windows 11 VM). Pedagogically fine; flag it as the one not container-validated |
| 03 | Linux Hardening to CIS | Lynis + OpenSCAP audit → apply 3 remediations (ASLR/redirects/core-dumps) → **re-run both, record after-scores** → accept 2 with rationale | **yes** — apply + verify the score moved | **Balanced (proactive)** |
| 04 | Exploit Mitigation & Allowlisting | observe denial → inspect profile → **load enforce, modify to add a deny rule, reload, re-test, decode the denial log** | **yes** — author + enforce + prove the deny | **Balanced (proactive)** |
| 05 | Endpoint Telemetry & EDR | stand up osquery → run 5 queries → **write a C2-detection JOIN query + a scheduled `pack.json`** → `run-queries.py` SIEM feed | **yes (detection-as-build)** — the visibility *is* the built control here, not a hardening | **By design / Balanced** — visibility lab; stands up telemetry and authors detections (cf. cloud 15, ztna 09). Not a hardening apply-gap |
| 06 | Configuration Management | run playbook → **add a 6th task, prove changed→ok idempotency** → `--check` drift → `drift-check.sh` exits non-zero on drift | **yes** — author config-as-code + prove idempotency + catch drift | **Balanced (proactive)** |
| 07 | Compliance Scoring & Auditing | OpenSCAP+Lynis baseline → pick 5 high-sev fails, **remediate ONE** → rescan → delta count → exception report; `compliance-diff.py` | **yes, but shallow** — apply+verify is present but only **one** finding is fixed before the rescan | **Deepen build side** — remediate a *set* (3–5) and show the score climb, not a single rule; the module's identity is *scoring*, so the delta should be substantive |
| 08 | Patch & Vulnerability Management | grype scan → osquery inventory → KEV cross-ref → prioritised top-5 → **patch the top package, re-run grype, confirm CVE count dropped** | **yes** — patch + re-scan + verify the count fell | **Balanced** |
| 09 | Local Privilege-Escalation Defense | find SUID → **exploit via GTFOBins → remove SUID bit → re-attempt, prove it fails → add AppArmor layer, re-verify → add osquery regression query** | **yes** — exploit → remediate → re-verify → defense-in-depth → regression check | **Balanced (proactive)** — the model apply-and-prove lab of the track |
| 10 | Detecting Host Compromise | match example rule → **write 3 Sigma rules (persistence/cred-access/lateral), test each fires on exactly its alert, build ATT&CK coverage layer** | **yes (detection-as-build)** | **Balanced** — detection-as-build (cf. cloud 15, ztna 09) |

**Tally:** 7 balanced/proactive (02 VM-gated, 03, 04, 06, 08, 09 + the two detection-as-build 05/10) ·
1 "by design" pure (01 orientation) · **0 audit-only that should gain an apply half** (the real gap
the prompt flagged — absent here, as predicted for a hardening track) · **1 shallow build to deepen
(07)** · 1 caveat-not-fix (02 VM-gated). No teardown.

## Structural hole: largely "none" — one optional candidate

Unlike cloud (KMS) and ztna (workload identity / SPIFFE), there is **no missing NIST/CIS pillar of
comparable weight** that is mostly build-and-operate. The track covers model → Windows baseline →
Linux baseline → exploit mitigations/allowlisting → telemetry → config-as-code → compliance scoring →
patch → privesc defense → detection. That is a complete endpoint-hardening arc. **Calling the hole
"none" is the honest answer.**

One *defensible-but-optional* candidate, noted not recommended as a default:

- **Host/disk integrity & boot trust** — Secure Boot, measured boot / TPM attestation, full-disk
  encryption (LUKS/BitLocker), and file-integrity monitoring (AIDE/Tripwire). This is the "protect
  the host's data and prove the boot chain wasn't tampered" surface, and it is almost entirely
  build/operate (configure LUKS + verify, baseline AIDE + prove a planted change is flagged). It is
  the closest thing to a pillar-shaped, build-heavy gap. *Why it's only optional:* FDE and Secure
  Boot are firmware/VM-dependent and hard to lab deterministically in a container (the charter's
  container-first preference is exactly why the existing labs lean Linux+AppArmor+OpenSCAP), and AIDE
  file-integrity overlaps the drift-detection muscle already built in 06. If a fill is wanted, AIDE
  file-integrity monitoring is the cheap, container-validatable slice; full boot-trust is a VM lab.

## Rebalance plan (sequenced, smallest-disruption first)

1. **07 — deepen the build side** *(S, promotable — rests on the already-validated env).* The lab
   already does baseline → fix → rescan → delta on a built, un-hardened container (`make up`/`make
   demo` run OpenSCAP+Lynis and apply one fix). Change Do-step 4 from "choose **one** to remediate"
   to "remediate the **3–5 highest-severity** findings (a small applied set)" and have Do-step 5/6
   show the score climbing across them, so the *scoring* module produces a substantive delta rather
   than a one-rule move. **No new env needed** — same container, `compliance-diff.py` already handles
   before/after XML. Pure prose + Do-step edit in `lab.md` (and align the module objective/key
   concepts in `plaintext`). This is the one genuine deepen.

2. **02 — flag, don't rebuild: the VM-gated build half** *(XS, documentation only).* The apply+verify
   cycle is real and correct, but it executes on a learner-provisioned Windows 11 VM; the container
   `make demo` only scores sample JSON, so the *apply* half is **not container-validated** and can't
   carry `.ci-demo`. This matches the charter's "VMs where the domain demands it" allowance (Windows
   LGPO genuinely needs Windows). **No change to the pedagogy** — just keep the audit honest that 02's
   build half is VM-dependent, exactly as the capstone rubric already assumes a Windows host. No env
   work; no follow-up required.

3. **(Optional, decision) — Host integrity / file-integrity monitoring** *(M, needs NEW env
   scaffolding + validation).* If the track wants a structural fill, the cheap container-validatable
   slice is an AIDE/Tripwire file-integrity lab: baseline the DB, plant a change, prove it's flagged,
   wire a scheduled re-check. This needs a new `plaintext-labs/endpoint-hardening/NN-…` dir with a
   `Dockerfile`/`compose`/`Makefile` and a validated `make up`/`make demo` — **net-new env, not a
   promotion** — so it is a decision, not a default, and would need a Docker-available session to
   validate (follow-up). Full Secure Boot / TPM / FDE is a VM lab and heavier still. **Recommendation:
   leave the hole at "none" unless the track owner wants the integrity pillar; if so, take the AIDE
   slice first.**

## Non-goals / cautions

- **Don't overcorrect — this track is already balanced.** The hardening labs already apply+verify
  (03, 04, 06, 08, 09 are textbook exploit/audit → remediate → re-verify). Do **not** bolt extra build
  steps onto them, and do **not** turn 01 (the threat-model orientation lab) or the two
  detection-as-build labs (05, 10) into hardening-apply labs — they are correct as-is, the same way
  cloud 01/14 and ztna 01/04/09 are pure by design.
- The only real edit is **07's depth** (one finding → a set); everything else is a caveat (02 is
  VM-gated by necessity) or an optional structural decision (host integrity), not a fix.
- Any change touches **both repos** (prose in `plaintext`, lab Do-steps/env in `plaintext-labs`) and
  must keep `mkdocs build --strict` green; 07's edit ships against the **already-validated** container,
  so it carries no new `make up`/`make demo` validation risk.
