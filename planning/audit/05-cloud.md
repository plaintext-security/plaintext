# Audit — Track 05-cloud

**Verdict:** Labs are gold-standard (all 17 modules ship a validated `plaintext-labs/cloud/<module>/` env with Makefile/compose, real artifacts, Automate-&-own-it, template-complete). The single systemic defect is the missing `*Type N · …*` tag on 16/17 modules — track-wide [CONSISTENCY]. No [BLOCKER]s. Anatomy uses the track's intentional case/job/reveal house style (not the generic Why/Objective/Core-idea headings) — treated as design, not defect.

## Per-module findings (FINDINGS only)

- **01-cloud-fundamentals:** [CONSISTENCY] missing `*Type N*` tag (has "Variant D" only); [POLISH] core-idea bridge under "The model, revealed" heading not "The core idea".
- **02-cloud-identity-iam:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] bridge under "The blast radius, revealed".
- **03-iam-attack-paths:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] bridge under "The graph, revealed".
- **04-cloud-network-security:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] bridge under "The reachability model, revealed".
- **05-posture-auditing:** [CONSISTENCY] missing `*Type N*` tag. (otherwise clean — full anatomy, S3-wave/UpGuard/Verizon anchors.)
- **06-iac-security:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] build-first variant structure ("Where the breaches start"/"Predict it before you scan") deviates from sibling reveal pattern (intentional but inconsistent).
- **07-secrets-management:** [CONSISTENCY] missing `*Type N*` tag. (clean otherwise — Uber-2016 anchor, lab env + auth note + automate verified.)
- **08-cicd-security:** [CONSISTENCY] missing `*Type N*` tag. (clean — SolarWinds/SUNBURST anchor.)
- **09-serverless-security:** [CONSISTENCY] missing `*Type N*` tag. (clean — Denonia/Cado-2022 anchor.)
- **10-container-image-security:** [CONSISTENCY] missing `*Type N*` tag. (clean — docker123321/Codecov-2021 anchors.)
- **11-container-escape-runtime:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] non-standard anatomy (exploit/mental-model/gap headings, shorter bridge ~150w). Anchor CVE-2019-5736.
- **12-kubernetes-rbac-network:** [CONSISTENCY] missing `*Type N*` tag. (clean — Tesla/RedLock cryptojacking anchor, auth note explicit.)
- **13-kubernetes-admission-runtime:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] auth note informal (blockquote) vs explicit elsewhere. Anchor Graboid.
- **14-cloud-attack-techniques:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] bridge split across "loudness question"/"ATT&CK vocabulary" headings. Anchor LastPass; LocalStack env.
- **15-cloud-logging-detection:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] auth note implicit-only in Setup. Anchors Capital One/LastPass.
- **16-cloud-incident-response:** [CONSISTENCY] missing `*Type N*` tag; [POLISH] auth note implicit-only in Setup. Anchor LastPass.
- **17-data-protection-kms:** clean — only module with `*Type N*` tag (`Type 7 · Build-&-Operate (+ Type 3 · Blast-Radius)`); full env, anchor Capital One.

## Notes
- **BASELINE/DELUXE tiering** is absent across the entire track. This appears to be a deliberate track-wide design choice rather than a per-module omission, so not flagged per-module; confirm whether the track is exempt from the tier convention.
- All 17 lab environments exist with Makefile + compose and real artifacts (LocalStack / Vulhub-style images / CloudGoat-equivalents). No missing-env [BLOCKER]s.

## Counts
- [BLOCKER]: 0
- [CONSISTENCY]: 17 (one per module — all the missing type tag)
- [POLISH]: ~9 (heading/anatomy/auth-note inconsistencies on 01–04, 06, 11, 13, 14, 15, 16)

## Top-3 fixes
1. Add the `*Type N · …*` tag line to all 16 modules missing it (01–16), matching the 17-data-protection-kms exemplar and the broader-curriculum convention. (Single highest-impact, track-wide.)
2. Standardize the auth-note placement/format on attack labs — make 13/15/16 carry an explicit authorization note like 12/14 rather than implicit-in-Setup or blockquote.
3. Decide and document the track's position on BASELINE/DELUXE tiering and on the reveal-heading house style (case/job/reveal vs Why/Objective/Core-idea) so the per-module variance (06, 11, 14–16) is either normalized or formally sanctioned.
