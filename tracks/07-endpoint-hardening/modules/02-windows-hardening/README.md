# Module 02 — Windows Hardening to CIS

*Type 4 · Audit→Build→Verify — score a Windows host with CIS-CAT Lite, apply a subset of CIS Level 1 controls via version-controlled LGPO, then rescan and diff the before/after JSON to quantify the improvement. The diff, not the raw score, is the deliverable. (Secondary: Build-&-Operate — the controls are applied as reproducible, version-controlled configuration.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**[Track 07 — Endpoint & Host Hardening]** — *A CIS benchmark is only useful when it's applied, measured, and version-controlled.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    The CIS Windows Benchmark is the industry's reference hardening standard — but "we apply CIS" is
    a claim that needs evidence. This module runs the full cycle: scan a host with CIS-CAT Lite,
    apply Level 1 controls via version-controlled LGPO, then rescan and *diff* the before/after JSON.
    The diff — which controls moved from fail to pass — is the deliverable, not the headline score.
    Treat the GPO export as code in git, and remember the benchmark is a floor, not a ceiling.

## Why this matters

Windows is the dominant enterprise endpoint OS, and the CIS Microsoft Windows Benchmarks are the industry's most widely referenced hardening standard — referenced by NIST, DoD, and most compliance frameworks by name. "We apply the CIS benchmark" is a commitment that requires evidence: a before/after compliance score, reproducible configuration-as-code, and a process for detecting drift. This module teaches the full cycle, not just the checklist.

## Objective

Apply a representative subset of CIS Windows Level 1 controls to a Windows host using LGPO, score the result with CIS-CAT Lite, and parse the before/after JSON report to quantify the improvement — all using reproducible, version-controlled configuration.

## The core idea

The CIS Windows Benchmarks exist in two levels. Level 1 is the baseline — settings that reduce attack surface without significantly breaking functionality. Level 2 tightens further but introduces operational friction (blocking USB entirely, stricter application allow-listing) that many environments can't absorb. For most organisations the right starting point is Level 1, applied fully and verifiably, rather than a selective cherry-pick that produces a false sense of coverage.

LGPO (Local Group Policy Object) is Microsoft's free tool for applying and exporting GPO settings to a local machine without a domain. For domain environments you'd use Group Policy itself; LGPO is the local equivalent that lets you import a GPO backup directly. The CIS Benchmark ships GPO backups you can import verbatim. The key discipline is treating these GPO exports as code: they live in version control, they are applied via script, and they are tested before production rollout. A GPO that was applied interactively through the Group Policy editor — and only in the editor — is configuration that nobody can reproduce.

!!! note "The mental model"
    The score is not the point — the *diff* is. Scan before any change, apply controls, rescan, and
    read which rules moved from fail to pass (a closed gap) versus which stayed at fail after you
    applied them (the GPO didn't take effect — a config-management failure to diagnose).

CIS-CAT Lite is the free tier of the Center for Internet Security's configuration assessment tool. It ingests the host's current settings and scores them against a benchmark profile, producing a JSON or HTML report with per-control pass/fail status. The score itself matters less than the per-control breakdown: which controls passed, which failed, and which require manual verification because they can't be tested automatically. A 78% score with a known list of exceptions is better operational posture than a 92% score where nobody knows what the 8% contains.

The practical hardening workflow runs in three phases. First, export a baseline scan before any changes — this is your legal "before" evidence for a compliance audit and your rollback reference. Second, apply the benchmark controls in batches, starting with the ones that map to your threat model's top priorities (from module 01). Third, rescan and diff the reports. The diff, not the score, is where you learn: a control that moved from fail to pass is a closed gap; a control that stayed at fail after you applied it means the GPO didn't take effect, which is a configuration management failure worth diagnosing.

!!! warning "The gotcha"
    Benchmark compliance is not security equivalence. CIS Level 1 means you applied a widely-accepted
    baseline, not that you're secure — the benchmark was written for the *average* enterprise, and
    your threat model (module 01) is what tells you where you aren't average. Floor, not ceiling. And
    a GPO clicked through the editor and only the editor is configuration nobody can reproduce.

One common trap is treating benchmark compliance as security equivalence. CIS Level 1 compliance means you applied a widely-accepted baseline, not that you are secure. The benchmark was written for the average enterprise; your threat model (module 01) tells you where the average enterprise is not you. Use the benchmark as a floor, not a ceiling.

!!! tip "AI caveat"
    A model translates terse CIS control prose into `Set-ItemProperty`/`secedit` commands fast — but
    it can produce a command that sets the wrong key or skips the rationale. Verify each against the
    benchmark's rationale section and test in a throwaway VM before it touches anything real.

## Learn (~4 hrs)

**CIS Benchmark and LGPO**
- [CIS Microsoft Windows 11 Benchmark (CIS free PDF)](https://www.cisecurity.org/benchmark/microsoft_windows_desktop) — register for the free download; read Sections 1–2 (the scope and methodology) and skim the Level 1 control list. You do not need to read all 600 pages — understand the structure.

**CIS-CAT Lite**
- [CIS-CAT Lite overview and download](https://www.cisecurity.org/cis-cat-lite) — free configuration assessment; read the quick-start guide to understand the report format.

**Microsoft Security Baseline**
- [Microsoft Security Compliance Toolkit](https://www.microsoft.com/en-us/download/details.aspx?id=55319) — Microsoft's own baseline GPO backups, which overlap substantially with CIS Level 1; a useful cross-reference.
- [Windows security baselines (Microsoft Learn)](https://learn.microsoft.com/en-us/windows/security/operating-system-security/device-management/windows-security-configuration-framework/windows-security-baselines) — conceptual overview of the baseline program; read the "What is a security baseline?" section.

**Group Policy as code**
- [Microsoft — "LGPO.exe utility" (Security Baselines documentation)](https://techcommunity.microsoft.com/blog/microsoft-security-baselines/lgpo-exe-local-group-policy-object-utility-v1-0/701045) — how LGPO imports and *exports* policy as text-based `.PolicyRules` / registry.pol files, which is what makes a local GPO version-controllable and diffable. Read the import/export and parse-to-text sections so your hardening baseline lives in git, not a clicked-through UI.

## Key concepts

- CIS Level 1 = baseline (minimal operational disruption); Level 2 = hardened (some functionality trade-offs).
- LGPO applies GPO backups to a local (non-domain) host; reproducibility requires version-controlling the GPO export.
- CIS-CAT Lite scans and scores the host against a benchmark profile; the per-control breakdown matters more than the aggregate score.
- Always scan *before* applying changes — the before/after diff is both your audit evidence and your rollback reference.
- Benchmark compliance is a floor, not a ceiling; your threat model (module 01) determines what lies above it.

## AI acceleration

Use an AI assistant to translate CIS control descriptions into PowerShell registry or GPO commands — the benchmark prose is terse, and AI is good at producing the `Set-ItemProperty` or `secedit` equivalent. Then verify each command against the benchmark's rationale section and test it in a non-production VM first. The model accelerates the mechanical translation; the rationale check is yours.

!!! question "Check yourself"
    - Why is the before/after diff the deliverable rather than the final compliance score?
    - What does it mean if a control stays at "fail" *after* you applied its GPO — and where do you look?
    - Why must the LGPO export live in version control rather than being clicked through the Group Policy editor?
