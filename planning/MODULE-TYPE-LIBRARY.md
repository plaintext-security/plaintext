# Module / lab type library — the constructs behind "Verdict" (and what's missing)

*Prompted 2026: "Verdict" worked for cloud and foundations — but how does it apply to automation, ZTNA,
and AI-augmented-ops, and what other module/lab **types** should the curriculum have? This catalogues the
shapes we've used, names the ones we're missing, and maps them onto every track. It's a design artifact,
not a build — read it, then we run a "type pass" across all 13 tracks.*

## The core realization

"Verdict" is not one module type. It's a **family** unified by a *stance*: anchor on something real,
make the learner commit a judgment before the reveal, end in an owned artifact. What actually varies —
and what defines a *type* — is three axes:

- **Anchor** — what the module is grounded in: a *real breach*, a *real engineering disaster*, a
  *reference architecture*, the *real toil being eliminated*, a *research result*, or a *documented AI failure*.
- **Verb** — the learner's central activity: **observe/predict · attack · build · design · measure · migrate · review**.
- **Deliverable** — what gets committed: a verdict memo, a guardrail-as-code, a working system, an
  architecture + decision record, an eval harness, a migration, or a set of review findings.

The cloud/foundations rewrites only exercised the **adversarial/judgment** corner of this space (anchor =
breach, verb = observe/attack). Automation, ZTNA, and AI live in the **build / design / measure** corners —
which need types we haven't written. Below: six families, ~16 types.

---

## Family I — Adversarial / Judgment  *(anchor = a real incident; the "Verdict" family — already built)*

| Type | Verb | Predict? | Deliverable | Example modules |
|---|---|---|---|---|
| **1. Concept Autopsy** | observe | yes (where the breach failed) | a principle/boundary analysis memo | found 01, 12; cloud 01 |
| **2. Misconception Reveal** | observe | yes (the wrong intuition) | the corrected mental model + a tiny proof | found 08, 09, 11 |
| **3. Blast-Radius Trace** | attack | yes (how far it reaches) | attack-path note + a guardrail | cloud 02, 03 |
| **4. Audit → Build → Verify** | attack→build | sometimes | the authored fix, proven to hold | cloud 04, 05 |
| **5. Detonate & Detect** | attack | which signal fires | telemetry + a detection | cloud 14, 15 |
| **6. Reconstruct** | observe | what was missed | an IR timeline + IOCs | cloud 16; found 05, 06 |

## Family II — Engineering / Build  *(anchor = real toil or a reference design, NOT a breach; verb = build & operate)*

| Type | Thesis | Deliverable | Where it belongs |
|---|---|---|---|
| **7. Build-&-Operate** *(NEW, name it explicitly)* | ship a working system and run it; the breach isn't the point, the *working thing* is | the running, reviewed system (pipeline, proxy, RAG) | automation 02/04/05/07/08; ztna 02/06; ai 02/04/05/06 |
| **8. Judgment-as-Code / Gate** *(have it)* | encode a rule that fails-bad / passes-good in CI | the gate, proven both ways | cloud 06; automation 03/09 |
| **9. Tool-Build** *(NEW)* | build a *reusable tool others run* — UX, flags, maintainability matter | the packaged tool + its README/tests | automation 06/07; ai 05; python track |

*Anchor for Family II is an **engineering disaster**, not a breach: Knight Capital 2012 ($440M in 45 min
from a bad automated deploy), the 2017 AWS S3 typo outage, a `terraform destroy` that hit prod. Same
"render the verdict" energy, different incident class — the lesson is "automation without a gate is a
faster way to be wrong."*

## Family III — Architecture / Design  *(anchor = a requirement + a reference model; verb = design, then stress-test)*

| Type | Thesis | Deliverable | Where it belongs |
|---|---|---|---|
| **10. Design → Red-team-your-own-design → Harden** *(NEW)* | produce an architecture/policy from requirements, then *attack your own design*, then iterate | the design + the attack that failed against it | ztna 04/07; cloud capstones; AD |
| **11. Decision / ADR** *(NEW)* | choose among real options under constraints and *defend the choice* | an Architecture Decision Record (options · tradeoffs · pick · why) | ztna 04/05; ai 01 (local vs frontier); automation 01; found 02 (VM vs container) |
| **12. Migration / Brownfield** *(NEW)* | move a legacy setup to the new way *incrementally without breaking it* (strangler-fig) | the migration + proof nothing broke | ztna (VPN→ZTNA); automation (click-ops→IaC); endpoint hardening |

