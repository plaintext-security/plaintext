# Module 03 — Linux Telemetry

*Type 7 · Build-&-Operate — configure Linux audit logging, query host state with osquery, and capture the execution telemetry detections rely on; you commit a working "Linux Sysmon" config and the queries that read it. (Secondary: Misconception Reveal — the container blind-spot your host telemetry quietly misses.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Defensive Operations** — *servers and containers are Linux; this is how you watch them.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Your web servers, containers, and Kubernetes nodes run Linux, where default logs say almost
    nothing about *what executed*. Two tools fill the gap from opposite directions: **auditd** taps
    syscalls and streams events as they happen (your Linux Sysmon), while **osquery** exposes the
    host as a SQL database you query on demand (your Linux live-response tool). You usually want
    both. The modern blind spot is **containers** — a process inside one is just a process on the
    host kernel, visible only if you've accounted for namespaces.

## Why this matters
Cloud workloads, web servers, and containers run Linux, where default logging tells you little
about *what executed*. auditd and osquery turn a Linux host into a queryable sensor — process
execution, file access, network connections — the visibility the cloud and detection tracks assume.
Without it, a compromised Linux host is a blind spot.

## Objective
Configure Linux audit logging, query host state with osquery, and capture the execution telemetry
detections rely on.

## The core idea
The cloud runs on Linux — your web servers, your containers, your Kubernetes nodes — and Linux's
default logs tell you almost nothing about *what executed*. `/var/log` has auth and syslog, but not
"this binary ran with these arguments and opened this socket." Two tools fill that gap from opposite
directions. **auditd** is the kernel's audit framework: it taps syscalls and streams events as they
happen (`execve`, file access, network) — an always-on firehose. **osquery** flips the model and
exposes the host as a SQL database you *query* (`SELECT … FROM processes`), live or on a schedule.
auditd is the event stream; osquery is the question you ask on demand. You usually want both.

!!! note "The mental model"
    For anyone trained on Windows, the translation is clean: **auditd is your Linux Sysmon** (the
    streaming execution sensor) and **osquery is your Linux live-response tool**. The detection lens
    is identical to the endpoint module — collect process execution, file, and network activity with
    the techniques you care about in mind — only the plumbing differs.

!!! warning "The gotcha"
    auditd rules are easy to write far too broadly: an over-eager rule floods you *and* adds real
    syscall overhead on a busy host, so you scope tightly. And **containers are the modern blind
    spot** — a process inside a container is just a process on the host kernel, so host-level
    auditd/eBPF *can* see it, but only if you've accounted for namespaces and where the container's
    own logs go.

??? note "Go deeper: where this is heading (eBPF)"
    eBPF-based tooling (Falco, Tetragon) is the modern direction for Linux execution telemetry —
    lower overhead, container-aware, and programmable in the kernel. The cloud track builds directly
    on it, so the auditd/osquery model you learn here is the foundation, not the destination.

!!! tip "AI caveat"
    A model writes auditd rules and osquery SQL quickly — but an over-broad audit rule floods you
    with noise and a wrong osquery join misses the event entirely. Test what the rule actually
    captures against real activity.

## Learn (~4 hrs)

**The Linux sensor**
- [osquery documentation](https://osquery.readthedocs.io/en/latest/) — query your host like a database; read "Getting Started" and a few example queries.
- [Linux Audit (auditd) documentation](https://github.com/linux-audit/audit-documentation/wiki) — the kernel audit framework: rules, events, and what to log.

**What to log**
- [MITRE ATT&CK — Data Source: Process](https://attack.mitre.org/datasources/DS0009/) — collect with detection in mind (same lens as the Windows module, Linux side).

## Key concepts
- auditd: rules, syscalls, and the event format
- osquery: host-as-a-database for live and scheduled queries
- Process execution + file + network telemetry on Linux
- eBPF-based tooling (the modern direction)
- Containers: where host telemetry sees — and misses — container activity

## AI acceleration
A model writes auditd rules and osquery SQL quickly — but an over-broad audit rule floods you with
noise and a wrong osquery join misses the event entirely. Test what the rule actually captures
against real activity.

!!! question "Check yourself"
    - auditd and osquery both give you Linux visibility — what does each do that the other doesn't,
      and why do you usually want both?
    - You enable a broad auditd rule on a busy production host and detection coverage seems great in
      the lab — what's the cost you haven't measured?
    - Why can a process running inside a container be invisible to host telemetry even though it
      shares the host kernel?
