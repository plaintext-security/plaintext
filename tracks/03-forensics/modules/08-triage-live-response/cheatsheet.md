# Cheat sheet — Triage & Live Response

*Companion to [Module 08 — Triage & Live Response](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Velociraptor — stand it up

```bash
velociraptor config generate -i               # interactive server config wizard
velociraptor --config server.config.yaml frontend -v     # run the server
velociraptor --config client.config.yaml client -v       # run an endpoint agent
velociraptor gui                              # standalone all-in-one GUI (fast lab mode)
```

- One static binary is server, client, and GUI. Enroll clients, then push queries (hunts) to the
  whole fleet at once.

## VQL — the shape of a query

```sql
SELECT Name, Pid, Ppid, CommandLine, Exe
FROM pslist()
WHERE Name =~ "powershell"          -- =~ is regex match; = is exact
ORDER BY Pid
LIMIT 50
```

- VQL is SQL over *plugins* (table-valued functions like `pslist()`, `netstat()`, `glob()`). Column
  names come from the plugin's output — check the reference, or `SELECT * ... LIMIT 1` to discover them.

## Core triage plugins (run these first)

```sql
SELECT * FROM pslist()                                   -- running processes
SELECT * FROM netstat()                                  -- active connections + owning PID
SELECT * FROM glob(globs="C:/Users/**/*.exe")            -- find files by pattern
SELECT FullPath, Mtime FROM glob(globs="C:/Temp/**")     -- recent writes in a dir
     WHERE Mtime > now() - 86400                          -- modified in the last 24h
SELECT * FROM users()                                    -- local accounts / logged-on users
SELECT * FROM info()                                     -- host facts (OS, hostname, uptime)
```

## Named artifacts (parameterised, reusable queries)

```
Windows.System.Pslist            processes
Windows.Network.Netstat          connections
Windows.Sys.Users                accounts
Windows.Registry.Sysinternals.Eulacheck   / autoruns-style persistence
Windows.EventLogs.*              parse EVTX on the endpoint
Linux.Sys.BashHistory            shell history
Generic.System.Pstree            cross-platform process tree
```

```bash
velociraptor artifacts list                        # what artifacts are available
velociraptor artifacts collect Windows.System.Pslist --args ...   # run one locally
```

## Hunt — one artifact, whole fleet

```
GUI: New Hunt → pick artifact (e.g. Windows.System.Pslist)
     → set scope/labels → Launch → results stream back from every enrolled endpoint
```

## Triage collection priority

```
1. Running processes        (what is executing right now)
2. Network connections      (who is it talking to)
3. Persistence mechanisms   (run keys, scheduled tasks, services)
4. Recently modified files  (staging, dropped tools)
```

## Gotchas worth remembering

- **Triage is not forensics.** Collect just enough to make the in-scope / out-of-scope call, then
  image only the in-scope hosts. Collecting everything drowns the team; missing a host loses evidence.
- **Zero rows ≠ clean host.** A VQL query against the wrong table or key returns an *empty* result,
  not an error — it looks like "nothing found." Confirm the query hits the right artifact before
  reading zero rows as "clean."
- **Collection-first, analysis-second.** Every action on a live box changes it — run a read-only
  agent that queries through kernel APIs and ships results out; don't sit at the keyboard poking.
- **Model-drafted VQL is a lead, not an answer.** AI writes VQL fast but silently selects the wrong
  table; review every generated query against the reference before you trust its output.
- **A hunt scales the same query across the fleet** — that's the whole point. Answer "how many hosts,
  which ones?" in minutes, before the ransomware fires, instead of imaging one box at a time.
