# Cheat sheet — Retrieval-Augmented Generation

*Companion to [Module 04 — Retrieval-Augmented Generation](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

RAG = retrieve relevant chunks from *your* corpus, then put them in the prompt so the model answers from
evidence instead of memory. The failure mode is silent: if retrieval misses, the model confidently
answers from training data. So you build the pipeline **and** the retrieval eval that proves it works.

## The pipeline, four stages

```
chunk  →  embed  →  store/index  →  retrieve top-k  →  stuff into prompt
```

## Chunking (the decision that dominates recall)

```python
# split on structure first (paragraphs/sections), then size-bound with overlap
CHUNK_SIZE = 800        # characters/tokens per chunk — too big dilutes, too small fragments
OVERLAP    = 100        # carry context across the boundary so answers aren't split in half
```

## Embed + store with chromadb

```python
import chromadb
client = chromadb.PersistentClient(path="./corpus")
col = client.get_or_create_collection("soc-kb")   # default embed fn, or pass your own

col.add(documents=chunks, ids=ids, metadatas=metas)   # embeds + indexes in one call

res = col.query(query_texts=["how do we handle a phished user?"], n_results=5)
for doc, dist in zip(res["documents"][0], res["distances"][0]):
    ...   # smaller distance = closer match
```

Swap in a dedicated embedding model (e.g. `nomic-embed-text` via Ollama) when the default underperforms
on your domain — measure before and after.

## Retrieve → prompt

```python
context = "\n\n---\n\n".join(res["documents"][0])
prompt = f"Answer ONLY from the context. If it's not there, say so.\n\n<context>\n{context}\n</context>\n\nQ: {q}"
```

## Measure retrieval — recall@k on a labelled set

```
recall@k = (queries whose relevant chunk appears in top-k) / (total queries)
```

```python
hits = sum(1 for q in labelled if gold_id(q) in [m["id"] for m in retrieve(q, k=5)])
print(f"recall@5 = {hits/len(labelled):.2f}")   # THIS is the scorecard, not a vibe
```

Build a small labelled query set (query → the chunk that should answer it), score recall@k, and gate it
in CI so a chunking/embedding change that drops recall goes red.

## Gotchas worth remembering

- **Retrieval failure is invisible without an eval.** A bad pipeline still returns fluent answers — from
  the model's memory, not your corpus. recall@k is the difference between "seems fine" and "proven."
- **Chunking beats model choice for RAG quality.** Most "the model is dumb" problems are actually "the
  right chunk was never retrieved." Tune chunk size/overlap first.
- **Ground the prompt hard.** "Answer only from context; say 'not in the docs' otherwise" — without it,
  RAG becomes confident hallucination with citations.
- **Retrieved text is untrusted input.** A poisoned document in the corpus is an injection vector (see
  securing-AI) — the model will follow instructions hidden in a chunk unless you delimit and constrain.
- **Re-embed the whole corpus when you change the embedding model.** Vectors from different models aren't
  comparable; mixing them silently wrecks retrieval.
