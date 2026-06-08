# Lab 02 — Investigating a Linux Host with Core Tools

## Setup
Docker-first — work inside a disposable container so nothing touches your host:
```bash
docker run --rm -it ubuntu:22.04 bash
apt update && apt install -y procps   # provides ps
```

## Scenario
You've been handed shell access to a server and need to answer basic triage questions: who
can do what, what's running, and what do the logs say?

> Only run this against systems you own or this throwaway container.

## Do
1. [ ] Map users and privileged accounts:
   `cut -d: -f1,3 /etc/passwd` (UID 0 = root) and `getent group sudo`
2. [ ] Find files that run with their owner's privileges (an escalation surface):
   `find / -perm -4000 -type f 2>/dev/null`
3. [ ] Inspect the running processes: `ps aux --sort=-%cpu | head`
4. [ ] Triage failed logins from a sample:
   ```bash
   printf 'Failed password for root from 10.0.0.9 port 22\nFailed password for invalid user admin from 10.0.0.5 port 22\n' > auth.sample
   grep 'Failed password' auth.sample | awk '{print $(NF-1)}' | sort | uniq -c
   ```

## Success criteria — you're done when
- [ ] You can list every UID-0 account and everyone who can `sudo`.
- [ ] You can name the default SUID-root binaries and say why each matters if modified.
- [ ] Your one-liner prints a per-IP failed-login count.

## Deliverables
A short `linux-triage.md`: the privileged accounts, the SUID list, and the top failed-login
IPs — the notes you'd paste into an incident ticket.

## AI acceleration
Ask a model to explain any SUID binary it flags as unusual — then confirm with `man` and
your own judgment before acting.

## Connects forward
This is the host fluency Track 01 (privilege escalation) and Track 07 (host hardening)
assume, and the artifact-reading habit Track 03 (forensics) builds on.

## Marketable proof
> "Drop me on an unfamiliar Linux box and I can profile its users, privileged binaries,
> processes, and auth logs in minutes — by hand or scripted."

## Stretch
- Turn the failed-login one-liner into a ranked top-5 with a threshold, then rewrite it in
  Python (a preview of Track 09).
