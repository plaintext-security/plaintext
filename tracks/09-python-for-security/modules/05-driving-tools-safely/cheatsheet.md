---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Driving Tools Safely with subprocess

*Companion to [Module 05 — Driving Tools Safely](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The safe default — a list, `shell=False`

```python
import subprocess

# Args as a LIST. shell=False is the DEFAULT — you don't even pass it.
# target is handed straight to execve as ONE argument: no shell, no injection.
result = subprocess.run(
    ["nmap", "-sV", "-oX", "-", target],   # target = "x; rm -rf /" is an inert (bad) hostname
    capture_output=True,   # collect stdout + stderr instead of inheriting the terminal
    text=True,             # decode bytes → str (utf-8) so result.stdout is a string
    check=True,            # raise CalledProcessError on non-zero exit (fail loud)
    timeout=30,            # kill + raise TimeoutExpired if the tool hangs
)

print(result.stdout)       # stdout as text
print(result.returncode)   # 0 on success (check=True guarantees this or it raised)
```

```python
# Handle the two failure modes explicitly.
try:
    result = subprocess.run(["whois", domain], capture_output=True, text=True,
                            check=True, timeout=15)
except subprocess.CalledProcessError as e:
    print(f"tool exited {e.returncode}: {e.stderr}")
except subprocess.TimeoutExpired:
    print("tool hung — killed at the timeout")
```

## The anti-pattern to recognize on sight

```python
# UNSAFE — DO NOT SHIP. This is what the copilot writes.
subprocess.run(f"nmap {target}", shell=True)          # target="x; id" → runs `id`
subprocess.run(f"whois {domain}", shell=True)         # domain="a.com; rm -rf ~" → RCE
os.system(f"vt domain {domain}")                       # same disease, older syntax
```

The moment a value flows through an **f-string into `shell=True`** (or `os.system`), `/bin/sh`
interprets `;`, `|`, `$()`, backticks, `&&`, `>`. In a triage tool that value came from an *alert* —
attacker-influenced by definition. The fix is almost always **delete `shell=True` and make the
string a list.**

## The rare must-build-a-string case — `shlex.quote`

```python
import shlex

# Only when an API genuinely wants ONE shell string (not a list). Quote every
# untrusted piece. The list form above is still better — it removes the shell.
cmd = f"nmap -sV {shlex.quote(target)}"    # "x; id" → "'x; id'", a single safe arg
subprocess.run(cmd, shell=True, check=True)

shlex.split("nmap -sV 'a b.com'")          # inverse: parse a string INTO a safe list
# → ['nmap', '-sV', 'a b.com']
```

## Pipes & redirection — in Python, not the shell

```python
# "I need a pipe" is NOT a reason for shell=True. Wire two processes in Python.
p1 = subprocess.Popen(["nmap", "-oX", "-", target], stdout=subprocess.PIPE, text=True)
p2 = subprocess.run(["xmllint", "--format", "-"], stdin=p1.stdout,
                    capture_output=True, text=True)
p1.stdout.close()          # let p1 get SIGPIPE if p2 exits early

# Redirection is an argument, not `> file`:
with open("scan.xml", "w") as fh:
    subprocess.run(["nmap", "-oX", "-", target], stdout=fh, check=True)

# Globbing is pathlib, not the shell:
from pathlib import Path
for f in Path("captures").glob("*.pcap"):
    subprocess.run(["tshark", "-r", str(f)], check=True)
```

## Validate before you shell out

```python
import re, ipaddress

DOMAIN = re.compile(r"^(?=.{1,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,}$", re.I)

def safe_target(indicator: str) -> str:
    """Allowlist the shape BEFORE any tool sees it. Reject the weird."""
    indicator = indicator.strip()
    if DOMAIN.match(indicator):
        return indicator
    try:
        return str(ipaddress.ip_address(indicator))   # normalizes + validates
    except ValueError:
        raise ValueError(f"not a valid domain or IP: {indicator!r}")

subprocess.run(["nmap", "-sV", safe_target(target)], check=True, timeout=30)
```

Defense in depth: `shell=False` stops injection; validation shrinks the attack surface so a tool
only ever receives well-formed arguments.

## Parse structured output, don't scrape text

```python
import xml.etree.ElementTree as ET

# nmap -oX - writes XML to stdout. Parse THAT — it's stable across versions;
# scraped human text breaks your regex on the next release.
r = subprocess.run(["nmap", "-sV", "-oX", "-", target],
                   capture_output=True, text=True, check=True, timeout=60)
root = ET.fromstring(r.stdout)
for port in root.iterfind(".//port"):
    state = port.find("state").get("state")
    svc = port.find("service")
    print(port.get("portid"), state, svc.get("name") if svc is not None else "?")

# JSON tools are even easier:
import json
r = subprocess.run(["vt", "domain", domain, "--format=json"],
                   capture_output=True, text=True, check=True, timeout=30)
data = json.loads(r.stdout)
```

```python
# Drive a DISSECTOR: suricata -r <pcap> emits eve.json — newline-delimited JSON,
# one event per line, keyed by event_type. The pcap path is untrusted input too:
# list args, shell=False. Parse the structured EVE, don't scrape stdout.
from pathlib import Path
subprocess.run(["suricata", "-r", pcap_path, "-l", str(outdir)],   # -l = output dir
               capture_output=True, text=True, check=True, timeout=300)
for line in (outdir / "eve.json").read_text().splitlines():
    event = json.loads(line)
    if event["event_type"] == "alert":              # feed each line to sift's pydantic union
        print(event["alert"]["signature"], event["alert"]["severity"])

# Same move, second dissector: tshark -T ek → one JSON object per packet.
subprocess.run(["tshark", "-r", pcap_path, "-T", "ek"],
               capture_output=True, text=True, check=True, timeout=300)
```

## Gotchas worth remembering

- **`shell=True` + untrusted input = command injection.** The single most damaging one-character
  mistake in Python security tooling. In a triage tool the input is *always* untrusted — it came
  from an alert.
- **The list form removes the shell entirely.** `["nmap", target]` hands `target` to `execve` as one
  argument — there is no `/bin/sh` to interpret `;` or `$()`, so there's nothing to inject into.
- **The 5-second review tell:** an f-string (or `%`/`+` concat) feeding `shell=True` or `os.system`.
  Treat every `subprocess` call as guilty until proven `shell=False` with list args.
- **Pipes/globs/redirection don't need `shell=True`** — wire `Popen` stdout→stdin, use
  `stdout=fh`, use `pathlib.glob`. Reaching for shell features usually means the work belongs in
  Python, where it's safer *and* testable.
- **`check=True` + `timeout=` are not optional in tooling** — fail loud on a bad exit, and never let a
  wrapped tool hang your pipeline forever.
- **Add a CI guard so it can't come back:** `bandit` flags `shell=True` (B602/B604) and `os.system`
  (B605); `ruff`'s flake8-bandit rules (`S602`/`S605`) do the same. Fail the build on it.

> Only shell out against systems you own or have explicit written permission to test.
