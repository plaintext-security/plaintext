# Lab 08 — Detonate, Detect, and Harden an Encoded PowerShell Abuse

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/08-detonate-detect-harden/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer` and `Pester` preinstalled, the cumulative `Vigil`
module, a **benign detonator** (`data/Invoke-BenignDetonation.ps1`), a committed **malicious-pattern**
telemetry sample, and a held-out **benign** telemetry sample.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/08-detonate-detect-harden
make up         # build the pwsh + PSScriptAnalyzer + Pester container
make detonate   # benign detonation: encode a -EncodedCommand, decode + run a BENIGN payload, capture telemetry
make shell      # drop into pwsh
make demo       # detonate -> capture telemetry -> gate: detection fires on malicious, quiet on benign held-out
make down       # stop when done
```

The lab **builds a custom minimal target** — the benign detonator — because the lesson is the *reproduce →
capture → detect* loop and you edit the detection source yourself; a black-box sample can't teach that. It
is reproducible at zero cost and the detonation and detection run entirely in the Linux container.

### What runs here, and what does NOT

The **detonation** (base64 encode/decode, running an obfuscated-but-benign scriptblock) and the
**detection over captured telemetry** run cross-platform on `pwsh` 7 in the Linux container. **Live AMSI
and Constrained Language Mode enforcement are Windows-only** — this container does not enforce them. You
will *author and reason about* the AMSI/CLM hardening here and mark it **assessed-not-demonstrated**; an
optional stretch step runs it on a Windows VM to watch it fire for real. Do not read a green `make demo`
as proof that AMSI or CLM is active.

## Scenario

