# Outside the box — where the charter itself may be miscut

*Companion to `ANALYSIS.md`. The three variants all obey CLAUDE.md and CONTRIBUTING.md. This file
asks the harder question the user raised: what if the **charter** is the thing constraining us into a
local maximum? Module 01 is the lens; most of these generalise to the whole curriculum.*

These are not "the charter is bad." They're places where a rule that's right *on average* may be wrong
for a *fundamentals* module specifically — and worth a deliberate decision rather than a default.

---

## 1. The two-file split (`README` concept → `lab.md` project) hard-codes "learn, then do"

**The assumption.** Every module is a concept page you read and a lab you then perform. CONTRIBUTING.md
makes this structural and non-negotiable.

**Why it may be miscut.** It front-loads the bridge into a page the learner skims and half-forgets, then
asks them to *do* in a separate file where the concept isn't present. For a skill domain like cloud,
*interleaved* learning (do a bit → understand that bit → do the next) transfers better than a wall of
prose followed by a wall of steps. The split also forces concept and practice to be authored as if
they're separable, when the best version of module 01 might be **one document that teaches the
shared-responsibility line at the exact moment the learner sets each control** (just-in-time bridge,
not front-loaded essay).

**Alternative.** Allow a "lab-first" or single-document module shape where the bridge prose is embedded
as margin notes at the decision points. Variant A is already straining against the two-file split — its
"who owns this?" beats want to live *inside* the Do steps, not 400 words up the page in a separate file.

**Cost.** Breaks the uniform structure, the nav, and the templates; harder to skim; the receipt/grading
machinery assumes `lab.md`.

---

## 2. "The core idea" mandates the *most passive* modality for the *most important* content

**The assumption.** The bridge is 2–5 paragraphs of expository prose hitting a fixed rubric (mental
model + practitioner translation + synthesis + gotcha + AI caveat). The bridge-prose checklist is the
most prescriptive thing in the whole charter.

**Why it may be miscut.** The charter's single most-defended asset — the original-prose bridge — is
delivered in the one mode where the learner does the least: reading a finished conclusion. The mental
models are *handed over* pre-chewed ("the line slides," "the burglar's map"). A learner retains a model
they **predicted or derived** far better than one they read. Nothing in the charter supports
*Socratic* or *prediction-then-reveal* concept delivery — "guess what the default public-access setting
is before you check; now check" beats a paragraph asserting "defaults aren't secure." The most elegant
prose is still telling, not teaching.

**Alternative.** Add a sanctioned "derive it" pattern: a couple of prediction prompts the learner
answers *before* the reveal, so the bridge becomes something they build. The prose then *confirms and
names* the model they just formed, which is exactly when naming sticks.

**Cost.** Harder to author well (bad Socratic prompts are worse than good prose); doesn't fit the
"link out for the explanation" division cleanly.

---

## 3. "Curate links, don't regurgitate" may be exactly backwards for *foundations*

**The assumption.** The hybrid model: the internet explains the basics better, so link out (the *Learn*
path) and reserve original prose for the bridge. Regurgitation is treated as always-waste.

**Why it may be miscut.** For a *foundational* concept that everything downstream reuses, a single
**owned, coherent narrative** beats a curated tour of five external sites — even at the cost of some
"regurgitation." The charter itself betrays the fragility of the link-out model: it needs a whole rule
about validating links, keeping sources fresh, and not sending people to firehose playlists. That
maintenance burden is the link-out tax. The deeper issue: bouncing a learner across AWS docs → CISA TRA
→ a YouTube video → ATT&CK to assemble the *most basic* frame of the entire track cedes coherence at the
moment coherence matters most. "Don't re-teach what's well covered" is great for *Kerberos in module 9*;
it may be wrong for *the shared-responsibility model in module 1*, where owning the spine is the point.

**Alternative.** Let foundational modules own more of their explanation (write/host the core walk-through)
and link out *less*, accepting the "regurgitation" charge as the price of a durable, single-voice spine.
Reserve aggressive curation for later, narrower modules.

**Cost.** Directly contradicts the hybrid model as written; more prose to maintain; risk of drifting
toward the "regurgitation module" failure the charter rightly fears.

---

## 4. Docker-first + "reproducible at zero cost" quietly defeats "tie it to the real world" — and for cloud it *miseducates*

