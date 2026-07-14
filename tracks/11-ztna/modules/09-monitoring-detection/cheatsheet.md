---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Monitoring & Detection in Zero Trust (Sigma / metrics)

*Companion to [Module 09 — Monitoring & Detection in Zero Trust](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Sigma rule anatomy (detection-as-code)

```yaml
title: Successful access from unexpected country
id: 7a1c...           # a UUID
status: experimental
logsource:
  product: zta-proxy
  service: access
detection:
  selection:
    event_type: access_allowed        # the proxy allowed a VALID identity
  filter:
    country:                          # the operating set you DO expect
      - US
      - DE
  condition: selection and not filter # fire on allowed access from anywhere else
level: high
```

The `selection and not filter` pattern is the workhorse: match the event, subtract the benign known-good.

## Convert / test a Sigma rule

```bash
pip install sigma-cli                                   # the sigma converter
sigma convert -t <backend> rule.yml                     # compile to a target query language
sigma check rule.yml                                    # validate rule structure/fields
# fire it against bundled events (backend-specific) and confirm it selects the anomaly, not the benign
```

## Scoring a detection — the confusion matrix

```
                 actual ANOMALY   actual BENIGN
rule FIRED          TP               FP
rule SILENT         FN               TN

precision = TP / (TP + FP)     # of what it flagged, how much was real
recall    = TP / (TP + FN)     # of the real anomalies, how many it caught   ← load-bearing
FP-rate   = FP / (FP + TN)     # benign events it fired on = analyst-time cost
accuracy  = (TP+TN)/total      # MISLEADS on imbalanced data — a rule that never fires is 99% "accurate"
```

For a leading-indicator geo-detection, **recall** is the metric that matters: a missed
credential-compromise can be a breach; a false positive costs an analyst a few minutes.

## Held-out corpus — the honest test

```
Score the rule on data it was NEVER tuned on. Stock it with the cases that BREAK a naive geo-rule:
  malicious:  foreign login · session that STARTS in-country then continues abroad · impossible-travel pair
  benign:     executive on a real (HR-logged) trip · dev whose VPN egresses abroad · cloud job in a DC region

Regression gate (in CI):
  recall drops below threshold  → build RED (rule went too NARROW — stopped catching a variant)
  FP-rate climbs above threshold → build RED (rule went too BROAD — fires on legit travel)
Prove the gate goes RED on a deliberately over-broad/over-narrow copy — a gate you've only seen pass isn't a gate.
```

## Drift detector — posture over time (declare → observe → diff → reconcile)

```
Declare (as code) the intended baseline:  max token lifetime · allowed policy exceptions · required posture checks
Observe the running config.
Diff observed vs declared; exit non-zero when they differ.
Reconcile back to the baseline.

The three silent drifts to catch:
  token-lifetime creep       (15 min quietly bumped to 8 hrs — every stolen token lives 32× longer)
  accreted allow-exceptions  (the "temporary" contractor→DB rule that outlived the contractor)
  disabled posture checks     (device-compliance flipped to "log only" and never flipped back)
```

## Gotchas worth remembering

- **A detection measured only on the demo set is a memorised exam.** The events you watched it fire on
  are the ones you tuned against — the number only means something on a *held-out* corpus the rule never
  saw. Never let AI generate the corpus *and* score against it; that's the contamination this module
  warns against — you label each near-miss by hand.
- **Recall over accuracy for leading indicators.** Accuracy hides both a missed breach and a flood of
  false positives on imbalanced data. Choose the metric deliberately and justify it — a model defaults
  to accuracy; override it.
- **A regression gate you've only seen pass is not a gate.** Prove it goes RED on a deliberately
  too-broad and too-narrow copy of the rule.
- **Coverage ≠ effectiveness.** A 500-event corpus of easy traffic is worse than a 30-event one that
  includes the VPN-egress near-miss and the impossible-travel pair. Sample the failure modes; don't
  count items.
- **The eval must fail *closed*.** If the score is missing or the eval errors, the build must go RED —
  a broken eval that silently passes is worse than no eval.
- **"Trust nothing" is a posture you hold over time, not a switch you flip once.** None of the three
  posture drifts throws an alarm on its own — only a declared-vs-observed diff catches them.
