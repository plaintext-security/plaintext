---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Async & Structured Concurrency

*Companion to [Module 04 — Async & Structured Concurrency](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## asyncio basics

```python
import asyncio

async def fetch(n):                 # a coroutine — calling it returns an awaitable
    await asyncio.sleep(0.3)        # yields the loop while "waiting" (I/O stand-in)
    return n * 2

async def main():
    result = await fetch(21)        # await runs it and gets the value
    return result

asyncio.run(main())                 # ONE entry point — starts the loop, runs, closes it
```

```python
# Run many coroutines concurrently, collect results in order
results = await asyncio.gather(fetch(1), fetch(2), fetch(3))

# Don't let one failure cancel the rest — get exceptions back as values
results = await asyncio.gather(*tasks, return_exceptions=True)

# Structured concurrency (Python 3.11+): a task group cancels siblings on error
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(fetch(1))
    t2 = tg.create_task(fetch(2))
# all tasks are awaited on exit; failures raise as an ExceptionGroup

# Process results as each finishes, not in submit order
for coro in asyncio.as_completed(tasks):
    result = await coro
```

## httpx.AsyncClient — the async HTTP client

```python
import httpx

# ONE client for the whole batch — reuses the connection pool. Not requests (sync-only).
async with httpx.AsyncClient(timeout=10.0) as client:
    r = await client.get("https://api.example/lookup", params={"ip": ip})
    r = await client.post("https://api.example/enrich", json={"iocs": batch})
    r.raise_for_status()            # raise on 4xx/5xx
    data = r.json()
    code = r.status_code
    wait = r.headers.get("Retry-After")
```

```python
# Bound the transport pool (complements your semaphore) + explicit timeouts
limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
timeout = httpx.Timeout(10.0, connect=5.0)   # total, with a tighter connect budget
async with httpx.AsyncClient(limits=limits, timeout=timeout) as client:
    ...
```

## Bounded concurrency — the semaphore

```python
# K = the API's published rate limit, NOT how fast your CPU is
sem = asyncio.Semaphore(8)

async def enrich(client, ioc):
    async with sem:                 # at most K coroutines past this line at once
        r = await client.get(url, params={"q": ioc})
        return r.json()

async with httpx.AsyncClient() as client:
    # `iocs` = the unique src_ip / dest_ip pulled off your validated AlertEvents
    tasks = [enrich(client, i) for i in iocs]
    results = await asyncio.gather(*tasks, return_exceptions=True)
```

## Retry / backoff honoring 429

```python
async def enrich(client, ioc, max_retries=5):
    for attempt in range(max_retries):
        r = await client.get(url, params={"q": ioc})
        if r.status_code != 429:
            r.raise_for_status()
            return Ok(r.json())
        # 429 — the server told you to slow down. Obey it.
        retry_after = r.headers.get("Retry-After")
        delay = float(retry_after) if retry_after else 2 ** attempt
        delay += random.uniform(0, 0.5)      # jitter — avoid lockstep retries
        await asyncio.sleep(delay)           # asyncio.sleep, NOT time.sleep
    return Err("rate-limited past retry budget")
```

```python
# Or express it declaratively with tenacity
from tenacity import retry, wait_exponential_jitter, stop_after_attempt

@retry(wait=wait_exponential_jitter(initial=1, max=30), stop=stop_after_attempt(5))
async def enrich(client, ioc): ...
```

## Handling partial failure

```python
from dataclasses import dataclass

@dataclass
class Ok:  data: dict
@dataclass
class Err: reason: str

# Every task returns a result object — the batch always completes
results = await asyncio.gather(*[enrich(client, i) for i in iocs],
                               return_exceptions=True)
ok  = [r for r in results if isinstance(r, Ok)]
bad = [r for r in results if not isinstance(r, Ok)]   # triage separately
```

## Durable background work — huey (task queue)

```python
# async = in-process & ephemeral (one batch). A task queue = out-of-process,
# durable, retryable — survives a restart. Reach for it when work must OUTLIVE the request.
from huey import SqliteHuey             # no broker service needed; RedisHuey for scale

huey = SqliteHuey(filename="sift.db")

@huey.task(retries=3, retry_delay=10)   # persisted job; auto-retries on failure
def enrich_indicator(ioc: str) -> dict:
    ...                                 # runs in a separate consumer process

enrich_indicator("1.2.3.4")             # enqueues and returns immediately (a future)
```

```bash
# run the worker(s) that drain the queue — separate from your app process
huey_consumer.py sift.tasks.huey -w 4   # 4 workers; queued jobs survive an app restart
```

## Gotchas worth remembering

- **Unbounded `gather` is a thundering herd.** `await asyncio.gather(*[enrich(i) for i in iocs])`
  opens *N* connections at once, floods the API, and gets you `429`'d or key-banned. Always bound —
  `asyncio.Semaphore(K)` and/or `httpx.Limits`.
- **Bare `gather` cancels the batch on the first raise.** One failed call sinks the other 9,999
  results. Use `return_exceptions=True` (minimum) or a typed per-item result (professional).
- **Never `time.sleep()` inside a coroutine** — it blocks the *whole* event loop, freezing every
  other task. Use `await asyncio.sleep(...)`. Same for any sync/blocking call (`requests`, heavy CPU).
- **A `429` is an instruction, not an error.** Honor `Retry-After` (seconds *or* an HTTP date) before
  falling back to exponential backoff; retrying instantly is the herd behavior that gets you banned.
- **Always set timeouts.** `httpx.AsyncClient()` has a default, but be explicit — one hung request
  with no timeout can stall your bound forever.
- **Reuse one client.** A fresh `AsyncClient` per call throws away the connection pool — create it
  once with `async with` around the whole batch.
- **Async is for waiting, not computing.** It overlaps I/O in *one thread*; CPU-bound work still
  serializes. Reach for it when the bottleneck is the network.
- **Async is ephemeral; a queue is durable.** In-process `asyncio` loses in-flight work if the process
  dies. When enrichment must survive a restart / retry later / run continuously, move it to a **task
  queue** (`huey`) — but *not before* (a queue you don't need is just latency + a broker to babysit).
  Long-running multi-step *workflows* graduate to durable execution (Temporal), in the Automation track.

> Only send requests to systems you own or have explicit written permission to test.
