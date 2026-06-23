# Automation "Verdict" conversion — status

*Wave 3, track 1. Drafted in `planning/automation-d/` (prose-complete); live `tracks/10-automation`
untouched except the module-04 drift-loop lab env (built + validated early — see below). Honor-system.*

## Done (this push)
- **DESIGN.md** spine (per-module type + real anchors + conversion actions).
- **11 modules drafted** (README + lab.md) to their Verdict types:
  - 01 mindset → **Concept Autopsy** (Knight Capital 2012 + AWS S3 2017) + an **ADR** deliverable (the automate/assist/leave-manual cut line)
  - 02 IaC → **Build-&-Operate** (plan-diff = safety surface; state = credential)
  - 03 IaC scanning → **Gate** (fail-bad/pass-good + one justified suppression)
  - 04 config mgmt → **Build-&-Operate + Drift** (declare→inject→detect→reconcile→steady-state) — **lab env built & `make demo`-green**
  - 05 CI/CD → **Build-&-Operate** (reframed from static review to *operating a running gate*; Codecov 2021 anchor)
  - 06 containerising → **Tool-Build** (reusable trufflehog image as a product)
  - 07 enrichment → **Build-&-Operate** (durable collector/processor pipeline)
  - 08 SOAR → **Build-&-Operate** (human-in-the-loop gate as the design call)
  - 09 detection-as-code → **Gate + Eval Harness (#13 explicit)** (held-out corpus + scorecard + regression gate)
  - 10 reviewing AI → **Adversarial Review (#14)** (planted dangerous misconfigs; checklist + measured trust policy; CVE-2025-30066 tj-actions anchor; fixed the empty Learn subsection)
  - **NEW · Click-ops → IaC Migration** → **Type 12 Migration/Brownfield** — the curriculum's first; `terraform import` strangler-fig, prove zero-drift `plan`.

## Promotion remaining (next, for the automation merge)
1. **Placement of the Migration module** — insert after 03 (renumber 04–10 → 05–11) *or* append as 11. Decide.
2. **Lab-env builds** (the prose specs exist; build + `make demo`-validate in `plaintext-labs/automation/`):
   - **Migration** — the multi-state brownfield env (setup script → `import` → HCL → `make plan` zero-drift gate). Spec is appended to its lab.md.
   - **05 CI/CD** — the operating-gate env (gitleaks+checkov+SBOM, OIDC mock) replacing the old static-review harness.
   - **09 detection-as-code** — the held-out corpus + `rules-regressed/` + `eval.py` + `make eval`/`make gate` (mirror defensive 09 / ai-ops 11).
   - **10 reviewing-AI** — add the workflow + destructive-terraform artifacts + the extra scanners (currently ships only the Terraform half).
   - **01** — add the ADR template + scrub the env's `automation-assessment.md` Meridian.
   - **04** — ✅ already built & validated (drift loop).
3. **Resolve ~9 VALIDATE links**; **strip AUTHOR'S NOTE blocks** (a few carry Meridian — gone on strip); **scrub Meridian from the live automation lab envs** (data/main.tf, automation-assessment.md, etc. — the track wasn't previously scrubbed).
4. **Move prose → tracks/ + plaintext-labs**, wire nav, `mkdocs --strict`, then merge.

## Note
The module-04 drift-loop env is committed to the labs branch now (validated, additive — extra `make` targets;
old prose still works) so the submodule is clean for the ztna/ai-ops conversions. Its converted prose lands at automation promotion.
