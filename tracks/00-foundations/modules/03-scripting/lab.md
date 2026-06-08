# Lab 03 — A Failed-Login Parser in Python

## Setup
Docker-first (mounts the current directory so your script persists):
```bash
docker run --rm -it -v "$PWD":/work -w /work python:3.12-slim bash
```

## Scenario
Build a small tool that reads an auth log and reports the top source IPs by failed-login
count — the kind of triage script you'll write constantly.

## Steps
1. Create a sample `auth.log`:
   ```
   Jan 1 10:00:01 host sshd[1]: Failed password for root from 10.0.0.9 port 22 ssh2
   Jan 1 10:00:02 host sshd[2]: Failed password for invalid user admin from 10.0.0.5 port 22 ssh2
   Jan 1 10:00:03 host sshd[3]: Failed password for root from 10.0.0.9 port 22 ssh2
   ```
2. Write `topips.py`:
   ```python
   import re, sys
   from collections import Counter

   PATTERN = re.compile(r"Failed password .* from (\d+\.\d+\.\d+\.\d+)")

   def top_ips(path, n=5):
       counts = Counter()
       with open(path) as f:
           for line in f:
               m = PATTERN.search(line)
               if m:
                   counts[m.group(1)] += 1
       return counts.most_common(n)

   if __name__ == "__main__":
       for ip, count in top_ips(sys.argv[1]):
           print(f"{count:>4}  {ip}")
   ```
3. Run it:
   ```bash
   python3 topips.py auth.log
   ```

## Expected output
```
   2  10.0.0.9
   1  10.0.0.5
```

## AI acceleration
Have a model extend this to emit JSON, or to flag any IP over a threshold — then review
the regex and the edge cases (IPv6? malformed lines?) before you trust the output.

## Questions
1. What does the script do with a line it can't parse, and is that the behaviour you want?
2. How would you adapt the regex to also capture IPv6 source addresses?
