# Audit — 00-foundations

**Verdict:** SHIP-READY with polish. All 12 modules clear the Definition-of-done bar — full anatomy, original bridge prose, grouped/time-boxed Learn paths with why-lines, real-world anchors, `*Last reviewed*` present, and validated `plaintext-labs/foundations/<module>` envs (Makefile in every dir). No blockers. Findings are consistency (tag-scheme split, renamed anatomy headings) and polish only.

## Per-module findings

- **01-security-principles** — [CONSISTENCY] type tag `*Variant D · …*` not `*Type N · …*` (P1 scheme split). Anatomy uses predict-then-reveal headings ("The case"/"The reveal") in place of literal "Why this matters"/"The core idea" — original prose, acceptable variant.
- **02-lab-setup** — clean. (Uses `*Type 11 · Decision/ADR …*` — the "Type N" scheme.)
- **03-docker** — [CONSISTENCY] type tag `*Variant D · …*`. [POLISH] Stretch has a duplicated/garbled CVE-2019-5736 walk-through block (Aqua + Unit 42 near-identical sentences stacked with openwall/Red Hat) — reads like a merge artifact, de-dup.
- **04-linux** — [CONSISTENCY] type tag `*Variant D · …*`. [POLISH] L5: one synthetic `Accepted` line overlaid on the real loghub log (genuine capture has no successful login) — disclosed in Setup + PROVENANCE.md; documented/mitigated, not a blocker.
- **05-windows** — [CONSISTENCY] type tag `*Variant D · …*`. [POLISH] README Event-ID table omits 4657 (Run-key write) which lab step 4 relies on — minor README↔lab gap. Anatomy headings renamed ("The case"/"The mental model").
- **06-networking** — [CONSISTENCY] type tag `*Variant D · …*`. L5: bundled beacon pcap is a SUNBURST-modeled stand-in but real path (`make fetch-data`, MTA.net RAT pcap) shipped alongside — within policy. Anatomy headings renamed ("The hook").
- **07-web-http** — [CONSISTENCY] type tag `*Variant D · …*`. Anatomy "core idea" renamed ("The reveal…"). Real anchor (Firesheep) + real target (Juice Shop) present — clean otherwise.
- **08-data-encoding** — [CONSISTENCY] type tag `*Variant D · …*`. Anatomy headings renamed ("The artifact"/"The verdict"). [POLISH] double blank line between front-matter and "## The artifact" (cosmetic). Real anchors (LummaC2 AA25-141B, CISA KEV, T1059.001/T1105).
- **09-cryptography** — [CONSISTENCY] type tag `*Variant D · …*`. Anatomy narrative headings ("The case"/"The reveal"); no literal "Why this matters". [POLISH] BASELINE tier.
- **10-scripting** — [CONSISTENCY] type tag `*Type 9 · Tool-Build …*` (the other "Type N" exemplar). Anatomy uses "The scale problem"/"The mental model"/"The review skill" — objective folded into prose, no literal "Objective"/"The core idea" headings. [POLISH] BASELINE tier.
- **11-version-control** — [CONSISTENCY] type tag `*Variant D · …*`. [POLISH] BASELINE tier; lab is git-only (no container) and correctly says so — fine.
- **12-threat-modeling** — [CONSISTENCY] type tag `*Variant D · …*`. Anatomy narrative headings ("The case"/"Your job"); no literal "Why this matters"/"Objective". [POLISH] BASELINE tier.

## Cross-cutting

- **Type-tag scheme split (CONSISTENCY, systemic):** 10 of 12 modules tag `*Variant D · …*`; only 02 (`Type 11`) and 10 (`Type 9`) use the `*Type N · …*` scheme the P1 rubric expects. The `Variant D` tags are intentional pedagogy labels (predict-then-reveal), not malformed — but the "Type" vs "Variant" wording is inconsistent across the track. Pick one convention.
- **Renamed anatomy headings (CONSISTENCY, systemic):** most modules replace literal "Why this matters" / "The core idea" / "Objective" headings with bespoke predict-then-reveal headings ("The case"/"The hook"/"The artifact" + "The reveal"/"The verdict"). Prose quality clears the bar in every case; only the canonical heading *names* deviate.
- **Formatting tier:** all 12 are BASELINE (no `!!! abstract "In 60 seconds"`, admonitions, or `!!! question "Check yourself"`). Consistent with each other — no DELUXE module in the track to set a higher bar.

## Counts

- BLOCKERS: 0
- CONSISTENCY: 12 (10× type-tag scheme + 03/05 README↔lab gaps; the renamed-heading + tag-scheme items are systemic)
- POLISH: 8 (03 dup CVE block, 04 synthetic line, 05 missing Event ID, 08 blank-line, + BASELINE-tier notes on 09/10/11/12)

## Top-3 fixes

1. Unify the type-tag scheme: convert `*Variant D · …*` to a `*Type N · …*` label (or vice-versa) so all 12 read consistently against the P1 rubric.
2. 03-docker: de-duplicate the garbled CVE-2019-5736 walk-through block in the Stretch section (merge artifact).
3. 05-windows: add Event ID 4657 to the README Event-ID table so it matches lab step 4 (Run-key write).
