# Cheat sheet — AI-Assisted Detection & Triage

*Companion to [Module 07 — AI-Assisted Detection & Triage](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

Using a model to triage alerts is only defensible if you've **measured** it against ground truth. This
sheet is the scoring machinery: a labelled corpus, a confusion matrix, and a threshold gate.

## The classification call (force a graded schema)

```python
from anthropic import Anthropic
client = Anthropic()

def triage(alert):
    m = client.messages.create(
        model="claude-haiku-4-5-20251001",       # cheap + fast is right for high-volume triage
        max_tokens=256,
        tools=[{"name": "verdict", "description": "Triage verdict for one alert",
                "input_schema": {"type": "object", "properties": {
                    "label": {"type": "string", "enum": ["true_positive", "false_positive"]},
                    "confidence": {"type": "number"}},
                    "required": ["label", "confidence"]}}],
        tool_choice={"type": "tool", "name": "verdict"},
        messages=[{"role": "user", "content": alert}],
    )
    return next(b.input for b in m.content if b.type == "tool_use")
```

## Confusion matrix + metrics (the scorecard)

```
                 predicted +    predicted -
   actual +          TP             FN         ← FN = missed real attack (the costly one)
   actual -          FP             TN         ← FP = analyst fatigue
```

```python
precision = TP / (TP + FP)     # of alerts it flagged, how many were real
recall    = TP / (TP + FN)     # of real attacks, how many it caught  ← usually the one that matters
f1        = 2*precision*recall / (precision + recall)
```

## Gate at a threshold

```python
# only auto-close when the model is BOTH confident AND the class is cheap-to-be-wrong
if v["label"] == "false_positive" and v["confidence"] >= 0.95:
    auto_close(alert)          # everything else → human queue
else:
    escalate(alert)
```

## Re-eval cadence

Alerts drift; models change. Re-run the scorecard on a fresh labelled sample on a schedule (and in CI on
any prompt/model change) — a threshold that was safe last quarter may not be now.

## Gotchas worth remembering

- **Recall is usually the metric that matters — a false negative is a missed breach.** Tune the
  threshold to your cost asymmetry: auto-closing a real attack is far worse than queuing a false alarm.
- **Never let the model auto-action the costly direction.** Auto-closing "false positives" at high
  confidence is defensible; auto-*escalating* or auto-*blocking* on a model call is not — gate it.
- **A score without a labelled set is theater.** You cannot claim precision/recall without ground truth;
  building and maintaining the labelled corpus IS the work.
- **Confidence is not calibrated by default.** A model's "0.95" isn't a real probability — validate that
  your threshold actually holds on held-out data, don't assume the number means what it says.
- **Class imbalance hides failure.** If 99% of alerts are false positives, "always say FP" scores 99%
  accuracy and misses every attack — that's why you read the confusion matrix, not accuracy.