## Family IV — Measurement / Evaluation  *(anchor = "you can't improve what you don't measure"; verb = build an eval) — THE BIGGEST GAP*

| Type | Thesis | Deliverable | Where it belongs |
|---|---|---|---|
| **13. Eval Harness** *(NEW — highest-value missing type)* | a non-deterministic system (a model, a RAG, a detection) is improved by a **test set + metric + regression gate**, not vibes | eval-as-code: a held-out set, a scorecard, a gate that fails on regression | ai 02/03/04/06/07; automation 09; defensive detection-tuning |
| **14. Adversarial Review** *(NEW)* | given AI/automation output that's *subtly wrong*, catch the failures and codify when to trust it | your review findings + the trust policy | automation 10; ai 03/06; the "AI authors → you review" thread, made into a whole lab |

*Family IV is the AI-era analog of judgment-as-code: "eval gates, not vibes." It's nearly absent from the
curriculum today and is the single most important addition — every AI module and every detection module
secretly needs it.*

## Family V — AI-Adversarial  *(anchor = documented AI failures / red-team research; verb = attack & secure the AI)*

| Type | Thesis | Deliverable | Where it belongs |
|---|---|---|---|
| **15. Red-team-the-AI** *(NEW)* | prompt-injection / jailbreak / data-exfil / tool-abuse against an LLM·MCP·RAG you built; "just tell it not to" is the wrong intuition | the working exploit + an eval that catches the regression (ties to type 13) | ai 09/10; securing MCP/RAG |

