# Cloud track — build-vs-find balance audit & rebalance plan

*Prompted by: "we teach detecting secret leaks but not safely handling secrets — is that prevalent? should it be reevaluated?" Audit done 2026-06-11 against the actual **labs** (where the find-vs-build skew really shows), not just the concept objectives.*

## TL;DR

The track is **more balanced than the concept pages imply.** Most labs follow *attacker→fixer* or
*audit→remediate→verify*, which is genuinely proactive. The skew is real but **narrow**: three
audit/attack labs stop before the "now build it right" half, one module (secrets) practices the
proactive side but shallowly, and there is **one true topical hole — data protection / KMS.**
Recommendation: surgical fixes (add a build half to 3 labs, deepen 1), plus a decision on a new
KMS module. No teardown.

## What "proactive / build & operate securely" means here

Not just "remediate a finding," but hands-on *designing, building, and operating* a secure control:
authoring least-privilege policy and proving it, standing up and operating a control (secret store,
guardrail, key policy, segmentation), encryption/key management, preventive policy-as-code. The
charter's attacker→fixer pattern already delivers a lot of this — the audit is about where it's
*missing*.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a proactive "build/operate" half? | Verdict |
|---|--------|-----------------|----------------------------------------|---------|
| 01 | Cloud Fundamentals | enumerate, inspect, map to SRM | no | **By design** — foundational orientation lab |
| 02 | Cloud Identity & IAM | enumerate perms, trace escalation, iam-simulator | **no** — never authors/verifies a least-priv fix | **Add build half** |
| 03 | IAM Attack Paths | graph, trace hops, identify minimum cut-set | partial — cut-set is identified, not implemented/verified | OK; could implement+re-verify the cut |
| 04 | Cloud Network Security | cloudmapper audit, SG findings, flow logs | **no** — maps/finds but never builds the fix/segmentation | **Add build half** |
| 05 | Posture & Misconfig Auditing | prowler, triage, draft+verify remediation | yes — remediate & verify | **Balanced** |
| 06 | IaC Security | scan, fix, suppress, **write CI gate** | yes — fix + preventive CI gate | **Balanced (proactive)** |
| 07 | Secrets Management | trufflehog find → Vault store, policy, least-priv token, rotate | yes, but **shallow operate** — no dynamic/leased creds, no app-fetch-at-runtime, manual rotation only, no cloud-native store (Secrets Manager/SSM) | **Deepen operate side** |
| 08 | CI/CD Security | gitleaks, trivy, SBOM, **write hardened workflow** | yes — harden the pipeline | **Balanced** |
| 09 | Serverless Security | enumerate, inject, **fix code + least-priv IAM + redeploy** | yes — attacker→fixer | **Balanced** |
| 10 | Container & Image Security | scan images, remediation decision (Dockerfile hardening) | partial — hardening is light/implied | OK; could make the hardened rebuild explicit |
| 11 | Container Escape & Runtime | exploit escape, **deploy + tune Falco** | yes (detection-as-build) | **Balanced** |
| 12 | K8s RBAC & Network | kube-bench, exploit, **apply least-priv RBAC + NetworkPolicies** | yes — strong build half | **Balanced (proactive)** |
| 13 | K8s Admission & Runtime | **write Kyverno policies** (prevent) + Falco | yes — policy-as-code prevention | **Balanced (proactive)** |
| 14 | Cloud Attack Techniques | detonate T1078.004/T1530/T1537, map ATT&CK | no | **By design** — purple-team attack-sim; feeds 15/16 |
| 15 | Cloud Logging & Detection | map events, **write Sigma rule** | yes (detection-as-build) | **Balanced** |
| 16 | Cloud Incident Response | reconstruct timeline, IOCs, extend triage.py | yes (respond/automate) | **Balanced** |

**Tally:** ~10 balanced/proactive · 3 "by design" pure (01 foundational, 14 attack-sim) · **2 audit-only
that should gain a build half (02, 04)** · 1 to deepen (07) · 2 minor (03, 10).

## The one structural hole: Data Protection / KMS

