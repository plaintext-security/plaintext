# Cheat sheet — Linux Telemetry

*Companion to [Module 03 — Linux Telemetry](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## auditd — service & rules

```bash
sudo systemctl status auditd            # is the daemon running?
sudo auditctl -l                        # list active rules
sudo auditctl -s                        # status: lost events, backlog, enabled
sudo augenrules --load                  # compile /etc/audit/rules.d/*.rules and load
```

Rules live in `/etc/audit/rules.d/*.rules` (persistent) or `auditctl` (runtime, lost on reboot).

## auditd — writing rules

```bash
# Syscall rule:  -a always,exit -F arch=b64 -S <syscall> -k <tag>
-a always,exit -F arch=b64 -S execve -k exec          # every program execution
-a always,exit -F arch=b64 -S connect -k netconn      # outbound sockets
# File/dir watch:  -w <path> -p <perms> -k <tag>   (perms: r w x a=attr)
-w /etc/passwd -p wa -k identity                      # writes/attr changes to passwd
-w /usr/bin/ -p x -k binexec                          # execution from a dir
```

`-k` is the searchable tag — always set one. `-F` adds filters (`uid`, `pid`, `success`, `exit`).

## auditd — reading events

```bash
sudo ausearch -k exec                   # events by key
sudo ausearch -sc execve -i            # by syscall, -i interprets numeric IDs to names
sudo ausearch -ts today -m EXECVE      # by time and message type
sudo aureport --executable --summary    # rollup report
```

## osquery — host as a SQL database

```sql
-- Interactive:  osqueryi     |    Ad hoc:  osqueryi --json "SELECT ..."
SELECT pid, name, path, cmdline FROM processes;
SELECT name, path, cmdline, parent FROM processes WHERE on_disk = 0;  -- proc, binary deleted
SELECT DISTINCT pid, name FROM process_open_sockets WHERE remote_port != 0;  -- talking out
SELECT * FROM listening_ports;
SELECT username, uid, shell FROM users WHERE shell NOT LIKE '%nologin%';
SELECT filename, path, mtime FROM file WHERE path LIKE '/etc/cron.d/%%';
```

Join to enrich — the move osquery is built for:

```sql
SELECT p.name, p.cmdline, u.username
FROM processes p JOIN users u ON p.uid = u.uid
WHERE p.name = 'bash';
```

Useful tables: `processes`, `process_open_sockets`, `listening_ports`, `users`, `logged_in_users`, `crontab`, `startup_items`, `file`, `hash`, `deb_packages`/`rpm_packages`.

## Gotchas worth remembering

- **auditd is the stream, osquery is the question.** auditd taps syscalls continuously (your "Linux Sysmon"); osquery snapshots state on demand (your "Linux live-response"). You usually want both — neither replaces the other.
- **Broad audit rules cost more than noise.** An over-eager `execve` rule floods you *and* adds real syscall overhead on a busy host. Check `auditctl -s` for `lost` events — if the backlog is dropping, you're missing exactly what you tried to catch.
- **Containers are the modern blind spot.** A process inside a container is just a process on the host kernel, so host-level auditd/osquery *can* see it — but only if you account for namespaces and where the container's own logs go.
- **osquery is a snapshot, not a stream.** A `SELECT FROM processes` misses a process that ran between polls. For continuous coverage, schedule the query (osqueryd) or lean on auditd for the event.
- **`on_disk = 0` and `remote_port != 0` are your fastest hunt filters** — a running process whose binary was deleted, or one holding an outbound socket, is worth a look before anything else.
- **eBPF (Falco, Tetragon) is where this is heading** — lower overhead, container-aware. auditd/osquery is the foundation, not the destination.
