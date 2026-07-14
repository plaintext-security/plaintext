# Lab 09 — Score `Vigil`'s Detections on a Held-Out Corpus, Gate the Regression, Sign the Module

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/09-test-measure-supplychain/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell:7.4-ubuntu-22.04`) with `PSScriptAnalyzer 1.22.0` and `Pester 5.6.1`
pinned, the cumulative `Vigil` module (now carrying a detection to evaluate), a **labelled corpus** with a
clearly separate **held-out** split, `eval.ps1` (scores the detection → a scorecard → exits non-zero on
regression), a real `Pester` suite (including a `Should -Invoke` mock), and `gate.ps1` (analyzer + Pester +
eval + signing all in one gate).

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/09-test-measure-supplychain
make up      # build the pwsh 7 + PSScriptAnalyzer + Pester container
make shell   # drop into pwsh
make demo    # run the full gate: PSScriptAnalyzer + Pester (coverage) + eval + sign/verify
make down    # stop when done
```

`make demo` runs offline and green on Linux: the self-signed code-signing certificate is generated *in the
container*, and the corpus is bundled — no network, no external service.

## Scenario

`Vigil` now detects a real PowerShell abuse pattern (encoded commands, IEX download cradles — the Module 08
technique), and it has tests. But "it has tests" and "it works" are different claims, and this module is
where you stop conflating them. You'll write tests that actually *mean* something (mocks, unhappy paths, a
coverage floor), then build a **detection eval**: score `Vigil`'s detection over a **held-out** labelled
corpus it was never tuned against, produce a precision/recall/FP scorecard, and gate the number so a
regression fails the build. Finally you'll close the supply chain — pin the toolchain and sign the module —
because the Gallery, as Module 01 warned, won't sign it for you. This is the last capability the capstone
integrates.

> Only test systems you own or have explicit written permission to test. Everything here runs locally in
> the lab container against bundled, labelled sample data.

## Do

1. [ ] **Look at the corpus and find the split.** Open `data/` and confirm two things: every sample carries
   a **label** (`malicious` or `benign`), and there is a **held-out** set kept separate from any tuning set.
   Say out loud why measuring on the tuning set would be a memory test, not a measurement. *(Hint: the eval
   must never see the tuning labels while scoring.)*
2. [ ] **Write a test that can actually fail.** Add a `Pester` test that **mocks an external edge** with
   `Should -Invoke` — assert the detection calls the feed/read exactly once, and add an **unhappy-path**
   case (malformed input, a mocked timeout) that asserts the *error* behavior, not the demo output. A test
   that only replays the happy path proves nothing. *(Hint: `Mock` the cmdlet, then `Should -Invoke -Times`.)*
3. [ ] **Add a coverage floor — and know what it doesn't prove.** Configure `Pester`'s `CodeCoverage` with a
   threshold and fail below it. Then write one sentence in your notes: *why 100% coverage still would not
   tell you the detection is effective.* The floor is a presence check, not an effectiveness check.
4. [ ] **Pick the metric and defend it.** Decide which metric(s) the scorecard reports — precision, recall,
   FP-rate — and *why this one for this tool*. State the tradeoff: `Vigil` feeds a human hunter, so which way
   do you lean, recall or precision? Write it down; the number is only meaningful next to the reason.
5. [ ] **Run the eval and read the scorecard.** Run `eval.ps1` against the **held-out** corpus. It runs the
   detection over each sample, compares to the label, and prints the confusion counts (TP/FP/TN/FN) and the
   metrics. This is the honest score — the one measured on data the detection never saw.
6. [ ] **Wire the regression gate — and prove it bites.** The eval commits a **floor** (e.g. recall ≥ 0.90,
   FP-rate ≤ 0.10) and exits non-zero below it. **Plant a regression** — remove a detection token, or loosen
   a threshold — re-run the eval, and watch the score drop and the gate fail. Then restore it and watch it
   pass. You must demonstrate *both* directions.
7. [ ] **Pin the toolchain.** Confirm every dependency install is version-**pinned** (`Install-PSResource
   -Version 5.6.1`, never floating). An unpinned install makes the gate that measures your module
   irreproducible.