`Vigil` reads Windows telemetry well by now — but you've never made it detect the technique that generates
most of the malicious telemetry it will ever see: an encoded, obfuscated PowerShell loader. So you'll play
both sides. First you **detonate** a benign reproduction of the technique (a base64 `-EncodedCommand`, an
`IEX` download cradle, and string obfuscation — but the payload only writes a marker file and prints a
beacon; it does nothing harmful). Then you **capture** the script-block-logging (Event ID 4104) and
process-creation (Event ID 4688) telemetry it emits, **build** `New-VigilDetection` to catch it, and write
the **hardening** that would have stopped it. The technique is real
([T1059.001](https://attack.mitre.org/techniques/T1059/001/) /
[T1027](https://attack.mitre.org/techniques/T1027/)); only the payload is defanged.

> **Authorization.** Only test systems you own or have explicit written permission to test. The detonation
> here is **benign** and targets the **shipped lab only** — no network calls, no persistence, no
> destructive actions. Never run an actual malicious cradle, or point any detonation at a system you do not
> own or have written permission to test.

## Do

1. [ ] **Detonate the technique (benignly) and read what it produced.** Run `make detonate`. Watch it
   base64-encode a `-EncodedCommand`, decode it back, run the *benign* payload (a marker file + a beacon
   string), and write the captured telemetry to `data/telemetry-detonated.json`. Confirm the marker file
   exists — that's proof the payload ran, harmlessly. This is your ground truth: telemetry from a technique
   you fired yourself.
2. [ ] **Decode a `-EncodedCommand` by hand.** Take the base64 blob out of the 4688 process-creation event
   and decode it yourself — remember it's **UTF-16LE**, not UTF-8 (hint: `[System.Convert]::FromBase64String`
   then `[System.Text.Encoding]::Unicode.GetString`). Read what the "encoded" command actually does. This is
   the move your detection has to make automatically.
3. [ ] **Try to detect it with a naive rule — and watch it lose.** Write a one-liner that flags the literal
   string `IEX`. Run it over the malicious sample, then look at the obfuscated event
   (`&('{1}{0}'-f'X','IE')…`): your literal rule misses it. Now run the same rule over the benign sample —
   note any admin command it falsely flags. This is the failure you're about to fix.
4. [ ] **Build the behaviour-based detection.** Implement (or review the reference) `New-VigilDetection` so
   it: decodes any `-EncodedCommand` payload before judging; flags a **download primitive wired to an
   execution primitive** (the cradle), string obfuscation (format-operator, char-code, `FromBase64String`),
   and suspicious launch flags (`-nop`, `-w hidden`, `-exec bypass`); emits **typed objects** with the
   matched rules and the ATT&CK IDs; and scans the telemetry **as data** — never `Invoke-Expression`-ing it
   (build the `iex` indicator from a char array / regex so `PSAvoidUsingInvokeExpression` stays green).
5. [ ] **Prove it fires on the attack AND is quiet on benign.** Run `New-VigilDetection` over the malicious
   sample (it should flag every malicious event and map them to T1059.001/T1027) and over the **held-out
   benign** sample (it must return *nothing* — no false positives on real admin PowerShell). A detection
   that only fires on the attack is half-tested.
6. [ ] **Tune precision with a score threshold.** Give the detection a `-MinScore`: raise it and show fewer,
   higher-confidence detections; lower it and show the recall/false-positive tradeoff. Decide the default
   you'd ship and say why.
7. [ ] **Write the hardening note.** In `HARDENING.md`, write the three controls and *what each one does to
   this exact attack*: script-block logging (Event ID 4104 — the reason you have decoded text to detect at
   all), Constrained Language Mode (breaks the `New-Object`/.NET cradle), AMSI (catches the deobfuscated
   buffer at runtime). Label **AMSI and CLM enforcement as Windows-only / assessed-not-demonstrated** here,
   with the exact enablement commands (see the cheat sheet) and honest limits.
8. [ ] **Automate & own it.** Commit `New-VigilDetection` (with tests that prove it fires on malicious and
   is quiet on the held-out benign sample), the captured telemetry sample, and `HARDENING.md`. In the
   commit/PR, note what the copilot drafted, the one place it detected a *string* instead of a *behaviour*,
   and — if it happened — the place it wrote a detector that would have *executed* what it was detecting.

## Success criteria — you're done when
- [ ] `make detonate` runs the benign payload (marker file written, beacon printed) and captures 4104/4688 telemetry — with **no** network calls or destructive actions.
- [ ] You decoded a `-EncodedCommand` by hand as UTF-16LE and can state what it does.
- [ ] `New-VigilDetection` **fires on every malicious event** in the sample and maps each to T1059.001/T1027, decoding the encoded payload to catch the behaviour inside it.
- [ ] The same detection is **quiet on the held-out benign sample** (zero false positives), and `make demo` proves both in one green run.
- [ ] Your detection scans telemetry **as data** — `PSScriptAnalyzer` is clean and no code path `Invoke-Expression`s the sample.
- [ ] `HARDENING.md` covers script-block logging, CLM, and AMSI, with AMSI/CLM enforcement **labelled Windows-only / assessed-not-demonstrated**.

## Deliverables
`New-VigilDetection` added to the `Vigil` module (typed output, ATT&CK-mapped, analyzer-clean), the Pester
tests that prove it fires on the malicious sample and is quiet on the held-out benign sample, the captured
telemetry sample, and `HARDENING.md`. Commit all of it. Do **not** commit any real malicious payload,
live cradle, downloaded stage, or the regenerated `data/telemetry-detonated.json` / `artifacts/` (they're
gitignored) — the point is the detection and the hardening, not the sample.

## AI acceleration
Have the copilot draft the detection rules from the ATT&CK T1059.001 detection guidance and the malicious
sample — then review for this domain's two failure classes. It will tend to (a) match the *string* `IEX`
instead of the *behaviour* (a download primitive wired to an execution primitive), missing every
obfuscated variant and false-positiving on benign `Invoke-WebRequest`; and (b) — the dangerous one — write
"analysis" code that builds a command from the log and *runs* it. The whole review is: detect behaviour not
strings, decode before you judge, and never execute what you detect. Then make the model prove its rule on
the **held-out benign** corpus, not the samples it was written against.

## Connects forward
The detection you build here is `Vigil`'s first real *detection artifact* — Module 09 wraps it in an **eval
harness**: a held-out labelled corpus, a precision/recall scorecard, and a CI regression gate so a change
that quietly drops a true positive fails the build. The behaviour-not-strings discipline and the
held-out-benign check are exactly the muscles that eval formalises. The hardening note connects back to the
JEA/least-privilege work in Module 06 (a constrained endpoint is CLM by another name) and forward to the
capstone, where `Vigil` ships as a self-attacked, eval-gated module.

## Marketable proof
> "I reproduce real PowerShell abuse techniques (T1059.001/T1027) safely against a lab target, build
> behaviour-based detections that decode encoded commands and survive obfuscation instead of matching
> strings — proven to fire on the attack and stay quiet on benign admin PowerShell — and pair them with the
> hardening (script-block logging, Constrained Language Mode, AMSI) that removes the attacker's advantage."

## Stretch (optional)
- **See AMSI and CLM fire for real (Windows VM).** On a Windows host, set
  `$ExecutionContext.SessionState.LanguageMode` to `ConstrainedLanguage` in a fresh runspace and watch a
  `New-Object Net.WebClient` cradle fail; then run a known AMSI test string against a Defender-enabled host
  and watch it get blocked. Record what your Linux container could *not* have shown you — this is the honest
  boundary the module drew.
- **Add an AST-based rule.** Reimplement one string-obfuscation rule as an AST walk
  (`[System.Management.Automation.Language.Parser]::ParseInput`) instead of a regex, and note where the AST
  is more robust (real structure, not text) and where it's overkill for log-line telemetry.
