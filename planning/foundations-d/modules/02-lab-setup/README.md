# Module 02 — Building a Safe Lab

*Module concept · [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Foundations** — *the first discipline of this whole field: never detonate on the machine you live on.*

<!-- module-meta -->
**Difficulty:** Beginner &nbsp;·&nbsp; **Estimated time:** ~3–4 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Module 01 — Security First Principles](../01-first-principles/README.md)
{ .module-meta }

## Why this matters

Every later lab — and all the poking-around you'll do on your own — needs somewhere you can run
hostile, broken, or just-plain-unknown software *without* risking your real files, your accounts, or
your home network. The habit you build here, **isolate it and make it disposable**, is the single
piece of professional hygiene that separates someone who can safely investigate malware from someone
who infects their own laptop on day one. It also keeps your learning *lawful*: the standing rule of
this entire curriculum is that you only attack targets you own or are explicitly permitted to test.

## Objective

Stand up an isolated, snapshot-able lab — a virtual machine you can reset to a known-good state,
plus a container for running your tooling — and be able to say *when* a VM is required and a
container is not enough.

## The core idea

The mental model is a seatbelt. You don't drive expecting to crash, but you wear it because the cost
of being wrong is catastrophic and the cost of the belt is nothing. A lab is two belts buckled at
once. **A snapshot** is your undo button: take one of the clean machine, break things freely, and roll
back to the exact known-good state in one action — that fearlessness is the real unlock, because you
learn far faster when a mistake costs nothing. **An isolated network** is the wall the malware can't
climb over: your lab must not be able to reach your real LAN or the wider internet, so that something
nasty inside it can't spread *out*.

Why so strict about the network? Because malware is built to spread. In May 2017 the **WannaCry**
ransomware worm encrypted machines across the NHS, Telefónica, and hundreds of thousands of other
hosts in a day — not by being clicked, but by *worming* from machine to machine over the network
(SMB, the EternalBlue exploit). The lesson for a lab is blunt: a sample you detonate will try to talk
to whatever it can reach. If your "lab" is bridged onto your home network, you have just handed it
your home network. Host-only or NAT networking walls it off; bridged does not. *"Is my isolated lab
actually isolated, or did I leave it bridged?"* is the one question worth re-checking every single
time.

Here is the prediction this module turns on. You've probably met Docker, and containers are fast and
cheap — so **is a Docker container a safe place to detonate malware?** Hold an answer before you read
on. → **No.** A container is not a separate machine; it is a *process* on your host with a restricted
view, and crucially it **shares your host's kernel.** A VM runs its own kernel on top of a hypervisor
— a far stronger wall. That difference *is* the VM-vs-container decision you'll make constantly: a
**VM** for anything you don't trust (malware, full-OS targets); a **container** for running *your*
tools and the curriculum's reproducible labs. (You'll see exactly where a container's isolation ends —
the shared kernel — hands-on in [Module 03](../03-docker/README.md).)

And isolation has limits even for VMs — which is the honest part beginners rarely hear. A VM's wall is
strong, not infinite. **VENOM** ([CVE-2015-3456](https://nvd.nist.gov/vuln/detail/CVE-2015-3456)) was
a 2015 bug in the virtual *floppy-disk controller* shared by QEMU, Xen, and KVM: code running as root
*inside* a guest could write out of bounds and potentially execute code on the **host** — a true
guest-to-host escape, from a device almost no one even uses. The takeaway isn't fear; it's why we
buckle *both* belts. The VM boundary can fail, so we also keep the lab off the network and
snapshot-disposable, so that even a bad day stays contained and recoverable.

## Learn (~2 hrs)

**Virtualization & isolation**
- [VirtualBox Manual — *Snapshots*](https://www.virtualbox.org/manual/topics/Snapshots.html) (~20 min) — the free, cross-platform hypervisor. Read this chapter for *how* take/restore works; snapshots are your undo button and the whole reason you can break things fearlessly. <!-- VALIDATE -->
- [VirtualBox Manual — *Virtual Networking*](https://www.virtualbox.org/manual/topics/networkingdetails.html) (~25 min) — read the **NAT** and **Host-Only** sections and contrast them with **Bridged**. This is the difference between a walled-off lab and one that's quietly on your home LAN. <!-- VALIDATE -->

**VM vs. container — the boundary**
- [Docker — *What is a container?*](https://www.docker.com/resources/what-container/) (~15 min) — read it asking one question: where does the isolation actually come from? The answer (shared host kernel) is exactly why a container is *not* where you detonate malware.

**What you'll point the lab at**
- [VulnHub — getting started](https://www.vulnhub.com/) (~15 min, orient) — free, intentionally-vulnerable VMs to practise on, plus the standing rule restated: only attack targets you own or are explicitly authorised to test.

## Key concepts

- **Two belts:** snapshots (disposability — revert to known-good in one action) **and** an isolated network (containment — the malware can't reach your LAN/internet).
- **Network modes:** host-only and NAT wall the lab off; **bridged** puts it on your real network — avoid it for anything untrusted.
- **VM vs. container:** a container shares your host kernel (a process with a restricted view); a VM runs its own kernel (a stronger wall). **Untrusted → VM. Your tooling → container.**
- **Isolation has limits:** VM escapes are real (VENOM, CVE-2015-3456) — which is *why* you also isolate the network and keep snapshots, not instead of it.
- **The authorization rule, internalised:** only ever attack what you own or are permitted to test.

## AI acceleration

Have a model draft your lab topology and the VirtualBox network settings from a one-line description —
then **sanity-check every networking choice yourself against the actual VM settings.** A model will
confidently call a setup "isolated" without ever seeing your adapter mode; a lab you *think* is
host-only while it's really bridged onto your home LAN is precisely the expensive mistake this module
exists to prevent. AI drafts the checklist; you verify the one thing that matters.
