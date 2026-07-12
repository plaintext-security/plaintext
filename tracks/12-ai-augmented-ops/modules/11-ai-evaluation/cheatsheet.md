# Cheat sheet — AI Evaluation & Observability

*Companion to [Module 11 — AI Evaluation & Observability](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

The deliverable is a **reusable eval harness**, not a one-off accuracy number: a held-out labelled set, a
scorecard, and a CI gate that goes red when a change silently degrades the system. If you can't measure a
regression, you can't ship AI safely.

## The harness shape

```
held-out set (never used to tune)  →  run system  →  score vs. labels  →  gate: fail if below baseline
```

## Metrics — pick per task

```
Classification/triage:  precision, recall, F1   (read the confusion matrix, not accuracy)
Retrieval / RAG:        recall@k, MRR           (did the right chunk come back?)
Generation quality:     LLM-as-judge rubric, exact-match, or human grade
Faithfulness (RAG):     is the answer grounded in retrieved context? (e.g. ragas)
```

```python
precision = TP/(TP+FP); recall = TP/(TP+FN)
f1 = 2*precision*recall/(precision+recall)
recall_at_k = hits_in_topk / total_queries
```

## LLM-as-judge (grading free-text answers)

```python
# a model scores another model's output against a rubric — cheap, scalable, imperfect
judge = client.messages.create(
    model="claude-sonnet-5", max_tokens=256,
    messages=[{"role": "user", "content":
        f"Rubric: is the answer grounded and correct? Answer PASS/FAIL + reason.\n\n{answer}"}],
)
# validate the judge itself against human labels before trusting it
```

## Gate it in CI (the point of the whole module)

```yaml
# promptfoo / pytest — fail the build when the score drops below baseline
promptfoo eval --assert          # non-zero exit on any failed threshold
```

```python
assert recall_at_k >= BASELINE, f"retrieval regressed: {recall_at_k} < {BASELINE}"
```

## Gotchas worth remembering

- **A held-out set is sacred — never tune on it.** The moment you optimize against your eval set, it
  stops measuring generalization and starts flattering you. Keep a set the system has never seen.
- **Accuracy lies under class imbalance.** 99%-false-positive alert streams make "always say benign"
  score 99% — read precision/recall/confusion matrix, never a single accuracy number.
- **The gate is the deliverable, not the number.** A score today is worthless next month; a CI check that
  goes red on a silent regression is what protects you over time.
- **Validate your judge.** LLM-as-judge is scalable but can be systematically wrong — spot-check it
  against human grades before you trust its verdicts, and re-check when you change judge models.
- **Observability ≠ evaluation.** Logging what the system did (observability) tells you *what happened*;
  the eval set tells you *whether it was right*. You need both, and the gate needs the eval.
