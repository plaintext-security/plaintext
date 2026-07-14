---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Linux for Security

*Companion to [Module 04 — Linux for Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Finding things

```bash
find / -name "*.conf" 2>/dev/null           # by name (dump permission noise to /dev/null)
find /var/log -mtime -1                     # modified in the last day
find / -size +100M 2>/dev/null              # big files
find / -perm -4000 -type f 2>/dev/null      # SUID binaries — the classic privesc sweep
grep -rn "password" /etc/ 2>/dev/null       # recursive text search, with line numbers
grep -rEi "passw(or)?d|secret|api[_-]?key" .   # regex + case-insensitive secret hunt
```

## Permissions — reading and changing

```bash
ls -l file        # -rwsr-xr-x  ← the 's' where 'x' should be = SUID
chmod 640 file    # owner rw, group r, other nothing
chmod u+x file    # symbolic form: add execute for owner
chown user:group file
umask             # what new files get by default
```

- Read `-rwxr-x---` in triples: **owner / group / other**. `s` in the owner triple = SUID (runs as
  the file's owner), `s` in group = SGID, `t` on a directory = sticky bit (only owners delete, e.g. `/tmp`).
- A world-writable script that root runs from cron *is* a root shell with extra steps.

## Users and privilege

```bash
id                          # who am I, which groups
sudo -l                     # what can I sudo? — first command after any foothold
cat /etc/passwd             # users (world-readable; shells at the end of each line)
sudo cat /etc/shadow        # password hashes (root only — that's the point)
last; who                   # recent and current logins
```

## Processes

```bash
ps aux                      # everything running (ps aux | grep <name>)
ps -ef --forest             # parent/child tree — who spawned that shell?
top                         # live view (or htop if installed)
kill -9 <pid>               # force-kill
lsof -p <pid>               # files a process has open
lsof -i :8080               # which process owns a port
```

## Services and logs

```bash
systemctl status ssh                # is it running, and its last log lines
systemctl list-units --type=service --state=running
journalctl -u ssh -f                # follow one service's log
journalctl --since "1 hour ago"     # recent everything
tail -f /var/log/auth.log           # auth events on Debian/Ubuntu (secure on RHEL)
```

- `/var/log/auth.log` is where brute-force attempts, sudo use, and new sessions land — the first
  file a defender reads and the first one an attacker wants to clean.

## Scheduled tasks (persistence lives here)

```bash
crontab -l                          # current user's cron jobs
sudo ls /etc/cron.* /var/spool/cron 2>/dev/null
systemctl list-timers               # systemd's cron equivalent
```

## Moving data around

```bash
tar czf out.tar.gz dir/             # create compressed archive
tar xzf out.tar.gz                  # extract (add -C /dest for a target dir)
scp file user@host:/tmp/            # copy over SSH
python3 -m http.server 8000         # instant file server from any directory
```

## Gotchas worth remembering

- Almost everything is a file — devices, sockets, process state (`/proc/<pid>/`). `/proc` is a
  live map of the system: `cat /proc/<pid>/cmdline` beats trusting a renamed binary.
- History files (`~/.bash_history`, `~/.zsh_history`) record what was typed — gold for forensics,
  a leak for anyone who types secrets on the command line.
- `2>/dev/null` hides *errors*, not results — use it to silence permission-denied spam in sweeps,
  never in scripts where the error is the signal.
