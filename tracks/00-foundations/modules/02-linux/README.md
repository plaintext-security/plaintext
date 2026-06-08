# Module 02 — Linux for Security

**Foundations** — *most of what you'll defend, attack, or investigate runs on Linux.*

## Why this matters
Servers, containers, security tooling, and half an attacker's targets are Linux. The shell
is the universal interface, and the difference between *reading* a system and *guessing* at
it is fluency with a handful of core tools. This is the muscle memory every later lab
assumes — when Track 01 escalates privilege or Track 03 carves a filesystem, it starts
here.

## Objective
Operate confidently on a Linux command line and use core tools to investigate a host's
users, processes, files, and logs.

## Learn (~3 hrs)

**The shell & the filesystem**
- [The Missing Semester — The Shell](https://missing.csail.mit.edu/2020/course-shell/) — MIT's no-fluff intro to thinking in the shell; do the exercises.
- [Linux Journey — The Command Line](https://linuxjourney.com/lesson/the-shell) — bite-sized and hands-on; the fastest way to fill gaps.
- [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — skim it so `/etc`, `/var`, and `/proc` stop being mysterious.

**Permissions, processes & users**
- [Julia Evans — "Bite Size Linux"](https://wizardzines.com/zines/bite-size-linux/) — the clearest explanation of `rwx`, SUID, and processes anywhere.
- [DigitalOcean — An Introduction to Linux Permissions](https://www.digitalocean.com/community/tutorials/an-introduction-to-linux-permissions) — read the SUID section twice; it underpins half of privilege escalation.

**Text processing (the security power tool)**
- [Julia Evans — "grep, awk, sed" wizard zines](https://wizardzines.com/) plus `man grep`, `man awk` — you'll live in these for log triage.

## Key concepts
- The filesystem hierarchy and "everything is a file"
- Users, groups, and permission bits (`rwx`, SUID/SGID)
- Processes and `/proc`
- Text-processing pipelines (`grep`, `awk`, `cut`, `sort`, `uniq`)
- Where logs live (`/var/log`) and how to read them

## AI acceleration
A model is a fast shell tutor — ask it to explain an unfamiliar command or draft an `awk`
one-liner. Verify before you run: check flags against `man`, and never paste a generated
command that touches files or permissions without reading it first.
