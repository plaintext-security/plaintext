---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Memory Forensics

*Companion to [Module 06 — Memory Forensics](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Volatility3 — invocation basics

```bash
vol -f memory.raw windows.info                 # confirm the image parses + identify the build
python3 vol.py -f memory.raw windows.info      # (if not installed as `vol`)
vol -f memory.raw -r csv windows.pslist        # -r csv / json / pretty output renderers
vol -f memory.raw -o ./out windows.dumpfiles   # -o = output dir for dumped files
```

- Volatility3 auto-detects the profile from the image via symbol tables — no manual `--profile` like
  v2. If it can't find symbols for the build, results are garbage, not a clean error.

## Process enumeration

```bash
vol -f mem.raw windows.pslist                  # walk the kernel process list (EPROCESS)
vol -f mem.raw windows.psscan                  # scan for EPROCESS objects (finds hidden/unlinked)
vol -f mem.raw windows.pstree                  # process hierarchy — parent/child anomalies
vol -f mem.raw windows.cmdline                 # exact launch command line per process
```

- `pslist` vs `psscan`: a PID in `psscan` but *missing* from `pslist` is a process hidden by
  unlinking — a strong rootkit/injection signal.

## Injection & malicious code

```bash
vol -f mem.raw windows.malfind                 # executable, file-less regions (injected code)
vol -f mem.raw windows.malfind --dump          # dump the suspicious regions to disk
vol -f mem.raw windows.dlllist --pid 1234      # DLLs loaded by a PID
vol -f mem.raw windows.ldrmodules --pid 1234   # DLLs missing from a load list (reflective loading)
vol -f mem.raw windows.hollowprocesses         # process-hollowing indicators
```

## Network

```bash
vol -f mem.raw windows.netscan                 # sockets + connections (incl. recently closed) → PID
vol -f mem.raw windows.netstat                 # connection table (build-dependent)
```

- A connection owned by `notepad.exe` or `svchost.exe` reaching a non-Microsoft external IP is the
  classic injection tell — correlate the PID back through `malfind` and `pstree`.

## Files, handles, and dumping

```bash
vol -f mem.raw windows.filescan                # file objects in memory (find a path)
vol -f mem.raw windows.dumpfiles --pid 1234    # dump a process's mapped files
vol -f mem.raw windows.handles --pid 1234      # handles: files, keys, mutexes (malware markers)
vol -f mem.raw windows.pslist --pid 1234 --dump   # dump the process executable
```

## Other high-value plugins

```bash
vol -f mem.raw windows.hashdump                # SAM password hashes
vol -f mem.raw windows.registry.hivelist       # in-memory registry hives
vol -f mem.raw windows.svcscan                 # services (persistence)
vol -f mem.raw windows.getsids --pid 1234      # process token / SIDs
```

## The correlation chain (a finding, not a lead)

```
pstree/cmdline   → parent-child anomaly? (Word.exe → powershell.exe -enc)
   ↓
malfind          → injected code inside that process?
   ↓
netscan          → is that PID talking to an external IP?
   ↓  = injection confirmed by correlation, not by any single plugin
```

## Gotchas worth remembering

- **The symbol table must match the *exact* build.** Win10 22H2 and Server 2019 lay structures out
  differently; a mismatch produces plausible-looking garbage, not an obvious failure.
- **A `malfind` hit is a lead, not a verdict.** JIT compilers and DRM legitimately allocate
  executable anonymous memory. Triage every hit — correlate the parent (`pstree`) and connections
  (`netscan`) before you call it injection.
- **Memory sees what disk can't** — fileless malware, injected shellcode, runtime-decrypted keys,
  recently-closed sockets. It's often the *only* place the full picture of an intrusion exists.
- **`pslist` misses hidden processes; `psscan` catches them.** Diff the two: presence in `psscan`
  but absence in `pslist` is a red flag worth chasing.
- **Every finding must trace to real plugin output.** Note the plugin, PID, and offset — never
  report an anomaly you can't point back to a specific line of output.
