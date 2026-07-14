# Module 09 — Test, Measure & Supply-Chain Gate

*Type 13 · Eval Harness — measure whether `Vigil`'s detections actually work by scoring them on a held-out labelled corpus, and gate regressions in CI so the score can never silently rot. (Secondary: Type 14 · Adversarial Review — catch the copilot's happy-path-only tests and the "coverage == effectiveness" fallacy.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot will write you tests that always pass; your edge is the eval that can fail, and the gate that fails the build when it does.*

!!! abstract "In 60 seconds"
    This is the track's final module, and it closes the loop the whole track opened: you built `Vigil` to
    emit typed objects, enrich concurrently, and detect real PowerShell abuse — but *is the detection any
    good?* You can't answer that with tests that only exercise the cases you already know pass. So you build
    two things the copilot never volunteers. First, **real `Pester` coverage**: tests that mock the edges
    (`Should -Invoke`) and assert the *unhappy* paths, not just the demo. Second, a **detection eval**: run
    `Vigil`'s detections over a **held-out** labelled corpus — malicious and benign samples it was never
    tuned against — compute **precision, recall, and false-positive rate**, and wire a **CI regression gate**
    that fails the build when a planted change drops the score. Then you close the supply chain: **pinned**
    `PSResourceGet` installs and a **code-signed** module (`Set-AuthenticodeSignature` → `Get-AuthenticodeSignature`),
    because the PowerShell Gallery does not require signing — that guarantee is yours to add.

## Why this matters

Ask the copilot to "write tests for this detection" and you'll get a `Describe` block full of `It` cases
that feed the function exactly the inputs it already handles and assert it returns what it already returns.
Every test passes. Coverage looks high. And you have learned *nothing* about whether the detection catches
attacks it hasn't seen or fires on benign activity it shouldn't — because a test that only replays the
demo can't tell you that. This is the single most seductive failure in security tooling: **coverage is not
effectiveness.** A detection with 100% line coverage and zero held-out evaluation is a detection you have
*exercised*, not one you have *measured*. The two are different, and conflating them ships false confidence
to a SOC.

The fix is the discipline every non-deterministic system needs — a model, a RAG, a classifier, and yes, a
detection: **a held-out test set, a metric, and a regression gate.** You measure the detection on data it
was never tuned against, you pick a metric that reflects the cost of being wrong (a SOC drowning in
false positives has a *different* problem than one missing intrusions), and you gate the number in CI so
the next "small improvement" — yours or the copilot's — can't quietly trade recall for a nicer-looking
diff. Then there's what you're *running*: `Vigil` depends on `PSScriptAnalyzer`, `Pester`, and whatever
else you `Install`. If those aren't pinned, your build is non-reproducible; if your own module isn't
signed, anyone downstream is trusting code they can't verify — and the Gallery, as Module 01 anchored,
won't add that guarantee for you.

## Objective

Give `Vigil` a real test-and-measure layer: `Pester` v5 tests that mock external edges with `Should -Invoke`
and assert unhappy paths (with a coverage gate that fails below a threshold you set and defend); an
`eval.ps1` that scores `Vigil`'s detections over a **held-out** labelled corpus into a precision/recall/FP
scorecard, with a **CI regression gate** that fails the build when a planted regression drops the score;
and a supply-chain gate — **pinned** `PSResourceGet` installs plus a **self-signed → sign → verify** loop
that proves the module's authenticity — all committed and runnable.

## The core idea

**Coverage is exercise; a held-out eval is measurement — do not confuse them.** Code coverage answers
"which lines ran during the tests?" A held-out evaluation answers "how well does the detection perform on
data it has never seen?" The copilot happily gives you the first and calls it done. But a detection is a
*classifier*, and you evaluate a classifier the way you evaluate any non-deterministic system: build a
**labelled corpus** (each sample marked malicious or benign), split off a **held-out** set that no tuning
ever touches, run the detection over it, and count. Four numbers fall out — true/false positives,
true/false negatives — and from them the metrics that matter. The reason the held-out split is
non-negotiable: if you tune your detection tokens against the same samples you then "measure" on, your
score is a memory test, not a generalization test. It will look great and mean nothing. **Hold general
claims to data the system was never fitted to** — the discipline is the same one that keeps an AI eval
honest.

