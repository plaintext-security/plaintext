# Cheat sheet — HTTP & APIs for Enrichment

*Companion to [Module 04 — HTTP & APIs for Enrichment](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## httpx — the basics

```python
import httpx

r = httpx.get("https://api.example.com/ip/8.8.8.8", timeout=10.0)  # ALWAYS set a timeout
r.status_code        # 200
r.json()             # parsed JSON body (raises on non-JSON)
r.text               # raw body as str
r.headers            # case-insensitive dict
r.raise_for_status() # raise HTTPStatusError on 4xx/5xx — opt in, not automatic
```

## Client — the session (auth + connection reuse)

```python
import os

# Headers set on the Client apply to every request in the session — set auth ONCE.
with httpx.Client(
    base_url="https://api.example.com",
    headers={"X-API-Key": os.environ["VT_API_KEY"]},   # key from env, never source
    timeout=httpx.Timeout(10.0, connect=5.0, read=30.0),
) as client:
    r = client.get("/ip/8.8.8.8")                      # path is joined to base_url
    r = client.post("/lookup", json={"ioc": "8.8.8.8"})
```

## Timeouts — the most dangerous default is None

```python
# httpx's default is NO timeout — one hung call hangs the whole run.
httpx.get(url, timeout=10.0)                       # single value = all phases

# Fine-grained: pass a default OR set all four phases explicitly.
httpx.Timeout(10.0)                                # 10s for connect/read/write/pool
httpx.Timeout(10.0, connect=5.0, read=30.0)        # default 10, override connect & read
httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)  # all four, no default
```

## Status-code-first handling

```python
def enrich(client, ioc):
    r = client.get(f"/ip/{ioc}")
    if r.status_code == 200:
        return r.json()                            # verdict
    if r.status_code == 404:
        return None                                # unknown IOC — log and SKIP, not crash
    if r.status_code == 429:
        raise RateLimited(retry_after(r))          # caller sleeps + retries
    if r.status_code >= 500:
        raise ServerError(r.status_code)           # caller backs off
    r.raise_for_status()                           # anything else is a real bug
```

## 429 retry + exponential backoff

```python
import time

def retry_after(r) -> float:
    hdr = r.headers.get("Retry-After")             # server tells you how long to wait
    return float(hdr) if hdr and hdr.isdigit() else 0.0

def enrich_with_retry(client, ioc, max_retries=3):
    for attempt in range(max_retries):
        r = client.get(f"/ip/{ioc}")
        if r.status_code == 200:
            return r.json()
        if r.status_code == 404:
            return None
        if r.status_code == 429:
            time.sleep(retry_after(r) or 2 ** attempt)   # honour header, else backoff
            continue
        if r.status_code >= 500:
            time.sleep(2 ** attempt)               # 1s, 2s, 4s
            continue
        r.raise_for_status()
    return None                                    # gave up after max_retries — skip IOC
```

## Timeout & error exceptions

```python
try:
    r = client.get(url)
except httpx.TimeoutException:                     # covers connect/read/write/pool timeouts
    ...
except httpx.HTTPStatusError as e:                 # only from raise_for_status()
    e.response.status_code
except httpx.RequestError as e:                    # base class: DNS, connection, protocol
    ...
```

## Gotchas worth remembering

- **Set a timeout on every call (or on the Client).** The default is `None` — no timeout — so one
  hung API on the worst possible night hangs your entire enrichment run with no error, no progress.
- **Auth on the `Client`, not per call.** Session-level headers set the key once and reuse the
  connection, which respects the rate-limit queue better than a fresh connection per request.
- **Load API keys from the environment, never the source file.** `os.environ["VT_API_KEY"]` keeps
  the secret out of git and out of code review.
- **Cap your retries.** Three is usually right. Retrying forever turns a rate-limit into a hang;
  after the cap, log and skip the IOC — a tool that finishes minus a few IOCs beats one that never does.
- **Check the status code before reading the body.** `r.json()` on a `429` or `503` error page
  raises a confusing decode error that masks the real problem.
- **`raise_for_status()` is opt-in.** httpx does *not* raise on 4xx/5xx by default — you decide
  per status code, which is exactly what you want when 404 and 429 mean different things.
