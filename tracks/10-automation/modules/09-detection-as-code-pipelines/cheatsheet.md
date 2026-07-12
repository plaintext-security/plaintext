# Cheat sheet — Detection-as-Code Pipelines (Sigma + pytest)

*Companion to [Module 09 — Detection-as-Code Pipelines](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## sigma-cli — lint and compile rules

```bash
sigma check data/rules/                  # validate syntax/structure of every rule (exit 1 on error)
sigma check rules/win_susp_enc.yml       # one rule
sigma list backends                      # available conversion targets
sigma convert -t splunk data/rules/      # compile rules to a backend query language
sigma convert -t splunk -o out.txt rules/   # write compiled queries to a file
```

`sigma check` is the cheap first gate — it rejects a misspelled `condition:` key or a malformed
`detection:` block before anything else runs.

## pytest — the intent table (does the rule fire on what it should?)

```python
import pytest
from conftest import match_rule        # in-process matcher: match_rule(rule, event) -> bool

CASES = [
    # (rule,                 event,             should_match)
    ("win_susp_enc.yml",     ENC_POWERSHELL,    True),   # malicious → must fire
    ("win_susp_enc.yml",     BENIGN_POWERSHELL, False),  # near-miss benign → must NOT fire
    ("win_new_service.yml",  SC_CREATE,         True),
    ("win_new_service.yml",  ROUTINE_SVC,       False),
]

@pytest.mark.parametrize("rule,event,expected", CASES)
def test_detection_intent(rule, event, expected):
    assert match_rule(rule, event) is expected
```

```bash
pytest data/tests/ -v                    # per-case pass/fail, human-readable
pytest data/tests/ -q                    # quiet — the CI form (exit code is the signal)
pytest data/tests/ -k enc                # run only cases whose id matches 'enc'
pytest data/tests/ -x                    # stop on first failure
```

Give every case a stable id so a failure names the rule, not `[case3]`:

```python
@pytest.mark.parametrize("rule,event,expected", CASES,
    ids=[f"{c[0]}-{'hit' if c[2] else 'miss'}" for c in CASES])
```

## The CI gate — chain the stages, fail fast

```bash
# ci-gate.sh — any stage exits non-zero → the merge is blocked
sigma check data/rules/ && pytest data/tests/ -q
```

```yaml
# .github/workflows/sigma-ci.yml
on: [push, pull_request]
permissions: { contents: read }
jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<pinned-sha>
      - run: sigma check data/rules/                 # stage 1: lint
      - run: pytest data/tests/ -q                   # stage 2: intent table
      - run: python3 eval.py --gate recall=0.90 --gate fp_rate=0.10   # stage 3: metric regression gate
```

## Gotchas worth remembering

- **A rule that isn't measured isn't a detection — it's a guess with a YAML file and good demo luck.**
  Score every rule against a **held-out, labelled corpus** it was never tuned on; tuning against your
  eval set launders overfitting into a green build.
- **Recall first — accuracy lies on imbalanced data.** With 1 malicious event per 10,000, a rule that
  never fires is 99.99% "accurate" and catches nothing. Gate on recall (did it catch the attack) and
  false-positive rate (will it drown the analyst), not accuracy.
- **Every rule needs a matching *benign* case, not just a malicious one.** The near-miss benign is
  what catches an over-widened selection — a rule that fires on everything passes a match-only test.
- **Detections rot silently — a cosmetic refactor drops `-enc`, a field rename matches nothing, and
  git still looks fine.** The regression gate exists precisely because nothing else tells you.
- **Prove the gate both ways.** GREEN on the good ruleset and RED on a *planted* regression — a gate
  you've only ever seen pass hasn't been shown to block anything.
- **`sigma convert` to your real backend as a stage** — fail on an empty compiled query; a rule that
  lints fine can still compile to nothing on your SIEM.
