# Variant D — why it breaks the template on purpose

*Variants A/B/C kept the house structure and varied the **lab activity**. Variant D varies the
**module form itself** — it's the concrete answer to "what if CLAUDE.md/CONTRIBUTING.md framed this
wrong?" Each move below maps to a numbered argument in `../CHARTER-CRITIQUE.md`.*

| Charter rule (as written) | What Variant D does instead | Critique # |
|---|---|---|
| `README` = concept essay, `lab.md` = project; learn-then-do | Bridge is delivered **inside** the flow as predict→do→reveal, in both files, at the moment of decision | #1 |
| "The core idea" = 2–5 paragraphs of expository prose | The core idea is **3 prediction prompts the learner answers before reading**; the prose only *confirms or corrects* their guess | #2 |
| Curate links; the *Learn* path carries the explanation | **Learn is cut to ~2 hrs / 4 links**; the module **owns its spine** (a foundations module shouldn't outsource the SRM) | #3 |
| Docker-first; simulator is fine; external target = stub | **States plainly that LocalStack doesn't enforce IAM**, and designs around it with `simulate-principal-policy` instead of pretending | #4 |
| "Automate & own it" = turn manual work into a script | Automation is **judgment-as-code**: encode your verdict as a CI guardrail that fails the bad policy — not keystroke-scripting | #5 |
| Ground in real artifacts *and* run the synthetic Meridian thread | **Real breach (Capital One 2019) is the spine and the "why";** Meridian is demoted to just the local sandbox | #6 |

## The bet

The wager is that for a *foundations* module, **a learner who predicted "two hops were AWS's fault" and
was shown they were wrong** retains the shared-responsibility model far better than one who read an
elegant paragraph asserting "the line slides." The whole module is built around manufacturing — and then
correcting — that specific wrong prediction, using a real breach where the misconception has real
consequences.

## What it costs / open risks

- **It won't pass the existing rubric.** The bridge-prose checklist in CONTRIBUTING.md is written for the
  essay form; this module would "fail" it while arguably teaching better. Adopting D means amending the
  charter (the "rules scale with module position" change in CHARTER-CRITIQUE's meta-point), not just the
  module.
- **Predict-then-reveal is fragile to skimming.** A learner who scrolls past the "Call it" prompts gets a
  weaker version than the essay would have given. Mitigation: the lab re-runs the same prediction beats
  hands-on, so the reveal lands at least once.
- **Real-breach spine ages and needs sourcing care.** Capital One is well-documented and stable, but the
  pattern (anchor each foundations module on a real breach) is a maintenance commitment.
- **Authoring difficulty is higher.** A bad Socratic prompt is worse than good prose; this form is harder
  to write well and harder to keep consistent across a track.

## If you like it

The cheapest way to validate the bet is to **A/B two openings of the same lab** — the shipped
enumerate-and-map intro vs. this predict-the-verdict intro — and see which leaves learners able to
correctly assign the encryption and metadata hops a week later. That's the real test of whether the
charter's essay-first default is the local maximum this variant suspects it is.