*Anchors are real and predict-then-reveal-friendly: Air Canada (2024, held legally liable for its
chatbot's hallucination), the Chevrolet dealer bot jailbroken to "sell a car for $1" (2023), Bing/Sydney,
and the agentic prompt-injection / MCP tool-poisoning research. Beginners reliably guess "just add a system
prompt" — wrong — which makes these prime Misconception-Reveal × Red-team hybrids.*

## Family VI — Operate-over-time  *(anchor = drift/change; verb = detect & correct drift)*

| Type | Thesis | Deliverable | Where it belongs |
|---|---|---|---|
| **16. Drift & Steady-State** *(NEW)* | the system is fine at `t=0` and wrong at `t=30`; the skill is detecting and reconciling drift | the drift detector + the reconciliation | automation 04 (config mgmt); ztna 09; cloud posture; endpoint |

---

## Coverage map — which families each track leans on

| Track | I (judgment) | II (build) | III (design) | IV (eval) | V (AI-adv) | VI (drift) |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| 00 foundations | ●●● | ● | ○ (02) | — | — | — |
| 01 offensive | ●●● | ● | — | ○ | — | — |
| 02 defensive | ●● | ● | — | ●(detection) | — | ● |
| 05 cloud | ●●● | ●● | ●(capstone) | ○ | — | ○ |
| 10 automation | ●(01,10) | ●●● | ●(01) | ●(09) | — | ●(04) |
| 11 ztna | ●(01,09) | ●● | ●●● | — | — | ●(09) |
| 12 ai-augmented-ops | ●(09,10) | ●●● | ○ | ●●● | ●●(09,10) | — |

●●● core · ●● strong · ● present · ○ latent/should-add · — n/a. The pattern: **the breach-anchored
family carried the security-analysis tracks; the build/design/eval families carry the engineering tracks
— and we've barely written them.**

---

## The three named tracks — per-module shape sketch

### 10 — Automation  *(spine = Build-&-Operate + Gate; bookended by judgment)*
- **01 Automation Mindset** → **Concept Autopsy** on Knight Capital 2012 / the AWS S3 typo outage. Predict:
  "automation makes you safer, right?" Reveal: it makes you *faster* — including at being wrong; the gate is the point.
- **02 IaC / 04 Config Mgmt / 05 CI-CD / 06 Containerising / 07 Enrichment / 08 SOAR** → **Build-&-Operate**
  (+ **Tool-Build** for 06/07). Anchor each on the toil it kills, not a breach. 04 also carries **Drift**.
- **03 IaC Scanning / 09 Detection-as-Code** → **Judgment-as-Code / Gate** (09 also **Eval Harness** — a detection
  needs a test corpus + a regression gate, which is exactly type 13).
- **10 Reviewing AI Automation** → **Adversarial Review** — the flagship of type 14.

### 11 — ZTNA  *(spine = Design-&-defend + Decision/ADR + Migration)*
- **01 Zero-Trust Principles** → **Concept Autopsy** on a lateral-movement breach (Target 2013 / OPM 2015 /
  SolarWinds): the perimeter held; the flat interior was the breach. Predict: "where did 'inside = trusted' fail?"
- **02 Identity Control Plane / 03 Device Trust / 06 Identity-Aware Access / 07 Microseg / 08 Policy-as-Code** →
  **Build-&-Operate** (07/08 also **Judgment-as-Code**).
- **04 ZTNA Architectures / 05 SASE** → **Decision / ADR** (self-hosted vs cloud-delivered, defend the pick) and
  **Design → red-team-your-own-design** (publish a no-inbound-ports service, then *try to reach it unauthenticated*).
- **The track's missing centerpiece:** a **Migration** module/project — **VPN → ZTNA** without an outage — the
  single most real-world ZTNA task. Worth adding (type 12).
- **09 Monitoring & Detection** → **Reconstruct / Detect** + **Drift**.

### 12 — AI-Augmented Ops  *(spine = Build-&-Operate + Eval Harness; capstone = Red-team-the-AI)*
- **01 Hybrid Pattern** → **Decision / ADR** (local vs frontier — defend where each runs and why).
- **02 Local Models / 04 RAG / 05 MCP / 06 SoC Copilot / 07 Detection-Triage / 08 SOAR-AI** → **Build-&-Operate**
  (05 also **Tool-Build**) — **and every one of them paired with an Eval Harness** (type 13): a RAG without a
  retrieval-quality eval is a vibe; a triage model without a labelled test set is a liability.
- **03 Prompt Patterns** → **Adversarial Review** + **Eval Harness** (reviewable, *scored* prompts).
- **09 Securing AI / 10 Attacking AI** → **Red-team-the-AI** (type 15), anchored on Air Canada / the Chevy bot /
  agentic prompt-injection — strong predict-then-reveal ("just prompt it not to" is wrong).

---

## What we should have added for Foundations (retrofit)

Foundations is mostly well-served by the three types it uses (Concept Autopsy, Misconception Reveal,
Skill-first). Two honest gaps:

- **02 Building a Safe Lab is really a Decision / ADR** (type 11): "VM vs container, snapshot strategy,
  network mode — choose and defend it." We framed it as a light predict; an ADR deliverable would be truer to
  the actual skill and would *introduce the ADR construct early* so later tracks can lean on it.
- **10 Scripting should be explicitly Tool-Build** (type 9), not just "build-first" — the point is a reusable,
  reviewable tool, which is the construct the whole automation track later compounds on.

What Foundations should **not** add: Eval Harness, Red-team-the-AI, Migration — those are later-track
constructs; forcing them on beginners would violate the "skill-first" discipline. So: one real retrofit
(name 02 an ADR), one reframing (name 10 a Tool-Build). The bigger value of this exercise is downstream.

---

## Proposal — run a "type pass" across all 13 tracks

The library above is the vocabulary; the payoff is applying it. A **type pass** = for each of the ~130
modules across all 13 tracks, tag its **primary type** (and secondary), then surface two things:

1. **Mismatches** — modules whose current shape fights their content (e.g., a build module written as a
   passive concept page; an AI module with no eval).
2. **Coverage gaps** — types that *should* appear and don't. The standout prediction: **Eval Harness (13)
   is under-used everywhere AI or detection appears**, and **Migration (12)** and **Decision/ADR (11)** are
   almost absent despite being core to ZTNA/automation/endpoint.

Output: a per-track type-map table + a gap list + a short "new modules worth adding" set (e.g., a ZTNA
*VPN→ZTNA migration* module; an AI *eval-harness* module if 02–08 don't already carry it). This is
parallelizable (one pass per track) and gives a curriculum-wide design picture *before* any further
rewriting — so we build the right shapes, not just more of the one we have.

> **✅ Type pass complete** (`type-pass/SYNTHESIS.md`). Headline: the curriculum is strong on Families
> I–II and systematically missing **#13 Eval Harness**, **#12 Migration**, **#11 ADR-as-artifact**, and
> **#14 Adversarial Review**. Those four drive the roadmap (`REDESIGN-ROADMAP.md`).

---

# Authoring templates (one per type)

*This is the working reference an author opens to write a module. Pick the type that fits the content
(use the "Use when" tells), then fill the skeleton. Every type still obeys the house rules in
`AUTHORING.md` (the four beats, anchor discipline, honesty, the validated-lab bar). The shared spine of
all types: **anchor on something real → make the learner commit a judgment → end in an owned, committed
artifact.** What changes per type is the anchor, the verb, and the deliverable.*

Each template gives: **Use when · Anchor · Verb · Deliverable · Grades-as** (the `grade.yaml` check type)
· **Predict** · **README shape** · **Lab shape** · **Copy** (the exemplar to model). New/under-practiced
types also carry a fill-in **Skeleton**.

## Family I — Adversarial / Judgment

### Type 1 · Concept Autopsy
- **Use when:** a concept module with no single tool, where a real breach lets the learner *derive* the principle. **Anchor:** a public breach · **Verb:** observe/predict · **Deliverable:** a one-page principle/boundary analysis memo · **Grades-as:** `structural` (the memo maps each failure to a principle) + `ai_rubric`.
- **Predict:** yes — "with all those controls, what *one* thing failed?" (reveal: none did / all did).
- **README:** *The case* (the breach, short) → *Your job* → *Call it before you read on* (2–3 predictions) → *The reveal* (the principle, as correction) → lean *Learn* → *Key concepts*.
- **Lab:** render the autopsy on the (or a comparable) account; the "own it" is a tiny script proving one failure (e.g. a cert-expiry checker).
- **Copy:** cloud 01, foundations 01/12.

### Type 2 · Misconception Reveal
- **Use when:** a beginner/practitioner reliably guesses *wrong* and the correction is load-bearing (base64 ≠ encryption; "encrypted" ≠ safe; delete ≠ gone). **Anchor:** a real artifact/incident exhibiting the misconception · **Verb:** observe/predict · **Deliverable:** the corrected mental model + a hands-on proof · **Grades-as:** `flag`/`artifact_functional` (the learner reproduces the disproof).
- **Predict:** yes — the wrong intuition, stated as a confident question.
- **README:** predict-then-reveal "core idea"; the reveal *names and fixes* the misconception.
- **Lab:** reproduce the disproof yourself (decode the "secret"; crack the "encrypted" hash).
- **Copy:** foundations 08/09/11.

### Type 3 · Blast-Radius Trace
- **Use when:** an offense/enumeration module — given a foothold, map how far it reaches. **Anchor:** a real intrusion/technique · **Verb:** attack · **Deliverable:** an attack-path note + a guardrail-as-code · **Grades-as:** `target_state` (the reach is demonstrated) + `structural` (the guardrail fails the bad state).
- **Predict:** yes — "how far does this reach?" (people under-count).
- **README:** the attacker's mental model (the account-as-graph; the metadata hop); honest about simulator limits.
- **Lab:** enumerate → prove reach (e.g. `simulate-principal-policy`) → author the cut → re-verify.
- **Copy:** cloud 02/03.

### Type 4 · Audit → Build → Verify
- **Use when:** find a misconfig, *author the fix*, prove it holds (the rebalance "build half"). **Anchor:** the misconfig class behind a real leak · **Verb:** attack→build · **Deliverable:** the authored fix + the proof the path is gone · **Grades-as:** `target_state` + `structural`.
- **Predict:** optional (reachability).
- **README:** the control's mental model ("a Security Group *is* the host firewall you know").
- **Lab:** audit → find → **author the corrected config + a default-deny baseline** → re-verify reachability.
- **Copy:** cloud 04/05.

### Type 5 · Detonate & Detect
- **Use when:** a purple-team module — safely fire a real technique, capture telemetry, build the detection. **Anchor:** a real ATT&CK technique/incident · **Verb:** attack · **Deliverable:** the detonation telemetry + a detection (often hands off to a Type 13 eval) · **Grades-as:** `artifact_functional` (rule fires on attack) + held-out benign check.
- **Predict:** "which signal is loudest / silent?"
- **README:** "cloud attacks are API calls, not exploits"; the management-vs-data-plane logging gotcha.
- **Lab:** detonate (stratus/Pacu/atomic) → map to ATT&CK → capture telemetry → write the detection.
- **Copy:** cloud 14/15, offensive 15.

### Type 6 · Reconstruct
- **Use when:** DFIR — rebuild a timeline/IOC set from an immutable log. **Anchor:** a real incident (two-stage breaches are richest) · **Verb:** observe · **Deliverable:** an IR timeline + IOCs + a triage script · **Grades-as:** `structural` (timeline rows + ATT&CK IDs) + `artifact_functional` (the triage tool).
- **Predict:** "what did the responders miss?"
- **README:** "cloud IR is reconstruction from a log, not disk forensics"; the super-timeline (time as join key).
- **Lab:** Predict → reconstruct → corroborate/scope/contain → automate the reconstruction.
- **Copy:** cloud 16, foundations 05/06.

## Family II — Engineering / Build

### Type 7 · Build-&-Operate
- **Use when:** the module's job is to **ship and run a working system** (pipeline, proxy, RAG, baseline). The anchor is the *toil eliminated* or a *reference architecture*, **not** a breach. **Verb:** build · **Deliverable:** the running, reviewed system · **Grades-as:** `artifact_functional` (`make up`/`make demo` works) + `structural` (review notes on what AI generated vs. corrected).
- **Predict:** rarely; lead with the build. Anchor on a real *engineering disaster* where one fits (Knight Capital, the AWS S3 typo).
- **README:** *Why this matters* (the toil/incident) → *The core idea* (the architecture & the one judgment that makes it good) → *Learn* → *Build & own it*.
- **Lab:** build it in ordered stages → operate it (run, observe) → **review the AI-generated parts line by line** → commit with the "what I corrected" note.
- **Copy:** the python track; automation 02/04.

### Type 8 · Judgment-as-Code / Gate
- **Use when:** the deliverable is a **rule that fails-bad / passes-good in CI**. **Anchor:** the misconfig/finding it catches · **Verb:** build · **Deliverable:** the gate, proven both ways · **Grades-as:** `artifact_functional` (gate exits non-zero on the bad fixture, zero on the fix).
- **README:** "a scanner is a fast junior reviewer with no context — the gate encodes *your* verdict so it can't regress."
- **Lab:** find → fix → **suppress one true false-positive correctly** → write the gate that blocks merge on the specific finding and passes on the fix.
- **Copy:** cloud 06, automation 03.

### Type 9 · Tool-Build
- **Use when:** the product is a **reusable tool others run** (flags, README, tests, packaging). **Verb:** build · **Deliverable:** the packaged, tested tool · **Grades-as:** `artifact_functional` (CLI runs, tests pass) + `structural` (has `--help`, README).
- **README:** the tool's job + the design judgment (what to parameterise, what to keep deterministic); the AI-review stance.
- **Lab:** spec → build read→parse→filter→output → add flags/tests → **review every AI-drafted line** → package.
- **Copy:** python track, automation 06/07.

## Family III — Architecture / Design

### Type 10 · Design → Red-team-your-own-design → Harden  *(under-practiced)*
- **Use when:** the learner *produces* an architecture/policy from requirements, then **attacks their own design**, then iterates. **Anchor:** a reference architecture (e.g. NIST 800-207) + a breach it would stop · **Verb:** design · **Deliverable:** the design + the attack that failed against it + the hardening diff · **Grades-as:** `target_state` (the attack is blocked by the learner's design) + `structural`.
- **Predict:** "where would *you* attack this design?"
- **Skeleton:**
  ```
  README: Why → The core idea (the design pattern + its one load-bearing tenet) → Learn → Key concepts
  Lab:
    1. [ ] Requirements → draw the design (boundaries, controls, data flows)
    2. [ ] Stand up a minimal instance of it
    3. [ ] RED-TEAM YOUR OWN DESIGN: attempt the attack the pattern is supposed to stop
    4. [ ] If it succeeds, harden and re-attack until it's blocked (the deliverable is the failed attack)
    5. [ ] Own it: the design doc + the proof (the blocked attack), committed
  ```
- **Copy:** ztna 05 (the no-inbound-ports step); generalise it.

### Type 11 · Decision / ADR  *(latent everywhere — seed it early)*
- **Use when:** a real choice under constraints (local-vs-frontier, self-host-vs-SASE, CIS-vs-STIG, RSA-vs-Ed25519). **Anchor:** the actual options + a constraint set · **Verb:** decide · **Deliverable:** an **Architecture Decision Record** (Nygard format) · **Grades-as:** `structural` (ADR has context, options scored, decision, honest consequences) + `ai_rubric`.
- **Predict:** optional — "which would you pick before you read the tradeoffs?"
- **Skeleton (the ADR the lab commits):**
  ```
  # ADR-NN: <decision>
  ## Context        — the forces/constraints (cost, threat model, ops burden, scale)
  ## Options        — 2–4 real options, each with pros/cons
  ## Decision       — the pick, in one sentence
  ## Consequences   — what you accept by choosing it (the HONEST downsides) + a real attack-path note
  ```
- **README:** teach the *axes of the tradeoff*, not the answer; the answer is the learner's to defend.
- **Copy:** ztna 04 (the exemplar — copy its scoring table + honest Consequences). Seed the construct at foundations 02.

### Type 12 · Migration / Brownfield  *(absent — high priority)*
- **Use when:** move a **running legacy thing** to the new way *incrementally without breakage* (strangler-fig). **Anchor:** the legacy setup + the target architecture · **Verb:** migrate · **Deliverable:** the migration + proof nothing broke at each step · **Grades-as:** `target_state` (new path works AND old path still served during cutover) + `structural` (a rollback plan).
- **Predict:** "what breaks if you cut over all at once?"
- **Skeleton:**
  ```
  README: Why (the legacy + why the big-bang cutover fails) → core idea (strangler-fig: run both, shift traffic, retire) → Learn → Key concepts
  Lab:
    1. [ ] Stand up the legacy baseline (VPN / click-ops infra / classic-crypto / unmanaged fleet)
    2. [ ] Stand the NEW path beside it (ZTNA proxy / IaC / hybrid-PQC / managed baseline)
    3. [ ] Cut over ONE slice; PROVE the rest still works (no outage)
    4. [ ] Shift the remaining slices; PROVE each; keep a rollback at every step
    5. [ ] Retire the legacy; own it: the migration runbook + the proof-of-no-outage
  ```
- **Build:** ztna VPN→ZTNA (first), automation click-ops→gated-IaC, crypto PQC/crypto-agility, endpoint fleet rollout.

### Type 13 · Eval Harness  *(THE systemic gap — highest priority)*
- **Use when:** a **non-deterministic system** (a model, a RAG, a detection, a classifier) is improved by measurement, not vibes. **Anchor:** "you can't improve what you don't measure" + a real labelled corpus · **Verb:** measure · **Deliverable:** **eval-as-code** — a held-out set + a metric + a scorecard + a CI **regression gate** · **Grades-as:** `artifact_functional` (the eval runs and scores) + `target_state` (the gate fails on a planted regression).
- **Predict:** "is this detection/RAG *good*? prove it" (the reveal: you can't, without an eval).
- **Skeleton:**
  ```
  README: Why (a system you can't measure, you can't trust) → core idea (held-out set vs demo set; metric choice; coverage ≠ effectiveness; the regression gate) → Learn → Key concepts
  Lab:
    1. [ ] Build a labelled corpus: known-good + known-bad, HELD OUT from the demo/tuning set
    2. [ ] Define the metric (precision/recall/FP-rate; retrieval@k; exact-match) — and WHY this one
    3. [ ] Run the system over the corpus → a scorecard (the numbers, not a vibe)
    4. [ ] Tune; re-score; show the curve (the FP/recall tradeoff)
    5. [ ] Wire the CI REGRESSION GATE: a planted regression must fail the build
    6. [ ] Own it: eval.py + corpus + the gate, committed
  ```
- **Build/upgrade:** a dedicated ai-ops "AI Eval & Observability" module (04/05/06 plug in); upgrade-in-place defensive 09, cloud 15, malware 13, AD 09. **Copy:** ai-ops 07 (generalise it).

### Type 14 · Adversarial Review  *(under-named — generalise it)*
- **Use when:** the skill is **catching subtly-wrong AI/automation output** and codifying when to trust it. **Anchor:** AI output that is confidently, subtly wrong · **Verb:** review · **Deliverable:** the review findings + a trust policy/checklist · **Grades-as:** `flag` (the learner finds the planted errors) + `structural` (the trust checklist).
- **Predict:** "this AI analysis looks right — is it?" (it isn't, in N specific ways).
- **Skeleton:**
  ```
  README: Why (AI authors confidently; the differentiating skill is rigorous review) → core idea (the failure modes for THIS domain: hallucinated CVEs, wrong ATT&CK IDs, plausible-but-false root cause) → Learn → Key concepts
  Lab:
    1. [ ] You're handed AI-generated output with N planted, realistic errors
    2. [ ] Find them; for each, say HOW you knew (the tell) and verify against the primary source
    3. [ ] Write the trust checklist: what you must always re-verify for this kind of output
    4. [ ] Own it: the corrected artifact + the checklist
  ```
- **Build:** generalise python 10 to offensive 17 (reporting), defensive (review AI detections), forensics (trust the AI summary?), malware. **Copy:** python 10.

## Family IV/V/VI — Measurement / AI-Adversarial / Operate-over-time

### Type 15 · Red-team-the-AI
- **Use when:** attack an LLM·MCP·RAG system the learner built (prompt injection, jailbreak, data-exfil, tool-abuse). **Anchor:** a documented AI incident (Air Canada; the Chevy "$1 car" bot; agentic prompt-injection / MCP tool-poisoning) · **Verb:** attack · **Deliverable:** the working exploit + an eval (Type 13) that catches the regression · **Grades-as:** `target_state` (the exploit works pre-fix, is blocked post-fix).
- **Predict:** "just tell it not to — does that work?" (no).
- **README:** predict-then-reveal on the "just add a system prompt" misconception; the trust-boundary view of tool-calling.
- **Lab:** build/inherit the AI system → land the injection/jailbreak → harden → re-attack → wire a promptfoo/garak regression eval.
- **Copy:** ai-ops 09/10; pair with python 09.

### Type 16 · Drift / Steady-State  *(latent — own it)*
- **Use when:** the system is correct at t=0 and wrong at t=30; the skill is **detect + reconcile drift**. **Anchor:** a baseline/policy that drifts (config, RBAC, detection decay) · **Verb:** operate · **Deliverable:** the drift detector + the reconciliation · **Grades-as:** `target_state` (drift is introduced, detected, and reconciled back to baseline).
- **Predict:** "you hardened it last month — is it still hardened?"
- **Skeleton:**
  ```
  README: Why (controls rot; "set and forget" is the failure) → core idea (declared state vs observed state; detect→diff→reconcile→re-enforce) → Learn → Key concepts
  Lab:
    1. [ ] Establish the declared baseline (config/RBAC/detections as code)
    2. [ ] INTRODUCE drift (a manual change, a decayed rule, an added permission)
    3. [ ] Detect it (diff observed vs declared) → report the delta
    4. [ ] Reconcile (re-enforce the baseline) and prove steady-state
    5. [ ] Own it: the drift-detect + reconcile loop, scheduled
  ```
- **Build:** endpoint (dedicated Drift module), automation 04, ztna 09. 

---

*Picking a type is the first authoring decision. If two fit, pick by the **deliverable** the learner
should walk away with — that's the module's real point. When none fit cleanly, the module may be doing
two jobs; split it. New types are allowed, but justify them against this list first.*
