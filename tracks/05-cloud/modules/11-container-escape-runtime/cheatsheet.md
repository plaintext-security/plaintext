# Cheat sheet — Container Escape & Runtime

*Companion to [Module 11 — Container Escape & Runtime](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The shared-kernel escape surface (config escapes need no CVE)

```bash
# --privileged: hands the container CAP_SYS_ADMIN + host devices → mount the host disk, chroot in
docker run --privileged -it ubuntu bash
#   inside: fdisk -l ; mount /dev/sda1 /mnt ; chroot /mnt   # you are now on the host

# mounted docker.sock: talk to the host daemon, launch a privileged container for yourself
docker run -v /var/run/docker.sock:/var/run/docker.sock ...   # NEVER in prod

# host path / host namespaces: erase the container↔host boundary
docker run -v /:/host ...            # node filesystem readable/writable from inside
docker run --pid=host --net=host ... # share the host's PID/network namespace
```

## Inspect a container's blast radius

```bash
capsh --print                                  # what capabilities does this container hold?
grep Cap /proc/1/status                        # CapEff/CapBnd bitmask of PID 1
cat /proc/self/mountinfo                       # what host paths are mounted in?
ls -l /var/run/docker.sock 2>/dev/null         # is the daemon socket exposed inside?
docker inspect --format '{{.HostConfig.Privileged}}' <ctr>   # privileged flag
```

## Falco — watch the syscall stream

```bash
falco                                  # run with default rules (eBPF probe on the host)
falco -r /etc/falco/my_rules.yaml      # load a specific rules file
falco -L                               # list all loaded rules
falco -V /etc/falco/my_rules.yaml      # validate a rules file WITHOUT running
falco -o json_output=true              # emit alerts as JSON
falco --list=syscall                   # supported syscall fields to build conditions from
```

## Anatomy of a Falco rule (real YAML fields)

```yaml
# a list: reusable set of values
- list: host_binaries
  items: [runc, docker, containerd, kubelet]

# a macro: a named, reusable condition fragment
- macro: container
  condition: container.id != host

# the rule itself
- rule: Write below host runc binary
  desc: Detect a container writing to the host runc binary (CVE-2019-5736 shape)
  condition: >
    open_write and container
    and fd.name pmatch (/usr/bin/runc, /usr/sbin/runc)
  output: >
    Container wrote to host runc (user=%user.name command=%proc.cmdline
    file=%fd.name container=%container.name image=%container.image.repository)
  priority: CRITICAL
  tags: [container, mitre_escape_to_host, T1611]
```

Key fields: `rule`, `desc`, `condition`, `output`, `priority` (EMERGENCY…DEBUG). Reuse `list`/`macro`. Common macros/fields: `container`, `open_write`, `spawned_process`, `proc.cmdline`, `fd.name`, `evt.type`, `container.image.repository`.

## Tune out a false positive (the practitioner skill)

```yaml
# append an exception so a benign workload stops tripping the rule —
# WITHOUT blinding it to the attack
- rule: Write below host runc binary
  exceptions:
    - name: known_installer
      fields: [proc.name]
      values:
        - [package-update]      # the legit process that also writes there
```

The `mount` inside a container is the *noisy* signal (databases, log shippers mount too); the **write to the host binary** is the sharp, low-noise one. Build the detection around the sharper signal.

## Gotchas worth remembering

- **A container is a process in a jail, not a VM.** There is no hypervisor, no second OS, no hardware wall — a syscall from inside runs on the *host's* kernel. Every escape is abusing a resource both sides touch; the kernel can't be un-shared.
- **`--privileged` and a mounted `docker.sock` are full escapes with no CVE.** They're config, not vulnerabilities — an image scan and admission policy that only read the spec/image never see the runtime abuse.
- **Static scan reads the image, admission reads the spec, neither reads behavior.** CVE-2019-5736 has a clean image and a legal spec; the attack is a *sequence of syscalls*, which is exactly what Falco watches and the other two can't.
- **Broad rules alert on benign work.** Out of the box Falco fires on databases writing their data dir and log shippers opening files — a rule you'd actually keep enabled is one *tuned* to fire on the escape and stay silent otherwise.
- **Validate every tuned variant against real output.** `falco -V` checks syntax; only `make demo`/live traffic tells you whether the rule is noisy in *your* environment — that depends on what your containers actually do, which no model can know.

> Reproduce escapes only in a lab you own (e.g. the pinned Vulhub runc environment) — never against systems you don't control.