**Pick the metric for the cost of being wrong, and say why.** Accuracy is a trap in security: a corpus
that's 95% benign lets a detector that fires on *nothing* score 95% accuracy while catching zero attacks.
So you reach for **precision** (of the events I flagged, how many were truly malicious? — the inverse of
alert fatigue) and **recall** (of the truly malicious events, how many did I catch? — the inverse of
misses), plus the **false-positive rate** because in a SOC every false positive costs an analyst's
attention. There is no single "right" number; there's a *tradeoff*, and your job is to state which way you
lean and why. A hunt tool that feeds a human reviewer can tolerate lower precision to buy recall; an
auto-blocking control cannot. The scorecard makes that tradeoff explicit and reviewable instead of buried
in a threshold nobody remembers choosing.

**A regression gate turns a one-time score into a durable guarantee.** A scorecard you run once and admire
is a vibe with extra steps. The value is the **gate**: commit the score (a floor for recall, a ceiling for
FP-rate), and fail the CI build when a change drops below it. Now the next edit — a "cleanup" the copilot
suggests, a token you remove because it looked noisy — can't silently degrade the detection, because the
held-out eval runs on every commit and the build goes red. This is the same move as Module 01's
`PSScriptAnalyzer` gate and Module 08's detection, one level up: instead of gating *style* or *presence*,
you gate *measured effectiveness*. And be honest about the gate's own limits — a small corpus bounds what
the score can prove; note the cap rather than implying the number generalizes further than the data
supports.

**Signing is the guarantee the Gallery leaves to you.** Module 01 anchored on it: the PowerShell Gallery
does not mandate code signing, so `Install-Module SomethingTrusted` can pull code no one verified. The
answer is to sign what *you* ship: create a code-signing certificate, `Set-AuthenticodeSignature` over the
module's files, and have consumers (and your CI) `Get-AuthenticodeSignature` to verify the signature is
`Valid` and the publisher is who you expect. Pair it with **pinned** dependency installs — `Install-PSResource
-Version 5.6.1`, never a floating "latest" — so the toolchain that gates your module is itself reproducible.
A self-signed cert in the lab teaches the mechanism end to end; in production you'd use a cert from a CA
your consumers trust, but the *loop* — sign, publish, verify before load — is identical. (One honesty note:
`Set-/Get-AuthenticodeSignature` are Windows-only cmdlets; the Linux lab demonstrates the *same primitive* —
a CMS/PKCS#7 detached signature, which is what Authenticode is built on — with `openssl cms`, and labels
full chain trust as assessed-not-demonstrated. Same loop, one host-specific tool.)

??? note "Why not just trust high code coverage?"
    Coverage tools (Pester's `CodeCoverage`, JaCoCo, coverage.py) measure *reachability*: did the tests
    execute this line? That's genuinely useful — untested lines are where bugs hide, and a coverage floor
    stops the copilot from shipping a function with no test at all. But coverage says nothing about whether
    your *assertions* are meaningful. You can hit 100% coverage with tests that assert `Should -Not -Throw`
    and check nothing about the result. For a detection, the assertion that matters is "does it correctly
    classify held-out samples?" — which no coverage number can tell you. Use coverage as a floor (a
    presence check), the held-out eval as the ceiling (an effectiveness check). Both, not either.

## Learn (~2–3 hrs)

**Real `Pester` — mocks and coverage, not happy paths (do these first)**

