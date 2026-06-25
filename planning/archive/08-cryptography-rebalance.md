# Cryptography track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual **labs**
(where the find-vs-build skew shows), not just the concept objectives. The framing question — "does the
lab only *break/analyze*, or also *build the correct construction and prove it*?" — applied module by
module to Track 08.*

## TL;DR

This track is **already the most break-then-build track we have**, and that's by design — a cryptography
curriculum naturally pairs *attack the broken scheme → implement it right → prove the attack now fails /
it round-trips*. Eight of ten labs already end in the learner **building a correct construction and
verifying it** (random-IV AEAD with AAD that round-trips, Argon2id that accepts/rejects, the Mozilla
modern TLS profile re-scanned to zero HIGH, a step-ca chain that verifies, Vault store/rotate/policy,
gitleaks pre-commit prevention). Two labs are **pure-by-design** orientation/audit (01 is partly a
primitive-orientation lab, 10 is the integrative audit). The skew is **one narrow gap: module 09
(email authentication)**, which has the learner *write* corrected SPF/DMARC records **into the
deliverable only** and never **applies them to the live zone and re-validates** — even though the env
already mounts a writable bind9 zone, so the build-and-verify half is one promoted step away. **No
structural topical hole.** Recommendation: one surgical fix (09), one optional minor deepen (01). No
teardown — the expected "already balanced" verdict.

## What "build & operate the correct construction and prove it" means here

