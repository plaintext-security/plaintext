# Cheat sheet — SOAR + AI

*Companion to [Module 08 — SOAR + AI](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

Wiring a model into a SOAR workflow is powerful and dangerous: automation acts. The rule that makes it
safe: a **human-in-the-loop gate that escalates on low confidence and never auto-acts on a model
failure.** The AI enriches and recommends; the workflow gates the action.

## The safe workflow shape (n8n / Shuffle / Tines)

```
Trigger (alert)
  → Enrich (MCP tools / lookups)
  → AI node: classify + confidence (structured output)
  → IF confidence ≥ threshold AND action is reversible
        → auto-remediate (low-risk only) → log
     ELSE
        → create ticket / page human  → WAIT for approval → act
  → Always: append to audit log
```

## The AI node — force structured output

```json
// HTTP Request node → your model endpoint; expect a schema back, not prose
{ "label": "phishing", "confidence": 0.82, "recommended_action": "quarantine_email" }
```

Parse the JSON in the next node and branch on it — never regex free text to decide an action.

## The gate (IF node logic)

```
confidence >= 0.9   AND   action in {enrich, tag, notify}      → auto
confidence <  0.9    OR   action in {block, disable, quarantine} → human approval
model_error OR unparseable output                               → fail CLOSED → human
```

## Fail closed

```
try:    verdict = parse(ai_output)
except: route_to_human("AI node failed — manual triage")   # NEVER default to auto-act on error
```

## Gotchas worth remembering

- **Automation acts — that's the whole risk.** A wrong classification in a report is embarrassing; a
  wrong classification wired to `disable_user` is an outage. The gate, not the model, is what makes this
  safe.
- **Fail closed, always.** On a model error, timeout, or unparseable response, the default must be
  "escalate to a human," never "proceed." A silent failure that auto-acts is the nightmare case.
- **Only auto-act on reversible, low-risk steps.** Enrich, tag, notify — yes. Block, quarantine, disable
  — human approval, because undo is expensive or impossible.
- **Log every decision for audit.** Which alert, what the model said, what confidence, what action,
  who approved. SOAR + AI without an audit trail is unreviewable.
- **Confidence thresholds need tuning against real data**, not a guessed 0.9 — carry over the scorecard
  discipline from the triage module.
