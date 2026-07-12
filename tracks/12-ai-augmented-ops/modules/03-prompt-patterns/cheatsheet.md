# Cheat sheet — Prompt Patterns for Security

*Companion to [Module 03 — Prompt Patterns for Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

Treat prompts as **versioned artifacts**, not throwaway strings: they live in git, have tests, and a CI
check catches a regression when someone "improves" one. The building blocks below are what you version.

## Structured output — force JSON you can parse

The single most useful security pattern: make the model return a schema, then validate it. With the
Anthropic SDK, use a tool definition as the schema and read the tool call back.

```python
from anthropic import Anthropic
client = Anthropic()

SCHEMA = {
    "name": "triage",
    "description": "Structured triage of one alert",
    "input_schema": {
        "type": "object",
        "properties": {
            "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
            "is_true_positive": {"type": "boolean"},
            "rationale": {"type": "string"},
        },
        "required": ["severity", "is_true_positive", "rationale"],
    },
}

msg = client.messages.create(
    model="claude-sonnet-5",              # capable default; claude-haiku-4-5 for cheap high-volume
    max_tokens=512,
    tools=[SCHEMA],
    tool_choice={"type": "tool", "name": "triage"},   # force the structured call
    messages=[{"role": "user", "content": alert_text}],
)
result = next(b.input for b in msg.content if b.type == "tool_use")
```

## The prompt anatomy that holds up

```
System:   role + hard rules ("answer ONLY from context", "never invent IOCs")
Context:  the retrieved/pasted evidence, clearly delimited
Task:     the specific ask, one job per call
Format:   the schema (enforced via the tool above, not just asked for)
```

- **Delimit untrusted input.** Wrap logs/alerts in explicit markers so the model can't confuse data for
  instructions — the seed of prompt injection (see the attacking-AI module).
- **One job per call.** "Classify AND summarize AND extract" degrades all three; chain single-purpose
  calls instead.

## Version + test prompts with promptfoo

```yaml
# promptfooconfig.yaml — prompts are files, tests assert on outputs
prompts: [prompts/triage.txt]
providers: [anthropic:messages:claude-sonnet-5]
tests:
  - vars: { alert: "sshd: 5000 failed logins from one IP" }
    assert:
      - type: is-json
      - type: javascript
        value: JSON.parse(output).severity === "high"
```

```bash
promptfoo eval          # run the suite; red on any failed assertion
promptfoo view          # browse results in the UI
```

## Gotchas worth remembering

- **Never trust free-text output — validate the schema.** "Return JSON" is a request, not a guarantee;
  parse it and reject on failure. The tool/`tool_choice` pattern makes the model *call* the schema,
  which is far more reliable than asking politely.
- **Prompts regress silently.** A wording tweak that helps one case breaks five others. Without a
  committed test suite + CI gate you won't notice until production — that's the whole module.
- **Pin the model in the config.** The same prompt behaves differently across models/versions; the
  version is part of the artifact you're testing.
- **Low temperature for graded tasks.** Determinism makes the eval meaningful; a high-temp prompt that
  passes today may fail the identical test tomorrow.
- **Untrusted content is data, not instructions** — and the model doesn't know the difference unless you
  delimit it. Every alert you paste in is potential injection.