For a crypto track the bar is specific: not just "break the weak scheme and explain," but **implement
the secure construction and demonstrate the attack now fails or the scheme round-trips / passes test
vectors** — random per-message nonce that defeats the XOR-reveal, AEAD whose tag rejects tampering,
Argon2id whose verifier accepts the right password and rejects the wrong, a TLS config re-scanned to
zero HIGH, a CA chain that verifies and a revoked cert that shows "revoked," a hardened DNS record the
resolver actually serves. The break is the motivation; the verified build is the deliverable.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build-correct-and-verify half? | Verdict |
|---|--------|-----------------|---------------------------------------|---------|
| 01 | Primitives in Practice | tamper CBC vs GCM, observe silent-corrupt vs auth-fail, compute HMAC; **build** AES-GCM `encrypt-aead.py` (Automate) | partial — break + observe in Do; the *build correct AEAD* is the required Automate step, not a verified Do-step | **By design (orientation)**; optional shallow-deepen — promote a GCM round-trip into Do |
| 02 | Symmetric & AEAD | reproduce IV-reuse XOR-reveal, **implement random-IV fix + AAD, re-run XOR and confirm it no longer leaks** (Do 3–5) | yes — break then build-correct-and-verify | **Balanced** |
| 03 | Asymmetric & Key Exchange | gen RSA/EC, sign/verify, **tamper→verify fails**, **X25519 ECDH → both sides derive identical secret** (Do 3–4) | yes — builds + verifies the correct construction | **Balanced** |
| 04 | Hashing, MACs & Passwords | crack unsalted SHA-256, **implement Argon2id, verify accept-correct/reject-wrong** (Do 3–4) | yes — break then build-correct-and-verify | **Balanced** |
| 05 | TLS Deep Dive | scan weak nginx, map findings to directives, **apply Mozilla modern profile, reload, rescan to confirm resolved**, inspect `s_client` (Do 4–5) | yes — build the correct config + re-verify | **Balanced (proactive)** |
| 06 | PKI & Certificate Management | **stand up step-ca, issue leaf, verify chain** (and prove a corrupted cert fails), revoke + confirm OCSP, issue short-lived (Do 2–5) | yes — builds + verifies the PKI lifecycle | **Balanced (proactive)** |
| 07 | Secrets Management | **store/read/rotate in Vault**, audit log, **SOPS encrypt+decrypt round-trip**, **author least-priv Vault policy + verify** (Do 2–5, AI step) | yes — builds + operates the correct control | **Balanced (proactive)** |
| 08 | Secret Detection & Leakage | scan history, prove deleted secret persists, **author remediation plan + add a gitleaks pre-commit hook (prevention)** (Do 5–6) | yes — detection + a preventive build | **Balanced** |
| 09 | Email Authentication | query/validate SPF/DKIM/DMARC, decode DKIM key, **write corrected records — into the deliverable only** (Do 3,5) | **no** — corrected records are written on paper; never **applied to the live zone and re-validated** (that's not even a stretch) | **Add build half** |
| 10 | Auditing Applied-Crypto Failures | scan 3 TLS configs, score the delta, map to OWASP A02, structured finding table; confirm strong server has 0 HIGH | no — integrative audit/report (the strong config is given, not built here) | **By design** — the track's integrative audit lab (like cloud 14 / ztna 04 are pure by design) |

**Tally:** ~7 balanced/proactive (02–08) · 2 "by design" pure (01 primitive-orientation, 10 integrative
audit) · **1 break/find-only that should gain a build-and-verify half (09)** · 1 optional shallow-deepen
(01). A *more* balanced result than cloud (2 audit-only + a hole) or ztna (2 inspect-only + a hole) —
this track's break↔build pairing was baked in from the start.

## Structural topical hole: none

The candidate holes for a crypto track — **authenticated encryption done right** (02: random-IV GCM +
AAD, verified), **key management / secrets** (07: Vault store/rotate/policy + SOPS), **TLS config**
(05: Mozilla modern profile, re-scanned), **PKI** (06: step-ca issue/verify/revoke + short-lived) — are
each already a built-and-verified lab. **Post-quantum** is the one genuinely-absent topic, but it is
*orientation/awareness* today (NIST ML-KEM/ML-DSA standards finalised 2024) more than a build-and-prove
lab that transfers to a current job, and the track is already at ten modules + capstone. Note it as a
**future watch item, not a recommended fill** — adding it would be breadth for its own sake, against the
"don't overcorrect" guardrail. No defensible structural hole.

## Rebalance plan (sequenced, smallest-disruption first)

1. **09 — add the build-and-verify half** *(S; promotable — rests on the already-validated env, no new
   scaffolding).* Today Do-steps 3 and 5 have the learner *write* the corrected SPF (`-all`) and DMARC
   (`p=reject; adkim=s; rua=…`) records **"into the deliverable"** — they are never applied or re-tested,
   so the lab ends at analysis. Add a core step: **edit the live bind9 zone** (`data/meridian-fictional.zone`,
   already bind-mounted via `./:/lab`), reload `named`, and **re-query with `dig` to prove the resolver now
   serves the hardened records** — then re-run the `validate-email-auth.py` automation (already required)
   and show it flips from WARN/FAIL to PASS. The corrected values already exist verbatim in
   `data/dns-records.txt` ("CORRECTED RECORDS"), so this is purely promoting a paper step to an
   apply-and-verify step. Mirrors ztna 03's "apply the ACL to the live mesh and prove it" and cloud 04's
   "author the fix and re-verify." **Cheap — existing env, existing automation; no `make`-level new
   services.** (A `make verify-strong` convenience target and a `grade.yaml` `target_state` check that the
   zone serves `-all`/`p=reject` would make it gradeable, but isn't required for the rebalance.)

2. **01 — optional shallow-deepen** *(S; promotable — no new env).* The lab's *break* half (tamper CBC
   vs GCM, observe) is strong, and the correct-AEAD build already exists as the **required Automate step**
   (`encrypt-aead.py`, random-IV GCM with tag in output). If we want 01 to read as break-then-build like
   02–08 rather than break-then-observe, promote one verified round-trip into the Do steps: after the
   tamper experiment, **encrypt→decrypt a message with random-IV AES-GCM and confirm it round-trips, then
   show a flipped tag is rejected.** Low priority — 01 is legitimately the primitive-orientation lab and
   02 immediately delivers the full random-IV build-and-verify, so this is polish, not a gap.

## Non-goals / cautions

- **Don't overcorrect — this is the expected "already balanced" track.** 02–08 are model break-then-build
  labs; leave them. 01 (primitive orientation) and 10 (integrative audit) are pure by design — 10's job
  *is* to produce the structured audit/report across given configs, exactly as cloud 14 and ztna 04 are
  pure; do not bolt a "build" half onto it.
- **No new module.** Post-quantum is a future watch item, not a defensible hole today; adding it would be
  breadth against the charter's "don't gold-plate."
- The single fix (09) touches the module `README.md` (objective + key concepts, in `plaintext`) and the
  lab `lab.md` Do-steps + success criteria (in `plaintext-labs`), and must keep `make up`/`make demo`
  validated and `mkdocs build --strict` green — the same dual-repo discipline the cloud/ztna rebalances
  followed. It rests on the existing bind9 env (writable mounted zone), so it needs **re-validation of
  `make demo`**, not new env scaffolding (Docker may be unavailable in-session → run `make up && make
  demo && make down` on a Linux runner before marking done).
