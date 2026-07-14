---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — A SoC Copilot (MCP + RAG)

*Companion to [Module 06 — A SoC Copilot (MCP + RAG)](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

The copilot is the integration: a **model** (local or hosted) + **RAG** (your runbooks/KB) + **MCP
tools** (enrichment, lookups), wired so every answer is auditable. It's only as trustworthy as its
weakest input — and it has three (prompt, retrieved docs, tool output), all untrusted.

## The request flow

```
alert ──▶ retrieve KB chunks (RAG) ──┐
                                     ├──▶ model call with context + tools ──▶ answer + citations
analyst question ────────────────────┘         │
                                     tool calls (MCP): enrich IP, pull logs
```

## Wire the three pieces

```python
from anthropic import Anthropic
client = Anthropic()

def copilot(question, kb, mcp_tools):
    ctx = "\n---\n".join(kb.query(question, k=5)["documents"][0])   # RAG
    return client.messages.create(
        model="claude-sonnet-5",                # or a local model via an OpenAI-compatible endpoint
        max_tokens=1024,
        system="Answer only from context and tool results. Cite sources. Say when unsure.",
        tools=mcp_tools,                         # MCP tool schemas
        messages=[{"role": "user",
                   "content": f"<context>{ctx}</context>\n\nQ: {question}"}],
    )
```

## Make it auditable (non-negotiable for a SOC)

```python
log.info({"q": question, "retrieved_ids": ids, "tool_calls": calls,
          "model": "claude-sonnet-5", "answer": text, "citations": srcs})
```

Every answer should be reconstructable: what was retrieved, which tools ran with which args, what the
model said. No black boxes in an investigation.

## Score it end-to-end

Build a labelled Q&A set over your corpus and grade the copilot's answers (correct? grounded? cited?) —
the deliverable is the running copilot **and** its answer-quality scorecard, re-run in CI.

## Gotchas worth remembering

- **Three untrusted inputs, not one.** The analyst's question, the retrieved documents, and the tool
  outputs can all carry injection. A poisoned runbook chunk can hijack the copilot as surely as a
  malicious prompt — constrain and delimit all three.
- **Citations or it didn't happen.** An answer a SOC analyst can't trace to a source is worse than no
  answer — it launders a hallucination as fact. Force source attribution.
- **The copilot advises; it doesn't act.** Keep mutating tools behind a human gate. A confidently wrong
  copilot that can *only talk* is recoverable; one that can block/quarantine on its own is an incident.
- **Log for reconstruction, not just debugging.** In a real investigation you'll need to prove what the
  copilot saw and did — structured, replayable logs are part of the build.
- **Grade end-to-end, not per-component.** Good retrieval + good model can still produce a bad answer;
  the only score that matters is the final answer against ground truth.
