---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Running Local Models

*Companion to [Module 02 — Running Local Models](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

Run an LLM on your own hardware when the data can't leave (IR on real logs, classified corpora). The
tradeoff is always **quality vs. footprint** — quantization shrinks the model to fit your VRAM at a
measurable cost in answer quality. Measure both.

## Ollama — the fast path

```bash
ollama pull llama3.1:8b            # download a model (tag = params:quant)
ollama run llama3.1:8b             # interactive chat
ollama list                       # what's downloaded
ollama ps                         # what's loaded in memory right now
ollama rm llama3.1:8b             # reclaim disk
echo "classify this alert" | ollama run llama3.1:8b   # one-shot from stdin
```

```bash
# HTTP API (local server on :11434) — this is what your scripts call
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b", "prompt": "…", "stream": false
}'
```

## Modelfile — pin a system prompt + params as a reusable model

```dockerfile
FROM llama3.1:8b
PARAMETER temperature 0.2         # low temp = deterministic; right for triage/extraction
PARAMETER num_ctx 8192            # context window (larger = more VRAM)
SYSTEM "You are a SOC triage assistant. Answer only from provided context."
```

```bash
ollama create soc-triage -f Modelfile && ollama run soc-triage
```

## Quantization (the GGUF tags you'll pick between)

```
Q4_K_M   ~4-bit, best size/quality balance — the usual default
Q5_K_M   ~5-bit, a bit better, a bit bigger
Q8_0     ~8-bit, near-full quality, ~2x the Q4 footprint
fp16     full precision — only if VRAM is plentiful
```

Rough VRAM rule of thumb: **params × bytes-per-weight**. An 8B model at Q4 (~0.5 B/weight) ≈ 4–5 GB;
at fp16 ≈ 16 GB. If it doesn't fit VRAM, layers spill to CPU/RAM and tokens/sec collapse.

## llama.cpp (when you want direct control)

```bash
llama-cli -m model.Q4_K_M.gguf -p "prompt" -n 256   # -n = max tokens to generate
llama-server -m model.Q4_K_M.gguf -c 8192           # OpenAI-compatible server on :8080
```

## Benchmark it — throughput AND quality

```bash
ollama run llama3.1:8b --verbose "…"   # prints eval rate (tokens/sec) after the reply
```

Quality is measured against *your* labelled data, not a public leaderboard — feed it your own alerts
and score the answers (see the eval-harness module). The deliverable is the running model **plus** its
measured baseline.

## Gotchas worth remembering

- **Quantization is lossy — measure the cost, don't assume it.** Q4 is usually fine for triage/extraction
  but can degrade multi-step reasoning. The only way to know is to score it on your own task.
- **Low temperature for security work.** `temperature 0.2` (or 0) makes extraction and classification
  repeatable; high temp invents plausible-but-wrong IOCs.
- **Context window is VRAM you pay for.** `num_ctx 8192` costs memory whether or not you fill it — size
  it to the job, not the max.
- **"Local" is the security property.** The reason to run a 8B Q4 model that's weaker than a frontier
  API is that the data *never leaves the host*. If the data can leave, a hosted frontier model is
  usually the better answer — be honest about which regime you're in.
- **Tokens/sec depends on fitting in VRAM.** A model one quant-level too large spills to CPU and runs
  10× slower — check `ollama ps` shows it fully GPU-loaded.
