# Spike findings — floci as LocalStack replacement (Task group 1)

**Date:** 2026-08-05 · **floci version tested:** `floci/floci:1.5.34` (Docker Hub) · **host:** aws-cli 2.36.1

## Verdict: floci is a clean drop-in. Proceed with floci-default across all 8 labs.

## Environment facts (de-risks the whole change)
- **License:** MIT — compatible with CC BY 4.0 redistribution. No blocker. *(Task 1.1 ✓)*
- **Image:** `floci/floci:1.5.34` on Docker Hub; `:latest` and pinned `:1.5.34` both resolve and pull.
  (Old `hectorvent/floci` is deprecated; `floci/floci` is official.)
- **Same wire as LocalStack:** listens on `:4566`, health path **`/_localstack/health`** works
  identically (so existing compose health checks need **no change**), account id `000000000000`,
  same `AWS_ACCESS_KEY_ID=test`/`AWS_ENDPOINT_URL` env convention.
- **Fast/light:** native Quarkus image, starts in ~0.02s, "Ready." in ~1s. Seeds **52 AWS managed
  IAM policies** at boot.

## Per-lab API probe results *(Tasks 1.2, 1.3 ✓)*

| Lab | API exercised | Result |
|---|---|---|
| 01 fundamentals | `s3 mb`/`ls`, `sts get-caller-identity` | ✅ works |
| 02 iam | `iam create-role`/`put-role-policy`, **`simulate-principal-policy`** | ✅ **real evaluation** — `allowed` for granted action, `implicitDeny` for ungranted. This was the biggest risk; it's genuinely implemented. |
| 03 iam-attack-paths | IAM enumeration, `sts assume-role` | ✅ works (assume-role returns real temp `ASIA…` creds) |
| 05 posture (prowler) | `sts get-caller-identity` + broad services | ✅ STS responds. **prowler's hardcoded public STS URL is a prowler-side issue** (the existing `patch-prowler-localstack.py`), independent of floci — port the patch to honor `AWS_ENDPOINT_URL`; likely still real-AWS-first for true posture depth. |
| 07 secrets | `secretsmanager create-secret`/`get-secret-value` | ✅ works |
| 09 serverless | `lambda create-function`/`list-functions` ✅; **`invoke`** ❌ w/o docker socket | ⚠️ create/enumerate work (covers the execution-role pedagogy). **Invoke needs `-v /var/run/docker.sock:/var/run/docker.sock`** mounted into the floci service (floci runs Lambda in real containers). Documented setup requirement, not a blocker. |
| 14 attack-techniques | `sts assume-role`, STS | ✅ works (assume-role chain viable) |
| 17 kms | `kms create-key`, `generate-data-key`, `encrypt`/`decrypt` | ✅ **full envelope roundtrip** (Plaintext+CiphertextBlob, decrypt recovers plaintext) |

## Implications for the plan
- **No health-check or endpoint changes** needed in compose — only the `image:` line and dropping
  `awslocal`. The swap is even more mechanical than assumed.
- **`simulate-principal-policy` works**, so lab 02's "prove the wall holds" step can stay on floci
  (real AWS remains the optional enforcement-truth upgrade, not a necessity).
- **Lab 09 compose must mount the Docker socket** for `invoke`; note this in its lab + Makefile.
- **Lab 05 (prowler)** stays the most likely **real-AWS-first**: STS works, but the prowler patch is
  prowler-internal and posture depth wants a real account. Re-evaluate `.ci-skip` after porting.
- **Detection (14/capstone):** GuardDuty/real CloudTrail delivery still not emulated (as expected) —
  unchanged by this migration; those rely on shipped sample events or the real-AWS route regardless.

## Open questions resolved
- Pinnable tag? **Yes** — `floci/floci:1.5.34`. · License? **MIT.** · IAM simulate? **Yes.** · KMS? **Yes.**
- Lambda fidelity (09)? **create/enumerate yes; invoke needs docker.sock mount.**
- Remaining open: prowler-on-floci end-to-end scan time/coverage (defer to task 4.1 on real lab).