No module covers cloud key management — **KMS, envelope encryption, key policies & grants,
encryption at rest/in transit, BYOK/rotation.** Track 08 (Cryptography) covers crypto generally, but
the cloud-native KMS surface (who can use a key, key-policy vs IAM, default-encrypt config, snapshot/
S3/EBS encryption) is its own thing and is absent. For a cloud-security track this is the most
defensible gap to fill — and it's almost entirely "build & operate," which also rebalances the track.

## Status (updated 2026-06-11)

Executed on branch `feat/cloud-rebalance` (both repos), each lab `make up`/`make demo` validated:
- ✅ **07** — operate side added (Vault dynamic DB creds + runtime-fetch app + root rotation +
  Secrets Manager/IAM variant). New services: Postgres, LocalStack.
- ✅ **04** — build half added (`check_reachability.py`: author least-priv SGs, prove bad paths denied /
  good paths intact). Also fixed a pre-existing cloudmapper build break (3.12→3.9 + source install).
- ✅ **02** — build half added (`check_escalation.py`: author the minimum-cut least-priv policy that
  closes the PassRole escalation, prove it). 
- ✅ **17 (new)** — Data Protection & KMS module created: envelope encryption + key-policy separation
  of duties (`check_keypolicy.py`). Concept + lab + nav + track map + landing counts.
- ✅ **Minor:** 03 implement+verify the cut-set (`graph-fixed.json` → analyze.py exit 0); 10
  hardened-rebuild verify (`make harden-verify` gates on MEDIUM+; bad fails with 2 HIGH, hardened
  passes). Both validated; also fixed pre-existing trivy/grype install break (multi-stage copy from
  the official tool images).

Not pushed yet (holding per request). Each lab change is in the `plaintext-labs` submodule; the
`plaintext` feat branch advances the submodule pointer.

## Rebalance plan (sequenced, smallest-disruption first)

1. **07 — deepen the operate side** *(S, highest value/lowest disruption).* Keep the find half; extend
   the build half to: mint a **dynamic/leased** credential (Vault DB secrets engine), have a small app
   **fetch it at runtime** (not env-var), and **automate rotation**. Add an AWS-native variant
   (Secrets Manager/SSM + IAM-gated read) so it isn't Vault-only. Reframe the module so safe handling
   is co-equal with detection, not a sequel to it.
2. **04 — add a build half** *(S–M).* After mapping and finding the bad Security Groups, have the learner
   **author the corrected SG ruleset + a default-deny baseline and re-verify reachability** (mirrors how
   12 ends in NetworkPolicies). Turns a pure-audit lab into audit→build→verify.
3. **02 — add a build half** *(S).* After tracing the escalation, have the learner **author the
   least-privilege policy that closes it and re-run `iam-simulator` to prove the path is gone** (mirrors
   03's cut-set, made concrete). Closes the "enumerate but never fix" gap.
4. **New module — Data Protection & KMS** *(M–L, structural decision).* Envelope encryption, key
   policies vs IAM, grants, default-encryption config, snapshot/bucket encryption, rotation. Slots well
   after 04 (network) or alongside 07 (secrets) as the "protect the data" pair. Mostly build/operate.
5. **Minor, opportunistic:** 03 implement+re-verify the cut-set; 10 make the hardened multi-stage rebuild
   an explicit graded step.

## Non-goals / cautions

- **Don't overcorrect.** Attacker→fixer is pedagogically strong; the goal is to fill the 2–3 audit-only
  gaps and the KMS hole, not to bolt a "build" half onto every attack/detect lab (01 and 14 are pure by
  design and should stay that way).
- Any change touches **both repos** (prose in `plaintext`, lab env in `plaintext-labs`) and must keep
  `mkdocs build --strict` green and ship a validated `make up`/`make demo`.
- Correction to an earlier verbal claim: module 07 is **not** "detection-only" — its lab already does
  Vault store/policy/rotation. The real gap is *operate-depth* (dynamic creds, runtime integration,
  automated rotation, cloud-native store), which is why the rec is "deepen," not "add from scratch."
