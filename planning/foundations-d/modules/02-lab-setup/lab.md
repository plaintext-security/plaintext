# Lab 02 — Build It, Snapshot It, Wall It Off

*Hands-on lab · [← Back to the module concept](README.md)*

## Setup

This lab ships a one-command validator-and-guide in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo. It confirms your
container tooling works and prints the VM isolation/snapshot walkthrough — it does **not** build the
VM for you, because standing it up by hand *is* the skill.

```bash
git clone https://github.com/plaintext-security/plaintext-labs.git
cd plaintext-labs/foundations/02-lab-setup
make demo    # validate Docker is running + print the VM isolation guide
```

You need Docker installed and a free hypervisor — [VirtualBox](https://www.virtualbox.org/) on
Windows/macOS-Intel/Linux, or [UTM](https://mac.getutm.app/) on Apple Silicon.

## Scenario

You're building the sandbox the rest of this curriculum runs in: one **isolated, snapshot-able VM**
for anything you don't trust, plus a **container** for your tooling. The point isn't just to make it
work once — it's to make it *reproducible*, so you can throw it away and rebuild from zero.

> Keep the lab network isolated from your home/work network. Only ever attack targets you own or are
> explicitly authorised to test.

## Do

Each step builds on the last; the final step turns the whole thing into a script.

1. [ ] **Create a Linux VM on an isolated network.** Install a fresh Ubuntu (or similar) VM. Set its
   network adapter to **host-only or NAT — not bridged** (the module explains why). *Hint:* in
   VirtualBox this is Settings → Network → Adapter 1.

2. [ ] **Prove the isolation.** From inside the VM, try to reach another device on your real LAN
   (e.g. `ping` your home router's IP). On a properly walled-off lab this should **fail** — verify it,
   don't assume it. This single check is the difference between an isolated lab and a bridged one.

3. [ ] **Make a clean snapshot and prove the revert.** Take a snapshot of the clean VM
   ("clean-baseline"), then *break* something — create a junk file, change a config — and **revert**.
   Confirm your change is gone. You now have a one-action undo button.

4. [ ] **Run a throwaway container.** On the host (or in the VM), run a disposable container that
   prints a message and exits cleanly (`docker run --rm ...`). This is your *tooling* lane — distinct
   from the VM, which is your *untrusted* lane.

5. [ ] **Decide the boundary, in writing.** In one or two sentences each, state: which lane (VM or
   container) you'd use to **detonate an unknown malware sample**, and which to **run a scanning tool**
   — and *why* (the shared-kernel reason). This is the judgment the module is really teaching.

6. [ ] **Capture it as a rebuild-from-zero script.** Write down the exact steps so you — or a teammate
   — could recreate this lab from nothing. Then turn those steps into the script in *Automate & own it*.

## Success criteria — you're done when

- [ ] Your VM is on host-only/NAT and you've **verified** it can't reach a device on your LAN.
- [ ] You can revert to a clean snapshot in one action, and have proven a change disappears on revert.
- [ ] A container runs and exits cleanly.
- [ ] You can state, in one sentence each, the VM-vs-container call for malware vs. tooling and the
  shared-kernel reason behind it.
- [ ] Your rebuild script/notes would let someone reproduce the lab with no guesswork.

## Deliverables

`lab-setup.md` — the topology, the network mode you chose and **how you verified it's isolated**, the
snapshot workflow, and your VM-vs-container decision. Commit it. Do **not** commit VM disk images,
snapshots, or any captured artifacts (they're heavy and may carry secrets — keep them out of git).

## Automate & own it

**Required.** Turn your rebuild notes into a **rebuild-from-zero script** — a small Bash (or Python)
script that does the reproducible parts for you: smoke-tests Docker (`docker run --rm hello-world`),
pulls your base image, and **prints the manual VM/snapshot/network steps that can't be automated** as
a checklist. The VM build stays manual; the script is the part that *can* be one command. Have a model
draft it from your notes, **review every line yourself** (especially that it never assumes the network
is isolated — it must remind you to *check*), run it on a clean machine to prove it reproduces the lab,
and commit it beside `lab-setup.md`.

## AI acceleration

Ask a model to review your `lab-setup.md` for isolation gaps — then verify its findings against your
*actual* VM network settings, not its assumptions. A model can't see your adapter mode; treat its
"looks isolated to me" as a hypothesis you confirm by re-running step 2.

## Connects forward

Every later lab runs in this sandbox. The snapshot-and-isolate habit is what makes the
[Docker module](../03-docker/README.md) (where you'll see the container boundary up close), and later
the Malware and Offensive tracks, safe to do at all. Your rebuild script is the first piece of the
Phase 1 project.

## Marketable proof

> "I run an isolated, reproducible security lab — snapshot-and-revert VMs on a walled-off network
> plus containers for tooling — so I can detonate and break things safely, and I can rebuild it from
> zero with one script."

## Stretch

- Add a **second VM** and put both on a *private, lab-only* network so they can talk to each other but
  nothing else — the topology you'll need the first time a lab has an attacker box *and* a target box.