8. [ ] **Sign the module and verify.** Generate a self-signed **code-signing** certificate, sign the
   module's `.ps1`/`.psd1`/`.psm1`, then verify and assert it's valid. Have the gate **refuse to pass a
   tampered file** — flip one byte after signing and watch verification fail. *(On Windows this is
   `Set-AuthenticodeSignature` → `Get-AuthenticodeSignature` → status `Valid`. Those cmdlets are
   Windows-only, so the Linux lab demonstrates the **same primitive** with `openssl cms` — the CMS/PKCS#7
   signature Authenticode is built on; full chain trust is assessed-not-demonstrated on Linux.)*
9. [ ] **Automate & own it.** Wire analyzer + `Pester` (with coverage) + eval + signature-verify into one
   `gate.ps1`, and commit it with the corpus, the scorecard, and your metric-choice note. In the commit/PR,
   name what the copilot generated, what you corrected, and the one thing it defaulted to — the happy-path
   test, the eval-on-the-tuning-set, the unpinned install, or the missing signature.

## Success criteria — you're done when
- [ ] Your `Pester` suite includes at least one `Should -Invoke` **mock** and one **unhappy-path** assertion — not a replay of the demo — and a **coverage floor** fails the run below threshold.
- [ ] `eval.ps1` scores `Vigil`'s detection on the **held-out** corpus and prints a scorecard (TP/FP/TN/FN + precision/recall/FP-rate).
- [ ] The eval **fails the build** on a planted regression and **passes** when it's restored — you demonstrated both directions.
- [ ] Every dependency install is **version-pinned**, and the module is **signed** with `Get-AuthenticodeSignature` reporting `Valid`; a tampered file fails verification.
- [ ] You can state, in a sentence each, why coverage ≠ effectiveness, why you held the corpus out, and which metric you chose and why.

## Deliverables
The `Vigil` test-and-measure layer: the `Pester` suite (mocks + unhappy paths + coverage floor), `eval.ps1`
+ the labelled corpus with its held-out split + the scorecard, the regression gate, the pinned-install +
signing/verify step, and your metric-choice note. Commit all of it. Do **not** commit the generated signing
certificate's private key, any real event exports beyond the bundled corpus, or `.env`/secrets — the cert
is regenerated in-container.

## AI acceleration
Have the copilot draft the whole layer — tests, `eval.ps1`, the signing loop — from your spec, then review
for its two signature failures. It will write **happy-path-only tests** (no mock, no error case, high
coverage, zero effectiveness) and it will **report coverage as if it answered "is this good?"** — it
doesn't. For the eval, the review that matters is the **split**: make sure the corpus genuinely holds out
the tuning samples, or the copilot will "measure" on the tuning set and hand you a meaningless 100%. And
watch for the unpinned `Install-PSResource` and the skipped signature — the exact Gallery-shaped defaults
Module 01 flagged, now yours to close for good.

## Connects forward
This is the capstone's measurement layer. The capstone integrates all three phases of `Vigil` — typed
telemetry ingest, safe concurrent enrichment over a least-privilege endpoint, the MCP surface, the
self-attacked detection — and this module is what proves the whole thing *works*, not just runs: the
`Pester` + eval regression gate and the signed, pinned supply chain are literally the capstone rubric's
"Tests & eval" and "Safety" dimensions. The eval discipline (held-out set + metric + regression gate)
recurs anywhere the curriculum measures a non-deterministic system — the AI-augmented-ops track's model
and RAG evals are the same shape.

## Marketable proof
> "I measure detection efficacy, not vibes: I score my detections on a held-out labelled corpus with a
> precision/recall scorecard, gate regressions in CI, and ship a code-signed, version-pinned PowerShell
> module — because the Gallery doesn't sign it for you."

## Stretch (optional)
- Add a **precision/recall curve**: sweep the detection threshold and plot (or table) the FP/recall
  tradeoff, then pick the operating point your metric-choice note argued for — and defend it against the curve.
- Publish the signed module to a **local `PSResourceGet` repository** and have a consumer step
  `Install-PSResource` it, then `Get-AuthenticodeSignature`-verify before importing — the full trusted-install loop.
- Split the eval corpus by **ATT&CK sub-technique** and report per-technique recall, so a regression that
  only breaks one technique's detection still fails the gate.
