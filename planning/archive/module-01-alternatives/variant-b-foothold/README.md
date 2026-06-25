# Module 01 — Cloud Fundamentals & Shared Responsibility

*Variant B · attack-first ("trace the blast radius from a foothold"). [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Cloud & Container Security** — *the responsibility boundary is easiest to see from the burglar's side.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

## Why this matters
A leaked cloud credential is the single most common way a cloud breach starts — a key in a public git
repo, a token in a CI log, a developer's laptop. The first question the responder asks is the same one
the attacker asks: *what can this credential actually do, and what stops it?* Answering that requires
the shared-responsibility model — but learned as a live map of walls, not a static diagram. Every wall
that holds against the stolen key is the provider's to enforce; every wall that gives is the customer's
to have built. This module teaches the frame the whole track hangs on by walking a real foothold to its
edges.

## Objective
Given a single leaked developer credential, enumerate its effective permissions, map how far the
account's configuration lets it reach (other buckets, role assumption, escalation), and classify each
boundary you hit as **provider-enforced** or **customer-owned** — deriving the shared-responsibility
model from the walls themselves.

## The core idea
The shared responsibility model is a spectrum, not a binary. IaaS (a raw EC2 instance) is a rented
rack — AWS owns the hardware and hypervisor; you own the OS, firewall, keys, and everything on top. SaaS
hands you a running app and your surface shrinks to identity and data. PaaS sits between. The textbook
mental model is **a horizontal line through the stack: yours above, the provider's below, and the line
slides with the service type.** Useful — but bloodless.

Here's the sharper version, drawn from the attacker's side. **The shared-responsibility boundary is a
building's security map sketched by the burglar walking its halls.** Every door that won't open is a
lock the *landlord* installed and maintains — the hypervisor isolation you cannot escape, the
cross-tenant boundary AWS enforces no matter what you do. Every door that *does* open is a lock the
*tenant* either never set or propped open: the bucket left readable, the role that trusts too much, the
`iam:PassRole` on `*` that lets a low-priv key walk into a high-priv role. You don't learn which is
which by reading the lease. You learn it by trying every door and noting which held.

This reframes **"the default is not secure"** as a lived experience instead of a warning. The doors that
give are almost never AWS bugs — they're customer-side controls left in a permissive default, and they
*feel* like the building's own doors, which is exactly why they get missed. The reframe also makes the
**control plane vs. data plane** split concrete: some doors are API calls (`AssumeRole`, `PassRole` —
the control plane, CloudTrail-logged), and some are reaching the goods (reading a second bucket's
objects — the data plane). The same stolen key opens different *kinds* of doors, logged in different
places, and a responder has to know which is which.

The honest gotcha — and the one judgment that separates understanding from button-pushing: **in a
local simulator the walls aren't physically enforced.** LocalStack doesn't reject calls your policy
forbids, so you can't learn the boundary by brute force here. Instead you reason about it with
`iam simulate-principal-policy`, which evaluates AWS's *real* policy logic against the account's actual
documents and tells you `allowed` or `denied` — the same answer the live enforcement plane would give.
That's not a workaround; it's the better tool, because it shows you *why* a wall holds (which statement
denied) rather than just that it did. Learn to trust the policy evaluation, not the error message.

## Learn (~3 hrs)

**Shared responsibility (~0.75 hr)**
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) — the primary source; read it once now and notice how few of the "secure" boxes are actually AWS's.

**How permissions are actually decided (~1.5 hrs)**
- [IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) — the rulebook every wall obeys: explicit deny > allow > implicit deny. Read the flowchart; it's the single most useful page for an attacker *or* a defender.
- [`iam simulate-principal-policy` reference](https://docs.aws.amazon.com/cli/latest/reference/iam/simulate-principal-policy.html) — the tool you'll use to test each door without enforcement. Read the parameters; you'll feed it an action and a resource and read the decision.

**Threat framework orientation (~0.75 hr)**
- [MITRE ATT&CK for Cloud — Initial Access & Privilege Escalation](https://attack.mitre.org/matrices/enterprise/cloud/) — focus on `Valid Accounts` (T1078) and the privilege-escalation column; your foothold and your `PassRole` hop map directly onto these.

## Key concepts
- The shared responsibility model as a spectrum (IaaS → PaaS → SaaS), read as a map of walls
- A wall that holds is provider-enforced; a wall that gives is a customer-owned default left open
- IAM policy evaluation order (explicit deny > allow > implicit deny) decides every door
- Control-plane doors (`AssumeRole`, `PassRole`) vs. data-plane doors (reading another bucket)
- `simulate-principal-policy` is the honest way to test boundaries without live enforcement

## AI acceleration
Dump the effective-permissions you enumerated for the leaked key into a model and ask it to plot the
blast radius: which actions enable lateral movement or escalation, and what each maps to in ATT&CK.
It's genuinely good at spotting the `PassRole` + over-broad-trust combination. What it *can't* see is
the effective permission once permission boundaries, SCPs, and resource policies are layered — it reads
one policy, not the evaluated result. Treat its blast-radius map as a hypothesis list; confirm every
edge with `simulate-principal-policy` before you call it real. You own the conclusion.
