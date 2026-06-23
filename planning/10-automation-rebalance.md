# Automation track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual
**labs** (the real `lab.md` Do-steps, Makefiles, and compose files under
`plaintext-labs/automation/`), not just the concept objectives. The recurring question — "does the
learner only *run/read* the provided automation, or do they **author it and prove it
triggers/blocks/remediates**?" — applied module by module to Track 10.*

## TL;DR

Security automation is **build-oriented by nature, and this track lives up to it.** Nine of ten labs
have the learner *author* an artifact — a Terraform config, an Ansible role, a `processor.py`, an
enrichment-and-ticket workflow, Sigma tests, CI gates — and *prove* it works, almost always including
a **negative/deny case** (the gate exits 1 on the bad config, the FP-suppression passes, the second
Ansible run shows 0 CHANGED, the broken Sigma rule fails `sigma check`). This is the **most uniformly
build-and-verify track audited so far** — even more than ZTNA. The skew is **a single shallow spot,
not a gap**: the SOAR lab (08) has the learner build and test enrich→route→ticket across four
scenarios, but the **human-in-the-loop approval gate** — the feature the capstone rubric requires at
*Proficient*, and the thing that distinguishes a SOAR playbook from a linear script — is demoted to a
*stretch*. Recommendation: one surgical promotion (08's approval-gate stretch → core), and a decision
on one defensible structural hole (pipeline secrets handling / OIDC). No teardown — the same
conclusion the cloud and ZTNA audits reached, only more so.

## What "build & operate the automation" means here

For an automation track the bar is the track's whole thesis: not "run the provided pipeline" or "read
the playbook," but **author the automation yourself and prove it does the right thing on both the
positive and the negative case** — the gate *blocks* the bad config and *passes* the fixed one; the
playbook *routes* the unknown verdict and *creates a ticket* even when enrichment is down; the role is
*idempotent* on re-run; the detection *fires* on the malicious event and *stays silent* on the benign
one. "AI authors → you review → scanners gate → you own it" only counts when the learner has stood up
the gate and watched it deny.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/operate-and-verify half? | Verdict |
|---|--------|-----------------|---------------------------------------|---------|
| 01 | The Automation Mindset | rate 10 tasks on repeatability/determinism, design (not build) 3 automations + 2 HITL gates, write a roadmap | no — explicitly "drafted, not implemented" | **By design** — orientation/assessment lab (the track's "decide what to automate" entry, like cloud 01 / ztna 01); the roadmap *is* the artifact |
| 02 | Infrastructure as Code | author `main.tf`: add a variable + output, plan→apply→destroy, prove UPDATE-not-REPLACE, confirm state in `.gitignore` | yes — author HCL + operate the lifecycle + verify the plan | **Balanced (build)** |
| 03 | IaC Security Scanning | scan, write `fixed.tf`, suppress an FP with justification, **write `ci-gate.sh` that exits 1 on bad / 0 on fixed**, author a PR workflow | yes — fix + **a gate proven on both the deny and the pass case** | **Balanced (proactive)** |
| 04 | Configuration Management | fill in the hardening role (sshd/sysctl/package + handler + var), prove idempotency (0 CHANGED on re-run), inject drift and prove correction | yes — author the role + operate it + verify idempotency *and* drift-correction | **Balanced (proactive)** |
| 05 | CI/CD Pipelines & Gates | review 3 flawed workflows, fix them, extend the checklist, **author a 4th multi-gate `security-gate.yml`** running gitleaks+checkov+sigma in parallel | yes — but the gates are authored as **static YAML**, never *executed* to watch one block (no live CI) | **Balanced (build); minor — gates not run live** |
| 06 | Containerising Tooling | write the `trufflehog` Dockerfile from scratch (pinned base, checksum-verified binary, non-root), prove it scans + finds the key, `checkov` clean, no secrets in layers, `make scan` read-only mount | yes — author the container + harden + verify (find the key, pass checkov, RO mount) | **Balanced (proactive)** |
| 07 | Enrichment & Data Pipelines | write `processor.py` (poll→enrich→write→delete, dead-letter on timeout), **prove resilience** by stopping/starting the API and watching errors drain + resume, write `monitor.py` | yes — build the pipeline + operate it + verify the failure path | **Balanced (proactive)** |
| 08 | SOAR Fundamentals | modify the n8n workflow (add an `unknown`→`investigate` IF branch), test 4 scenarios incl. API-down, export v2; **the human-approval node is *stretch only*** | yes — author + route + verify across 4 cases — **but no human-in-the-loop gate in the core path** | **Shallow build — promote the approval-gate stretch** |
| 09 | Detection-as-Code Pipelines | fix the broken Sigma rule, write parametrized pytest (fire-on-malicious + silent-on-benign for all 5), **break a rule and prove `sigma check` exits 1**, write `ci-gate.sh`, author the CI workflow | yes — author tests + gate, proven on both fire/no-fire and pass/break | **Balanced (proactive)** |
| 10 | Reviewing AI-Generated Automation | scan AI-generated `.tf`, write `fixed.tf` to checkov-clean, suppress one FP, write a 12-item review checklist, write `review.sh` (json+jq PASS/FAIL) | yes — remediate AI output to a proven-clean state + author a reusable review tool | **Balanced (build)** |

**Tally:** 8 balanced/proactive (02, 03, 04, 06, 07, 09, 10, and 05) · 1 "by design" pure (01,
assessment) · **0 run/read-only** · **1 shallow build to deepen (08 — promote the human-approval
gate)** · 1 minor note (05 gates authored but never executed live). The most build-heavy track audited;
the cloud audit found 2 audit-only + 1 hole, ZTNA found 2 inspect-only + 1 hole, and Track 10 finds
**zero run-only labs** — only one stretch to promote.

## The one shallow spot: 08's missing human-in-the-loop gate

This is not a "run-only" lab — the learner already *builds*: they add an IF branch, test four
scenarios (happy path, missing field, API-down, unknown IP), and export a versioned `v2` workflow.
What's missing is the **defining feature of SOAR done right**, and it's the one the capstone explicitly
grades:

- The capstone rubric scores **SOAR playbook** as *Proficient* only with "Enrich → contain → ticket
  with an explicit **human approval step**," and the track README's headline promise is "build response
  playbooks that enrich, contain, and ticket **with a human in the loop**."
- Yet in lab 08 the human-approval node is **Stretch item #1** ("instead of creating the ticket
  automatically, send a Slack message / write to a `pending_approval/` file and wait for a human to
  click Approve") — so a learner can finish the module having built a *fully-automatic* playbook and
  never operate the human gate the capstone then demands.

**Fix (promote the stretch to a core, graded step):** after the four-scenario test, have the learner
add a **human-approval node** to the live workflow for the `escalate`/`malicious` path — the playbook
writes to `pending_approval/` (or pauses on an n8n Wait/Webhook-resume node) and only creates the
containment ticket *after* an explicit approve, and **proves the deny case**: an un-approved (or
rejected) alert produces **no** containment ticket. That turns 08 into the same author→apply→prove-the-
deny shape the rest of the track already has, and aligns the lab with the rubric it feeds.

## A structural hole worth a decision: secrets handling in pipelines (OIDC / no-long-lived-creds)

The track teaches *finding* leaked secrets thoroughly — `gitleaks` in 05, `trufflehog` in 06, secrets
never in state-file/git in 02 — but it never has the learner **build the secure way a pipeline gets a
credential**: short-lived OIDC federation to a cloud/registry instead of a stored long-lived key,
masked secrets, and proving a workflow can *deploy without any long-lived secret in the repo or
environment*. This is the exact mirror of the cloud audit's finding ("we detect leaks but never *safely
handle* secrets") applied to CI/CD, and it is the most prevalent real-world CI security control absent
here. It is almost entirely build-and-operate (author a workflow that mints an ephemeral token, prove
the deploy works, prove a static-key path is rejected/removed) and slots naturally after 05.

This is a **decision, not a default** (as in both prior audits): it is the larger, lab-validation-heavy
piece and would need a validated `plaintext-labs/automation/NN-…` env. If a lighter touch is preferred,
the same lesson could instead be folded into 05 as a build step (OIDC-deploy job + "no static secret"
proof) rather than a new module. **"None / fold into 05" is a defensible answer** given how complete the
track already is — flagged here because it is the one genuine topical gap, not because the track needs
filling out.

## Rebalance plan (sequenced, smallest-disruption first)

1. **08 — promote the human-approval gate from stretch to core** *(S; **promotable — rests on the
   already-validated env**).* The n8n + ticket-backend + threat-api compose already runs; adding a
   `pending_approval/` directory write + an approve step (or an n8n Wait node) and a `make`/curl proof
   that an un-approved alert creates **no** containment ticket needs **no new services** — it reuses the
   ticket-backend volume and the existing webhook. Realign the module objective + key concepts so the
   human-in-the-loop gate is core, matching the capstone rubric. **Cheap, highest value.**
2. **05 — (minor, optional) execute one gate live instead of static-only** *(S; promotable).* The lab
   already runs `gitleaks` live via `make demo`; consider having the learner *run* the multi-gate
   `security-gate.yml`'s checkov stage locally against a bad config to **watch it exit non-zero**, so
   "author a gate" becomes "author a gate and see it block," not just reviewed YAML. Low priority — 03
   and 09 already deliver a *proven* gate, so the track's "watch it block" muscle is covered.
3. **New module / 05-extension — pipeline secrets handling (OIDC, no long-lived creds)** *(M–L,
   structural decision; **needs NEW env scaffolding built + validated** via `make up`/`make demo` — and
   Docker may be unavailable in the authoring session → follow-up validation, exactly as the ZTNA
   SPIFFE module was left pending).* Author a workflow that authenticates with a short-lived federated
   token and prove a long-lived-secret path is removed/denied. Confirm before building; shipping it
   unvalidated would violate the charter's labs-built-and-validated definition of done.

## Non-goals / cautions

- **Do not overcorrect — this track is already build-heavy and appropriate.** Eight of ten labs author
  and verify automation with a real deny/negative case; 01 is pure-by-design assessment (the roadmap
  *is* the job, like cloud 01 / ztna 01). The only in-track fix is 08's approval gate. Resist bolting a
  second "build" half onto labs that already have one.
- The single most important fix is **08**, and it is **promotable** (existing validated env), not new
  scaffolding — do that first regardless of the structural-hole decision.
- Any change touches **both repos** (objective/key-concepts prose in `plaintext`, lab `lab.md` +
  Makefile/compose in `plaintext-labs`) and must keep `mkdocs build --strict` green and ship a
  validated `make up`/`make demo`.
- Honest scoping on the structural hole: the track is complete enough that "fold OIDC into 05" or even
  "none" is defensible. The new-module path is the larger, validation-heavy commitment and should be a
  deliberate decision, not a reflex to add work to a track that mostly doesn't need it.