- [`Pester` — "Mocking" (`Should -Invoke`)](https://pester.dev/docs/usage/mocking) (~30 min) — how to
  replace an external call (`Invoke-RestMethod`, a file read) with a mock and *assert it was invoked* the
  right number of times with the right args. This is how you test the unhappy paths — a feed timeout, a
  429 — without a network.
- [`Pester` — "Code Coverage"](https://pester.dev/docs/usage/code-coverage) (~20 min) — configure
  `CodeCoverage` in `New-PesterConfiguration`, set a threshold, and fail the run below it. Read enough to
  wire a coverage floor into the gate — and to understand what the number does *not* prove.
- [`Pester` — Configuration reference](https://pester.dev/docs/commands/New-PesterConfiguration) (~15 min)
  — the object that drives everything in CI: `Run.Exit`, `CodeCoverage.CoveragePercentTarget`,
  `TestResult`. Skim it so the gate script reads as configuration, not magic.

**Evaluating a classifier — the metric, and why**

- [Google — "Classification: Precision and Recall" (ML Crash Course)](https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall) (~20 min)
  — the clearest short explanation of precision vs. recall and the tradeoff between them. A detection *is* a
  binary classifier; this is the vocabulary your scorecard speaks.
- [Palantir — "Alerting and Detection Strategy (ADS) Framework"](https://github.com/palantir/alerting-detection-strategy-framework) (~15 min)
  — how the field thinks about measuring a detection rather than asserting it works; grounds the "held-out
  corpus + metric" discipline in real detection engineering, not just ML theory.

**The supply chain — pinning and signing**

- [`Microsoft.PowerShell.PSResourceGet` — `Install-PSResource`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.psresourceget/install-psresource) (~15 min)
  — the modern successor to `Install-Module`; read the `-Version` parameter and why pinning an exact
  version (not a range) is what makes a build reproducible.
- [Microsoft Learn — "Set-AuthenticodeSignature" + "Sign a PowerShell script"](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-authenticodesignature) (~20 min)
  — create a code-signing cert, sign, and verify with `Get-AuthenticodeSignature`; read what `Valid`,
  `UnknownError`, and `NotSigned` statuses mean and why the Gallery not mandating this puts it on you.

## Key concepts
- **Coverage ≠ effectiveness** — coverage says a line *ran*; a held-out eval says the detection *works*. Gate on both, conflate neither.
- **Held-out vs. tuning set** — never measure on the samples you tuned against; that's a memory test, not a generalization test.
- **Metric for the cost of being wrong** — precision (alert fatigue), recall (misses), FP-rate (analyst cost); accuracy lies on skewed corpora. State the tradeoff.
- **Regression gate** — commit the score as a floor; the held-out eval runs in CI and fails the build on a drop, so effectiveness can't silently rot.
- **Real `Pester`** — `Should -Invoke` mocks and unhappy-path assertions, not a replay of the demo; a coverage floor as a presence check.
- **Supply-chain gate** — pinned `Install-PSResource -Version`; self-signed → `Set-AuthenticodeSignature` → `Get-AuthenticodeSignature` verify, because the Gallery won't sign for you.

## AI acceleration

Turn the copilot loose on the test suite and the eval, then review for the two failures it reliably ships.
**First: happy-path-only tests.** Ask for tests and it will feed the function the exact inputs it already
handles and assert the exact outputs it already returns — green, high-coverage, and worthless as a measure
of anything. The tell: no `Should -Invoke`, no mock of the feed or file edge, no assertion on an *error*
path. Make it mock the boundary and test what happens when the feed times out or the input is malformed.
**Second: the "coverage == effectiveness" fallacy** — it will proudly report a coverage percentage as if
that answers "is the detection good?" It doesn't, and you should be able to say why in one sentence.
For the eval, the high-value review is the **split**: does the corpus actually hold out the samples the
detection was tuned on, or did the copilot "evaluate" on the tuning set and report a beautiful, meaningless
100%? And for the supply chain, watch for the unpinned `Install-PSResource` with no `-Version` and the
missing signature step — the exact defaults Module 01 warned about, now yours to close.

!!! question "Check yourself"
    - Your detection has 100% `Pester` code coverage. Why does that *not* tell you whether it catches
      attacks it hasn't seen — and what would?
    - Your corpus is 95% benign. Why is accuracy a misleading metric here, and which two metrics would you
      report instead — and how does the tradeoff between them change for a hunt tool vs. an auto-blocker?
    - The PowerShell Gallery doesn't mandate signing. Concretely, what does signing your module with
      `Set-AuthenticodeSignature` let a consumer verify that an unsigned Gallery install cannot?