**The assumption.** Every reference lab ships a validated one-command Docker environment; an
external-target-only lab is "a stub, not a finished lab." Simultaneously: "tie it to real artifacts,
not invented toy examples."

**Why it may be miscut.** For cloud, these two rules collide and Docker wins by default — so the learner
practices against **LocalStack, whose security semantics differ from real AWS.** Concretely: LocalStack
CE *does not enforce IAM*, which means a "shared responsibility" lab taught on it can't actually show a
wall holding — the single most important thing in the module. (Variant B has to fake enforcement with
`simulate-principal-policy` precisely because of this.) The charter's reproducibility mandate is, for
cloud fundamentals, in tension with its own realism mandate — and the simulator's wrong security model
is an *educational* hazard, not just a fidelity nit: the learner internalises "my policy denied that"
from a system that denies nothing.

**Alternative.** For cloud specifically, treat **real free-tier with teardown discipline** as a
first-class lab target, not a stretch goal — accept losing "one-command reproducibility" to gain correct
security semantics. Or split: simulate for *enumeration mechanics*, real-account for *enforcement
behaviour*. The charter's blanket "Docker-first, external target = stub" rule should bend for the
domains where the simulator lies.

**Cost.** Real accounts mean cost risk, credentials, teardown failures, CI that can't run the lab; the
charter built the whole receipt/CI model around reproducible local demos.

---

## 5. "Automate & own it" as a *universal* requirement manufactures busywork at the fundamentals end

**The assumption.** Every lab must end in a reusable script/tool — automation is mandatory, uniformly.

**Why it may be miscut.** The genuine learning in module 01 is a *judgment* ("which side of the line is
this, and why"), and judgment doesn't automate cleanly. So the required script ends up automating the
*enumeration* (the easy, mechanical part) while the actual skill — the mapping — stays manual. The
automation requirement is load-bearing and excellent in modules where the work *is* mechanical (parsing
logs, scanning IaC); bolting it onto a conceptual orientation module produces a slightly contrived
`enumerate.sh` that automates the thing that wasn't the point.

**Alternative.** Scale the automation requirement to module type: mandatory where the work is mechanical;
*optional / "if it genuinely reduces toil"* for conceptual or judgment-heavy modules. Or reframe the
automation as "encode your *judgment* as a check" (a policy-as-code rule, a grader assertion) rather than
"script your *keystrokes*."

**Cost.** Weakens the track-wide "AI-authors-you-review" thread if applied loosely; needs a clear rule
for *which* modules are exempt or the exemption becomes an excuse.

---

## 6. The synthetic "Meridian" narrative competes with the charter's own "use real artifacts" rule

**The assumption.** Ground labs in real CVEs/datasets/ATT&CK — *and* run a fictional "Meridian Financial"
story for continuity.

**Why it may be miscut.** For the *fundamentals* framing, a real breach beats an invented company.
Module 01 is about "whose fault was the breach, provider or customer?" — and there is a canonical,
public, perfectly-on-topic real answer: **Capital One (2019)**, an SSRF → instance-role-credential → S3
chain that is *the* textbook shared-responsibility case (AWS's surface held; the customer's WAF/role/
bucket config didn't). Opening module 01 on that real post-mortem would teach the line harder than
Meridian's seeded account, and it satisfies the charter's own "tie it to the real world" rule better than
the synthetic narrative does.

**Alternative.** Let the fundamentals module open on a real breach teardown and *use Meridian only as the
hands-on sandbox*. Reserve the fictional thread for continuity, not for carrying the "why this matters."

**Cost.** Real breach narratives need careful sourcing and age; the Meridian thread gives cross-module
continuity that a rotating cast of real breaches doesn't.

---

## The meta-point

Five of these six are the same shape: **a rule that is correct for the *median* module (a narrow,
later, mechanical one) is miscut for a *fundamentals* module (broad, first, judgment-heavy).** The
charter implicitly designs for the median and applies uniformly. The highest-leverage charter change
might simply be: **make the rules a function of where the module sits** — foundations modules earn more
owned prose, interleaved structure, real-environment fidelity, derive-it concept delivery, and a relaxed
automation mandate; deep specialist modules keep the current curate-link-Docker-automate defaults. One
size is teaching two very different jobs.
