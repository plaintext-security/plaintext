---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Enrichment with Runspaces & Throttling

*Companion to [Module 04 — Enrichment with Runspaces & Throttling](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## `ForEach-Object -Parallel` — fan out with a bound

```powershell
# Run the body in separate runspaces, at most N concurrently.
$indicators | ForEach-Object -ThrottleLimit 5 -Parallel {
    $ip = $_                       # the current item
    Start-Sleep -Milliseconds 50  # stand-in for an API call
    [pscustomobject]@{ Indicator = $ip; Checked = $true }
}
```

`-ThrottleLimit` is a **politeness contract** with whatever you call, not a raw speed dial. Bound it to
the feed's rate limit. Unset or set-to-input-size = effectively unbounded = rate-limited or IP-banned.
`-Parallel` requires PowerShell 7+.

## `$using:` — the parallel body can't see your variables

```powershell
$feed = @{ '185.220.101.7' = 'Emotet' }        # outer scope
$bag  = [System.Collections.Concurrent.ConcurrentBag[pscustomobject]]::new()

$indicators | ForEach-Object -ThrottleLimit 5 -Parallel {
    $table = $using:feed          # REQUIRED — without $using: it's $null
    $sink  = $using:bag
    $hit   = $table[$_]
    $sink.Add([pscustomobject]@{ Indicator = $_; Malware = $hit })
}
```

The parallel scriptblock is a **fresh runspace**; outer variables are *copied in* only via `$using:`.
Forget it and lookups run against `$null` (everything looks "clean" — the silent failure).

## Thread-safe collection — never `+=` across threads

```powershell
# WRONG — read-modify-write race; silently drops results, count wobbles run to run.
$results = @()
$in | ForEach-Object -Parallel { $results += $_ }     # <-- broken

# RIGHT — ConcurrentBag is safe for concurrent .Add()
$bag = [System.Collections.Concurrent.ConcurrentBag[pscustomobject]]::new()
$in | ForEach-Object -Parallel { ($using:bag).Add($_) }
$bag.ToArray() | Sort-Object Indicator                # stable output order
```

Prove the race: run the `+=` version several times over a few thousand items and watch `.Count` change.
Other thread-safe options: `[System.Collections.Concurrent.ConcurrentDictionary[TKey,TValue]]` (dedup +
lookup), `[System.Collections.Concurrent.ConcurrentQueue[T]]` (FIFO).

## Retry with exponential backoff

```powershell
$attempt = 0
while ($true) {
    $attempt++
    try {
        $result = Get-Enrichment $ip    # e.g. a real API call that can 429/timeout
        break
    }
    catch {
        if ($attempt -ge $maxRetry) { throw }
        Start-Sleep -Milliseconds ($baseMs * [math]::Pow(2, $attempt - 1))  # 50,100,200...
    }
}
```

Back off *exponentially* (not instant retry) so a transient `429 Too Many Requests` or dropped connection
recovers without hammering the feed. Add **jitter** (`+ (Get-Random -Max $baseMs)`) to avoid a thundering
herd when many lookups fail at once.

## The correct enrichment shape (load once, fan out, collect, retry)

```text
1. Collect + DE-DUP indicators        -> query each unique one exactly once
2. Load the feed ONCE (this thread)   -> in-memory lookup; keep network out of the hot loop
3. ForEach-Object -Parallel -Throttle -> $using: the feed + the ConcurrentBag
4.   per item: retry-with-backoff lookup -> .Add() the typed result to the bag
5. $bag.ToArray() | Sort-Object       -> deterministic, typed output
```

## Raw runspace pool — what the wrapper does underneath

```powershell
$pool = [runspacefactory]::CreateRunspacePool(1, 5)   # min, max (the throttle)
$pool.Open()
$jobs = foreach ($ip in $indicators) {
    $ps = [powershell]::Create()
    $ps.RunspacePool = $pool
    [void]$ps.AddScript({ param($x) "checked $x" }).AddArgument($ip)
    [pscustomobject]@{ PS = $ps; Handle = $ps.BeginInvoke() }
}
$results = foreach ($j in $jobs) { $j.PS.EndInvoke($j.Handle); $j.PS.Dispose() }
$pool.Close(); $pool.Dispose()
```

Reach for the raw pool only when you need shared session state (a pre-imported module, one reused HTTP
client) or fine-grained `BeginInvoke`/`EndInvoke` control. For fan-out enrich, `ForEach-Object -Parallel`
is enough. Note: `-Parallel` runspaces don't inherit loaded modules — `Import-Module` inside the body if
the block needs a cmdlet.

## The feed (abuse.ch Feodo Tracker) — snapshot vs live

```powershell
# Offline snapshot (the lab default — deterministic, testable):
Invoke-VigilEnrichment -Indicator $ips -FeedPath ./data/feodo_ipblocklist.csv -ThrottleLimit 5

# Live feed: download ONCE, outside the parallel body, then enrich against the file:
Invoke-RestMethod 'https://feodotracker.abuse.ch/downloads/ipblocklist.csv' |
    Set-Content ./feodo_live.csv
Invoke-VigilEnrichment -Indicator $ips -FeedPath ./feodo_live.csv
```

CSV columns: `first_seen_utc,dst_ip,dst_port,c2_status,last_online,malware`. Never fetch the feed *inside*
the parallel block — one bulk read, then pure lookups.

## Copilot tells to catch (the three traps + one)

```text
[ ] $using: present on every outer variable the -Parallel body reads? (else $null)
[ ] Results in a ConcurrentBag/.Add(), not $x += inside -Parallel? (else racy, drops rows)
[ ] -ThrottleLimit bounded to the feed's limit, not unset / = input size? (else rate-limited)
[ ] Each lookup wrapped in bounded retry + backoff? (else one 429 kills the batch)
```
