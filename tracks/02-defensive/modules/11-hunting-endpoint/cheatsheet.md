---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Threat Hunting: Endpoint

*Companion to [Module 11 — Threat Hunting: Endpoint](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The hunt loop

```
hypothesis ("attacker persists via a Run key")
  → query endpoint data (VQL / osquery)
  → confirm or REFUTE
  → ruled out (a result) | investigate → codify as a detection
```

State a **specific, testable** hypothesis. A hunt that ends in "ruled out" is a success, not a failure.

## Velociraptor VQL — the query shape

```sql
-- VQL:  SELECT <columns> FROM <plugin/artifact>(<args>) WHERE <filter>
SELECT Pid, Name, CommandLine, Ppid
FROM pslist()
WHERE Name =~ 'powershell'                -- =~ is regex match

-- Run an osquery table from inside VQL:
SELECT * FROM Artifact.Generic.Client.Info()

-- Enumerate a directory and filter:
SELECT FullPath, Mtime, Size
FROM glob(globs='C:/Users/*/AppData/**/*.exe')
WHERE Mtime > timestamp(epoch=now() - 86400)
```

Deploy it at scale as a **hunt** (queues an artifact across all endpoints) rather than one flow at a time. Useful plugins: `pslist()`, `netstat()`, `glob()`, `read_file()`, `hash()`, `process_tracker`.

## osquery SQL — persistence & discovery hunts

```sql
-- Run-key persistence (the classic hypothesis)
SELECT name, path, data FROM registry
WHERE key LIKE 'HKEY_USERS\%\Software\Microsoft\Windows\CurrentVersion\Run%';

-- Scheduled tasks / cron
SELECT name, action, path FROM scheduled_tasks;      -- Windows
SELECT command, path FROM crontab;                   -- Linux

-- Process with a deleted/unbacked binary
SELECT pid, name, path FROM processes WHERE on_disk = 0;

-- Outbound connections + owning process
SELECT p.name, s.remote_address, s.remote_port
FROM process_open_sockets s JOIN processes p ON s.pid = p.pid
WHERE s.remote_port != 0;

-- Office spawning a script interpreter (TTP-level, outlives any hash)
SELECT name, path, cmdline, parent FROM processes
WHERE parent IN (SELECT pid FROM processes WHERE name IN ('winword.exe','excel.exe'));
```

## Pyramid of Pain — hunt high, not low

```
TTPs / behaviours     ← hardest for attacker to change → HUNT HERE
Tools
Network/Host artifacts
Domain names
IP addresses
Hash values           ← trivial to change → weakest hunt
```

"Any Office app spawning a script interpreter" (a TTP) outlives any single hash.

## Gotchas worth remembering

- **Hunting *goes looking*; detection *waits*.** You're hunting exactly the thing your rules had no signature for — so a signature-shaped mindset misses the point. Form the hypothesis, then interrogate the data.
- **Treat every hypothesis as something to *refute*.** A pattern that's just normal-for-you looks suspicious until confirmed against the data. "Ruled out" is a legitimate, valuable outcome.
- **Hunt behaviours, not IOCs.** A hash or IP is trivial to change; a technique costs real effort. Climb the Pyramid of Pain — the higher you hunt, the longer your finding stays true.
- **The AI will "confirm" a benign pattern.** A model is great for generating hypotheses and drafting VQL/osquery, but it can't see your baseline. Its leads are hypotheses to test, never conclusions.
- **Close the loop or repeat the work.** A successful hunt should become a detection (module 08), so you only hunt that thing by hand once. Otherwise you re-discover it every quarter.
- **`on_disk = 0` and outbound-socket joins are your highest-yield first queries** — cheap to run across the fleet, and they surface the two things attackers can't easily hide.
