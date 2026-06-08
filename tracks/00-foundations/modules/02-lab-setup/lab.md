# Lab 02 — Stand Up and Snapshot a Disposable Lab

## Setup
A hypervisor (VirtualBox or similar) and Docker installed on your machine.

## Scenario
Build the sandbox you'll use for the rest of the curriculum: one isolated VM you can snapshot
and revert, plus confirmation that containers run.

> Keep the lab network isolated from your home/work network. Only ever attack targets you own
> or are authorised to test.

## Do
1. [ ] Create a Linux VM on an **isolated** network (host-only or NAT — not bridged). Confirm
   it cannot reach another device on your LAN.
2. [ ] Take a **snapshot** of the clean VM, change something, then **revert** — prove the
   reset works.
3. [ ] Confirm Docker runs a throwaway container (print a message and exit).
4. [ ] Write down the exact steps so you (or a teammate) could rebuild the lab from scratch.

## Success criteria — you're done when
- [ ] Your VM is on an isolated network and you've verified it can't see your LAN.
- [ ] You can revert to a clean snapshot in one action.
- [ ] A container runs and exits cleanly.
- [ ] Your notes would let someone rebuild the lab with no guesswork.

## Deliverables
`lab-setup.md`: the topology, the network mode you chose (and why it's isolated), and the
rebuild steps.

## AI acceleration
Ask a model to review your `lab-setup.md` for isolation gaps — then verify its findings
against your actual network settings, not its assumptions.

## Connects forward
Every later lab runs here. The snapshot habit is what makes the Malware and Offensive tracks
safe.

## Marketable proof
> "I run an isolated, reproducible lab — snapshot-and-revert VMs plus containers — so I can
> detonate and break things safely."

## Stretch
- Add a second VM and put both on a private lab-only network so they can talk to each other
  but nothing else.
