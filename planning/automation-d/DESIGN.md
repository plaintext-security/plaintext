# Automation Track (10) — "Verdict" conversion spine

*Wave 3, track 1 (maintainer-prioritized). Converts `tracks/10-automation` to the type-driven model.
Drafted in `planning/automation-d/` (prose-complete; live track untouched), then promoted — the proven
foundations pipeline. Honor-system: NO grading/receipts/grade.yaml. Per-module brief below; each module
is authored against its row.*

## Thesis

Automation is a **Build-&-Operate + Judgment-as-Code** discipline, bookended by **judgment**: a Concept
Autopsy on an automation *disaster* at the front (01) and Adversarial Review of AI-written automation at
the back (the reviewing module). The anchor class here is **engineering disasters, not breaches** — the
lesson is *"automation doesn't make you safer; it makes you faster, including at being wrong — the gate
and the review are the point."* So the track leans on Family II (build/gate) for its spine, Family I only
at the bookends, and it's where three new constructs land: **Migration (#12), Drift (#16), and an explicit
Eval Harness (#13)**.

## Conversion at a glance (from `type-pass/10-automation.md`)

The track is already strong (7 of 10 clean fits). The conversion is mostly **sharpening anchors + naming
types + closing 3 construct gaps**, not wholesale rewrites:
- **Add** a Migration module (click-ops→IaC) — the biggest gap.
- **Fold Drift into 04** (config mgmt) — build the detect→reconcile loop, not just idempotency.
- **Make 09's Eval Harness explicit** (held-out corpus + scorecard + regression gate).
- **Reframe 01** to a named-disaster Concept Autopsy + ADR; **reframe 05** from static review to operating
  a running gate; **fix 10's** empty Learn subsection.

## House rules (bind every module)

- Two files (`README.md` + `lab.md`); lab.md is the symlinked source-of-truth in `plaintext-labs/automation/`.
- **Preserve the real tool content** (Terraform/OpenTofu, checkov/tfsec, Ansible, GitHub Actions, n8n/Shuffle,
  Sigma/pytest, trufflehog) — change the *frame and the deliverable*, not the rigor.
- **Build-first, not predict-then-reveal**, for Families II/III (most of this track). Reserve predict-then-
  reveal for 01 (the autopsy) where intuition ("automation = safer") is instructively wrong.
- Real anchors, cite primary sources, no invented URLs (`<!-- VALIDATE -->` if unsure).
- **Neutral framing** — scrub any "Meridian"/fictional company to generic names.
- Honor-system; the "Automate & own it"/deliverable is the committed artifact (gate, ADR, migration runbook,
  drift loop, eval scorecard, review checklist) — no grader.

---

## Per-module spine (the authoring brief)

> Source module = `tracks/10-automation/modules/<same-name>` + its lab env `plaintext-labs/automation/<same-name>`.
> Draft output = `planning/automation-d/modules/<name>/{README.md,lab.md}`.

**01 · The Automation Mindset** — **Type 1 Concept Autopsy** (+ Type 11 ADR deliverable).
- **Anchor:** **Knight Capital 2012** ($440M lost in ~45 minutes when an automated deploy left old code +
  a repurposed feature flag live on one of eight servers). Secondary: the **2017 AWS S3 outage** (a fat-fingered
  runbook command took out S3 us-east-1). Predict-then-reveal: *"automation makes you safer, right?"* →
  reveal: it makes you *faster*, including at being wrong, at a scale and speed humans can't catch — the
  **gate/review/rollback is the point**, and *what* you automate is a judgment.
- **Deliverable:** an **ADR** defending the automate / assist / leave-manual **cut line** for a set of
  security tasks (Context · Options · Decision · Consequences) — seeds the ADR construct early. Plus the
  one-paragraph autopsy mapping Knight Capital to "no gate, no kill-switch, no review."

**02 · Infrastructure as Code** — **Type 7 Build-&-Operate** (secondary: Concept Autopsy flavor).
- **Anchor:** the toil of click-ops infra with no history/review/repeatability; ground the stakes in a real
  `terraform apply`/state mishap (e.g. a destructive plan applied to prod, or a leaked state file). Keep the
  plan→apply→destroy + local-provider lab. **Deliverable:** reproducible infra from zero, reviewed, with the
  plan-diff as the safety surface.

**03 · IaC Security Scanning** — **Type 8 Judgment-as-Code / Gate** (clean fit; keep, lean into gate language).
- **Anchor:** the misconfig class that ships in real Terraform (unencrypted S3, `0.0.0.0/0`, `*` IAM — the
  Capital One / 2017-S3-leak shapes), caught **before** apply. checkov/tfsec exit codes block `tofu apply`;
  suppression-with-justification is the judgment. **Deliverable:** the CI gate, proven fail-bad/pass-good.

**04 · Configuration Management + Drift** — **Type 7 Build-&-Operate + Type 16 Drift/Steady-State**.
- **Anchor:** configuration drift / snowflake servers causing an outage or a silent security regression.
  Keep Ansible idempotency, then **build the drift loop the type pass flagged as missing**: introduce an
  out-of-band change to a hardened host → **detect** it (`--check`/`--diff` or a scheduled scan) → **reconcile**
  → prove steady-state. **Deliverable:** the drift detector + the reconciliation run (not just an idempotent play).

**NEW · Click-ops → IaC Migration** — **Type 12 Migration / Brownfield** *(the biggest gap; pairs after 03)*.
- **Anchor:** the universal brownfield reality — infra was clicked together before anyone wrote IaC; you must
  adopt it without an outage. **Lab:** stand up a hand-created resource (a security group / bucket via the
  local provider or a docker stand-in), `terraform import` it into state, refactor to HCL **incrementally**
  (strangler-fig), and prove `plan` shows **zero drift** afterward — old path served throughout. **Deliverable:**
  the migration runbook + the zero-drift `plan` proof + a rollback note. *(Placement: insert as module 04,
  renumber 04–10→05–11 on promotion; or append as 11 to avoid renumber — decide at promotion.)*

**05 · CI/CD Pipelines & Gates** — **Type 7 Build-&-Operate** (secondary: Gate) — *reframe from static review*.
- **Anchor:** a real CI/CD supply-chain failure (Codecov 2021 — a tampered CI step exfiltrated secrets from
  thousands of pipelines; or the SolarWinds build-compromise as the cautionary backdrop). **Reframe** from
  "read/fix 3 insecure workflow files" (that's Adversarial Review) to **building and operating a running
  pipeline gate**: secret-scan + IaC-scan + SBOM gates from commit to deploy, with pinned action SHAs,
  least-privilege/OIDC tokens (tie to the repo's own T23 Actions-hardening). **Deliverable:** the hardened,
  operating pipeline that blocks a bad change.

**06 · Containerising Tooling** — **Type 9 Tool-Build** (clean fit; name it).
- **Anchor:** the "works on my machine" toil of un-containerised security tools. Package a reusable security
  tool (trufflehog image) others run — ENTRYPOINT/non-root/minimal-base/UX. **Deliverable:** the packaged,
  documented, reusable tool image.

**07 · Enrichment & Data Pipelines** — **Type 7 Build-&-Operate** (secondary: Tool-Build).
- **Anchor:** the toil of manual IOC enrichment at volume. Two-container collector/processor pipeline,
  directory-as-queue durability, observability; reuses 04's enrichment function. **Deliverable:** the
  scheduled pipeline feeding processed data downstream.

**08 · SOAR Fundamentals** — **Type 7 Build-&-Operate** (secondary: Gate).
- **Anchor:** alert fatigue / the toil of manual triage-contain-ticket. Working n8n/Shuffle playbook
  trigger→enrich→decide→respond with the **human-in-the-loop gate** as the central design call. **Deliverable:**
  the operating playbook + the four-scenario test (note: a scored test set would be a Type-13 stretch).

**09 · Detection-as-Code Pipelines** — **Type 8 Gate + Type 13 Eval Harness** *(make #13 explicit)*.
- **Anchor:** detections that rot / regress silently in production. Already has the bones (pytest
  `(rule,event,expected)` table + mandatory should-not-match FP cases + CI gate). **Lean hard into Eval
  Harness language** (mirror ai-ops 11 + the Wave-2 detection upgrades): a **held-out** event corpus, a
  **scorecard** (precision/recall/FP-rate), and a **regression gate** that fails a degraded rule. **Deliverable:**
  the versioned detections + the scored regression gate. This is automation's canonical #13 exemplar.

**10 · Reviewing AI-Generated Automation** — **Type 14 Adversarial Review** (flagship; clean fit).
- **Anchor:** AI writes plausible, structurally-sound, **semantically-dangerous** automation (an over-broad
  IAM policy, a `pull_request_target` with secrets, an unpinned action). Catch the planted dangerous
  misconfigs, codify a reusable **review checklist + a trust/suppression policy** (and a measured threshold,
  not just vibes). **Fix the empty "AI code review patterns" Learn subsection** (add real links). **Deliverable:**
  the review findings + the checklist. This is the curriculum's Type-14 template alongside python 10.

## Phases (unchanged structure, reframed)
- **Phase 1 · Infra & config as code (01–04 + Migration)** — define infra in Terraform/OpenTofu, gate it,
  manage config + drift, and migrate a brownfield resource in.
- **Phase 2 · Pipelines & portable tooling (05–07)** — operate a hardened CI/CD gate, a containerised tool,
  a scheduled enrichment pipeline.
- **Phase 3 · Respond & review (08–10)** — a SOAR playbook, detections-as-code with a scored regression gate,
  and rigorous review of AI-written automation.

## Promotion notes (for later)
- Renumber decision for the Migration module (insert at 04 vs append at 11).
- Lab-env work: build the Migration multi-state env + the 04 drift loop + make 09's held-out corpus explicit
  in `plaintext-labs/automation/`. Resolve VALIDATE; scrub Meridian; `mkdocs --strict`; STATUS.
