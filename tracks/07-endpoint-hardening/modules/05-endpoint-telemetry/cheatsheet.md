---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Endpoint Telemetry with osquery

*Companion to [Module 05 — Endpoint Telemetry & EDR](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Running osqueryi (the interactive shell)

```bash
osqueryi                                # ad-hoc SQL shell — no daemon required
osqueryi "SELECT name, pid FROM processes;"   # one-shot query, then exit
osqueryi --json "SELECT * FROM users;"  # JSON output for piping into jq
```

Meta-commands inside the shell (dot-prefixed, no SQL):

```text
.tables                 # list every queryable table
.tables process         # tables matching a substring
.schema processes       # columns + types for one table — read before you query
.mode line              # one column per line (readable for wide rows); also csv, json
.help                   # all meta-commands
.exit                   # quit
```

## Security-focused queries

```sql
-- What's running, and what spawned it (T1059) — filter for droppers in /tmp
SELECT pid, name, path, cmdline, parent FROM processes;
SELECT pid, name, path FROM processes WHERE path LIKE '/tmp/%';

-- Listening services (attack surface) + live sockets per process (C2, T1071)
SELECT pid, address, port, protocol FROM listening_ports;
SELECT pid, remote_address, remote_port FROM process_open_sockets;

-- JOIN: name the process behind each outbound connection to a high port
SELECT p.name, p.path, s.remote_address, s.remote_port
FROM process_open_sockets s JOIN processes p USING (pid)
WHERE s.remote_port > 1024;

-- Persistence via cron (T1053.003)
SELECT command, path FROM crontab WHERE command LIKE '%/tmp/%';

-- Accounts with a real login shell / who's on the box now
SELECT username, uid, shell FROM users WHERE shell NOT LIKE '%nologin%';
SELECT * FROM logged_in_users;                  -- see also: last, shell_history

-- Loaded kernel modules — rootkit surface
SELECT name, size, used_by FROM kernel_modules;

-- Installed packages (feeds vuln inventory in module 08)
SELECT name, version, arch FROM deb_packages;   -- rpm_packages on RHEL/Fedora

-- SUID binaries (privesc); trust artifacts an attacker plants
SELECT path, permissions, uid FROM suid_bin;
SELECT * FROM authorized_keys;
```

## Scheduling with osquery.conf and packs

`osqueryd` is the daemon; config lives at `/etc/osquery/osquery.conf`. Scheduled queries log
results (JSON) that a SIEM ingests — this is the continuous telemetry layer.

```json
{
  "schedule": {
    "proc_from_tmp": { "query": "SELECT pid, name, path FROM processes WHERE path LIKE '/tmp/%';", "interval": 300 },
    "cron_persist":  { "query": "SELECT command, path FROM crontab;", "interval": 300 }
  },
  "decorators": {
    "load": [ "SELECT hostname FROM system_info;" ]
  },
  "packs": {
    "incident-response": "/etc/osquery/packs/incident-response.conf"
  }
}
```

```bash
systemctl enable --now osqueryd                    # run/manage the daemon
osqueryi --config_check --config_path=/etc/osquery/osquery.conf   # validate before deploying
```

## Wazuh agent (real-time streaming to a manager)

```bash
# Agent config lives here — point it at the manager's IP
/var/ossec/etc/ossec.conf              # <server><address>MANAGER_IP</address>

# Register the agent (must be keyed to the manager before it reports)
/var/ossec/bin/agent-auth -m MANAGER_IP        # auto-enroll
/var/ossec/bin/manage_agents                   # interactive: add/extract keys (run on manager)

/var/ossec/bin/wazuh-control start             # start/stop/status the agent
systemctl status wazuh-agent                   # or via systemd
tail -f /var/ossec/logs/ossec.log              # troubleshoot enrollment/connection
```

Wazuh can ingest osquery pack output directly — the agent forwards process, FIM (`auditd`), and
osquery results to the manager for correlation and alerting.

## Gotchas worth remembering

- **osquery is point-in-time by default.** `SELECT FROM processes` is a snapshot of *this instant* — a
  process that spawns and exits between polls is invisible. For continuous coverage use the evented
  tables (`process_events`, `file_events`, `socket_events`), which need the audit publisher enabled
  (`--disable_audit=false`, `--audit_allow_config`) in the daemon config.
- **Scheduled queries report differentials, not snapshots.** By default a query logs only what was
  *added*/*removed* since the last run — you see the change, not full state. Set `"snapshot": true`
  when you want the complete result set every interval.
- **osquery is visibility, not prevention.** It tells you a malicious process ran — it does not block
  it. That's the gap a real EDR fills; pair osquery with Wazuh (or another response layer) for action.
- **A Wazuh agent that isn't keyed reports nothing.** Enrollment (`agent-auth`/`manage_agents`) is a
  prerequisite, not a nicety — an unregistered agent sits silent no matter how healthy it looks.
- **Don't run heavy queries on a tight schedule.** A full `file` walk every 10s spikes CPU across the
  fleet. Tune `interval` to the query's cost; let osquery's watchdog cap runaways.
