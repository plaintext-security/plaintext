# Module 08 — Detection-as-Code

**Defensive Operations** — *write the detection once, version it, test it — like software, because it is.*

## Why this matters
Detections written by hand in one SIEM's console are unversioned, untested, and trapped in that
tool. Detection-as-code treats them like software: written in a portable language (Sigma), stored
in git, tested in CI, and converted to whatever backend you run. Sigma is the community standard,
and thousands of real detections are published as Sigma rules you can read, run, and learn from.

## Objective
Write a Sigma detection for a real ATT&CK technique, convert it to your SIEM's query language, and
confirm it fires on real attack telemetry.

## Learn (~4 hrs)

**The language**
- [Write a Sigma rule in 120 seconds (video)](https://www.youtube.com/watch?v=h8-Mnjq6EsU) — the format, fast.
- [Sigma (SigmaHQ) — project & rule repository](https://github.com/SigmaHQ/sigma) — the spec, the converter (`sigma-cli`), and thousands of real published rules to learn from.

**Map it**
- [MITRE ATT&CK](https://attack.mitre.org/) — every detection should name the technique it catches.

## Key concepts
- Why detections belong in git, not a console
- Sigma rule anatomy (logsource, detection, condition)
- Converting Sigma → SIEM query (sigma-cli / pySigma)
- Testing a detection against known-bad and known-good
- Mapping detections to ATT&CK

## AI acceleration
A model writes a Sigma rule from a description in seconds — genuinely useful. But it'll produce
logically-valid rules that match the wrong field or miss the variant; a rule you didn't test is a
liability, not a detection. Run it against real data before you commit it.
