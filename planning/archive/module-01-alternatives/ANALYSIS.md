# Module 01 (Cloud Fundamentals) — alternative pedagogies

*Exploration prompted 2026-06-22: "what other ways could we have taught this material?"
These are competing drafts of the **same module**, kept outside `tracks/` so they don't build.
Read this file first; the variants live in `variant-a-provision/`, `variant-b-foothold/`,
`variant-c-spectrum/`, and `variant-d-verdict/`.*

> **A/B/C vary the lab activity within the house template. Variant D (`variant-d-verdict/`) varies the
> module *form itself*** — it's the built-out version of `CHARTER-CRITIQUE.md`: breach-driven,
> predict-then-reveal, interleaved, judgment-as-code. Read `variant-d-verdict/RATIONALE.md` for how each
> of its choices maps to a charter critique.

## What the shipped module actually does

Module 01 fuses three jobs into one lab:

1. **A mental model** — the shared responsibility model (SRM): who owns what, IaaS→PaaS→SaaS.
2. **A skill** — CLI account enumeration (`aws`/`awslocal iam list-*`, `s3api get-*`).
3. **A judgment** — "default is not secure"; spotting the misconfig in the gap.

The lab's pedagogical shape is **observational audit**: the learner is dropped into a
pre-broken LocalStack account (one over-broad policy, one `iam:PassRole *`, one public bucket),
enumerates it, finds the planted issues, and writes a responsibility matrix. The activity verb is
**read / observe**.

This is exactly what the rebalance audit (`cloud-track-rebalance.md`) called module 01:
*"By design — foundational orientation lab,"* find-only on purpose. The question worth asking is
whether *orientation* is best served by observing a broken account, or by one of the other three
verbs below — because the verb you pick is the thing the learner actually practices.

### Honest weaknesses of the shipped version

- **The needles are labeled.** `setup.sh` plants exactly three findings, `account.json` annotates
  each with `"Note": "FINDING: …"`, and `make demo` prints `FINDINGS: …`. The learner can't really
  *miss*, so the SRM mapping is a fill-in-the-blank rather than a judgment.
- **SRM is asserted, not felt.** The learner is *told* the line sits between customer and provider;
  they never stand on either side of it. The most load-bearing concept of the whole track is taught
  the most passively.
- **No "build" half.** Consistent with the audit, the lab never has the learner *do* anything to the
  account — only describe it. Every later module in the track that ends well (06, 12, 13, 15) ends in
  the learner *making* something.

None of these make it a bad module. They make it a *conservative* one. The variants each trade that
conservatism for a different, more active thesis.

## The design space (pick a verb)

| | Verb | Thesis (how the SRM is taught) | Lineage |
|---|------|--------------------------------|---------|
| **0 — shipped** | **observe** | enumerate a broken account, map findings to the model | observational audit |
| **A — provision** | **build** | you only know who owns a control once you're the one who had to configure it | constructionism |
| **B — foothold** | **attack** | the boundary is clearest from the burglar's side: every wall that holds is the provider's, every one that gives is the customer's | inquiry / offense↔defense |
| **C — spectrum** | **compare** | ship the *same* feature three ways (IaaS/PaaS/SaaS) and watch the line slide | contrastive |

All four reach the same competence the objective demands (enumerate via CLI, articulate
provider-vs-customer surface, spot the default-is-not-secure trap). They differ in what the learner
*practices* and what they *commit*.

## The three variants at a glance

### A · "Provision it and feel the line" (build-first)
The learner stands up the Meridian upload backend themselves from an empty account — S3 bucket,
EC2 instance role + trust policy, a dev user — and at **each control** answers "is securing this mine
or AWS's?" They hit the permissive defaults by being the one who has to turn them off, then harden,
then prove the dev user can't reach other buckets with `simulate-principal-policy`. **Deliverable:** a
working, idempotent secure baseline (`provision.sh`/`main.tf`) *plus* the responsibility matrix.
- **Why it's strong:** the SRM stops being a diagram — you internalize the line by being responsible
  for every control on the customer side of it. Seeds the IaC spine the whole track leans on (06, 12, 13).
- **Cost:** more setup for the learner; risks drifting toward "an IaC module" instead of a fundamentals one.
- **Feasibility:** clean. LocalStack supports the create-side already (the current `seed.sh` proves it);
  `tflocal` (Terraform→LocalStack) is a mature pattern.

### B · "Trace the blast radius from a foothold" (attack-first)
The learner is handed one leaked `dev-alice` credential and a question: *how far does this account
let me reach, and why does each wall stop me?* They enumerate their own effective permissions,
probe data-plane reach (other buckets), find the `PassRole` escalation, and **classify each wall** as
provider-enforced or customer-owned — deriving the SRM from the walls. **Deliverable:** a blast-radius
note + the matrix, justified by which walls held.
- **Why it's strong:** the most visceral way to teach the boundary, and it leans into the
  offense↔defense connective tissue CLAUDE.md prizes; flows straight into module 02/03.
- **Cost:** an attack framing for a *fundamentals* module may over-rotate to offense this early; it's
  the least "neutral orientation" of the four.
- **Feasibility caveat (important):** LocalStack CE does **not** enforce IAM, so you can't teach
  "the wall physically stops you" by brute force — the honest build uses `iam simulate-principal-policy`
  (logical allow/deny against the real policy docs) as the wall. Drafted that way.

### C · "The spectrum, three ways" (compare-first)
Makes the module's central mental model the central activity: deploy/observe the *same* file-upload
feature as (1) EC2 + role (IaaS), (2) Lambda + S3 (PaaS), (3) an S3-hosted static front (SaaS-ish), and
build a **side-by-side** responsibility matrix across compute / runtime / network / identity / data —
watching the line slide row by row. The punchline: more-managed shrinks your surface but *concentrates*
it (in the SaaS row, identity & data config is all you have and all of it matters). **Deliverable:** the
three-column matrix + a probe script that prints the customer-owned checklist for a given deployment type.
- **Why it's strong:** the spectrum is the one idea from this module that everything downstream reuses,
  and this is the only variant that teaches it by *direct contrast* rather than assertion.
- **Cost:** three mini-deployments is the most moving parts; thinnest single "skill."
- **Feasibility caveat:** Lambda genuinely runs in LocalStack; EC2 is describe-only (no real VM in CE)
  and the SaaS row is represented by its config surface. Honest about that in the lab Setup.

## Recommendation

If the goal is the strongest *fundamentals* module, **Variant A (provision)** is my pick: building is
the most durable way to internalize "who owns what," it kills the labeled-needles problem, and it plants
the IaC habit the rest of the track compounds on — directly answering the rebalance audit's "add a build
half" theme at the very front of the track. **Variant C** is the best pure teacher of the IaaS→PaaS→SaaS
spectrum specifically and would pair beautifully as the *concept* framing even if the lab goes another way.
**Variant B** is the most exciting but is better held for module 02/03, where offense is the explicit job —
using it here spends the track's "think like an attacker" reveal a module too early.

A viable hybrid: **A's build-first lab with C's three-ways framing in "The core idea."** Provision once,
but narrate the line moving across IaaS/PaaS/SaaS as you go.
