# Module 02 — Building a Safe Lab

**Foundations** — *you need somewhere safe to break things before you break anything for real.*

## Why this matters
Every later lab — and all your own experimentation — needs an isolated, disposable,
reproducible environment. Doing security work on your daily machine, or against systems you
don't own, is how people get hurt or get arrested. This module sets up the sandbox the whole
curriculum runs in, and the snapshot-and-revert habit that lets you break things fearlessly.

## Objective
Stand up an isolated, snapshot-able lab (VM + containers) you can reset to a known-good
state, and understand when to use a VM versus a container.

## Learn (~2 hrs)

**Virtualization**
- [VirtualBox Manual — snapshots & networking](https://www.virtualbox.org/manual/) — the free hypervisor; focus on snapshots and host-only/NAT networking (how you wall a lab off from your home network).
- [TCM Security — building a virtual hacking lab (YouTube)](https://www.youtube.com/@TCMSecurityAcademy) — a practical, current walkthrough of a safe build.

**What to put in it**
- [VulnHub — getting started](https://www.vulnhub.com/) — free intentionally-vulnerable VMs, and the standing rule: only attack targets you own or are explicitly authorised to test.

## Key concepts
- Isolation: host-only vs NAT vs bridged, and why a lab shouldn't touch your LAN
- Snapshots and reverting to known-good
- VM vs container: when each is the right tool
- Disposable by default; reproducible from notes
- The authorization rule, internalised

## AI acceleration
Have a model draft your lab topology and network settings — then sanity-check every
networking choice yourself. A misconfigured "isolated" lab that's actually bridged to your
home network is exactly the mistake that bites.
