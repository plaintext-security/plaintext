---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Eval Harness, Property Tests & Supply Chain

*Companion to [Module 09 — Eval Harness, Property Tests & Supply Chain](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Eval-as-code with `pydantic-evals` (held-out corpus → scorecard)

```python
from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import Evaluator, EvaluatorContext

# One labelled example: a real Suricata `alert` event -> expected TP/FP ground-truth label.
# The corpus is HELD OUT — nothing in your tuning/threshold path reads it.
dataset = Dataset(cases=[
    Case(name="alert-001", inputs=alert, expected_output="malicious"),   # true positive
    Case(name="alert-002", inputs=alert2, expected_output="benign"),     # false positive
])

class LabelMatch(Evaluator):                       # a scorer: 1.0 hit, 0.0 miss
    def evaluate(self, ctx: EvaluatorContext) -> float:
        return float(ctx.output == ctx.expected_output)

# task() is the thing under test — sift's triage verdict for one input.
report = dataset.evaluate_sync(task, evaluators=[LabelMatch()])
report.print()                                     # the scorecard
```

- `Case(inputs=..., expected_output=..., metadata=...)`; a `Dataset` is a list of `Case`s plus evaluators.
- Load the corpus from `holdout.jsonl` into `Case`s — do **not** inline it next to your thresholds.
- `evaluate_sync(task, ...)` runs `task` over every case; `evaluate(...)` is the async twin.
- The API moves between releases — read your **pinned** version's docs, not a blog post.

## Precision / recall for a triage classifier (not accuracy)

```python
tp = sum(p == "malicious" and e == "malicious" for p, e in pairs)  # caught real
fp = sum(p == "malicious" and e == "benign"    for p, e in pairs)  # false alarm
fn = sum(p == "benign"    and e == "malicious" for p, e in pairs)  # MISSED attack

precision = tp / (tp + fp)   # of what we flagged, how much was real
recall    = tp / (tp + fn)   # of the real attacks, how many we caught
```

- **Recall** protects you from the miss that gets someone breached; **precision** protects the analyst from alert fatigue. Pick which matters — and write down why — *before* reading the number.
- `sklearn.metrics.precision_score` / `recall_score` / `classification_report` do this if you prefer a library.

## CI regression gate (fail the build below baseline)

```python
def test_triage_meets_baseline():
    report = dataset.evaluate_sync(task, evaluators=[LabelMatch()])
    p, r = precision_recall(report)
    assert p >= 0.80, f"precision regressed: {p:.3f}"   # thresholds YOU justify
    assert r >= 0.90, f"recall regressed: {r:.3f}"      # build goes red below
```

- Prove it works: plant a regression (loosen a rule / swap a worse prompt) → watch red → revert → green.
- The gate is the deliverable, not the score. A scorecard nobody asserts on is a vanity dashboard.

## Property tests with `hypothesis` (fuzz the M2 EVE validator)

```python
from hypothesis import given, example, strategies as st
from pydantic import ValidationError

# EVE-shaped payloads: an event_type plus arbitrary envelope/nested fields.
@given(st.fixed_dictionaries(
    {"event_type": st.text()},
    optional={"timestamp": st.text(), "src_ip": st.text(), "alert": st.dictionaries(st.text(), st.integers())},
))
@example({"event_type": "stats"})              # unmodelled type -> no union member -> quarantine
@example({"event_type": "alert", "alert": {"severity": 5}})  # out of Suricata's 1..3 range
def test_eve_validator_never_half_parses(payload):
    try:
        event = AlertEvent.model_validate(payload)  # M2 boundary (or TypeAdapter(EveEvent) once the union grows)
    except ValidationError:
        return                                       # rejecting malformed EVE is correct -> quarantine
    assert isinstance(event, AlertEvent)             # else: a fully-formed event, never a half-object
```

- State a **property** ("either a well-formed event or a `ValidationError` — never a half-parse, never some *other* exception"), then let `hypothesis` generate hundreds of adversarial EVE-shaped inputs and **shrink** any failure to the minimal case.
- Keep the shrunk failing input as an `@example` regression once you fix the validator.
- Avoid `assume(...)` that swallows the interesting inputs — that quietly disables the fuzz.

```bash
pytest -q                                   # runs @given tests like any pytest
pytest --hypothesis-seed=0                  # reproduce a flaky generated failure
```

## Supply-chain gate — `pip-audit` + hash-locked lockfile

```bash
uv lock                                     # resolve + write hash-locked uv.lock
uv sync --locked                            # install EXACTLY the lock (fails on drift)
pip-audit -r requirements.txt               # audit a pinned file against the advisory DB
pip-audit                                   # audit the current environment
uv export --format requirements-txt \
  --no-emit-project > requirements.txt      # hashes for --require-hashes installs

pip install --require-hashes -r requirements.txt   # refuses any byte-mismatch
```

- In CI, run `pip-audit` over the **lockfile** (not a loose `requirements.txt`) and fail the build on any known-vulnerable version.
- `--require-hashes` / `uv sync --locked` fail install when the bytes don't match what you locked — the exact tamper `torchtriton` relied on nobody checking.
- Prove it: pin a known-vulnerable version or drift the lock → build red → restore → green.

## Gotchas worth remembering

- **The held-out set is sacred.** Never tune prompts, thresholds, or rules against your eval corpus — optimize on it and the score becomes a mirror that always flatters you. Say so *in the repo* so it can't happen by accident.
- **Accuracy lies under class imbalance.** If 98% of alerts are benign, "say benign to everything" scores 98% and catches zero attacks. Read **precision and recall**, never accuracy alone, on skewed data.
- **The CI gate is the deliverable, not the number.** A one-time scorecard is a vanity metric; the value is the assertion that turns a silent prompt/model regression into a red build the day it lands.
- **Property tests find what examples miss.** Your hand-written bad payloads encode *your* imagination of malformed input; `hypothesis` generates the input you didn't think of and shrinks it to something debuggable.
- **Pin `pydantic-evals`.** It's young and its API (`Case`, `Dataset`, evaluator signatures, report shape) shifts between releases — pin an exact version and learn the durable shape: held-out cases → scorer → CI threshold.
- **Close the supply-chain loop from Module 01.** A lockfile is only a control once CI fails on drift or a vulnerable version — untested, unmeasured, unpinned is the copilot's default this module exists to end.
