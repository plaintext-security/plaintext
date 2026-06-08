# Module 02 — Linux for Security

## Objective
Operate confidently on a Linux command line and use core tools to investigate a
system's state for security work.

## Background
Most security tooling — and most servers you'll defend or attack — runs on Linux. The
shell is the universal interface: "everything is a file," permissions gate access,
processes expose what's running, and logs record what happened. Fluency here is the
difference between *reading* a system and *guessing* at it.

## Key concepts
- Filesystem hierarchy and the "everything is a file" model
- Users, groups, and permission bits (`rwx`, SUID/SGID)
- Processes and how to inspect them (`ps`, `/proc`)
- Text-processing pipelines (`grep`, `awk`, `cut`, `sort`, `uniq`)
- Where logs live (`/var/log`) and how to read them

## AI acceleration
A model is a fast shell tutor — ask it to explain an unfamiliar command or draft an `awk`
one-liner. Verify before you run: check flags against `man`, and never paste a generated
command that touches files or permissions without reading it first.

## Further reading
- Filesystem Hierarchy Standard (FHS): https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html
- GNU coreutils manual: https://www.gnu.org/software/coreutils/manual/
- man7.org Linux man-pages (`proc(5)`, `credentials(7)`): https://man7.org/linux/man-pages/
