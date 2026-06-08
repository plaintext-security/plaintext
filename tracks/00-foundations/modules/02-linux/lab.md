# Lab 02 — Investigating a Linux Host with Core Tools

## Setup
Docker-first — work inside a disposable container so nothing touches your host:
```bash
docker run --rm -it ubuntu:22.04 bash
apt update && apt install -y procps   # provides ps
```

## Scenario
You've been handed shell access to a server and need to answer basic triage questions:
who can do what, what's running, and what do the logs say?

> Only run this against systems you own or this throwaway container.

## Steps
1. Map users and privileged accounts:
   ```bash
   cut -d: -f1,3 /etc/passwd     # users and UIDs (UID 0 = root)
   getent group sudo             # who can escalate via sudo
   ```
2. Find files that run with their owner's privileges (an escalation surface):
   ```bash
   find / -perm -4000 -type f 2>/dev/null   # SUID binaries
   ```
3. Inspect running processes:
   ```bash
   ps aux --sort=-%cpu | head
   ```
4. Parse a log for failed logins (sample one if the container has none):
   ```bash
   printf 'Failed password for root from 10.0.0.9 port 22\nFailed password for invalid user admin from 10.0.0.5 port 22\n' > auth.sample
   grep 'Failed password' auth.sample | awk '{print $(NF-1)}' | sort | uniq -c
   ```

## Expected output
The UID-0 accounts, the default SUID binaries, the top processes by CPU, and a per-IP
count of failed logins.

## AI acceleration
Ask a model to explain any SUID binary it considers unusual — then confirm with `man` and
your own judgment before acting on it.

## Questions
1. Which binaries are SUID-root by default, and why is each a risk if it were modified?
2. How would you turn the failed-login one-liner into a ranked "top 5 attackers" list?
