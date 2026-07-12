# Cheat sheet — Files, Regex & Log Parsing

*Companion to [Module 02 — Files, Regex & Log Parsing](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Regex — compile once, name your groups

```python
import re

# Named groups → a dict you can reason about, not a positional tuple.
LINE = re.compile(
    r"(?P<month>\w{3})\s+(?P<day>\d+)\s+(?P<time>[\d:]+)\s+"
    r"\S+ sshd\[\d+\]: Failed password for (?:invalid user )?"
    r"(?P<user>\S+) from (?P<ip>\d{1,3}(?:\.\d{1,3}){3})"
)

m = LINE.search("Jan  3 04:12:09 host sshd[1123]: Failed password for root from 10.0.0.9")
if m:                          # ALWAYS check — no match returns None, not a blank match
    m.group("ip")              # "10.0.0.9"
    m.groupdict()              # {"month": "Jan", ..., "ip": "10.0.0.9"}
```

## Match, search, findall, finditer

```python
LINE.match(s)      # anchored at START of string only
LINE.search(s)     # first match ANYWHERE — the usual choice for log lines
LINE.fullmatch(s)  # must match the WHOLE string
LINE.findall(s)    # list of all matches (strings, or tuples if >1 group)
LINE.finditer(s)   # iterator of Match objects — use when you want groupdict()

re.IGNORECASE  # a.k.a. re.I    re.MULTILINE  # ^/$ per line
re.VERBOSE     # a.k.a. re.X — whitespace/comments in the pattern are ignored
```

## Useful character classes & quantifiers

```python
r"\d"   # digit        r"\w"  # word char [A-Za-z0-9_]     r"\s"  # whitespace
r"\S"   # non-space    r"."   # any char (except newline unless re.DOTALL)
r"a+"   # 1+ greedy    r"a*"  # 0+ greedy   r"a?"  # optional  r"a{1,3}"  # range
r"a+?"  # 1+ LAZY (shortest match) — the fix when a greedy match grabs too much
r"(?:...)"  # non-capturing group — group without adding to .groups()
```

## pathlib — paths as objects, not strings

```python
from pathlib import Path

log = Path("/var/log/auth.log")
log.name        # "auth.log"      log.suffix   # ".log"     log.stem  # "auth"
log.parent      # Path("/var/log")
log.exists()    # bool            log.is_file()

for p in Path("/var/log").glob("auth.log*"):   # non-recursive; rglob() recurses
    ...

Path("out/report.csv").parent.mkdir(parents=True, exist_ok=True)  # ensure dir first
Path("notes.txt").write_text("done\n")         # whole-file read/write
```

## Read big logs line by line (not all into memory)

```python
# Stream — one line at a time, constant memory even on a year of logs.
with log.open() as fh:                 # NOT log.read_text().splitlines()
    for line in fh:
        m = LINE.search(line)
        if m:
            ...
```

## collections — the aggregation toolkit

```python
from collections import Counter, deque, defaultdict

# Counter — frequency of anything hashable.
fails = Counter()
fails[ip] += 1                         # or Counter(ip_list) in one shot
fails.most_common(5)                   # top-5 [(ip, count), ...]
fails.total()                          # sum of all counts (3.10+)

# deque(maxlen=N) — a fixed-size sliding window; old items fall off the left.
window = deque(maxlen=100)
window.append(timestamp)               # O(1) both ends; length caps at 100

# defaultdict — per-key windows without "if key not in d" boilerplate.
windows = defaultdict(lambda: deque(maxlen=100))
windows[ip].append(ts)
```

## Sliding-window brute-force verdict

```python
from datetime import timedelta

WINDOW = timedelta(minutes=5)
THRESHOLD = 5
hits = defaultdict(deque)              # ip -> deque of datetimes

def is_bruteforce(ip, ts):
    q = hits[ip]
    q.append(ts)
    while q and ts - q[0] > WINDOW:    # evict anything older than the window
        q.popleft()
    return len(q) >= THRESHOLD
```

## Gotchas worth remembering

- **Compile once, outside the loop.** `re.compile()` at module scope; matching a string-literal
  pattern inside a million-line loop recompiles it every iteration and quietly burns CPU.
- **A match object is falsy-safe only if you check it.** `LINE.search(...)` returns `None` on no
  match — `.group()` on `None` is an `AttributeError`. Guard every match before you read groups.
- **The silent miss is the real failure, not the crash.** A regex that quietly skips 5% of lines
  (an sshd format variant, IPv6, extra whitespace) is worse than none — you'll trust its count.
  Verify on a line that *should* match and one that *shouldn't* before you believe the output.
- **Don't `read_text().splitlines()` a log you don't control the size of.** It loads the whole file
  into RAM; iterate the open handle instead for constant memory.
- **Raw strings for patterns.** Always write regex as `r"\d+"` — without the `r`, Python's own
  backslash escaping mangles the pattern before `re` ever sees it.
- **`match` is anchored, `search` is not.** A pattern that "doesn't work" often just needs
  `search()` — `match()` only tries from the start of the string.
