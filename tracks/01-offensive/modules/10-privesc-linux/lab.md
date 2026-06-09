# Lab 10 — Escalate to Root on Linux

## Setup

```bash
git clone https://github.com/plaintext-security/plaintext-labs.git
cd plaintext-labs/offensive/10-privesc-linux
make up
```

The container is a Debian host with three planted misconfigurations:
SUID bit on `find`, a NOPASSWD sudo rule for `find`, and a world-writable
cron script running as root. You start as `appuser` (uid=1001).

## Scenario

You've obtained an initial shell on Meridian Financial's application server as
`appuser` — a low-privilege account. The goal is to escalate to root by
enumerating the system and exploiting one of the misconfigurations.

> **Authorization note:** Only escalate privileges on systems you own or
> have explicit written authorisation to test. This container is intentionally
> misconfigured; run it inside the provided lab only.

## Do

1. [ ] Run the demo to see all three vectors and both exploits:
   ```bash
   make demo
   ```
   Note which vectors were found by each enumeration technique.

2. [ ] Shell into the container as appuser and enumerate manually:
   ```bash
   make shell
   su - appuser           # switch to low-privilege user (password: appuser)
   find / -perm -u=s 2>/dev/null | head -20
   sudo -l
   cat /etc/crontab
   ```

3. [ ] For Vector 1 (SUID find):
   - Look up `/usr/bin/find` on [GTFOBins](https://gtfobins.org/).
   - What is the exact `find -exec` command that gives you a root shell?
   - Run it and confirm `id` shows `euid=0(root)`.

4. [ ] For Vector 2 (sudo NOPASSWD):
   - `sudo -l` shows you can run `find` as root without a password.
   - Run `sudo find /dev/null -exec id \; -quit`. What uid do you get?
   - Why is this higher-confidence than the SUID vector?

5. [ ] For Vector 3 (writable cron):
   - Confirm the script is writable: `ls -la /usr/local/bin/backup.sh`
   - What payload would you append to escalate privilege?
   - Why is this a persistence vector, not just escalation?

6. [ ] Explain the difference between:
   - `uid=0(root)` (real uid is root)
   - `euid=0(root)` (effective uid is root, via SUID)
   - Why does `sh -p` matter for the SUID exploit?

## Success criteria — you're done when

- [ ] You enumerated all three vectors (SUID, sudo, writable cron) from the appuser shell.
- [ ] You gained root (uid=0 or euid=0) via at least one vector.
- [ ] You can explain the exact misconfiguration and the remediation for each.
- [ ] You know what GTFOBins is and how to use it to look up an escalation technique.

## Deliverables

`linux-privesc.md`: the three vectors (how found, what misconfiguration, GTFOBins entry),
the proof-of-root command output, and the remediation for each.

## Automate & own it

**Required.** Write `enum.py` that:
- Finds SUID binaries in common paths
- Reads `/etc/sudoers` and parses NOPASSWD rules
- Reads `/etc/crontab` and checks write permissions on scripts
- Outputs a priority-ranked shortlist of vectors

AI drafts the script; you cross-check each result against GTFOBins and verify
by hand before trusting it. Commit `enum.py` and `linux-privesc.md`.

## AI acceleration

Paste your `sudo -l` and `find / -perm -u=s` output to a model and ask it to
shortlist the highest-confidence vector and the GTFOBins technique. Then verify
against GTFOBins yourself — the model shortlists; you confirm. Models often
surface kernel exploits prematurely (they crash boxes); prefer misconfiguration
vectors for stability.

## Connects forward

Root on one host enables the lateral movement in module 12 (pivoting). The
defensive inverse is Track 07 (endpoint hardening) — each vector here maps
directly to a CIS benchmark check or a lynis finding.

## Marketable proof

> "I enumerate and escalate privilege on Linux — SUID binaries, sudo
> misconfigurations, and writable cron scripts — using GTFOBins, and I can
> map each vector to its defensive remediation."

## Stretch

- Exploit **PwnKit (CVE-2021-4034)** in a lab container: run a vulnerable
  `pkexec` version and demonstrate how the bug turns a heap corruption into root
  without any planted misconfiguration. Note why kernel/system-level CVEs like
  this are the "last resort" — less stable, more noise.
- Run `lynis audit system` inside the container and compare its output to your
  manual enum. Which findings overlap? Which does lynis miss?
