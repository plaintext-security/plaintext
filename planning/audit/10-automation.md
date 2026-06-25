# Audit — Track 10 (Security Automation)

**Verdict:** Strong, near-complete track — consistent lab template, grouped/time-boxed Learn paths, real-world anchors. One BLOCKER: a duplicate-`11` numbering collision where `11-clickops-iac-migration` is a spec-only (unbuilt) lab orphaned from the track README. Type-tag format is inconsistent (Variant D vs Type N). Note: no module/lab uses a tiered BASELINE/DELUXE structure (P5 N/A across track — "baseline" appears only as the literal hardening-baseline noun).

## Per-module findings

- **01-automation-mindset** — [CONSISTENCY] P1 tag is `Variant D · …` not `Type N · …`; [POLISH] P2/P3 anatomy deliberately replaces "The core idea" with "The case"/"Call it"/"The reveal" autopsy (intentional but deviates from standard anatomy); lab has no auth note (none needed — no target).
- **02-infrastructure-as-code** — clean.
- **03-iac-security-scanning** — [CONSISTENCY] P1 tag is `Variant D · …` not `Type N`.
- **04-configuration-management** — clean (Type 7; CISA AA23-278A + CIS anchors real).
- **05-cicd-pipelines** — clean.
- **06-containerising-tooling** — clean (Type 9; trufflehog real tool).
- **07-enrichment-pipelines** — clean (Kreps Log essay + SQS DLQ anchors solid).
- **08-soar-fundamentals** — clean (n8n env real, four-scenario test).
- **09-detection-as-code-pipelines** — [CONSISTENCY] P1 tag is `Variant D · …` not `Type N`.
- **10-reviewing-ai-automation** — [CONSISTENCY] P1 tag is `Variant D · …` not `Type N` (CVE-2025-30066 anchor real).
- **11-clickops-iac-migration** — [BLOCKER] L4 lab is spec-only: `plaintext-labs/automation/11-clickops-iac-migration/` has only `lab.md`, NO Makefile/compose/env; lab.md carries a "Lab-env spec (to be built at promotion)" section = unbuilt stub. [BLOCKER] numbering collision: this is the second `11-*` dir; track README omits it entirely and claims "eleven modules," so it is an orphan (in mkdocs nav but not the README module table). [CONSISTENCY] P1 tag `Type 12 · …`.
- **11-pipeline-secrets** — clean as a module (Type 7; OIDC env real with `check_no_static_secret.py`), but shares the `11` number with clickops — it is the one the README treats as canonical module 11.

## Counts
- BLOCKER: 2 (both on 11-clickops: unbuilt lab + numbering collision/orphan)
- CONSISTENCY: 5 (four Variant-D tag-format mismatches: 01/03/09/10 + 11-collision)
- POLISH: 1 (01 non-standard anatomy)
- Clean modules: 7 of 12 (02,04,05,06,07,08,11-pipeline-secrets)

## Top-3 fixes
1. Resolve the duplicate `11`: renumber `11-clickops-iac-migration` → `12-…` (or demote/move it) across dir name, mkdocs nav, and the track README module table; today it is in nav but absent from the README.
2. Build the `11-clickops-iac-migration` lab env in `plaintext-labs` (Makefile + OpenTofu local-provider compose per the in-file spec) and run `make up && make plan`, or explicitly mark the module non-shipping until then — a spec-only lab is a stub per Definition of Done.
3. Normalize P1 type tags: 01/03/09/10 use `Variant D · …`; either standardize all to the `Type N · …` form or document the Variant taxonomy so the track is internally consistent.
