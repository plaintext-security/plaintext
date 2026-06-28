# Phase 2 Project — Tested Detection Set + Documented Hunt

*Defensive · Phase 2 (modules 08–13) · ~6–8 hrs · Prereqs: finish modules 08–13 first.*

> You wrote rules, tested them, mapped coverage, and hunted endpoint and network one technique at a time. The project is the **integration**: a set of detections-as-code mapped to MITRE ATT&CK, tested against a real attack dataset and gated so they can't regress, plus one documented threat hunt that turns a finding into a new rule.

## Why this is a project, not another module

Each Phase-2 module produced one rule, one test, one hunt, or one coverage view. Alone they're scattered YAML and notes; integrated they're a versioned, regression-gated detection set with a coverage story and a hunt that feeds it:

- **08 · Detection-as-Code** → `detection.yml` + `detection.md` (the Sigma rule committed to git, the field logic, the FP reasoning).
- **09 · Detection Testing & Tuning** → `detection-test.md` + the **held-out corpus**, `eval.py` scorecard, and the `make eval` regression gate.
- **10 · ATT&CK Mapping & Coverage** → `navigator_layer.json` + `coverage.md` (your gaps and the prioritised next detections).
- **11 · Threat Hunting — Endpoint** → `hunt-endpoint.md` (the hypothesis, the evidence chain, the Sigma rule from `--sigma`).
- **12 · Threat Hunting — Network** → `hunt-network.md` (the beacon-candidate table, the CV analysis, the verdict, the JSON snippet).
- **13 · PowerShell Logging & Hunting** → `powershell-hunt.md` + `powershell-abuse.yml` (the per-event verdict, the Sigma rule, the regression test).

## Build it

1. **Assemble the rule set.** Collect your Sigma rules (08, 11's `--sigma`, 13's `powershell-abuse.yml`) into **one versioned ruleset directory**, each rule carrying its ATT&CK technique mapping. The set — not the single rule — is the unit. Wire the module-08 CI lint/convert check and the module-09/13 regression gate so the *whole set* lints, converts, and re-tests on every commit.
2. **Test against a real attack dataset, prove no regression.** Run the set against the real attack data (and your held-out benign corpus) so `make eval` reports which techniques fire and which stay quiet on benign — and **fails** if any rule stops catching its technique or starts catching the benign baseline.
3. **Run one hunt end to end, and feed it back.** Take one of your hunts (endpoint or network) from hypothesis → evidence chain → verdict, and **turn the finding into a new rule** added to the set. Then write `detection-set.md`: the rule inventory with ATT&CK mappings, the `eval.py` scorecard, the coverage layer's gaps, and the hunt narrative that produced the newest rule.

## Success criteria

- [ ] A **versioned ruleset** of multiple Sigma rules, each mapped to an ATT&CK technique, lints and converts on commit.
- [ ] The set is tested against a real attack dataset *and* a benign corpus; `make eval` fails on regression in either direction.
- [ ] One documented hunt runs hypothesis → verdict and produces a new rule that joins the set.

## Deliverable

A `detection-set/` folder in your repo: the **versioned ruleset** (all `*.yml` + ATT&CK mappings), the **`eval.py` scorecard + regression gate**, the **`navigator_layer.json`**, the **`detection-set.md`** write-up with the hunt narrative, and your committed module notes. Commit the rules — that's the whole point of detection-as-code. **Do not** commit raw exported event logs or PCAPs (see `.gitignore`) — reference the datasets.

## Self-check rubric

Grade your own `detection-set/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Detection-as-code** | A loose rule that only matches the demo data | A versioned set, each rule ATT&CK-mapped, linted and converted on commit | Rules catch the *technique*, proven on a variation, not the exact sample |
| **Testing & regression** | Tested once by hand | `make eval` scores against attack + benign and fails on regression | Adversarial benign in the corpus; tuning rationale documented per rule |
| **Coverage** | No coverage view | Navigator layer with honest gaps and prioritised next detections | Gaps drive the hunt; coverage tied to a real adversary's techniques |
| **Hunt → rule** | Hunt noted, no follow-through | One hunt runs hypothesis→verdict and yields a new rule in the set | Hunt narrative an analyst could replay; the rule generalises beyond the find |

→ Next: **[Module 14 — Alert Triage & Incident Response](modules/14-triage-ir/README.md)** opens Phase 3, whose project is the **[track capstone](README.md#capstone)** — the alert-to-root-cause SOC build that integrates both phases.
